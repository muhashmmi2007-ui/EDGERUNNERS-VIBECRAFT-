/**
 * Comprehensive Organiser-Provided Timetable Dataset
 * 13 Sections across 10 Timetables (Batches 1, 2, 3)
 * Academic Year: 2026-2027 (Sections 1-9) & 2024-2025 (Sections 10-13)
 * Semester Range: 29 August 2026 to 29 November 2026
 */

export const SEMESTER_START_DATE = '2026-08-29';
export const SEMESTER_END_DATE = '2026-11-29';
export const MANDATORY_THRESHOLD = 0.75;
export const ASPIRATIONAL_TARGET = 0.90;

export const STANDARD_PERIODS = [
  { period: 1, time: '09:00 - 09:50' },
  { period: 2, time: '09:50 - 10:40' },
  { period: 'TEA', time: '10:40 - 10:50', isBreak: true },
  { period: 3, time: '10:50 - 11:40' },
  { period: 4, time: '11:40 - 12:30' },
  { period: 5, time: '12:30 - 01:20' },
  { period: 6, time: '01:20 - 02:10' },
  { period: 7, time: '02:10 - 03:00' },
  { period: 'TEA_AN', time: '03:00 - 03:10', isBreak: true },
  { period: 8, time: '03:10 - 04:00' },
  { period: 9, time: '04:00 - 04:50' },
];

export const SECTIONS_DATA = [
  // -------------------------------------------------------------
  // 1. III ECE-DS (V Sem, 2026-27, IST 519/FN)
  // -------------------------------------------------------------
  {
    id: 'III_ECE_DS',
    displayName: 'III ECE-DS',
    year: 'III',
    semester: 5,
    academicYear: '2026–27',
    venue: 'IST 519/FN',
    department: 'School of Electrical & Electronics Engg.',
    notes: 'Standard 9-period schedule. Multi-period labs count as 1 class unit.',
    subjects: [
      { code: '21MAB302T', name: 'Discrete Mathematics', slot: 'A', credits: '3-1-0-4', faculty: 'New Faculty 2', dept: 'AP/Maths' },
      { code: '21ECC301P', name: 'Microprocessor, Microcontroller, & Interfacing', slot: 'B', credits: '3-1-0-4', faculty: 'Mrs. B. Abirami', dept: 'EO/SRMIST' },
      { code: '21ECC303T', name: 'VLSI Design and Technology', slot: 'C', credits: '3-0-0-3', faculty: 'Dr. R. Vinoth Raj', dept: 'AP/ECE-DS' },
      { code: '21CSO355T', name: 'Machine Learning for All', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. Chitra Devi', dept: 'ASP/SoC' },
      { code: '21ECE371T', name: 'Database Design and Management', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. S. Saraswathi', dept: 'AP/SoC' },
      { code: '21GNP301L', name: 'Community Connect', slot: 'F', credits: '0-0-2-1', faculty: 'Dr. S. Jeevananthan / Dr. V. Manikandan', dept: 'AP/ECE-DS' },
      { code: '21PDM301L', name: 'Analytical and Logical Thinking Skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC Faculty', dept: 'CDC-625' },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. Prabin Kumar Bera', dept: 'AP/ECE' },
      { code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. R. Vinodhraj / Dr. H. Sri Bhuvaneeshwari', dept: 'AP/ECE-DS, AP/ECE', isLab: true },
    ],
    // Mon-Fri schedule
    weeklySchedule: {
      Monday: [
        { period: 1, slot: 'E' }, { period: 2, slot: 'B' }, { period: 3, slot: 'C' }, { period: 4, slot: 'A' }
      ],
      Tuesday: [
        { period: 1, slot: 'C' }, { period: 2, slot: 'B' }, { period: 3, slot: 'D' }, { period: 4, slot: 'F' },
        { periods: [6, 7], slot: 'LAB', label: 'LAB-108/107', room: 'LAB-108/107', countsAs: 1 }
      ],
      Wednesday: [
        { period: 1, slot: 'H' }, { period: 2, slot: 'B' }, { period: 3, slot: 'A' }, { period: 4, slot: 'C' },
        { period: 9, slot: 'G', label: 'G-625', room: '625' }
      ],
      Thursday: [
        { period: 1, slot: 'A' }, { period: 2, slot: 'D' }, { period: 4, slot: 'B' }, { period: 5, slot: 'F' }
      ],
      Friday: [
        { period: 1, slot: 'D' }, { period: 2, slot: 'A' }, { period: 3, slot: 'E' }, { period: 4, slot: 'B', label: 'B-Proj' },
        { period: 6, slot: 'G', label: 'G-625', room: '625' },
        { periods: [8, 9], slot: 'LAB', label: 'LAB-108/107', room: 'LAB-108/107', countsAs: 1 }
      ]
    }
  },

  // -------------------------------------------------------------
  // 2. IV ECE-B (VII Sem, 2026-27, IST 227)
  // -------------------------------------------------------------
  {
    id: 'IV_ECE_B',
    displayName: 'IV ECE-B',
    year: 'IV',
    semester: 7,
    academicYear: '2026–27',
    venue: 'IST 227',
    department: 'School of Electrical & Electronics Engg.',
    notes: 'VII semester senior schedule.',
    subjects: [
      { code: '21GNH401T', name: 'Behavioural Psychology', slot: 'A', credits: '2-1-0-3', faculty: 'Dr. A. Anand', dept: 'AP/ECE' },
      { code: '21ECC401T', name: 'Wireless Communication and Antenna Systems', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. K. Vigneshwaran', dept: 'AP/ECE' },
      { code: '21ECC402P', name: 'Computer Communication and Network Security', slot: 'C', credits: '2-1-0-3', faculty: 'Dr. R. Rajasekar', dept: 'ASP & HOD ECE-DS' },
      { code: '21ECE461T', name: 'Semiconductor Memory Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. H. SriBhuvaneeshwari', dept: 'AP/ECE' },
      { code: '21ECC463T', name: 'Scripting Language for Electronic Design Automation', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. Sreenivasa Rao Ijada', dept: 'Prof/ECE' },
      { code: '21CSO355T', name: 'Machine Learning for All', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. N. Prasanna Venkatesh', dept: 'AP/BME' },
      { code: '21ECC402P_LAB', name: 'Computer Communication & Network Sec (Lab)', slot: 'LAB', credits: '2-1-0-3', faculty: 'Ms. T. Swetha', dept: 'AP/ECE', isLab: true },
    ],
    weeklySchedule: {
      Monday: [
        { period: 1, slot: 'C' }, { period: 2, slot: 'A' }, { period: 3, slot: 'E' }, { period: 4, slot: 'F' }
      ],
      Tuesday: [
        { period: 1, slot: 'C' }, { period: 2, slot: 'E' }, { period: 3, slot: 'F' }, { period: 4, slot: 'B' }
      ],
      Wednesday: [
        { period: 1, slot: 'C' }, { period: 2, slot: 'D' }, { period: 3, slot: 'A' }, { period: 4, slot: 'B' }
      ],
      Thursday: [
        { period: 1, slot: 'D' }, { period: 2, slot: 'B' },
        { periods: [3, 4], slot: 'LAB', label: 'LAB-IST 108', room: 'IST 108', countsAs: 1 },
        { period: 5, slot: 'A' }
      ],
      Friday: [
        { period: 1, slot: 'E' }, { period: 2, slot: 'D' }, { period: 4, slot: 'F' }
      ]
    }
  },

  // -------------------------------------------------------------
  // 3. III ECE-A (V Sem, 2026-27, IST 518/FN)
  // -------------------------------------------------------------
  {
    id: 'III_ECE_A',
    displayName: 'III ECE-A',
    year: 'III',
    semester: 5,
    academicYear: '2026–27',
    venue: 'IST 518/FN',
    department: 'School of Electrical & Electronics Engg.',
    notes: 'Morning FN session section with dual lab sessions.',
    subjects: [
      { code: '21MAB302T', name: 'Discrete Mathematics', slot: 'A', credits: '3-1-0-4', faculty: 'New Faculty 3', dept: 'AP/Maths' },
      { code: '21ECC301P', name: 'Microprocessor, Microcontroller & Interfacing', slot: 'B', credits: '3-1-0-4', faculty: 'Dr. M. Manikandan', dept: 'AP/ECE' },
      { code: '21ECC303T', name: 'VLSI Design and Technology', slot: 'C', credits: '3-0-0-3', faculty: 'Dr. M. Jothi', dept: 'AP/ECE' },
      { code: '21ECE408T', name: 'System and Network on Chip', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. V. Manikandan', dept: 'AP/ECE-DS' },
      { code: '21CSO355T', name: 'Machine Learning for All', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. J. Jencia', dept: 'AP/BME' },
      { code: '21GNP301L', name: 'Community Connect', slot: 'F', credits: '0-0-2-1', faculty: 'Dr. V. Rajesh / Dr. V. Bharathi', dept: 'AP/ECE' },
      { code: '21PDM301L', name: 'Analytical and Logical Thinking Skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC Faculty', dept: 'CDC / 625' },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. K. Vigneshwaran', dept: 'AP/ECE' },
      { code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. M. Jothi & Dr. P. Manorajitham', dept: 'AP/ECE', isLab: true },
    ],
    weeklySchedule: {
      Monday: [
        { period: 1, slot: 'E' }, { period: 2, slot: 'B' }, { period: 3, slot: 'B' }, { period: 4, slot: 'A' },
        { period: 6, slot: 'G', label: 'G-625', room: '625' }
      ],
      Tuesday: [
        { period: 1, slot: 'H' }, { period: 2, slot: 'D' }, { period: 3, slot: 'B' }, { period: 4, slot: 'B', label: 'B-Proj' },
        { period: 6, slot: 'G', label: 'G-625', room: '625' }
      ],
      Wednesday: [
        { period: 1, slot: 'C' }, { period: 2, slot: 'A' }, { period: 3, slot: 'D' }, { period: 4, slot: 'F' },
        { period: 9, slot: 'LAB', label: 'LAB-108/109', room: 'LAB-108/109', countsAs: 1 }
      ],
      Thursday: [
        { period: 1, slot: 'A' }, { period: 2, slot: 'E' }, { period: 4, slot: 'C' }, { period: 5, slot: 'F' }
      ],
      Friday: [
        { period: 1, slot: 'D' }, { period: 2, slot: 'A' }, { period: 4, slot: 'E' }, { period: 5, slot: 'C' },
        { periods: [7, 8], slot: 'LAB', label: 'LAB-108/109', room: 'LAB-108/109', countsAs: 1 }
      ]
    }
  },

  // -------------------------------------------------------------
  // 4. IV ECE-A (VII Sem, 2026-27, IST 225)
  // -------------------------------------------------------------
  {
    id: 'IV_ECE_A',
    displayName: 'IV ECE-A',
    year: 'IV',
    semester: 7,
    academicYear: '2026–27',
    venue: 'IST 225',
    department: 'School of Electrical & Electronics Engg.',
    notes: 'VII semester senior section.',
    subjects: [
      { code: '21GNH401T', name: 'Behavioural Psychology', slot: 'A', credits: '2-1-0-3', faculty: 'Dr. A. Anand', dept: 'AP/ECE' },
      { code: '21ECC401T', name: 'Wireless Communication and Antenna Systems', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. K. Vigneshwaran', dept: 'AP/ECE' },
      { code: '21ECC402P', name: 'Computer Communication and Network Security', slot: 'C', credits: '2-1-0-3', faculty: 'Dr. S. Jeevananthan', dept: 'AP/ECE-DS' },
      { code: '21ECE461T', name: 'Semiconductor Memory Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. H. SriBhuvaneeshwari', dept: 'AP/ECE' },
      { code: '21ECC463T', name: 'Scripting Language for Electronic Design Automation', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. Sreenivasa Rao Ijada', dept: 'Prof/ECE' },
      { code: '21CSO355T', name: 'Machine Learning for All', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. N. Prasanna Venkatesh', dept: 'AP/BME' },
      { code: '21ECC402P_LAB', name: 'Computer Communication & Network Sec (Lab)', slot: 'LAB', credits: '2-1-0-3', faculty: 'Mrs. T. Swetha', dept: 'AP/ECE', isLab: true },
    ],
    weeklySchedule: {
      Monday: [
        { period: 1, slot: 'C' }, { period: 3, slot: 'A' }, { period: 4, slot: 'D' }
      ],
      Tuesday: [
        { period: 1, slot: 'C' }, { period: 2, slot: 'D' }, { period: 3, slot: 'B' }, { period: 4, slot: 'F' }
      ],
      Wednesday: [
        { period: 1, slot: 'B' },
        { periods: [2, 3], slot: 'LAB', label: 'LAB-IST 108', room: 'IST 108', countsAs: 1 },
        { period: 4, slot: 'E' }, { period: 5, slot: 'F' }
      ],
      Thursday: [
        { period: 1, slot: 'F' }, { period: 2, slot: 'A' }, { period: 4, slot: 'E' }, { period: 5, slot: 'B' }
      ],
      Friday: [
        { period: 1, slot: 'C' }, { period: 2, slot: 'A' }, { period: 4, slot: 'D' }, { period: 5, slot: 'E' }
      ]
    }
  },

  // -------------------------------------------------------------
  // 5. III ECE-B (V Sem, 2026-27, IST 518/AN)
  // -------------------------------------------------------------
  {
    id: 'III_ECE_B',
    displayName: 'III ECE-B',
    year: 'III',
    semester: 5,
    academicYear: '2026–27',
    venue: 'IST 518/AN',
    department: 'School of Electrical & Electronics Engg.',
    notes: 'Afternoon session timetable; afternoon periods 6-9 utilized.',
    subjects: [
      { code: '21MAB302T', name: 'Discrete Mathematics', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. M. Thanga Rejini', dept: 'AP/Maths' },
      { code: '21ECC301P', name: 'Microprocessor, Microcontroller & Interfacing', slot: 'B', credits: '3-1-0-4', faculty: 'Mrs. B. Abirami', dept: 'EO/SRMIST' },
      { code: '21ECC303T', name: 'VLSI Design and Technology', slot: 'C', credits: '3-0-0-3', faculty: 'Dr. R. Vinoth Raj', dept: 'AP/ECE-DS' },
      { code: '21ECE408T', name: 'System and Network on Chip', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. V. Manikandan', dept: 'AP/ECE-DS' },
      { code: '21CSO355T', name: 'Machine Learning for All', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. J. Jencia', dept: 'AP/BME' },
      { code: '21GNP301L', name: 'Community Connect', slot: 'F', credits: '0-0-2-1', faculty: 'Dr. H. Sudharani / Ms. T. Swetha', dept: 'AP/ECE' },
      { code: '21PDM301L', name: 'Analytical and Logical Thinking Skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC Faculty', dept: 'CDC – 625' },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. A. Anand', dept: 'AP/ECE' },
      { code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. Sreenivas Ijada Rao / Dr. B. Devilal', dept: 'Prof./ECE, AP/ECE', isLab: true },
    ],
    weeklySchedule: {
      Monday: [
        { periods: [1, 2], slot: 'LAB', label: 'LAB-108/109', room: 'LAB-108/109', countsAs: 1 },
        { period: 4, slot: 'E' }, { period: 5, slot: 'B' }, { period: 8, slot: 'A' }, { period: 9, slot: 'D' }
      ],
      Tuesday: [
        { period: 1, slot: 'G', label: 'G-625', room: '625' },
        { period: 4, slot: 'F' }, { period: 5, slot: 'B' }, { period: 8, slot: 'D' }, { period: 9, slot: 'C' }
      ],
      Wednesday: [
        { period: 1, slot: 'G', label: 'G-625', room: '625' },
        { period: 3, slot: 'D' }, { period: 4, slot: 'F' }, { period: 6, slot: 'B', label: 'B-Proj' }, { period: 7, slot: 'B' },
        { period: 8, slot: 'A' }, { period: 9, slot: 'H' }
      ],
      Thursday: [
        { periods: [1, 2], slot: 'LAB', label: 'LAB-108/109', room: 'LAB-108/109', countsAs: 1 },
        { period: 4, slot: 'A' }, { period: 5, slot: 'C' }, { period: 8, slot: 'E' }, { period: 9, slot: 'F' }
      ],
      Friday: [
        { period: 4, slot: 'C' }, { period: 5, slot: 'A' }, { period: 8, slot: 'E' }, { period: 9, slot: 'D' }
      ]
    }
  },

  // -------------------------------------------------------------
  // 6. III BME (V Sem, 2026-27, IST 211/AN)
  // -------------------------------------------------------------
  {
    id: 'III_BME',
    displayName: 'III BME',
    year: 'III',
    semester: 5,
    academicYear: '2026–27',
    venue: 'IST 211/AN',
    department: 'Biomedical Engineering',
    notes: 'Biomedical engineering core syllabus with multiple specialized labs.',
    subjects: [
      { code: '21MAB301T', name: 'Probability and Statistics', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. K. M. Kanagasamy', dept: 'AP/Maths' },
      { code: '21BMC302I', name: 'Microcontrollers & Its App in Medicine', slot: 'B', credits: '3-0-2-4', faculty: 'Dr. K. Vigneshwaran', dept: 'ASP/ECE' },
      { code: '21BMC301J', name: 'Biomedical Signal Processing', slot: 'C', credits: '3-0-2-4', faculty: 'Dr. V.N. Senthilkumaran', dept: 'ASP & HOD / ECE' },
      { code: '21BME266T', name: 'Biometrics', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. G. Gifta', dept: 'AP/BME' },
      { code: '21ECC103T', name: 'Modern Wireless Communication System', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. Vaishnavi', dept: 'AP/ECE' },
      { code: '21BMC303T', name: 'Principles of Medical Imaging', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. N. Prasanna Venkatesh', dept: 'AP/BME' },
      { code: '21PDM301L', name: 'Analytical and Logical Thinking Skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC Faculty', dept: 'CDC-625' },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. G. Gifta', dept: 'AP/BME' },
      { code: '21GNP301L', name: 'Community Connect', slot: 'I', credits: '0-0-2-1', faculty: 'Dr. J. Jencia / Dr. N. Prasanna Venkatesh', dept: 'AP/BME' },
    ],
    weeklySchedule: {
      Monday: [
        { periods: [1, 2], slot: 'G', label: 'G-625', room: '625', countsAs: 2 },
        { periods: [3, 4], slot: 'B', label: 'MPMC LAB-107', room: 'LAB-107', countsAs: 1 },
        { period: 6, slot: 'E' }, { period: 7, slot: 'B' }, { period: 8, slot: 'F' }, { period: 9, slot: 'H' }
      ],
      Tuesday: [
        { periods: [1, 2], slot: 'C', label: 'BIO DSP LAB-108', room: 'LAB-108', countsAs: 1 },
        { period: 3, slot: 'G', label: 'G-625', room: '625' },
        { period: 6, slot: 'C' }, { period: 7, slot: 'D' }, { period: 8, slot: 'A' }, { period: 9, slot: 'B' }
      ],
      Wednesday: [
        { period: 6, slot: 'C' }, { period: 7, slot: 'A' }, { period: 8, slot: 'F' }, { period: 9, slot: 'D' }
      ],
      Thursday: [
        { period: 3, slot: 'I', label: '1-108', room: 'IST 108' },
        { period: 6, slot: 'A' }, { period: 7, slot: 'C' }, { period: 8, slot: 'E' }, { period: 9, slot: 'B' }
      ],
      Friday: [
        { period: 1, slot: 'I', label: '1-108', room: 'IST 108' },
        { period: 6, slot: 'F' }, { period: 7, slot: 'A' }, { period: 8, slot: 'D' }, { period: 9, slot: 'E' }
      ]
    }
  },

  // -------------------------------------------------------------
  // 7. II ECE-DS B (III Sem, 2026-27, IST 411/AN)
  // -------------------------------------------------------------
  {
    id: 'II_ECE_DS_B',
    displayName: 'II ECE-DS B',
    year: 'II',
    semester: 3,
    academicYear: '2026–27',
    venue: 'IST 411/AN',
    department: 'School of Electrical & Electronics Engg.',
    notes: 'Afternoon session second year data science section.',
    subjects: [
      { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', slot: 'A', credits: '3-1-0-4', faculty: 'New Faculty 3', dept: 'AP/MAT' },
      { code: '21ECC201T', name: 'Solid State Devices', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. Jeevanantham S', dept: 'AP/ECE DS' },
      { code: '21CSS201T', name: 'Computer Organization and Architecture', slot: 'C', credits: '3-1-0-4', faculty: 'Dr. P. Murugepadiyan', dept: 'Prof/ECE' },
      { code: '21ECC203T', name: 'Digital Logic Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. S. Krishnakumar', dept: 'AP/ECE DS' },
      { code: '21ECC205T', name: 'Electromagnetic Theory and Interference', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. V. Bharathi', dept: 'AP/ECE' },
      { code: '21LEM201T', name: 'Professional Ethics', slot: 'F', credits: '1-0-0-0', faculty: 'Dr. K. Vigneshwaran', dept: 'AP/ECE' },
      { code: '21LEM202T', name: 'Universal Human Values-II', slot: 'G', credits: '2-1-0-3', faculty: 'Mrs. D. Lavanya', dept: 'RS - ECE' },
      { code: '21PDM201L', name: 'Verbal Reasoning', slot: 'H', credits: '0-0-2-0', faculty: 'CDC Faculty', dept: 'CDC-TB-106' },
      { code: '21PDH209T', name: 'Social Engineering', slot: 'I', credits: '2-0-0-2', faculty: 'Mrs. D. Lavanya', dept: 'RS - ECE' },
      { code: '21ECC211L', name: 'Devices and Digital IC Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. S. Krishnakumar', dept: 'AP/ECE DS', isLab: true },
    ],
    weeklySchedule: {
      Monday: [
        { periods: [3, 4], slot: 'LAB', label: 'LAB-309/107', room: 'LAB-309/107', countsAs: 1 },
        { period: 6, slot: 'D' }, { period: 7, slot: 'B' }, { period: 8, slot: 'C' }, { period: 9, slot: 'I' }
      ],
      Tuesday: [
        { periods: [1, 2], slot: 'LAB', label: 'LAB-309/107', room: 'LAB-309/107', countsAs: 1 },
        { period: 6, slot: 'C' }, { period: 7, slot: 'D' }, { period: 8, slot: 'E' }, { period: 9, slot: 'A' }
      ],
      Wednesday: [
        { periods: [1, 2], slot: 'G', label: 'G-401', room: '401', countsAs: 2 },
        { period: 6, slot: 'I' }, { period: 7, slot: 'E' }, { period: 8, slot: 'A' }, { period: 9, slot: 'D' }
      ],
      Thursday: [
        { periods: [1, 2], slot: 'G', label: 'G-401', room: '401', countsAs: 2 },
        { period: 3, slot: 'H', label: 'H-TB-106', room: 'TB-106' },
        { period: 6, slot: 'A' }, { period: 7, slot: 'C' }, { period: 8, slot: 'B' }, { period: 9, slot: 'E' }
      ],
      Friday: [
        { periods: [1, 2], slot: 'H', label: 'H-TB-106', room: 'TB-106', countsAs: 2 },
        { period: 6, slot: 'F' }, { period: 7, slot: 'A' }, { period: 8, slot: 'B' }, { period: 9, slot: 'C' }
      ]
    }
  },

  // -------------------------------------------------------------
  // 8. II ECE-DS A (III Sem, 2026-27, IST 416/FN)
  // -------------------------------------------------------------
  {
    id: 'II_ECE_DS_A',
    displayName: 'II ECE-DS A',
    year: 'II',
    semester: 3,
    academicYear: '2026–27',
    venue: 'IST 416/FN',
    department: 'School of Electrical & Electronics Engg.',
    notes: 'Forenoon session second year data science section.',
    subjects: [
      { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. C. Arun Kumar', dept: 'AP/Maths' },
      { code: '21ECC201T', name: 'Solid State Devices', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. Jeevanantham S', dept: 'AP/ECE-DS' },
      { code: '21CSS201T', name: 'Computer Organization and Architecture', slot: 'C', credits: '3-1-0-4', faculty: 'Dr. P. Murugepadiyan', dept: 'Prof/ECE' },
      { code: '21ECC203T', name: 'Digital Logic Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. S. Krishnakumar', dept: 'AP/ECE-DS' },
      { code: '21ECC205T', name: 'Electromagnetic Theory and Interference', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. V. Bharathi', dept: 'AP/ECE' },
      { code: '21LEM201T', name: 'Professional Ethics', slot: 'F', credits: '1-0-0-0', faculty: 'Dr. Jothi M', dept: 'AP/ECE' },
      { code: '21LEM202T', name: 'Universal Human Values-II', slot: 'G', credits: '2-1-0-3', faculty: 'Mrs. N. Suganthi', dept: 'RS - ECE' },
      { code: '21PDM201L', name: 'Verbal Reasoning', slot: 'H', credits: '0-0-2-0', faculty: 'CDC Faculty', dept: 'CDC – TB-106' },
      { code: '21PDH209T', name: 'Social Engineering', slot: 'I', credits: '2-0-0-2', faculty: 'Mrs. D. Lavanya', dept: 'RS - ECE' },
      { code: '21ECC211L', name: 'Devices and Digital IC Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. Jeevanantham S / Dr. V. Bharathi', dept: 'AP/ECE-DS, AP/ECE', isLab: true },
    ],
    weeklySchedule: {
      Monday: [
        { period: 1, slot: 'E' }, { period: 2, slot: 'A' }, { period: 3, slot: 'I' },
        { period: 6, slot: 'G', label: 'G-602', room: '602' },
        { periods: [8, 9], slot: 'LAB', label: 'LAB-309/107', room: 'LAB-309/107', countsAs: 1 }
      ],
      Tuesday: [
        { period: 1, slot: 'C' }, { period: 2, slot: 'A' }, { period: 3, slot: 'E' }, { period: 4, slot: 'D' },
        { period: 6, slot: 'G', label: 'G-602', room: '602' },
        { periods: [8, 9], slot: 'H', label: 'H-TB-106', room: 'TB-106', countsAs: 2 }
      ],
      Wednesday: [
        { period: 1, slot: 'A' }, { period: 2, slot: 'B' }, { period: 3, slot: 'C' }, { period: 4, slot: 'D' },
        { period: 6, slot: 'H', label: 'H-TB-106', room: 'TB-106' }
      ],
      Thursday: [
        { period: 1, slot: 'B' }, { period: 2, slot: 'C' }, { period: 4, slot: 'A' }, { period: 5, slot: 'F' },
        { periods: [7, 8], slot: 'LAB', label: 'LAB-309/107', room: 'LAB-309/107', countsAs: 1 }
      ],
      Friday: [
        { period: 1, slot: 'D' }, { period: 2, slot: 'B' }, { period: 3, slot: 'E' }, { period: 4, slot: 'C' }
      ]
    }
  },

  // -------------------------------------------------------------
  // 9. II BME (III Sem, 2026-27, IST 602/FN)
  // -------------------------------------------------------------
  {
    id: 'II_BME',
    displayName: 'II BME',
    year: 'II',
    semester: 3,
    academicYear: '2026–27',
    venue: 'IST 602/FN',
    department: 'Biomedical Engineering',
    notes: 'Forenoon session second year BME section.',
    subjects: [
      { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. A. Manickan', dept: 'ASP/MAT' },
      { code: '21BMC202T', name: 'Biomedical Signals and Systems', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. Senthil Kumaran V N', dept: 'ASP & HOD/ECE' },
      { code: '21BMC203I', name: 'Electric and Electronic Circuits', slot: 'C', credits: '3-0-2-4', faculty: 'Dr. Prabin Kumar Bera', dept: 'AP/ECE' },
      { code: '21BMC204I', name: 'Digital Logic for Medical Systems', slot: 'D', credits: '2-0-2-3', faculty: 'Dr. G. Gifta', dept: 'AP/BME' },
      { code: '21PYS202T', name: 'Medical Physics', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. D. Rajeswari', dept: 'ASP/PHY' },
      { code: '21LEM201T', name: 'Professional Ethics', slot: 'F', credits: '1-0-0-0', faculty: 'Dr. H. SriBhuvaneeshwari', dept: 'AP/ECE' },
      { code: '21LEM202T', name: 'Universal Human Values-II', slot: 'G', credits: '2-1-0-3', faculty: 'Mrs. N. Suganthi', dept: 'RS - ECE' },
      { code: '21PDM201L', name: 'Verbal Reasoning', slot: 'H', credits: '0-0-2-0', faculty: 'CDC Faculty', dept: 'CDC-TB-106' },
      { code: '21PDH201T', name: 'Social Engineering', slot: 'I', credits: '2-0-0-2', faculty: 'Mrs. Francis Areekyaa Mary', dept: 'RS - EEE' },
    ],
    weeklySchedule: {
      Monday: [
        { period: 1, slot: 'E' }, { period: 2, slot: 'C' }, { period: 3, slot: 'I' },
        { periods: [6, 7], slot: 'D', label: 'DLMS/EEC-107,309', room: '107,309', countsAs: 1 }
      ],
      Tuesday: [
        { period: 1, slot: 'C' }, { period: 2, slot: 'E' }, { period: 3, slot: 'B' }, { period: 4, slot: 'A' },
        { period: 6, slot: 'H', label: 'H-TB-106', room: 'TB-106' }
      ],
      Wednesday: [
        { period: 1, slot: 'B' }, { period: 2, slot: 'D' }, { period: 4, slot: 'A' },
        { period: 6, slot: 'H', label: 'H-TB-106', room: 'TB-106' },
        { period: 7, slot: 'G', label: 'G-602', room: '602' }
      ],
      Thursday: [
        { period: 1, slot: 'A' }, { period: 2, slot: 'E' }, { period: 3, slot: 'B' }, { period: 4, slot: 'D' },
        { period: 8, slot: 'D', label: 'DLMS/EEC-107,309', room: '107,309' }
      ],
      Friday: [
        { period: 1, slot: 'F' }, { period: 2, slot: 'A' }, { period: 3, slot: 'C' }, { period: 4, slot: 'D' },
        { period: 8, slot: 'G', label: 'G-602', room: '602' }
      ]
    }
  },

  // -------------------------------------------------------------
  // 10. I ECE-A (I Sem, 2024–25, Odd)
  // -------------------------------------------------------------
  {
    id: 'I_ECE_A',
    displayName: 'I ECE-A (2024–25)',
    year: 'I',
    semester: 1,
    academicYear: '2024–25',
    venue: 'Main Campus',
    department: 'First Year ECE',
    isHistorical: true,
    notes: 'Preserved exactly from organiser dataset. Timetable from 2024–25 academic year.',
    subjects: [
      { code: '21MAB102T', name: 'Advanced Calculus & Complex Analysis', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. R. Ragul', dept: 'AP/Maths' },
      { code: '21CYB101J', name: 'Chemistry', slot: 'B', credits: '3-1-2-5', faculty: 'Dr. P. Pachamuthu', dept: 'AP/Che' },
      { code: '21BTB102J', name: 'Electronic System and PCB Design', slot: 'C', credits: '2-0-0-2', faculty: 'Dr. U. Shajith Ali', dept: 'Asso.Prof/EEE' },
      { code: '21CSS101J', name: 'Programming for Problem Solving', slot: 'D', credits: '3-0-2-4', faculty: 'Dr. A. Rama Prasath', dept: 'Asso.Prof/CA' },
      { code: '21LEH104T', name: 'German', slot: 'E', credits: '2-1-0-3', faculty: 'Mr. Selva', dept: 'German' },
      { code: '21BTB103T', name: 'Biology', slot: 'F', credits: '2-0-0-2', faculty: 'Dr. M. Jaya Priya', dept: 'AP/Biotech.' },
      { code: '21GNH101J', name: 'Philosophy of Engineering', slot: 'GNH', credits: '1-0-2-2', faculty: 'Dr. R. Aarthi', dept: 'AP/Phy' },
      { code: '21MES101L', name: 'Basic Civil and Mech Workshop', slot: 'WS', credits: '0-0-4-2', faculty: 'Dr. N.S. Balaji', dept: 'Asst.Prof/Mech', isLab: true },
      { code: '21PDM102L', name: 'General Aptitude / CDC', slot: 'CDC', credits: '0-0-2-0', faculty: 'Mr. Sivaransdhan', dept: 'Trainer' },
      { code: '21GNM102L', name: 'NSS', slot: 'NSS', credits: '0-0-2-0', faculty: 'Dr. R. Manickam', dept: 'Physical Director' },
    ],
    weeklySchedule: {
      Monday: [
        { period: 1, slot: 'E' }, { period: 2, slot: 'B', label: 'IST602' }, { period: 3, slot: 'B', label: 'IST602' }, { period: 4, slot: 'B', label: 'IST602' },
        { periods: [6, 7], slot: 'B', label: 'Che lab', countsAs: 1 }, { period: 8, slot: 'F', label: 'F/CDC' }, { period: 9, slot: 'CDC', label: 'IST710' }
      ],
      Tuesday: [
        { period: 1, slot: 'C' }, { period: 2, slot: 'B' }, { period: 3, slot: 'A' }, { period: 4, slot: 'D', label: 'D/IST602' },
        { periods: [7, 8], slot: 'WS', label: 'Workshop (IST 20,21)', countsAs: 1 }
      ],
      Wednesday: [
        { period: 1, slot: 'B' }, { period: 3, slot: 'E' }, { period: 4, slot: 'D', label: 'D/IST602' },
        { periods: [6, 7], slot: 'D', label: 'PPS LAB', countsAs: 1 }, { period: 8, slot: 'C', label: 'PCB Lab IST 108' }
      ],
      Thursday: [
        { period: 1, slot: 'E', label: 'German/IST602' }, { period: 3, slot: 'A' },
        { periods: [5, 6], slot: 'CDC', label: 'CDC/IST310', countsAs: 2 },
        { period: 9, slot: 'NSS', label: 'NSS (IS T2401)' }
      ],
      Friday: [
        { period: 1, slot: 'D' }, { period: 2, slot: 'A' }, { period: 3, slot: 'C' }, { period: 4, slot: 'B', label: 'B/IST602' },
        { period: 7, slot: 'F' }, { period: 9, slot: 'E', label: 'German/IST626' }
      ]
    }
  },

  // -------------------------------------------------------------
  // 11. I ECE-B & EEE (I Sem, 2024–25, Odd)
  // -------------------------------------------------------------
  {
    id: 'I_ECE_B_EEE',
    displayName: 'I ECE-B & EEE (2024–25)',
    year: 'I',
    semester: 1,
    academicYear: '2024–25',
    venue: 'Main Campus',
    department: 'First Year ECE / EEE',
    isHistorical: true,
    notes: 'Preserved exactly from organiser dataset.',
    subjects: [
      { code: '21MAB102T', name: 'Advanced Calculus & Complex Analysis', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. M. Durga', dept: 'AP/Maths' },
      { code: '21CYB101J', name: 'Chemistry', slot: 'B', credits: '3-1-2-5', faculty: 'Dr. N. Pushba', dept: 'AP/Che' },
      { code: '21BTB102J', name: 'Electronic System and PCB Design', slot: 'C', credits: '2-0-0-2', faculty: 'Dr. U. Shajith Ali', dept: 'Asso.Prof/EEE' },
      { code: '21CSS101J', name: 'Programming for Problem Solving', slot: 'D', credits: '3-0-2-4', faculty: 'Dr. A. Rama Prasath', dept: 'Asso.Prof/CA' },
      { code: '21GNH101J', name: 'Philosophy of Engineering', slot: 'E', credits: '1-0-2-2', faculty: 'Dr. R. Aarthi', dept: 'AP/Phy' },
      { code: '21BTB103T', name: 'Biology', slot: 'F', credits: '2-0-0-2', faculty: 'Dr. M. Jaya Priya', dept: 'AP/Biotech.' },
      { code: '21EEC101J', name: 'Electrical Circuits (for ECE)', slot: 'G', credits: '2-0-0-2', faculty: 'Dr. Dheepanchakkravarthy', dept: 'Asso.Prof/EEE' },
      { code: '21LEH104T', name: 'German', slot: 'GER', credits: '2-1-0-3', faculty: 'Mr. Selva', dept: 'German' },
      { code: '21MES101L', name: 'Basic Civil and Mech Workshop', slot: 'WS', credits: '0-0-4-2', faculty: 'Dr. Mubarak MD Khan', dept: 'AP/Mech', isLab: true },
      { code: '21PDM102L', name: 'General Aptitude', slot: 'CDC', credits: '0-0-2-0', faculty: 'Mrs. Thenmozhi', dept: 'Communication Trainer' },
      { code: '21GNM102L', name: 'NSS', slot: 'NSS', credits: '0-0-2-0', faculty: 'Dr. R. Manickam', dept: 'Physical Director' },
    ],
    weeklySchedule: {
      Monday: [
        { period: 1, slot: 'CDC', label: 'CDC/IST600' }, { period: 2, slot: 'G', label: 'GST520' }, { period: 3, slot: 'F', label: 'F/IST710' },
        { periods: [4, 5], slot: 'B', label: 'Che lab', countsAs: 1 },
        { period: 6, slot: 'A', label: 'IST602' }, { period: 7, slot: 'D', label: 'IST602' }, { period: 8, slot: 'GER', label: 'IST602' }, { period: 9, slot: 'E', label: 'IST602' }
      ],
      Tuesday: [
        { periods: [3, 4], slot: 'WS', label: 'Workshop (IST 20,21)', countsAs: 1 },
        { period: 5, slot: 'C', label: 'C/IST602' }, { period: 6, slot: 'B', label: 'B/IST602' }, { period: 7, slot: 'A' }, { period: 8, slot: 'D' }, { period: 9, slot: 'E', label: 'IST602' }
      ],
      Wednesday: [
        { period: 1, slot: 'G', label: 'IST710' }, { periods: [2, 5], slot: 'D', label: 'PPS Lab', countsAs: 1 },
        { period: 3, slot: 'CDC', label: 'CDC/IST310' }, { period: 6, slot: 'B', label: 'B/IST602' }, { period: 7, slot: 'E' }, { period: 8, slot: 'D' }
      ],
      Thursday: [
        { periods: [1, 2], slot: 'NSS', label: 'NSS', countsAs: 2 },
        { period: 3, slot: 'E', label: 'E/IST626' }, { period: 4, slot: 'G', label: 'IST710' }, { period: 6, slot: 'D', label: 'D/IST602' }, { period: 8, slot: 'GER', label: 'German/IST602' }
      ],
      Friday: [
        { period: 4, slot: 'E', label: 'IST626' }, { period: 7, slot: 'B', label: 'IST602' }, { period: 8, slot: 'A' }, { period: 9, slot: 'C', label: 'IST602' }
      ]
    }
  },

  // -------------------------------------------------------------
  // 12. I ECE-DS (Even Sem 2024–25)
  // -------------------------------------------------------------
  {
    id: 'I_ECE_DS',
    displayName: 'I ECE-DS (2024–25 Even)',
    year: 'I',
    semester: 2,
    academicYear: '2024–25',
    venue: 'Main Campus',
    department: 'First Year ECE Data Science',
    isHistorical: true,
    notes: 'Preserved from organiser dataset. Marked Even Semester in source header.',
    subjects: [
      { code: '21MAB102T', name: 'Advanced Calculus & Complex Analysis', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. Pandiyarajan', dept: 'AP/Maths' },
      { code: '21CYB101J', name: 'Chemistry', slot: 'B', credits: '3-1-2-5', faculty: 'Dr. E. Logasakthi / Dr. V.N. Senthil Kumaran', dept: 'AP/Che' },
      { code: '21BTB102J', name: 'Electronic System and PCB Design', slot: 'C', credits: '2-0-0-2', faculty: 'ECE Faculty', dept: 'Asso.Prof/ECE' },
      { code: '21CSS101J', name: 'Programming for Problem Solving', slot: 'D', credits: '3-0-2-4', faculty: 'Mrs. R. Sharanya', dept: 'AP/CSE' },
      { code: '21GNH101J', name: 'Philosophy of Engineering', slot: 'E', credits: '1-0-2-2', faculty: 'Dr. R. Ramesh', dept: 'Faculty' },
      { code: '21BTB103T', name: 'Biology', slot: 'F', credits: '2-0-0-2', faculty: 'Dr. M. Jaya Priya', dept: 'AP/Biotech.' },
      { code: '21LEH104T', name: 'German', slot: 'GER', credits: '2-1-0-3', faculty: 'Mr. Selva', dept: 'Asso.Prof/Mech' },
      { code: '21MES101L', name: 'Basic Civil and Mech Workshop', slot: 'WS', credits: '0-0-4-2', faculty: 'Dr. Subbulakshmi / Dr. ND Moulavi Khan', dept: 'AP/Mech', isLab: true },
      { code: '21PDM102L', name: 'General Aptitude', slot: 'CDC', credits: '0-0-2-0', faculty: 'Mr. Sivaransdhan', dept: 'Trainer' },
      { code: '21GNM102L', name: 'NSS', slot: 'NSS', credits: '0-0-2-0', faculty: 'Dr. R. Manickam', dept: 'Physical Director' },
    ],
    weeklySchedule: {
      Monday: [
        { period: 1, slot: 'C', label: 'IST710' }, { period: 3, slot: 'C', label: 'PCB Lab' },
        { period: 5, slot: 'A', label: 'IST502' }, { period: 6, slot: 'B', label: 'IST502' }, { period: 7, slot: 'D', label: 'IST702' }, { period: 8, slot: 'E', label: 'IST502' }
      ],
      Tuesday: [
        { periods: [2, 3], slot: 'B', label: 'Che lab', countsAs: 1 },
        { period: 5, slot: 'A', label: 'IST502' }, { period: 6, slot: 'D', label: 'IST602' }, { period: 7, slot: 'D', label: 'IST602' }, { period: 8, slot: 'GER', label: 'IST502' }
      ],
      Wednesday: [
        { periods: [1, 2], slot: 'CDC', label: 'CDC/IST510', countsAs: 2 }, { period: 3, slot: 'F', label: 'IST710' },
        { period: 5, slot: 'A', label: 'IST502' }, { period: 6, slot: 'B', label: 'IST602' }, { period: 7, slot: 'C', label: 'IST602' }, { period: 8, slot: 'E', label: 'IST502' }
      ],
      Thursday: [
        { period: 1, slot: 'GER', label: 'IST710' }, { period: 2, slot: 'A', label: 'IST710' }, { period: 3, slot: 'D', label: 'IST710' },
        { period: 5, slot: 'B', label: 'IST502' }, { period: 7, slot: 'F', label: 'IST502' }, { period: 8, slot: 'WS', label: 'IST502' }
      ],
      Friday: [
        { period: 2, slot: 'GER', label: 'German/IST626' }, { period: 5, slot: 'A', label: 'IST502' }
      ]
    }
  },

  // -------------------------------------------------------------
  // 13. I Biotech-B / Biomedical Engineering (Even Sem 2024–25)
  // -------------------------------------------------------------
  {
    id: 'I_BIOTECH_B',
    displayName: 'I Biotech-B / BME (2024–25 Even)',
    year: 'I',
    semester: 2,
    academicYear: '2024–25',
    venue: 'Main Campus',
    department: 'First Year Biotech & Biomedical',
    isHistorical: true,
    notes: 'Preserved from organiser dataset. Combined Biotech and Biomedical Engineering.',
    subjects: [
      { code: '21MAB102T', name: 'Advanced Calculus & Complex Analysis', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. R. Suresh', dept: 'AP/Maths' },
      { code: '21CYB101J', name: 'Chemistry', slot: 'B', credits: '3-1-2-5', faculty: 'Dr. E. Logasakthi', dept: 'AP/Che' },
      { code: '21BTC105T', name: 'Cell Biology (for Biotech)', slot: 'C', credits: '2-0-0-2', faculty: 'Dr. Deepi Paul', dept: 'AP/Biotech' },
      { code: '21CSS101J2', name: 'Programming for Problem Solving', slot: 'D', credits: '1-0-2-4', faculty: 'Dr. B. Chitradevi', dept: 'AP/CSE' },
      { code: '21GNH101J', name: 'Philosophy of Engineering', slot: 'E', credits: '1-0-2-2', faculty: 'Dr. J. Ramya Parkavi', dept: 'AP/Phy' },
      { code: '21BTC101T', name: 'Biochemistry (for Biotech)', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. M. Jaya Priya', dept: 'AP/Biotech' },
      { code: '21BTB104T', name: 'Biology: Human Physiology & Anatomy', slot: 'G', credits: '2-0-0-2', faculty: 'Faculty', dept: 'Biomedical' },
      { code: '21LEH105T', name: 'Japanese', slot: 'JPN', credits: '2-1-0-3', faculty: 'Mr. Nadeem', dept: 'Japanese' },
      { code: '21MES101L', name: 'Basic Civil and Mech Workshop', slot: 'WS', credits: '0-0-4-2', faculty: 'Dr. K. Manimannan / Dr. R. Ramesh', dept: 'AP/Mech', isLab: true },
      { code: '21PDM102L', name: 'General Aptitude / CDC', slot: 'CDC', credits: '0-0-2-0', faculty: 'Mr. Sivaransdhan', dept: 'Trainer' },
      { code: '21GNM101L', name: 'Yoga for Health', slot: 'YOGA', credits: '0-0-2-4', faculty: 'Ms. Balasaraswthy', dept: 'Physical Instructor' },
    ],
    weeklySchedule: {
      Monday: [
        { period: 1, slot: 'C', label: 'C/IST520' },
        { periods: [2, 3], slot: 'YOGA', label: 'YOGA', countsAs: 2 },
        { period: 4, slot: 'F', label: 'F/IST510' },
        { period: 5, slot: 'A', label: 'IST702' }, { period: 6, slot: 'B', label: 'IST702' }, { period: 7, slot: 'D', label: 'IST702' }, { period: 8, slot: 'E', label: 'IST702' }, { period: 9, slot: 'G', label: 'IST702' }
      ],
      Tuesday: [
        { periods: [1, 2], slot: 'CDC', label: 'CDC/IST710', countsAs: 2 },
        { period: 3, slot: 'G', label: 'IST520' }, { period: 4, slot: 'F', label: 'F/IST710' },
        { period: 6, slot: 'B', label: 'B/IST702' }, { period: 7, slot: 'C', label: 'IST702' }, { period: 8, slot: 'D', label: 'IST702' }, { period: 9, slot: 'A', label: 'A/IST702' }
      ],
      Wednesday: [
        { periods: [4, 5], slot: 'WS', label: 'Workshop (IST 20,21)', countsAs: 1 }
      ],
      Thursday: [
        { periods: [2, 3], slot: 'B', label: 'Che lab', countsAs: 1 },
        { period: 4, slot: 'A', label: 'A, CHT10/C' }, { period: 5, slot: 'B', label: 'B/IST702' }, { period: 6, slot: 'D', label: 'IST702' },
        { period: 8, slot: 'JPN', label: 'Japanese/IST702' }
      ],
      Friday: [
        { period: 1, slot: 'E', label: 'E/IST702' }, { period: 2, slot: 'CDC', label: 'CDC/IST702' }, { period: 3, slot: 'A', label: 'A/IST702' },
        { period: 5, slot: 'JPN', label: 'Japanese/IST702' },
        { periods: [8, 9], slot: 'D', label: 'PPS LAB', countsAs: 1 }
      ]
    }
  }
];

export function getSectionById(id) {
  return SECTIONS_DATA.find((sec) => sec.id === id) || SECTIONS_DATA[0];
}
