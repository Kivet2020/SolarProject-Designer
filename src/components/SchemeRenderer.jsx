import React, { useState, useRef } from 'react';
import useProjectStore from '../store/useProjectStore';
import { PVPanel, Inverter, DCFuse, ACBreaker, GroundSymbol, SmartLabel, SPD, DCSwitch, BatteryBank, COLORS } from './SolarSymbols';
import { calculateStringParams, validateMppt } from '../logic/solarMathUtils';

const SchemeRenderer = () => {
  const { currentProject, db } = useProjectStore();
  const showLabels = currentProject.showLabels;
  const svgRef = useRef(null);
  
  const [scale, setScale] = useState(0.8);
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.preventDefault();
    setScale(s => Math.min(Math.max(0.2, s - e.deltaY * 0.001), 5));
  };
  const handleMouseDown = (e) => { setIsDragging(true); setStartPos({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const handleMouseMove = (e) => { if (isDragging) setPan({ x: e.clientX - startPos.x, y: e.clientY - startPos.y }); };
  const handleMouseUp = () => setIsDragging(false);

  // Context
  const { numStrings, numPanels, numInverters, stringsPerMppt } = currentProject;
  const panel = db.library.panels.find(p => p.id === currentProject.panelId);
  const inverter = db.library.inverters.find(i => i.id === currentProject.inverterId);
  
  const stringData = calculateStringParams(panel, numPanels, currentProject.minTemp, currentProject.maxTemp, currentProject.bifacialGain);
  const mpptCheck = validateMppt(stringData, stringsPerMppt, inverter);
  
  const stringsPerInverter = Math.ceil(numStrings / numInverters);
  const usedMppts = Math.ceil(stringsPerInverter / stringsPerMppt);

  const drawInverterSystem = (inverterIdx, yOffset) => {
    const elements = [];
    const invX = 500;
    
    // Inverter Symbol
    elements.push(<Inverter key={`inv-${inverterIdx}`} x={invX} y={yOffset} />);
    elements.push(<SmartLabel key={`inv-lbl-${inverterIdx}`} x={invX+10} y={yOffset - 15} title={`INV ${inverterIdx + 1}`} value={inverter?.model} show={showLabels} />);

    // DC Side - MPPTs
    const mpptSpacing = 80 / (usedMppts || 1);
    for (let m = 0; m < usedMppts; m++) {
      const mpptY = yOffset + 10 + (m * mpptSpacing);
      const stringsInThisMppt = (m === usedMppts - 1 && stringsPerInverter % stringsPerMppt !== 0) 
        ? stringsPerInverter % stringsPerMppt 
        : stringsPerMppt;

      // Draw parallel string block
      const strX = invX - 250;
      elements.push(
        <g key={`mppt-${inverterIdx}-${m}`}>
          <PVPanel x={strX - 60} y={mpptY - 20} width={40} height={30} label="" />
          <SmartLabel x={strX - 60} y={mpptY - 30} title={`${stringsInThisMppt}x Strings in Parallel`} value="" show={showLabels} />
          
          <line x1={strX - 20} y1={mpptY} x2={strX + 50} y2={mpptY} stroke={COLORS.dcLogic} strokeWidth="2" />
          <DCFuse x={strX + 10} y={mpptY} />
          
          {/* DC Bus & Protection per MPPT */}
          <line x1={strX + 50} y1={mpptY} x2={invX - 60} y2={mpptY} stroke={COLORS.dcLogic} strokeWidth="2" />
          
          <DCSwitch x={invX - 100} y={mpptY} />
          
          {/* SPD Parallel Drop */}
          <line x1={invX - 60} y1={mpptY} x2={invX - 60} y2={mpptY + 20} stroke={COLORS.dcLogic} strokeWidth="1" />
          <SPD x={invX - 60} y={mpptY + 30} type="DC" />
          <line x1={invX - 60} y1={mpptY + 45} x2={invX - 60} y2={mpptY + 60} stroke={COLORS.ground} strokeWidth="1" strokeDasharray="2,2" />
          
          {/* Connection to MPPT Input */}
          <line x1={invX - 60} y1={mpptY} x2={invX} y2={mpptY} stroke={COLORS.dcLogic} strokeWidth="2" />
          <text x={invX - 5} y={mpptY - 5} fontSize="9" fill={COLORS.border} textAnchor="end">MPPT {m+1}</text>
        </g>
      );
    }

    // AC Side
    const acOutY = yOffset + 60;
    elements.push(
      <g key={`ac-${inverterIdx}`}>
        <line x1={invX + 80} y1={acOutY} x2={invX + 150} y2={acOutY} stroke={COLORS.acLogic} strokeWidth="3" />
        <ACBreaker x={invX + 120} y={acOutY} />
        
        {/* Connection to Common AC Busbar */}
        <line x1={invX + 150} y1={acOutY} x2={800} y2={acOutY} stroke={COLORS.acLogic} strokeWidth="3" />
      </g>
    );

    // Hybrid Battery
    if (inverter?.type === 'Hybrid') {
      elements.push(
        <g key={`batt-${inverterIdx}`}>
           <line x1={invX + 40} y1={yOffset + 80} x2={invX + 40} y2={yOffset + 120} stroke={COLORS.dcLogic} strokeWidth="3" />
           <BatteryBank x={invX + 40} y={yOffset + 140} />
        </g>
      );
    }

    return elements;
  };

  return (
    <div 
      className="svg-wrapper" 
      style={{ width: '100%', height: '100%', overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg width="100%" height="100%" style={{ backgroundColor: '#f8fafc' }}>
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          
          {/* Alerts */}
          {!mpptCheck.valid && (
            <SmartLabel x={200} y={50} title="ERROR" value={mpptCheck.errors.join(' | ')} show={true} alert={true} />
          )}
          {usedMppts > (inverter?.mpptCount || 1) && (
            <SmartLabel x={200} y={70} title="ERROR" value={`Not enough MPPTs! Need ${usedMppts}, Inverter has ${inverter?.mpptCount}`} show={true} alert={true} />
          )}

          {/* Draw Inverters (Folded if too many) */}
          {numInverters > 3 ? (
            <g>
               {drawInverterSystem(0, 150)}
               <line x1={540} y1={250} x2={540} y2={350} stroke={COLORS.border} strokeWidth="2" strokeDasharray="5,5" />
               <text x={560} y={300} fontSize="14" fill={COLORS.border} fontWeight="bold">... {numInverters - 2} Inverters ...</text>
               {drawInverterSystem(numInverters - 1, 400)}
            </g>
          ) : (
            Array.from({length: numInverters}).map((_, i) => drawInverterSystem(i, 150 + i * 150))
          )}

          {/* Main AC Collection Busbar */}
          <line x1={800} y1={100} x2={800} y2={numInverters > 3 ? 500 : 150 + numInverters * 150} stroke={COLORS.acLogic} strokeWidth="5" />
          <SmartLabel x={810} y={120} title="Main Busbar" value="400V AC" color={COLORS.acLogic} show={showLabels} />

          {/* Grid Connection */}
          <line x1={800} y1={250} x2={900} y2={250} stroke={COLORS.acLogic} strokeWidth="5" />
          <ACBreaker x={850} y={250} />
          
          {/* Main AC SPD */}
          <line x1={880} y1={250} x2={880} y2={280} stroke={COLORS.acLogic} strokeWidth="1" />
          <SPD x={880} y={295} type="AC" />
          <line x1={880} y1={310} x2={880} y2={330} stroke={COLORS.ground} strokeWidth="1" strokeDasharray="2,2" />
          
          <rect x={900} y={220} width="60" height="60" fill="#fff" stroke={COLORS.acLogic} strokeWidth="2" rx="4" />
          <text x={930} y={255} textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.acLogic}>GRID</text>

        </g>
      </svg>
    </div>
  );
};

export default SchemeRenderer;
