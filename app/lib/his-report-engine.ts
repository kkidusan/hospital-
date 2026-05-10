import { prisma } from '@/lib/db';

export async function getFullHisData(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const consultations = await prisma.consultation.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    include: {
      patient: { select: { sex: true, age: true, ageUnit: true } }
    }
  });

  const allPatients = await prisma.patient.findMany({
    where: { registeredAt: { lte: endDate } },
    select: { sex: true, age: true, ageUnit: true }
  });

  const deaths = await prisma.admission.findMany({
    where: {
      dischargeType: 'DECEASED',
      dischargeDate: { gte: startDate, lte: endDate }
    },
    include: { patient: { select: { sex: true, age: true, ageUnit: true } } }
  });

  const admissionsCount = await prisma.admission.count({
    where: { admissionDate: { gte: startDate, lte: endDate } }
  });

  const labTests = await prisma.labRequestTest.findMany({
    where: {
      labRequest: {
        createdAt: { gte: startDate, lte: endDate }
      }
    },
    include: {
      labRequest: {
        include: {
          patient: { select: { sex: true, age: true, ageUnit: true } }
        }
      }
    }
  });

  // Enhanced Lab Result Counting
  let malSlidesExam = 0;
  let malPositive = 0;
  let tbSmears = 0;
  let tbPositive = 0;
  let hivTestedRefTotal = 0;
  let hivPositiveRefTotal = 0;
  let rprTestedRefTotal = 0;
  let rprPositiveRefTotal = 0;

  labTests.forEach(test => {
    const testName = (test.testName || '').toString().toLowerCase().trim();
    const result = (test.result || '').toString().toLowerCase().trim();

    // Malaria
    if (
      testName.includes('malaria') || 
      testName.includes('blood film') || 
      testName.includes('mp') || 
      testName.includes('rapid malaria') ||
      testName.includes('mps')
    ) {
      malSlidesExam++;
      if (
        result.includes('positive') || 
        result.includes('detected') || 
        result.includes('reactive') ||
        result.includes('plasmodium')
      ) {
        malPositive++;
      }
    }

    // Tuberculosis (AFB)
    if (
      testName.includes('afb') || 
      testName.includes('geneexpert') || 
      testName.includes('tb') && testName.includes('smear')
    ) {
      tbSmears++;
      if (
        result.includes('positive') || 
        result.includes('afb+') || 
        result.includes('detected') ||
        result.includes('mtb')
      ) {
        tbPositive++;
      }
    }

    // HIV
    if (testName.includes('hiv')) {
      hivTestedRefTotal++;
      if (
        result.includes('positive') || 
        result.includes('reactive') ||
        result.includes('detected')
      ) {
        hivPositiveRefTotal++;
      }
    }

    // RPR / Syphilis
    if (testName.includes('rpr') || testName.includes('syphilis')) {
      rprTestedRefTotal++;
      if (
        result.includes('positive') || 
        result.includes('reactive')
      ) {
        rprPositiveRefTotal++;
      }
    }
  });

  let newVisitsM = 0, newVisitsF = 0, newVisitsNat = 0;

  consultations.forEach((con) => {
    const sex = (con.patient?.sex || '').toString().toUpperCase().trim();
    if (sex === 'M' || sex === 'MALE') newVisitsM++;
    else if (sex === 'F' || sex === 'FEMALE') newVisitsF++;
    else newVisitsNat++;
  });

  let totalPopMale = 0, totalPopFemale = 0, childrenUnder5 = 0, infants = 0, females1549 = 0;

  allPatients.forEach((p) => {
    const sex = (p.sex || '').toString().toUpperCase().trim();
    let age = p.age || 0;
    const unit = (p.ageUnit || 'years').toLowerCase();
    const ageInYears = unit === 'months' ? age / 12 : age;

    if (sex === 'M' || sex === 'MALE') totalPopMale++;
    if (sex === 'F' || sex === 'FEMALE') totalPopFemale++;

    if (ageInYears < 5) childrenUnder5++;
    if (ageInYears < 1) infants++;
    if ((sex === 'F' || sex === 'FEMALE') && ageInYears >= 15 && ageInYears <= 49) females1549++;
  });

  let mortMaleU5 = 0, mortMaleGE5 = 0, mortFemaleU5 = 0, mortFemaleGE5 = 0;

  deaths.forEach((adm) => {
    const p = adm.patient;
    if (!p) return;
    const sex = (p.sex || '').toString().toUpperCase().trim();
    let age = p.age || 0;
    const unit = (p.ageUnit || 'years').toLowerCase();
    const ageInYears = unit === 'months' ? age / 12 : age;

    if (sex === 'M' || sex === 'MALE') {
      ageInYears < 5 ? mortMaleU5++ : mortMaleGE5++;
    } else if (sex === 'F' || sex === 'FEMALE') {
      ageInYears < 5 ? mortFemaleU5++ : mortFemaleGE5++;
    }
  });

  const morbidity = {
    urtiU5M:0, urtiU5F:0, urtiU5T:0, urtiGE5M:0, urtiGE5F:0, urtiTotal:0,
    lrtiU5M:0, lrtiU5F:0, lrtiU5T:0, lrtiGE5M:0, lrtiGE5F:0, lrtiTotal:0,
    wDiarrU5M:0, wDiarrU5F:0, wDiarrU5T:0, wDiarrGE5M:0, wDiarrGE5F:0, wDiarrTotal:0,
    bDiarrU5M:0, bDiarrU5F:0, bDiarrU5T:0, bDiarrGE5M:0, bDiarrGE5F:0, bDiarrTotal:0,
    skinU5M:0, skinU5F:0, skinU5T:0, skinGE5M:0, skinGE5F:0, skinTotal:0,
    eyeU5M:0, eyeU5F:0, eyeU5T:0, eyeGE5M:0, eyeGE5F:0, eyeTotal:0,
    wormsU5M:0, wormsU5F:0, wormsU5T:0, wormsGE5M:0, wormsGE5F:0, wormsTotal:0,
    malConfU5M:0, malConfU5F:0, malConfU5T:0, malConfGE5M:0, malConfGE5F:0, malConfTotal:0,
    malSuspU5M:0, malSuspU5F:0, malSuspU5T:0, malSuspGE5M:0, malSuspGE5F:0, malSuspTotal:0,
    tbU5M:0, tbU5F:0, tbU5T:0, tbGE5M:0, tbGE5F:0, tbTotal:0,
    leprosyU5M:0, leprosyU5F:0, leprosyU5T:0, leprosyGE5M:0, leprosyGE5F:0, leprosyTotal:0,
    afpU5M:0, afpU5F:0, afpU5T:0, afpGE5M:0, afpGE5F:0, afpTotal:0,
    measlesU5M:0, measlesU5F:0, measlesU5T:0, measlesGE5M:0, measlesGE5F:0, measlesTotal:0,
    meningU5M:0, meningU5F:0, meningU5T:0, meningGE5M:0, meningGE5F:0, meningTotal:0,
    hivU5M:0, hivU5F:0, hivU5T:0, hivGE5M:0, hivGE5F:0, hivTotal:0,
    stiU5M:0, stiU5F:0, stiU5T:0, stiGE5M:0, stiGE5F:0, stiTotal:0,
    acuteMalU5M:0, acuteMalU5F:0, acuteMalU5T:0, acuteMalGE5M:0, acuteMalGE5F:0, acuteMalTotal:0,
    anaemiaU5M:0, anaemiaU5F:0, anaemiaU5T:0, anaemiaGE5M:0, anaemiaGE5F:0, anaemiaTotal:0,
    injuriesU5M:0, injuriesU5F:0, injuriesU5T:0, injuriesGE5M:0, injuriesGE5F:0, injuriesTotal:0,
    dentalU5M:0, dentalU5F:0, dentalU5T:0, dentalGE5M:0, dentalGE5F:0, dentalTotal:0,
    gastritisU5M:0, gastritisU5F:0, gastritisU5T:0, gastritisGE5M:0, gastritisGE5F:0, gastritisTotal:0,
    surgicalU5M:0, surgicalU5F:0, surgicalU5T:0, surgicalGE5M:0, surgicalGE5F:0, surgicalTotal:0,
    gynU5M:0, gynU5F:0, gynU5T:0, gynGE5M:0, gynGE5F:0, gynTotal:0,
    htnU5M:0, htnU5F:0, htnU5T:0, htnGE5M:0, htnGE5F:0, htnTotal:0,
    diabetesU5M:0, diabetesU5F:0, diabetesU5T:0, diabetesGE5M:0, diabetesGE5F:0, diabetesTotal:0,
    mentalU5M:0, mentalU5F:0, mentalU5T:0, mentalGE5M:0, mentalGE5F:0, mentalTotal:0,
    otherU5M:0, otherU5F:0, otherU5T:0, otherGE5M:0, otherGE5F:0, otherTotal:0,
  };

  let uds = 0, vds = 0, gud = 0, pid = 0;
  let dehydNo = 0, dehydSome = 0, dehydSevere = 0;

  consultations.forEach((con) => {
    const diagnoses = Array.isArray(con.diagnoses) ? con.diagnoses : [];
    diagnoses.forEach((d: any) => {
      const name = (d.name || d || '').toString().toLowerCase().trim();

      let cat = 'other';
      if (name.includes('urti') || name.includes('upper respiratory')) cat = 'urti';
      else if (name.includes('lrti') || name.includes('pneumonia')) cat = 'lrti';
      else if (name.includes('watery diarrhoea') || name.includes('watery diarrhea')) cat = 'wDiarr';
      else if (name.includes('bloody diarrhoea') || name.includes('dysentery')) cat = 'bDiarr';
      else if (name.includes('skin')) cat = 'skin';
      else if (name.includes('eye') || name.includes('conjunctivitis')) cat = 'eye';
      else if (name.includes('worm')) cat = 'worms';
      else if (name.includes('malaria')) cat = 'malConf';
      else if (name.includes('tuberculosis') || name.includes('tb')) cat = 'tb';
      else if (name.includes('leprosy')) cat = 'leprosy';
      else if (name.includes('polio') || name.includes('flaccid')) cat = 'afp';
      else if (name.includes('measles')) cat = 'measles';
      else if (name.includes('meningitis')) cat = 'mening';
      else if (name.includes('hiv') || name.includes('aids')) cat = 'hiv';
      else if (name.includes('sti') || name.includes('urethral') || name.includes('gonorrhea') || name.includes('syphilis')) cat = 'sti';
      else if (name.includes('malnutrition')) cat = 'acuteMal';
      else if (name.includes('anaemia') || name.includes('anemia')) cat = 'anaemia';
      else if (name.includes('injury') || name.includes('trauma')) cat = 'injuries';
      else if (name.includes('dental')) cat = 'dental';
      else if (name.includes('gastritis')) cat = 'gastritis';
      else if (name.includes('surgical')) cat = 'surgical';
      else if (name.includes('gynaecological') || name.includes('gyne')) cat = 'gyn';
      else if (name.includes('hypertension') || name.includes('htn')) cat = 'htn';
      else if (name.includes('diabetes')) cat = 'diabetes';
      else if (name.includes('mental')) cat = 'mental';

      const base = cat + 'U5';
      morbidity[base + 'T'] = (morbidity[base + 'T'] || 0) + 1;

      const sex = (con.patient?.sex || '').toString().toUpperCase().trim();
      if (sex === 'M' || sex === 'MALE') {
        morbidity[base + 'M'] = (morbidity[base + 'M'] || 0) + 1;
      } else if (sex === 'F' || sex === 'FEMALE') {
        morbidity[base + 'F'] = (morbidity[base + 'F'] || 0) + 1;
      } else {
        morbidity[base + 'M'] = (morbidity[base + 'M'] || 0) + 1;
      }

      if (name.includes('urethral') || name.includes('uds')) uds++;
      if (name.includes('vaginal') || name.includes('vds')) vds++;
      if (name.includes('ulcer') || name.includes('gud')) gud++;
      if (name.includes('pid') || name.includes('pelvic')) pid++;

      if (name.includes('dehydration') || name.includes('dehydrated')) {
        if (name.includes('severe')) dehydSevere++;
        else if (name.includes('some')) dehydSome++;
        else dehydNo++;
      }
    });
  });

  return {
    organisation: "Your Organisation Name",
    camp: "Your Camp Name",
    month,
    year,

    totalPop: allPatients.length,
    totalPopMale,
    totalPopFemale,
    childrenUnder5,
    liveBirths: 0,
    infants,
    females1549,
    pregnantLactating: 0,

    totalDeaths: deaths.length,
    mortMaleU5, mortMaleGE5, mortFemaleU5, mortFemaleGE5,
    mortU5: mortMaleU5 + mortFemaleU5,
    mortGE5: mortMaleGE5 + mortFemaleGE5,

    newVisitsM, newVisitsF, newVisitsNat,
    revisitsM: 0, revisitsF: 0, revisitsNat: 0,
    totalConsultM: newVisitsM, totalConsultF: newVisitsF, totalConsultNat: newVisitsNat,

    malSlidesExam,
    malPositive,

    tbSmears,
    tbPositive,

    hivTestedRefMale: 0,
    hivTestedRefFemale: 0,
    hivTestedRefTotal: hivTestedRefTotal,
    hivPositiveRefMale: 0,
    hivPositiveRefFemale: 0,
    hivPositiveRefTotal: hivPositiveRefTotal,

    hivTestedNatMale: 0,
    hivTestedNatFemale: 0,
    hivTestedNatTotal: 0,
    hivPositiveNatMale: 0,
    hivPositiveNatFemale: 0,
    hivPositiveNatTotal: 0,

    rprTestedRefMale: 0,
    rprTestedRefFemale: 0,
    rprTestedRefTotal: rprTestedRefTotal,
    rprPositiveRefMale: 0,
    rprPositiveRefFemale: 0,
    rprPositiveRefTotal: rprPositiveRefTotal,

    rprTestedNatMale: 0,
    rprTestedNatFemale: 0,
    rprTestedNatTotal: 0,
    rprPositiveNatMale: 0,
    rprPositiveNatFemale: 0,
    rprPositiveNatTotal: 0,

    ...morbidity,

    uds, vds, gud, pid, stiTotal: uds + vds + gud + pid,

    dehydNo, dehydSome, dehydSevere, dehydTotal: dehydNo + dehydSome + dehydSevere,

    ipdMalariaAdm: 0, ipdMalariaDeath: 0,
    ipdAriAdm: 0, ipdAriDeath: 0,
    ipdDiarrAdm: 0, ipdDiarrDeath: 0,
    ipdTbAdm: 0, ipdTbDeath: 0,
    ipdOtherAdm: admissionsCount,
    ipdOtherDeath: deaths.length,

    tbBegin: 0, tbNew: 0, tbSuccess: 0, tbDeath: 0, tbDefault: 0, tbEnd: 0,
    leprosyBegin: 0, leprosyNew: 0, leprosySuccess: 0, leprosyEnd: 0,

    bcg: 0, polio3: 0, dpt3: 0, measles: 0, fullyVacc: 0,
    tt1: 0, tt2: 0, tt3: 0, tt4: 0, tt5: 0,

    sfpBegin: 0, sfpNew: 0, sfpEnd: 0,
    tfpAdm: 0, tfpExit: 0, tfpEnd: 0,

    ancFirst: 0, ancRepeat: 0, deliveries: 0,
    skilledDelivery: 0,
    fpNew: 0, fpTotal: 0,
    sgbvRape: 0,

    condomsTotal: 0,
    vctTested: 0, vctPositive: 0,
    pmtctTested: 0, pmtctPositive: 0,
    pmtctPostMothers: 0,
  };
}