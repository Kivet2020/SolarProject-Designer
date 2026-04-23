import { create } from 'zustand';

const defaultLibrary = {
  panels: [
    { id: "p1", mfg: "Jinko", model: "Tiger Neo N-type 575W", Pmax: 575, Voc: 51.27, Isc: 14.19, Vmpp: 42.22, Impp: 13.61, tempCoefVoc: -0.25 },
    { id: "p2", mfg: "Longi", model: "Hi-MO X10 (LR8-66HVD-645M)", Pmax: 645, Voc: 49.62, Isc: 16.46, Vmpp: 40.88, Impp: 15.78, tempCoefVoc: -0.20, bifaciality: 0.75, width: 2382, height: 1134, weight: 33.5 },
    { id: "p3", mfg: "Trina", model: "Vertex 670W", Pmax: 670, Voc: 46.10, Isc: 18.62, Vmpp: 38.2, Impp: 17.55, tempCoefVoc: -0.24 }
  ],
  inverters: [
    { id: "i1", mfg: "Huawei", model: "SUN2000-100KTL-M2", powerKW: 100, maxInputVoltage: 1100, mpptMinVoltage: 200, mpptMaxVoltage: 1000, mpptCount: 10, maxMpptCurrent: 30, phases: 3, type: "Grid-tied" },
    { id: "i2", mfg: "Sungrow", model: "SG110CX", powerKW: 110, maxInputVoltage: 1100, mpptMinVoltage: 200, mpptMaxVoltage: 1000, mpptCount: 9, maxMpptCurrent: 26, phases: 3, type: "Grid-tied" },
    { id: "i3", mfg: "Solis", model: "110K-5G", powerKW: 110, maxInputVoltage: 1100, mpptMinVoltage: 200, mpptMaxVoltage: 1000, mpptCount: 10, maxMpptCurrent: 26, phases: 3, type: "Grid-tied" },
    { id: "i4", mfg: "Deye", model: "SUN-50K-SG01HP3", powerKW: 50, maxInputVoltage: 1000, mpptMinVoltage: 150, mpptMaxVoltage: 850, mpptCount: 4, maxMpptCurrent: 36, phases: 3, type: "Hybrid", batteryType: "HV" },
    { id: "i4b", mfg: "Deye", model: "SUN-8K-SG01LP1", powerKW: 8, maxInputVoltage: 500, mpptMinVoltage: 150, mpptMaxVoltage: 425, mpptCount: 2, maxMpptCurrent: 13, phases: 1, type: "Hybrid", batteryType: "LV" },
    { id: "i5", mfg: "Deye", model: "SUN-110K-G03", powerKW: 110, maxInputVoltage: 1100, mpptMinVoltage: 200, mpptMaxVoltage: 1000, mpptCount: 6, maxMpptCurrent: 40, phases: 3, type: "Grid-tied" },
    { id: "i6", mfg: "Deye", model: "SUN-136K-G01P3", powerKW: 136, maxInputVoltage: 1100, mpptMinVoltage: 200, mpptMaxVoltage: 1000, mpptCount: 8, maxMpptCurrent: 40, phases: 3, type: "Grid-tied" }
  ],
  batteries: [
    { id: "b1", mfg: "Dyness", model: "Powerbox Pro", capacityKwh: 10.24, voltage: 51.2, maxDischargeA: 100, chemistry: "LiFePO4", type: "LV" },
    { id: "b2", mfg: "Dyness", model: "DL5.0C", capacityKwh: 5.12, voltage: 51.2, maxDischargeA: 100, chemistry: "LiFePO4", type: "LV" },
    { id: "b3", mfg: "Dyness", model: "Tower TS10", capacityKwh: 10.66, voltage: 288, chemistry: "LiFePO4", type: "HV" }
  ],
  cables: [
    { id: "c1", mfg: "Nexans", name: "Solar PV 4mm²", section: 4, material: "Copper", maxCurrent: 44, resistance: 4.95, insulation: "Solar PV UV", nominalVoltage: "DC 1500V", cableType: "DC" },
    { id: "c2", mfg: "Prysmian", name: "Tecsun 6mm²", section: 6, material: "Copper", maxCurrent: 57, resistance: 3.3, insulation: "Solar PV UV", nominalVoltage: "DC 1500V", cableType: "DC" },
    { id: "c3", mfg: "General Cable", name: "RV-K 95mm²", section: 95, material: "Copper", maxCurrent: 250, resistance: 0.193, insulation: "XLPE", nominalVoltage: "AC 0.6/1kV", cableType: "AC" }
  ],
  dcProtection: [
    { id: "dcp1", name: "Bussmann gPV 15A 1500V", type: "Fuse", nominalCurrent: 15, maxVoltage: 1500 },
    { id: "dcp2", name: "Suntree DC SPD Type II 1000V", type: "SPD", maxVoltage: 1000 },
    { id: "dcp3", name: "DC Load Break Switch 32A", type: "Switch", nominalCurrent: 32, maxVoltage: 1000 }
  ],
  acProtection: [
    { id: "acp1", name: "Schneider Compact NSX 160A", type: "MCCB", nominalCurrent: 160, curve: "C", phases: 3 },
    { id: "acp2", name: "ABB Tmax 250A", type: "MCCB", nominalCurrent: 250, curve: "C", phases: 3 },
    { id: "acp3", name: "Schneider iPRD AC SPD Type II", type: "SPD", maxVoltage: 400 }
  ]
};

const loadInitialState = () => {
  const saved = localStorage.getItem('solarGraphDB');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Data migration check for batteries
      if (!parsed.library.batteries) {
         parsed.library.batteries = defaultLibrary.batteries;
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse local DB");
    }
  }
  return { library: defaultLibrary, projects: [] };
};

const useProjectStore = create((set, get) => ({
  db: loadInitialState(),

  currentProject: {
    id: null,
    name: "Utility Scale 650kW",
    date: new Date().toISOString().split('T')[0],
    location: "Madrid, Spain",
    tiltAngle: 25,
    azimuth: 180,
    mountingType: "Ground Mount",
    minTemp: -10,
    maxTemp: 70,
    panelId: "p1",
    inverterId: "i4", // Hybrid 50K
    batteryId: "b3", // TS10 HV
    dcCableId: "c1",
    acCableId: "c3",
    numPanels: 20,
    numStrings: 10,
    numInverters: 6,
    stringsPerMppt: 2,
    bifacialGain: 0,
    logoBase64: null,
    overrides: {},
    showLabels: true,
    isLocked: false
  },

  toggleLock: () => set((state) => ({
    currentProject: { ...state.currentProject, isLocked: !state.currentProject.isLocked }
  })),

  saveDB: (newDb) => {
    localStorage.setItem('solarGraphDB', JSON.stringify(newDb));
    set({ db: newDb });
  },

  updateCurrentProject: (updates) => set((state) => ({
    currentProject: { ...state.currentProject, ...updates }
  })),

  addComponent: (category, componentData) => {
    const state = get();
    const newDb = { ...state.db };
    newDb.library[category] = [...newDb.library[category], { ...componentData, id: Date.now().toString() }];
    state.saveDB(newDb);
  },

  updateComponent: (category, id, componentData) => {
    const state = get();
    const newDb = { ...state.db };
    const index = newDb.library[category].findIndex(c => c.id === id);
    if (index >= 0) {
      newDb.library[category][index] = { ...componentData, id };
      state.saveDB(newDb);
    }
  },

  removeComponent: (category, id) => {
    const state = get();
    const newDb = { ...state.db };
    newDb.library[category] = newDb.library[category].filter(c => c.id !== id);
    state.saveDB(newDb);
  },

  saveCurrentProjectToArchive: () => {
    const state = get();
    const newDb = { ...state.db };
    const project = { ...state.currentProject };
    if (!project.id) project.id = Date.now().toString();
    const existingIndex = newDb.projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) newDb.projects[existingIndex] = project;
    else newDb.projects.push(project);
    state.saveDB(newDb);
    set({ currentProject: project });
  },

  loadProjectFromArchive: (id) => {
    const state = get();
    const project = state.db.projects.find(p => p.id === id);
    if (project) set({ currentProject: project });
  },

  exportDB: () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(get().db, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "solargraph_database.json");
    dlAnchorElem.click();
  },

  importDB: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.library && data.projects) {
        get().saveDB(data);
        alert("Database imported successfully!");
      }
    } catch (e) {
      alert("Failed to parse JSON.");
    }
  }
}));

export default useProjectStore;
