import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateFullHisPdf = (data: any = {}) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  let pageNum = 1;

  const headerColor = [60, 70, 130];
  const yellowHeader = [255, 230, 100];

  const addPageHeader = (sectionTitle: string) => {
    doc.setFillColor(...headerColor);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("Monthly Health Information Report", pageWidth / 2, 12, { align: "center" });
    doc.setFontSize(11);
    doc.text("Health Information System v0.9.30", pageWidth / 2, 19, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Name of Organisation: ${data.organisation || 'Select Name'}`, 15, 35);
    doc.text(`Name of Camp: ${data.camp || 'Select Camp'}`, 15, 42);
    doc.text(`Current Month: ${data.month || 'Select Month'}`, 120, 35);
    doc.text(`Current Year: ${data.year || 'Select Year'}`, 120, 42);

    doc.setFontSize(13);
    doc.text(sectionTitle, pageWidth / 2, 58, { align: "center" });
    doc.line(12, 62, pageWidth - 12, 62);

    doc.setFontSize(9);
    doc.text(`Page ${pageNum}`, pageWidth - 30, 20);
    pageNum++;

    return 70;
  };

  const newSection = (title: string) => {
    doc.addPage();
    return addPageHeader(title);
  };

  let y: number;

  // 1.0 General Information
  y = addPageHeader("1.0 General Information");
  autoTable(doc, {
    startY: y,
    head: [['1.2 Population', 'Male', 'Female', 'Total']],
    body: [
      ['Total Population', data.totalPopMale || 0, data.totalPopFemale || 0, data.totalPop || 0],
      ['Number of live births', '', '', data.liveBirths || 0],
      ['Number of infants < 1 year', '', '', data.infants || 0],
      ['Number of children < 5 years', '', '', data.childrenUnder5 || 0],
      ['Number of females 15-49 years', '', data.females1549 || 0, ''],
      ['Number of pregnant and lactating', '', data.pregnantLactating || 0, ''],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader },
    theme: 'grid'
  });

  // 2.0 Mortality
  y = newSection("2.0 Mortality");
  autoTable(doc, {
    startY: y,
    head: [['2.1 Mortality by Age', '<5 Refugee', '≥5 Refugee', 'National', 'Total']],
    body: [
      ['Male', data.mortMaleU5 || 0, data.mortMaleGE5 || 0, 0, ''],
      ['Female', data.mortFemaleU5 || 0, data.mortFemaleGE5 || 0, 0, ''],
      ['Total', data.mortU5 || 0, data.mortGE5 || 0, 0, data.totalDeaths || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 15;
  autoTable(doc, {
    startY: y,
    head: [['2.2 Mortality by Cause', '<5 Ref', 'Total Ref', 'National']],
    body: [
      ['Malaria', 0, 0, 0], ['ARI', 0, 0, 0], ['Watery diarrhoea', 0, 0, 0],
      ['Bloody diarrhoea', 0, 0, 0], ['Tuberculosis', 0, 0, 0], ['Measles', 0, 0, 0],
      ['Meningitis', 0, 0, 0], ['AIDS', 0, 0, 0], ['Maternal death', 0, 0, 0],
      ['Neonatal death', 0, 0, 0], ['Acute malnutrition', 0, 0, 0],
      ['Other', 0, data.otherDeaths || 0, 0], ['Total', 0, data.totalDeaths || 0, 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  // 3.0 Morbidity
  y = newSection("3.0 Morbidity");

  // 3.1 Consultation
  autoTable(doc, {
    startY: y,
    head: [['3.1 Consultation', 'M', 'F', 'Nat', 'Total']],
    body: [
      ['New Visits', data.newVisitsM || 0, data.newVisitsF || 0, data.newVisitsNat || 0, (data.newVisitsM || 0) + (data.newVisitsF || 0) + (data.newVisitsNat || 0)],
      ['Revisits', data.revisitsM || 0, data.revisitsF || 0, data.revisitsNat || 0, (data.revisitsM || 0) + (data.revisitsF || 0) + (data.revisitsNat || 0)],
      ['Total', data.totalConsultM || 0, data.totalConsultF || 0, data.totalConsultNat || 0, (data.totalConsultM || 0) + (data.totalConsultF || 0) + (data.totalConsultNat || 0)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader },
    theme: 'grid'
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text("3.2 Morbidity", 15, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [
      [
        { content: 'Diagnosis', rowSpan: 2 },
        { content: '< 5', colSpan: 3 },
        { content: 'Refugee', colSpan: 3 },
        { content: '≥ 5', colSpan: 2 },
        { content: 'Total Crude', rowSpan: 2 },
        { content: 'Crude Incid.', rowSpan: 2 },
        { content: 'Crude % Morb.', rowSpan: 2 },
        { content: 'National', colSpan: 2 },
        { content: 'Total Crude', rowSpan: 2 }
      ],
      [
        '', 'M', 'F', 'Total', 'U5 Incid.', 'U5 % Morb.', 'M', 'F', '', '', '', '< 5', '≥ 5', ''
      ]
    ],
    body: [
      ['URTI', data.urtiU5M||0, data.urtiU5F||0, data.urtiU5T||0, data.urtiU5Incid||0, data.urtiU5Perc||0, data.urtiGE5M||0, data.urtiGE5F||0, data.urtiTotal||0, data.urtiCrudeIncid||0, data.urtiCrudeMorb||0, data.urtiNatU5||0, data.urtiNatGE5||0, data.urtiNatTotal||0],
      ['LRTI', data.lrtiU5M||0, data.lrtiU5F||0, data.lrtiU5T||0, data.lrtiU5Incid||0, data.lrtiU5Perc||0, data.lrtiGE5M||0, data.lrtiGE5F||0, data.lrtiTotal||0, data.lrtiCrudeIncid||0, data.lrtiCrudeMorb||0, data.lrtiNatU5||0, data.lrtiNatGE5||0, data.lrtiNatTotal||0],
      ['* Watery diarrhoea', data.wDiarrU5M||0, data.wDiarrU5F||0, data.wDiarrU5T||0, data.wDiarrU5Incid||0, data.wDiarrU5Perc||0, data.wDiarrGE5M||0, data.wDiarrGE5F||0, data.wDiarrTotal||0, data.wDiarrCrudeIncid||0, data.wDiarrCrudeMorb||0, data.wDiarrNatU5||0, data.wDiarrNatGE5||0, data.wDiarrNatTotal||0],
      ['* Bloody diarrhoea', data.bDiarrU5M||0, data.bDiarrU5F||0, data.bDiarrU5T||0, data.bDiarrU5Incid||0, data.bDiarrU5Perc||0, data.bDiarrGE5M||0, data.bDiarrGE5F||0, data.bDiarrTotal||0, data.bDiarrCrudeIncid||0, data.bDiarrCrudeMorb||0, data.bDiarrNatU5||0, data.bDiarrNatGE5||0, data.bDiarrNatTotal||0],
      ['Skin disease', data.skinU5M||0, data.skinU5F||0, data.skinU5T||0, data.skinU5Incid||0, data.skinU5Perc||0, data.skinGE5M||0, data.skinGE5F||0, data.skinTotal||0, data.skinCrudeIncid||0, data.skinCrudeMorb||0, data.skinNatU5||0, data.skinNatGE5||0, data.skinNatTotal||0],
      ['Eye Disease', data.eyeU5M||0, data.eyeU5F||0, data.eyeU5T||0, data.eyeU5Incid||0, data.eyeU5Perc||0, data.eyeGE5M||0, data.eyeGE5F||0, data.eyeTotal||0, data.eyeCrudeIncid||0, data.eyeCrudeMorb||0, data.eyeNatU5||0, data.eyeNatGE5||0, data.eyeNatTotal||0],
      ['Intestinal worms', data.wormsU5M||0, data.wormsU5F||0, data.wormsU5T||0, data.wormsU5Incid||0, data.wormsU5Perc||0, data.wormsGE5M||0, data.wormsGE5F||0, data.wormsTotal||0, data.wormsCrudeIncid||0, data.wormsCrudeMorb||0, data.wormsNatU5||0, data.wormsNatGE5||0, data.wormsNatTotal||0],
      ['* Malaria (confirmed)', data.malConfU5M||0, data.malConfU5F||0, data.malConfU5T||0, data.malConfU5Incid||0, data.malConfU5Perc||0, data.malConfGE5M||0, data.malConfGE5F||0, data.malConfTotal||0, data.malConfCrudeIncid||0, data.malConfCrudeMorb||0, data.malConfNatU5||0, data.malConfNatGE5||0, data.malConfNatTotal||0],
      ['Malaria (suspected)', data.malSuspU5M||0, data.malSuspU5F||0, data.malSuspU5T||0, data.malSuspU5Incid||0, data.malSuspU5Perc||0, data.malSuspGE5M||0, data.malSuspGE5F||0, data.malSuspTotal||0, data.malSuspCrudeIncid||0, data.malSuspCrudeMorb||0, data.malSuspNatU5||0, data.malSuspNatGE5||0, data.malSuspNatTotal||0],
      ['Tuberculosis', data.tbU5M||0, data.tbU5F||0, data.tbU5T||0, data.tbU5Incid||0, data.tbU5Perc||0, data.tbGE5M||0, data.tbGE5F||0, data.tbTotal||0, data.tbCrudeIncid||0, data.tbCrudeMorb||0, data.tbNatU5||0, data.tbNatGE5||0, data.tbNatTotal||0],
      ['Leprosy', data.leprosyU5M||0, data.leprosyU5F||0, data.leprosyU5T||0, data.leprosyU5Incid||0, data.leprosyU5Perc||0, data.leprosyGE5M||0, data.leprosyGE5F||0, data.leprosyTotal||0, data.leprosyCrudeIncid||0, data.leprosyCrudeMorb||0, data.leprosyNatU5||0, data.leprosyNatGE5||0, data.leprosyNatTotal||0],
      ['Acute Flaccid Paralysis / Polio', data.afpU5M||0, data.afpU5F||0, data.afpU5T||0, data.afpU5Incid||0, data.afpU5Perc||0, data.afpGE5M||0, data.afpGE5F||0, data.afpTotal||0, data.afpCrudeIncid||0, data.afpCrudeMorb||0, data.afpNatU5||0, data.afpNatGE5||0, data.afpNatTotal||0],
      ['* Measles', data.measlesU5M||0, data.measlesU5F||0, data.measlesU5T||0, data.measlesU5Incid||0, data.measlesU5Perc||0, data.measlesGE5M||0, data.measlesGE5F||0, data.measlesTotal||0, data.measlesCrudeIncid||0, data.measlesCrudeMorb||0, data.measlesNatU5||0, data.measlesNatGE5||0, data.measlesNatTotal||0],
      ['* Meningitis', data.meningU5M||0, data.meningU5F||0, data.meningU5T||0, data.meningU5Incid||0, data.meningU5Perc||0, data.meningGE5M||0, data.meningGE5F||0, data.meningTotal||0, data.meningCrudeIncid||0, data.meningCrudeMorb||0, data.meningNatU5||0, data.meningNatGE5||0, data.meningNatTotal||0],
      ['HIV/AIDS', data.hivU5M||0, data.hivU5F||0, data.hivU5T||0, data.hivU5Incid||0, data.hivU5Perc||0, data.hivGE5M||0, data.hivGE5F||0, data.hivTotal||0, data.hivCrudeIncid||0, data.hivCrudeMorb||0, data.hivNatU5||0, data.hivNatGE5||0, data.hivNatTotal||0],
      ['** STI (non-HIV/AIDS)', data.stiU5M||0, data.stiU5F||0, data.stiU5T||0, data.stiU5Incid||0, data.stiU5Perc||0, data.stiGE5M||0, data.stiGE5F||0, data.stiTotal||0, data.stiCrudeIncid||0, data.stiCrudeMorb||0, data.stiNatU5||0, data.stiNatGE5||0, data.stiNatTotal||0],
      ['Acute malnutrition', data.acuteMalU5M||0, data.acuteMalU5F||0, data.acuteMalU5T||0, data.acuteMalU5Incid||0, data.acuteMalU5Perc||0, data.acuteMalGE5M||0, data.acuteMalGE5F||0, data.acuteMalTotal||0, data.acuteMalCrudeIncid||0, data.acuteMalCrudeMorb||0, data.acuteMalNatU5||0, data.acuteMalNatGE5||0, data.acuteMalNatTotal||0],
      ['Anaemia', data.anaemiaU5M||0, data.anaemiaU5F||0, data.anaemiaU5T||0, data.anaemiaU5Incid||0, data.anaemiaU5Perc||0, data.anaemiaGE5M||0, data.anaemiaGE5F||0, data.anaemiaTotal||0, data.anaemiaCrudeIncid||0, data.anaemiaCrudeMorb||0, data.anaemiaNatU5||0, data.anaemiaNatGE5||0, data.anaemiaNatTotal||0],
      ['*** Injuries', data.injuriesU5M||0, data.injuriesU5F||0, data.injuriesU5T||0, data.injuriesU5Incid||0, data.injuriesU5Perc||0, data.injuriesGE5M||0, data.injuriesGE5F||0, data.injuriesTotal||0, data.injuriesCrudeIncid||0, data.injuriesCrudeMorb||0, data.injuriesNatU5||0, data.injuriesNatGE5||0, data.injuriesNatTotal||0],
      ['Dental', data.dentalU5M||0, data.dentalU5F||0, data.dentalU5T||0, data.dentalU5Incid||0, data.dentalU5Perc||0, data.dentalGE5M||0, data.dentalGE5F||0, data.dentalTotal||0, data.dentalCrudeIncid||0, data.dentalCrudeMorb||0, data.dentalNatU5||0, data.dentalNatGE5||0, data.dentalNatTotal||0],
      ['Gastritis', data.gastritisU5M||0, data.gastritisU5F||0, data.gastritisU5T||0, data.gastritisU5Incid||0, data.gastritisU5Perc||0, data.gastritisGE5M||0, data.gastritisGE5F||0, data.gastritisTotal||0, data.gastritisCrudeIncid||0, data.gastritisCrudeMorb||0, data.gastritisNatU5||0, data.gastritisNatGE5||0, data.gastritisNatTotal||0],
      ['Surgical', data.surgicalU5M||0, data.surgicalU5F||0, data.surgicalU5T||0, data.surgicalU5Incid||0, data.surgicalU5Perc||0, data.surgicalGE5M||0, data.surgicalGE5F||0, data.surgicalTotal||0, data.surgicalCrudeIncid||0, data.surgicalCrudeMorb||0, data.surgicalNatU5||0, data.surgicalNatGE5||0, data.surgicalNatTotal||0],
      ['Gynaecological', data.gynU5M||0, data.gynU5F||0, data.gynU5T||0, data.gynU5Incid||0, data.gynU5Perc||0, data.gynGE5M||0, data.gynGE5F||0, data.gynTotal||0, data.gynCrudeIncid||0, data.gynCrudeMorb||0, data.gynNatU5||0, data.gynNatGE5||0, data.gynNatTotal||0],
      ['Hypertension', data.htnU5M||0, data.htnU5F||0, data.htnU5T||0, data.htnU5Incid||0, data.htnU5Perc||0, data.htnGE5M||0, data.htnGE5F||0, data.htnTotal||0, data.htnCrudeIncid||0, data.htnCrudeMorb||0, data.htnNatU5||0, data.htnNatGE5||0, data.htnNatTotal||0],
      ['Diabetes', data.diabetesU5M||0, data.diabetesU5F||0, data.diabetesU5T||0, data.diabetesU5Incid||0, data.diabetesU5Perc||0, data.diabetesGE5M||0, data.diabetesGE5F||0, data.diabetesTotal||0, data.diabetesCrudeIncid||0, data.diabetesCrudeMorb||0, data.diabetesNatU5||0, data.diabetesNatGE5||0, data.diabetesNatTotal||0],
      ['Mental illness', data.mentalU5M||0, data.mentalU5F||0, data.mentalU5T||0, data.mentalU5Incid||0, data.mentalU5Perc||0, data.mentalGE5M||0, data.mentalGE5F||0, data.mentalTotal||0, data.mentalCrudeIncid||0, data.mentalCrudeMorb||0, data.mentalNatU5||0, data.mentalNatGE5||0, data.mentalNatTotal||0],
      ['Other', data.otherU5M||0, data.otherU5F||0, data.otherU5T||0, data.otherU5Incid||0, data.otherU5Perc||0, data.otherGE5M||0, data.otherGE5F||0, data.otherTotal||0, data.otherCrudeIncid||0, data.otherCrudeMorb||0, data.otherNatU5||0, data.otherNatGE5||0, data.otherNatTotal||0],
      ['Total', data.totalU5M||0, data.totalU5F||0, data.totalU5||0, '', '', data.totalGE5M||0, data.totalGE5F||0, data.totalCrude||0, '', '', data.totalNatU5||0, data.totalNatGE5||0, data.totalNatCrude||0]
    ],
    styles: { fontSize: 6.5, cellPadding: 1.2, lineColor: [0,0,0], lineWidth: 0.1 },
    headStyles: { fillColor: yellowHeader, fontSize: 7, halign: 'center', lineColor: [0,0,0], lineWidth: 0.2 },
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 38 }, 1: { cellWidth: 9 }, 2: { cellWidth: 9 }, 3: { cellWidth: 12 },
      4: { cellWidth: 13 }, 5: { cellWidth: 13 }, 6: { cellWidth: 9 }, 7: { cellWidth: 9 },
      8: { cellWidth: 14 }, 9: { cellWidth: 14 }, 10: { cellWidth: 14 }, 11: { cellWidth: 11 },
      12: { cellWidth: 11 }, 13: { cellWidth: 14 }
    }
  });

  y = newSection("3.3 Outbreak Alert, STI & Dehydration");

  autoTable(doc, {
    startY: y,
    head: [['3.4 STI', '<18 M', '<18 F', 'Total <18', '≥18 M', '≥18 F', 'Total ≥18', 'Total Crude', 'C\'tact treated', 'Nat']],
    body: [
      ['UDS', data.udsU18M||0, data.udsU18F||0, data.udsU18T||0, data.udsGE18M||0, data.udsGE18F||0, data.udsGE18T||0, data.udsTotal||0, data.udsContact||0, data.udsNat||0],
      ['VDS', data.vdsU18M||0, data.vdsU18F||0, data.vdsU18T||0, data.vdsGE18M||0, data.vdsGE18F||0, data.vdsGE18T||0, data.vdsTotal||0, data.vdsContact||0, data.vdsNat||0],
      ['GUD', data.gudU18M||0, data.gudU18F||0, data.gudU18T||0, data.gudGE18M||0, data.gudGE18F||0, data.gudGE18T||0, data.gudTotal||0, data.gudContact||0, data.gudNat||0],
      ['PID', data.pidU18M||0, data.pidU18F||0, data.pidU18T||0, data.pidGE18M||0, data.pidGE18F||0, data.pidGE18T||0, data.pidTotal||0, data.pidContact||0, data.pidNat||0],
      ['Total', data.stiTotalU18M||0, data.stiTotalU18F||0, data.stiTotalU18||0, data.stiTotalGE18M||0, data.stiTotalGE18F||0, data.stiTotalGE18||0, data.stiTotal||0, data.stiContactTotal||0, data.stiNatTotal||0],
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  autoTable(doc, {
    startY: y,
    head: [['3.5 Dehydration', 'Refugee M', 'Refugee F', 'Total Refugee', 'Nat', 'Total']],
    body: [
      ['No dehydration', data.dehydNoM||0, data.dehydNoF||0, data.dehydNoT||0, data.dehydNoNat||0, data.dehydNoTotal||0],
      ['Some dehydration', data.dehydSomeM||0, data.dehydSomeF||0, data.dehydSomeT||0, data.dehydSomeNat||0, data.dehydSomeTotal||0],
      ['Severe dehydration', data.dehydSevereM||0, data.dehydSevereF||0, data.dehydSevereT||0, data.dehydSevereNat||0, data.dehydSevereTotal||0],
      ['Total', data.dehydTotalM||0, data.dehydTotalF||0, data.dehydTotalRef||0, data.dehydTotalNat||0, data.dehydTotal||0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  // 4.0 In-patient Department & Referral
  y = newSection("4.0 In-patient Department & Referral");
  autoTable(doc, {
    startY: y,
    head: [['4.2 Inpatient Admissions and Deaths', 'Admissions', 'Deaths']],
    body: [
      ['Malaria', data.ipdMalariaAdm || 0, data.ipdMalariaDeath || 0],
      ['ARI', data.ipdAriAdm || 0, data.ipdAriDeath || 0],
      ['Watery diarrhoea', data.ipdDiarrAdm || 0, data.ipdDiarrDeath || 0],
      ['Tuberculosis', data.ipdTbAdm || 0, data.ipdTbDeath || 0],
      ['Other', data.ipdOtherAdm || 0, data.ipdOtherDeath || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  // ==================== 5.0 LABORATORY (Updated to match image) ====================
  y = newSection("5.0 Laboratory");

  // 5.1 Malaria
  doc.setFontSize(11);
  doc.text("5.1 Malaria", 15, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Number of malaria slides examined', '']],
    body: [['Number of malaria slides positive', '']],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader },
    theme: 'grid'
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: y,
    head: [['Malaria Indicator', '']],
    body: [['Malaria slide positivity rate', '']],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader },
    theme: 'grid'
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // 5.2 Tuberculosis
  doc.setFontSize(11);
  doc.text("5.2 Tuberculosis", 15, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Number of smears examined for AFB', '']],
    body: [
      ['Number of smears positive for AFB', ''],
      ['Number of new smear-positive patients', '']
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader },
    theme: 'grid'
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: y,
    head: [['Tuberculosis Indicator', '']],
    body: [['Sputum smear-positivity rate', '']],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader },
    theme: 'grid'
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // 5.3 Blood Donation
  doc.setFontSize(11);
  doc.text("5.3 Blood Donation", 15, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [
      [' ', 'Refugee', '', '', 'National', '', ''],
      ['Blood Donation', 'Male', 'Female', 'Total', 'Male', 'Female', 'Total']
    ],
    body: [
      ['Number tested for HIV',
        data.hivTestedRefMale || 0, data.hivTestedRefFemale || 0, data.hivTestedRefTotal || 0,
        data.hivTestedNatMale || 0, data.hivTestedNatFemale || 0, data.hivTestedNatTotal || 0],
      ['Number tested positive for HIV',
        data.hivPositiveRefMale || 0, data.hivPositiveRefFemale || 0, data.hivPositiveRefTotal || 0,
        data.hivPositiveNatMale || 0, data.hivPositiveNatFemale || 0, data.hivPositiveNatTotal || 0]
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader },
    theme: 'grid'
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: y,
    head: [['Blood Donation Indicator', '']],
    body: [['Prevalence of HIV in blood donors', '']],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader },
    theme: 'grid'
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // 5.4 RPR Testing (OPD)
  doc.setFontSize(11);
  doc.text("5.4 RPR Testing (OPD)", 15, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [
      [' ', 'Refugee', '', '', 'National', '', ''],
      ['RPR Testing (OPD)', 'Male', 'Female', 'Total', 'Male', 'Female', 'Total']
    ],
    body: [
      ['Number tested for RPR',
        data.rprTestedRefMale || 0, data.rprTestedRefFemale || 0, data.rprTestedRefTotal || 0,
        data.rprTestedNatMale || 0, data.rprTestedNatFemale || 0, data.rprTestedNatTotal || 0],
      ['Number tested positive for RPR',
        data.rprPositiveRefMale || 0, data.rprPositiveRefFemale || 0, data.rprPositiveRefTotal || 0,
        data.rprPositiveNatMale || 0, data.rprPositiveNatFemale || 0, data.rprPositiveNatTotal || 0]
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader },
    theme: 'grid'
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: y,
    head: [['RPR Indicators', '']],
    body: [
      ['Prevalence of syphilis (OPD)', ''],
      ['Prevalence of syphilis among Nationals (OPD)', ''],
      ['Ratio of contacts tested : RPR positive cases', '']
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader },
    theme: 'grid'
  });

  // 6.0 Disease Control
  y = newSection("6.0 Disease Control");
  autoTable(doc, {
    startY: y,
    head: [['6.1 Tuberculosis Program', '<5 M', '<5 F', '≥5 M', '≥5 F', 'Total']],
    body: [
      ['At beginning of month', '', '', '', '', data.tbBegin || 0],
      ['New cases', '', '', '', '', data.tbNew || 0],
      ['Treatment success', '', '', '', '', data.tbSuccess || 0],
      ['Death', '', '', '', '', data.tbDeath || 0],
      ['Default', '', '', '', '', data.tbDefault || 0],
      ['At end of month', '', '', '', '', data.tbEnd || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: y,
    head: [['6.2 Leprosy Program', '<5 M', '<5 F', '≥5 M', '≥5 F', 'Total']],
    body: [
      ['At beginning of month', '', '', '', '', data.leprosyBegin || 0],
      ['New cases', '', '', '', '', data.leprosyNew || 0],
      ['Treatment success', '', '', '', '', data.leprosySuccess || 0],
      ['At end of month', '', '', '', '', data.leprosyEnd || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  // 7.0 EPI and Vitamin A
  y = newSection("7.0 EPI and Vitamin A");
  autoTable(doc, {
    startY: y,
    head: [['7.1 Children Vaccinated', 'Doses']],
    body: [
      ['BCG', data.bcg || 0],
      ['Polio III', data.polio3 || 0],
      ['DPT III', data.dpt3 || 0],
      ['Measles', data.measles || 0],
      ['Fully Vaccinated', data.fullyVacc || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: y,
    head: [['7.4 Tetanus Toxoid', 'Pregnant', 'Non-Preg', 'Other', 'Total']],
    body: [
      ['TT 1', data.tt1 || 0, '', '', ''],
      ['TT 2', data.tt2 || 0, '', '', ''],
      ['TT 3', data.tt3 || 0, '', '', ''],
      ['TT 4', data.tt4 || 0, '', '', ''],
      ['TT 5', data.tt5 || 0, '', '', ''],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  // 8.0 Nutrition
  y = newSection("8.0 Nutrition");
  autoTable(doc, {
    startY: y,
    head: [['8.1 Supplementary Feeding Program', 'Total']],
    body: [
      ['At beginning of month', data.sfpBegin || 0],
      ['New admissions', data.sfpNew || 0],
      ['At end of month', data.sfpEnd || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: y,
    head: [['8.2 Therapeutic Feeding Program', 'Admissions', 'Exits', 'End']],
    body: [
      ['Severe Acute Malnutrition', data.tfpAdm || 0, data.tfpExit || 0, data.tfpEnd || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  // 9.0 Reproductive Health
  y = newSection("9.0 Reproductive Health");
  autoTable(doc, {
    startY: y,
    head: [['9.1 Antenatal Care', 'Total']],
    body: [
      ['First ANC visit', data.ancFirst || 0],
      ['Repeat ANC visit', data.ancRepeat || 0],
      ['Deliveries', data.deliveries || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: y,
    head: [['9.2 Delivery Care', 'Total']],
    body: [
      ['Live births', data.liveBirths || 0],
      ['Skilled deliveries', data.skilledDelivery || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: y,
    head: [['9.4 Family Planning', 'New Users', 'Total']],
    body: [['All Methods', data.fpNew || 0, data.fpTotal || 0]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: y,
    head: [['9.5 SGBV', 'Total']],
    body: [['Rape survivors', data.sgbvRape || 0]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  // 10.0 HIV/AIDS
  y = newSection("10.0 HIV/AIDS");
  autoTable(doc, {
    startY: y,
    head: [['10.1 Condom Distribution', 'Number']],
    body: [['Total condoms', data.condomsTotal || 0]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: y,
    head: [['10.2 VCT', 'Total']],
    body: [
      ['Tested', data.vctTested || 0],
      ['Positive', data.vctPositive || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: y,
    head: [['10.3 PMTCT Antenatal', 'Total']],
    body: [
      ['Pregnant tested', data.pmtctTested || 0],
      ['Positive', data.pmtctPositive || 0],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: y,
    head: [['10.5 PMTCT Postnatal', 'Total']],
    body: [['HIV positive mothers', data.pmtctPostMothers || 0]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: yellowHeader }
  });

  const fileName = `HIS_Full_Report_${data.month || 'MM'}_${data.year || 'YYYY'}.pdf`;
  doc.save(fileName);
};