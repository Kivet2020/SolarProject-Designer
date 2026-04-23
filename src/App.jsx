import React, { useState } from 'react';
import useProjectStore from './store/useProjectStore';
import SchemeRenderer from './components/SchemeRenderer';
import { generatePDF } from './logic/pdfGenerator';
import { Lock, Unlock, Download, Pencil, Trash2, Copy, Plus } from 'lucide-react';

const ComponentModal = ({ category, item, onClose, onSave }) => {
  const [formData, setFormData] = useState(item || { id: Date.now().toString() });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{item ? 'Edit' : 'Add'} Component ({category})</h3>
        
        {/* Common Fields */}
        <div className="form-group">
          <label>Manufacturer/Brand</label>
          <input className="form-input" name="mfg" value={formData.mfg || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Model/Name</label>
          <input className="form-input" name="model" value={formData.model || formData.name || ''} onChange={(e) => { handleChange(e); setFormData(p => ({...p, name: e.target.value}))}} required />
        </div>

        {/* Dynamic Fields based on category */}
        {category === 'panels' && (
          <div className="grid-2">
             <div className="form-group"><label>Pmax (W)</label><input type="number" className="form-input" name="Pmax" value={formData.Pmax || 0} onChange={handleChange} /></div>
             <div className="form-group"><label>Voc (V)</label><input type="number" step="0.1" className="form-input" name="Voc" value={formData.Voc || 0} onChange={handleChange} /></div>
             <div className="form-group"><label>Isc (A)</label><input type="number" step="0.1" className="form-input" name="Isc" value={formData.Isc || 0} onChange={handleChange} /></div>
             <div className="form-group"><label>TempCoef Voc (%/°C)</label><input type="number" step="0.01" className="form-input" name="tempCoefVoc" value={formData.tempCoefVoc || 0} onChange={handleChange} /></div>
             <div className="form-group"><label>Bifaciality Factor (0-1)</label><input type="number" step="0.01" className="form-input" name="bifaciality" value={formData.bifaciality || 0} onChange={handleChange} /></div>
          </div>
        )}

        {category === 'inverters' && (
          <div className="grid-2">
             <div className="form-group"><label>Power (kW)</label><input type="number" className="form-input" name="powerKW" value={formData.powerKW || 0} onChange={handleChange} /></div>
             <div className="form-group"><label>Max Input (V)</label><input type="number" className="form-input" name="maxInputVoltage" value={formData.maxInputVoltage || 0} onChange={handleChange} /></div>
             <div className="form-group"><label>MPPT Count</label><input type="number" className="form-input" name="mpptCount" value={formData.mpptCount || 1} onChange={handleChange} /></div>
             <div className="form-group"><label>Max I per MPPT (A)</label><input type="number" className="form-input" name="maxMpptCurrent" value={formData.maxMpptCurrent || 0} onChange={handleChange} /></div>
          </div>
        )}

        {category === 'batteries' && (
          <div className="grid-2">
             <div className="form-group"><label>Capacity (kWh)</label><input type="number" step="0.1" className="form-input" name="capacityKwh" value={formData.capacityKwh || 0} onChange={handleChange} /></div>
             <div className="form-group"><label>Voltage (V)</label><input type="number" className="form-input" name="voltage" value={formData.voltage || 0} onChange={handleChange} /></div>
             <div className="form-group">
               <label>Type</label>
               <select className="form-select" name="type" value={formData.type || 'LV'} onChange={handleChange}>
                 <option value="LV">Low Voltage (48V)</option>
                 <option value="HV">High Voltage</option>
               </select>
             </div>
             <div className="form-group"><label>Chemistry</label><input className="form-input" name="chemistry" value={formData.chemistry || 'LiFePO4'} onChange={handleChange} /></div>
          </div>
        )}

        {category === 'cables' && (
          <>
            <div className="form-group">
              <label>Cable Type</label>
              <select className="form-select" name="cableType" value={formData.cableType || 'DC'} onChange={handleChange}>
                <option value="DC">DC (Solar to Inverter)</option>
                <option value="AC">AC (Inverter to Grid)</option>
              </select>
            </div>
            <div className="grid-2">
               <div className="form-group"><label>Section (mm²)</label><input type="number" className="form-input" name="section" value={formData.section || 0} onChange={handleChange} /></div>
               <div className="form-group"><label>Resistance (Ω/km)</label><input type="number" step="0.001" className="form-input" name="resistance" value={formData.resistance || 0} onChange={handleChange} /></div>
            </div>
          </>
        )}

        {(category === 'dcProtection' || category === 'acProtection') && (
          <div className="grid-2">
             <div className="form-group">
               <label>Type</label>
               <select className="form-select" name="type" value={formData.type || ''} onChange={handleChange}>
                 {category === 'dcProtection' ? (
                   <><option value="Fuse">Fuse</option><option value="SPD">SPD</option><option value="Switch">Switch</option></>
                 ) : (
                   <><option value="MCCB">MCCB / Breaker</option><option value="SPD">SPD</option></>
                 )}
               </select>
             </div>
             <div className="form-group"><label>Max Voltage (V)</label><input type="number" className="form-input" name="maxVoltage" value={formData.maxVoltage || 0} onChange={handleChange} /></div>
             <div className="form-group"><label>Nominal Current (A)</label><input type="number" className="form-input" name="nominalCurrent" value={formData.nominalCurrent || 0} onChange={handleChange} /></div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
          <button className="btn btn-outline" style={{flex: 1}} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{flex: 1}} onClick={() => onSave(formData)}>Save</button>
        </div>
      </div>
    </div>
  );
};

const HardwareLibrary = () => {
  const { db, addComponent, updateComponent, removeComponent, exportDB, importDB } = useProjectStore();
  const [activeCategory, setActiveCategory] = useState('panels');
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, item: null });

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => importDB(event.target.result);
      reader.readAsText(file);
    }
  };

  const handleSaveModal = (data) => {
    if (modalState.item) {
      updateComponent(activeCategory, data.id, data);
    } else {
      addComponent(activeCategory, data);
    }
    setModalState({ isOpen: false, item: null });
  };

  const handleDuplicate = (item) => {
    const clone = { ...item, model: item.model ? `${item.model} (Copy)` : undefined, name: item.name ? `${item.name} (Copy)` : undefined, id: Date.now().toString() };
    setModalState({ isOpen: true, item: clone }); // Open modal with cloned data to act as "Add New"
  };

  const filteredItems = db.library[activeCategory].filter(item => {
    const term = search.toLowerCase();
    const mfg = (item.mfg || '').toLowerCase();
    const model = (item.model || item.name || '').toLowerCase();
    return mfg.includes(term) || model.includes(term);
  });

  return (
    <div className="workspace">
      <div className="card-title">
        Hardware Library
        <div>
          <button className="btn btn-outline" style={{marginRight: '10px'}} onClick={exportDB}>Export JSON</button>
          <label className="btn btn-outline" style={{cursor: 'pointer'}}>
            Import JSON
            <input type="file" accept=".json" style={{display: 'none'}} onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="nav-tabs" style={{marginBottom: '1.5rem'}}>
        <div className={`nav-tab ${activeCategory === 'panels' ? 'active' : ''}`} onClick={() => setActiveCategory('panels')}>Panels</div>
        <div className={`nav-tab ${activeCategory === 'inverters' ? 'active' : ''}`} onClick={() => setActiveCategory('inverters')}>Inverters</div>
        <div className={`nav-tab ${activeCategory === 'batteries' ? 'active' : ''}`} onClick={() => setActiveCategory('batteries')}>Batteries</div>
        <div className={`nav-tab ${activeCategory === 'cables' ? 'active' : ''}`} onClick={() => setActiveCategory('cables')}>Cables</div>
        <div className={`nav-tab ${activeCategory === 'dcProtection' ? 'active' : ''}`} onClick={() => setActiveCategory('dcProtection')}>DC Protection</div>
        <div className={`nav-tab ${activeCategory === 'acProtection' ? 'active' : ''}`} onClick={() => setActiveCategory('acProtection')}>AC Protection</div>
      </div>

      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem'}}>
          <input 
            className="form-input" 
            placeholder="Search brand or model..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{flex: 1}}
          />
          <button className="btn btn-primary" style={{display: 'flex', alignItems: 'center', gap: '5px'}} onClick={() => setModalState({ isOpen: true, item: null })}>
            <Plus size={16} /> Add New
          </button>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Manufacturer</th>
              <th>Model / Name</th>
              <th>Key Parameter</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>{item.mfg || 'Generic'}</td>
                <td>{item.model || item.name}</td>
                <td>
                   {item.Pmax && `${item.Pmax}W`}
                   {item.powerKW && `${item.powerKW}kW, ${item.mpptCount} MPPT`}
                   {item.section && `${item.section}mm², ${item.cableType}`}
                   {item.type && `${item.type}`}
                </td>
                <td style={{textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                  <button className="btn btn-outline" style={{padding: '0.25rem', border: 'none'}} onClick={() => setModalState({ isOpen: true, item })} title="Edit"><Pencil size={16} color="var(--primary)"/></button>
                  <button className="btn btn-outline" style={{padding: '0.25rem', border: 'none'}} onClick={() => handleDuplicate(item)} title="Duplicate"><Copy size={16} color="var(--primary)"/></button>
                  <button className="btn btn-outline" style={{padding: '0.25rem', border: 'none'}} onClick={() => removeComponent(activeCategory, item.id)} title="Delete"><Trash2 size={16} color="var(--danger)"/></button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr><td colSpan="4" style={{textAlign: 'center', color: 'var(--text-light)'}}>No components found matching your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalState.isOpen && (
        <ComponentModal category={activeCategory} item={modalState.item} onClose={() => setModalState({ isOpen: false, item: null })} onSave={handleSaveModal} />
      )}
    </div>
  );
};

const ProjectArchive = () => {
  const { db, loadProjectFromArchive } = useProjectStore();
  return (
    <div className="workspace">
      <div className="card-title">My Projects</div>
      <div className="grid-2">
        {db.projects.length === 0 ? <p>No saved projects yet.</p> : null}
        {db.projects.map(p => {
          const panel = db.library.panels.find(panel => panel.id === p.panelId);
          const pmax = panel ? panel.Pmax : 500;
          return (
            <div className="card" key={p.id}>
              <h3>{p.name}</h3>
              <p style={{color: 'var(--text-light)', marginBottom: '1rem'}}>{p.location} | Date: {p.date}</p>
              <p>Total Power: {((p.numPanels * p.numStrings * pmax) / 1000).toFixed(1)} kWp</p>
              <button className="btn btn-outline" style={{marginTop: '1rem'}} onClick={() => loadProjectFromArchive(p.id)}>
                Load Project
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InputCenter = () => {
  const { currentProject, updateCurrentProject, saveCurrentProjectToArchive, db, toggleLock } = useProjectStore();
  const [exportLang, setExportLang] = useState('EN');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const svgEl = document.querySelector('.svg-wrapper svg');
    try {
      await generatePDF(currentProject, db, svgEl, exportLang);
    } catch (e) {
      console.error(e);
      alert("Failed to export PDF.");
    }
    setIsExporting(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => updateCurrentProject({ logoBase64: event.target.result });
      reader.readAsDataURL(file);
    }
  };

  const isLocked = currentProject.isLocked;
  const dcCables = db.library.cables.filter(c => c.cableType === 'DC');
  const acCables = db.library.cables.filter(c => c.cableType === 'AC');
  const selectedInverter = db.library.inverters.find(i => i.id === currentProject.inverterId);
  const selectedBattery = db.library.batteries.find(b => b.id === currentProject.batteryId);

  return (
    <div className="app-layout" style={{flexDirection: 'row', flex: 1, overflow: 'hidden'}}>
      <aside className="sidebar" style={{flexShrink: 0}}>
        
        {/* Actions Bar */}
        <div className="sidebar-section" style={{background: '#f1f5f9', position: 'sticky', top: 0, zIndex: 10}}>
           <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
              <button className={`btn ${isLocked ? 'btn-danger' : 'btn-outline'}`} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}} onClick={toggleLock}>
                 {isLocked ? <><Lock size={16} /> Locked</> : <><Unlock size={16} /> Unlocked</>}
              </button>
              <button className="btn btn-primary" style={{flex: 1}} onClick={saveCurrentProjectToArchive} disabled={isLocked}>💾 Save</button>
           </div>
           
           <div style={{display: 'flex', gap: '10px'}}>
              <select className="form-select" value={exportLang} onChange={e => setExportLang(e.target.value)} style={{width: '70px'}}>
                 <option value="EN">EN</option><option value="ES">ES</option><option value="RU">RU</option>
              </select>
              <button className="btn btn-primary" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}} onClick={handleExportPDF} disabled={isExporting}>
                 <Download size={16} /> {isExporting ? 'Generating...' : 'Export PDF'}
              </button>
           </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Project Identity</div>
          <div className="form-group"><label>Project Name</label><input className="form-input" disabled={isLocked} value={currentProject.name} onChange={e => updateCurrentProject({name: e.target.value})} /></div>
          <div className="form-group"><label>Location (City, Country)</label><input className="form-input" disabled={isLocked} value={currentProject.location} onChange={e => updateCurrentProject({location: e.target.value})} /></div>
          <div className="form-group"><label>Project Date</label><input type="date" className="form-input" disabled={isLocked} value={currentProject.date} onChange={e => updateCurrentProject({date: e.target.value})} /></div>
          
          <div className="form-group">
            <label>Company Logo (For PDF)</label>
            <input type="file" accept="image/png, image/jpeg" className="form-input" disabled={isLocked} onChange={handleLogoUpload} />
            {currentProject.logoBase64 && <div style={{marginTop: '5px', fontSize: '12px', color: 'var(--success)'}}>Logo uploaded ✓</div>}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Environment (Climate Engine)</div>
          <div className="grid-2">
             <div className="form-group"><label>Min Winter Temp (°C)</label><input type="number" className="form-input" disabled={isLocked} value={currentProject.minTemp} onChange={e => updateCurrentProject({minTemp: Number(e.target.value)})} /></div>
             <div className="form-group"><label>Max Summer Temp (°C)</label><input type="number" className="form-input" disabled={isLocked} value={currentProject.maxTemp} onChange={e => updateCurrentProject({maxTemp: Number(e.target.value)})} /></div>
          </div>
          <div className="grid-2">
             <div className="form-group"><label>Tilt Angle (°)</label><input type="number" className="form-input" disabled={isLocked} value={currentProject.tiltAngle} onChange={e => updateCurrentProject({tiltAngle: Number(e.target.value)})} /></div>
             <div className="form-group"><label>Azimuth (°)</label><input type="number" className="form-input" disabled={isLocked} value={currentProject.azimuth} onChange={e => updateCurrentProject({azimuth: Number(e.target.value)})} /></div>
          </div>
          <div className="form-group">
            <label>Mounting Type</label>
            <select className="form-select" disabled={isLocked} value={currentProject.mountingType} onChange={e => updateCurrentProject({mountingType: e.target.value})}>
               <option value="Ground Mount">Ground Mount</option>
               <option value="Pitched Roof">Pitched Roof</option>
               <option value="Flat Roof">Flat Roof</option>
            </select>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">PV Configuration</div>
          <div className="form-group">
            <label>Select Panel</label>
            <select className="form-select" disabled={isLocked} value={currentProject.panelId} onChange={e => updateCurrentProject({panelId: e.target.value})}>
              {db.library.panels.map(p => <option key={p.id} value={p.id}>{p.mfg} {p.model} ({p.Pmax}W)</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Total Strings</label><input type="number" className="form-input" disabled={isLocked} value={currentProject.numStrings} onChange={e => updateCurrentProject({numStrings: Number(e.target.value)})} /></div>
            <div className="form-group"><label>Panels / String</label><input type="number" className="form-input" disabled={isLocked} value={currentProject.numPanels} onChange={e => updateCurrentProject({numPanels: Number(e.target.value)})} /></div>
          </div>
          {panel?.bifaciality > 0 && (
            <div className="form-group">
              <label>Bifacial Gain (%): <strong>{currentProject.bifacialGain}%</strong></label>
              <input type="range" min="0" max="30" step="1" className="form-input" disabled={isLocked} value={currentProject.bifacialGain} onChange={e => updateCurrentProject({bifacialGain: Number(e.target.value)})} />
              <div style={{fontSize: '11px', color: 'var(--text-light)', marginTop: '2px'}}>Calculated Isc: {(panel.Isc * (1 + currentProject.bifacialGain/100)).toFixed(2)}A</div>
            </div>
          )}
          <div className="form-group">
            <label>DC Cable (PV to Inverter) 🔴</label>
            <select className="form-select" disabled={isLocked} value={currentProject.dcCableId} onChange={e => updateCurrentProject({dcCableId: e.target.value})}>
              {dcCables.map(c => <option key={c.id} value={c.id}>{c.mfg} {c.name} ({c.section}mm²)</option>)}
            </select>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">System Configuration</div>
          <div className="form-group">
            <label>Select Inverter</label>
            <select className="form-select" disabled={isLocked} value={currentProject.inverterId} onChange={e => updateCurrentProject({inverterId: e.target.value})}>
              {db.library.inverters.map(i => <option key={i.id} value={i.id}>{i.mfg} {i.model} ({i.powerKW}kW)</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Number of Inverters</label><input type="number" className="form-input" disabled={isLocked} value={currentProject.numInverters} onChange={e => updateCurrentProject({numInverters: Number(e.target.value)})} /></div>
            <div className="form-group"><label>Strings per MPPT</label><input type="number" className="form-input" disabled={isLocked} value={currentProject.stringsPerMppt} onChange={e => updateCurrentProject({stringsPerMppt: Number(e.target.value)})} /></div>
          </div>
          
          {selectedInverter?.type === 'Hybrid' && (
             <div className="form-group" style={{background: 'var(--bg-light)', padding: '10px', borderRadius: '4px', border: '1px dashed var(--border)'}}>
               <label style={{color: 'var(--primary)', fontWeight: 'bold'}}>Select Battery (Hybrid Storage)</label>
               <select className="form-select" disabled={isLocked} value={currentProject.batteryId} onChange={e => updateCurrentProject({batteryId: e.target.value})}>
                 {db.library.batteries.map(b => <option key={b.id} value={b.id}>{b.mfg} {b.model} ({b.capacityKwh}kWh, {b.voltage}V)</option>)}
               </select>
               
               {/* Voltage Mismatch Check */}
               {selectedInverter.batteryType && selectedBattery && selectedInverter.batteryType !== selectedBattery.type && (
                 <div style={{color: 'var(--danger)', fontSize: '12px', marginTop: '5px'}}>
                   ⚠️ Voltage Mismatch: Inverter ({selectedInverter.batteryType}) vs Battery ({selectedBattery.type} Voltage)
                 </div>
               )}
             </div>
          )}

          <div className="form-group">
            <label>AC Cable (Inverter to Grid) 🔵</label>
            <select className="form-select" disabled={isLocked} value={currentProject.acCableId} onChange={e => updateCurrentProject({acCableId: e.target.value})}>
              {acCables.map(c => <option key={c.id} value={c.id}>{c.mfg} {c.name} ({c.section}mm²)</option>)}
            </select>
          </div>
        </div>
      </aside>

      <section className="workspace" style={{padding: 0, position: 'relative', overflow: 'hidden'}}>
        {/* Toolbar for Canvas */}
        <div style={{position: 'absolute', top: 20, right: 20, zIndex: 10, background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}>
           <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 500}}>
              <input type="checkbox" checked={currentProject.showLabels} onChange={(e) => updateCurrentProject({ showLabels: e.target.checked })} />
              Show Technical Labels
           </label>
           <div style={{fontSize: '12px', color: '#64748b', marginTop: '5px'}}>Scroll to Zoom, Drag to Pan</div>
        </div>
        <SchemeRenderer />
      </section>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('input');
  return (
    <div className="app-layout">
      <header className="header">
        <h1>☀️ SolarGraph Pro</h1>
        <div className="nav-tabs">
          <div className={`nav-tab ${activeTab === 'input' ? 'active' : ''}`} onClick={() => setActiveTab('input')}>Dashboard</div>
          <div className={`nav-tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>Hardware Library</div>
          <div className={`nav-tab ${activeTab === 'archive' ? 'active' : ''}`} onClick={() => setActiveTab('archive')}>My Projects</div>
        </div>
      </header>
      <main className="main-content">
        {activeTab === 'input' && <InputCenter />}
        {activeTab === 'library' && <HardwareLibrary />}
        {activeTab === 'archive' && <ProjectArchive />}
      </main>
    </div>
  );
}

export default App;
