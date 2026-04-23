import React from 'react';

const COLORS = {
  dcLogic: '#1e293b', 
  acLogic: '#2563eb', 
  ground: '#10b981',  
  component: '#ffffff',
  border: '#334155',
  spd: '#f59e0b',
  switch: '#ef4444'
};

export const PVPanel = ({ x, y, width = 60, height = 40, label = "", collapsed = false }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="0" y="0" width={width} height={height} fill={COLORS.component} stroke={COLORS.border} strokeWidth="2" rx="4" />
    <line x1={width/3} y1="0" x2={width/3} y2={height} stroke={COLORS.border} strokeWidth="1" strokeOpacity="0.5" />
    <line x1={(width/3)*2} y1="0" x2={(width/3)*2} y2={height} stroke={COLORS.border} strokeWidth="1" strokeOpacity="0.5" />
    <line x1="0" y1={height/2} x2={width} y2={height/2} stroke={COLORS.border} strokeWidth="1" strokeOpacity="0.5" />
    {collapsed && <text x={width/2} y={height/2 + 5} fill={COLORS.border} fontSize="14" fontWeight="bold" textAnchor="middle">...</text>}
  </g>
);

export const Inverter = ({ x, y, width = 80, height = 80 }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="0" y="0" width={width} height={height} fill={COLORS.component} stroke={COLORS.border} strokeWidth="2" rx="4" />
    <line x1="0" y1={height} x2={width} y2="0" stroke={COLORS.border} strokeWidth="2" />
    <text x={width/4} y={height/4 + 10} fontSize="16" fontWeight="bold" fill={COLORS.dcLogic} textAnchor="middle">=</text>
    <text x={(width/4)*3} y={(height/4)*3 + 10} fontSize="16" fontWeight="bold" fill={COLORS.acLogic} textAnchor="middle">~</text>
    <text x={width/2} y={-10} fontSize="12" fontWeight="bold" fill={COLORS.border} textAnchor="middle">INV</text>
  </g>
);

export const DCFuse = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="-15" y="-8" width="30" height="16" fill={COLORS.component} stroke={COLORS.border} strokeWidth="2" />
    <line x1="-15" y1="0" x2="15" y2="0" stroke={COLORS.border} strokeWidth="2" />
  </g>
);

export const ACBreaker = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx="0" cy="-10" r="3" fill="none" stroke={COLORS.border} strokeWidth="2" />
    <circle cx="0" cy="10" r="3" fill="none" stroke={COLORS.border} strokeWidth="2" />
    <line x1="-8" y1="-8" x2="2" y2="7" stroke={COLORS.border} strokeWidth="2" />
    <path d="M-5 -2 L-10 -2 L-10 2 L-5 2 Z" fill="none" stroke={COLORS.border} strokeWidth="1" />
  </g>
);

export const SPD = ({ x, y, type = 'DC' }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="-10" y="-15" width="20" height="30" fill={COLORS.component} stroke={COLORS.spd} strokeWidth="2" />
    <path d="M-5 -5 L5 -5 L-5 5 L5 5" fill="none" stroke={COLORS.spd} strokeWidth="2" />
    <text x="15" y="4" fontSize="10" fill={COLORS.spd} fontWeight="bold">SPD {type}</text>
  </g>
);

export const DCSwitch = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx="-10" cy="0" r="3" fill="none" stroke={COLORS.switch} strokeWidth="2" />
    <circle cx="10" cy="0" r="3" fill="none" stroke={COLORS.switch} strokeWidth="2" />
    <line x1="-8" y1="-2" x2="8" y2="-10" stroke={COLORS.switch} strokeWidth="2" />
  </g>
);

export const GroundSymbol = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <line x1="0" y1="0" x2="0" y2="15" stroke={COLORS.ground} strokeWidth="2" />
    <line x1="-15" y1="15" x2="15" y2="15" stroke={COLORS.ground} strokeWidth="2" />
    <line x1="-10" y1="20" x2="10" y2="20" stroke={COLORS.ground} strokeWidth="2" />
    <line x1="-5" y1="25" x2="5" y2="25" stroke={COLORS.ground} strokeWidth="2" />
  </g>
);

export const BatteryBank = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="-20" y="-15" width="40" height="30" fill={COLORS.component} stroke={COLORS.dcLogic} strokeWidth="2" rx="2" />
    <line x1="-10" y1="-15" x2="-10" y2="-20" stroke={COLORS.dcLogic} strokeWidth="2" />
    <line x1="10" y1="-15" x2="10" y2="-20" stroke={COLORS.dcLogic} strokeWidth="2" />
    <text x="-10" y="-22" fontSize="10" fontWeight="bold" fill={COLORS.dcLogic} textAnchor="middle">+</text>
    <text x="10" y="-22" fontSize="10" fontWeight="bold" fill={COLORS.dcLogic} textAnchor="middle">-</text>
    <text x="0" y="5" fontSize="10" fontWeight="bold" fill={COLORS.dcLogic} textAnchor="middle">BATT</text>
  </g>
);

export const SmartLabel = ({ x, y, title, value, isOverride = false, show = true, color = COLORS.border, alert = false }) => {
  if (!show) return null;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {isOverride && <rect x="-5" y="-12" width="120" height="25" fill="#fef3c7" rx="4" opacity="0.8" />}
      <text x="0" y="0" fontSize="11" fill={alert ? '#ef4444' : (isOverride ? '#d97706' : color)} fontFamily="Inter, sans-serif">
        <tspan fontWeight="500">{title}: </tspan>
        <tspan fontWeight="700">{value}</tspan>
      </text>
    </g>
  );
};

export { COLORS };
