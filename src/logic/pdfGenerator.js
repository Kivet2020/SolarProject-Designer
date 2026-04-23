import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import 'svg2pdf.js';

// Language Dictionary for PDF (Simplified i18n for PDF Generator)
const DICT = {
  EN: {
    title: "SOLAR POWER PLANT PROJECT",
    date: "Date",
    engineer: "Engineer",
    powerDC: "Total DC Power",
    powerAC: "Total AC Power",
    bomTitle: "BILL OF MATERIALS (BOM)",
    item: "Item",
    desc: "Description",
    qty: "Qty",
    notes: "Notes",
    panel: "PV Modules",
    inverter: "Inverters",
    cable: "Cables",
    protection: "Protection Devices",
    apprTitle: "Role",
    apprName: "Name",
    apprSig: "Signature",
    apprDate: "Date",
    stamp: "Place Stamp Here",
    page: "Page"
  },
  ES: {
    title: "PROYECTO DE PLANTA SOLAR",
    date: "Fecha",
    engineer: "Ingeniero",
    powerDC: "Potencia Total DC",
    powerAC: "Potencia Total AC",
    bomTitle: "LISTA DE MATERIALES (BOM)",
    item: "Ítem",
    desc: "Descripción",
    qty: "Cant.",
    notes: "Notas",
    panel: "Módulos FV",
    inverter: "Inversores",
    cable: "Cables",
    protection: "Dispositivos de Protección",
    apprTitle: "Cargo",
    apprName: "Nombre",
    apprSig: "Firma",
    apprDate: "Fecha",
    stamp: "Sello Aquí",
    page: "Página"
  },
  RU: {
    title: "ПРОЕКТ СОЛНЕЧНОЙ ЭЛЕКТРОСТАНЦИИ",
    date: "Дата",
    engineer: "Инженер",
    powerDC: "Общая мощность DC",
    powerAC: "Общая мощность AC",
    bomTitle: "СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ (BOM)",
    item: "Поз.",
    desc: "Наименование",
    qty: "Кол-во",
    notes: "Прим.",
    panel: "Солнечные панели",
    inverter: "Инверторы",
    cable: "Кабельная продукция",
    protection: "Защитная автоматика",
    apprTitle: "Должность",
    apprName: "ФИО",
    apprSig: "Подпись",
    apprDate: "Дата",
    stamp: "М.П.",
    page: "Страница"
  }
};

export const generatePDF = async (project, db, svgElement, lang = 'EN') => {
  const t = DICT[lang] || DICT['EN'];
  
  // Create PDF Document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Metadata
  doc.setProperties({
    title: `${project.name} - Single Line Diagram & BOM`,
    author: "SolarGraph Pro Engineer",
    creator: "SolarGraph Pro Software"
  });

  // Calculate project values
  const panel = db.library.panels.find(p => p.id === project.panelId);
  const inverter = db.library.inverters.find(i => i.id === project.inverterId);
  
  const totalPanels = project.numPanels * project.numStrings;
  const totalDcPower = ((panel?.Pmax || 0) * totalPanels / 1000).toFixed(2);
  const totalAcPower = ((inverter?.powerKW || 0) * project.numInverters).toFixed(2);

  // Helper for footer (Approved By & Stamp)
  const drawFooter = (docInst, yPos) => {
    docInst.setFontSize(10);
    docInst.setTextColor(100);
    docInst.line(20, yPos, 190, yPos); // Horizontal line
    
    docInst.text(`${t.apprTitle}: __________________`, 20, yPos + 10);
    docInst.text(`${t.apprName}: __________________`, 70, yPos + 10);
    docInst.text(`${t.apprSig}: __________________`, 120, yPos + 10);
    docInst.text(`${t.apprDate}: __________________`, 170, yPos + 10);

    // Stamp Placeholder
    docInst.rect(150, yPos + 15, 40, 40);
    docInst.text(t.stamp, 170, yPos + 35, { align: "center" });
  };

  const addPageNumber = (docInst, pageNum, totalPages, isA3 = false) => {
    docInst.setFontSize(10);
    const xPos = isA3 ? 400 : 190;
    const yPos = isA3 ? 285 : 290;
    docInst.text(`${t.page} ${pageNum} / ${totalPages}`, xPos, yPos, { align: "right" });
  };

  // --- PAGE 1: TITLE PAGE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(t.title, 105, 50, { align: "center" });
  
  // Logo Logic
  if (project.logoBase64) {
    try {
      doc.addImage(project.logoBase64, 'JPEG', 75, 70, 60, 40, '', 'FAST');
    } catch (e) {
      doc.rect(75, 70, 60, 40);
      doc.text("INVALID LOGO FORMAT", 105, 90, { align: "center" });
    }
  } else {
    doc.rect(75, 70, 60, 40);
    doc.setFontSize(12);
    doc.text("PLACE LOGO HERE", 105, 90, { align: "center" });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(`Project Name: ${project.name}`, 20, 130);
  doc.text(`Location: ${project.location || 'N/A'}`, 20, 140);
  doc.text(`${t.date}: ${project.date}`, 20, 150);
  doc.text(`${t.engineer}: ________________________`, 20, 160);

  doc.setFont("helvetica", "bold");
  doc.text(`Project Summary:`, 20, 180);
  doc.setFont("helvetica", "normal");
  doc.text(`${t.powerDC}: ${totalDcPower} kWp`, 25, 190);
  doc.text(`${t.powerAC}: ${totalAcPower} kW`, 25, 200);
  doc.text(`Total Inverters: ${project.numInverters} units`, 25, 210);
  doc.text(`Total Panels: ${totalPanels} units`, 25, 220);

  doc.setFont("helvetica", "bold");
  doc.text(`Site Context:`, 120, 180);
  doc.setFont("helvetica", "normal");
  doc.text(`Mounting: ${project.mountingType || 'N/A'}`, 125, 190);
  doc.text(`Tilt Angle: ${project.tiltAngle || 0}°`, 125, 200);
  doc.text(`Azimuth: ${project.azimuth || 0}°`, 125, 210);
  doc.text(`Temp Range: ${project.minTemp}°C to ${project.maxTemp}°C`, 125, 220);

  drawFooter(doc, 240);

  // --- PAGE 2: BILL OF MATERIALS (BOM) ---
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(t.bomTitle, 105, 20, { align: "center" });

  const tableData = [
    [t.panel, `${panel?.mfg} ${panel?.model} ${panel?.Pmax}W`, totalPanels, ""],
    [t.inverter, `${inverter?.mfg} ${inverter?.model} ${inverter?.powerKW}kW`, project.numInverters, "MPPT Config"],
    [t.cable, "DC String Cables (4mm2/6mm2)", "1", "Lot"],
    [t.cable, "Main AC Collection Cable", "1", "Lot"],
    [t.protection, "DC Fuses & Switch Disconnectors", project.numStrings * 2, ""],
    [t.protection, "DC SPD (Type II)", project.numInverters, "Parallel to Inverter"],
    [t.protection, "AC Breakers (MCCB)", project.numInverters, ""],
    [t.protection, "AC SPD (Type II)", "1", "Main Busbar"]
  ];

  doc.autoTable({
    startY: 30,
    head: [[t.item, t.desc, t.qty, t.notes]],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 10, font: "helvetica" }
  });

  drawFooter(doc, doc.lastAutoTable.finalY + 30);

  // --- PAGE 3: SVG DIAGRAM (A3 Landscape) ---
  doc.addPage("a3", "landscape");
  
  if (svgElement) {
    // Note: svg2pdf is asynchronous but integrated via doc.svg if plugin is loaded correctly, 
    // or we use a workaround by capturing SVG to Canvas. Since we assume svg2pdf is standard here:
    try {
      await doc.svg(svgElement, {
        x: 10,
        y: 10,
        width: 400, // Fit inside A3
        height: 270
      });
    } catch (e) {
      console.warn("SVG Rendering failed, falling back to text error", e);
      doc.text("SVG Render Error. Ensure svg2pdf.js is properly linked.", 20, 20);
    }
  }

  // Draw A3 footer manually
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.line(20, 270, 400, 270);
  doc.text(`${t.apprTitle}: _____________`, 20, 280);
  doc.text(`${t.apprName}: _____________`, 80, 280);
  doc.text(`${t.apprSig}: _____________`, 140, 280);
  doc.text(`${t.apprDate}: _____________`, 200, 280);
  
  doc.rect(340, 230, 40, 40);
  doc.text(t.stamp, 360, 250, { align: "center" });

  // Add Page Numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addPageNumber(doc, i, pageCount, i === 3);
  }

  // Generate File
  const filename = `${project.name.replace(/[^a-z0-9]/gi, '_')}_${project.date}_${lang}.pdf`;
  doc.save(filename);
};
