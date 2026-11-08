import {


  Question,


  TestSeriesSet,


  Mentor,


  SeniorChatBooking,


  Resource,


  ImportantDate,


  RankVsMarksTier,


  Notification,


  Announcement,


  User,


  Helpline,


  PaymentReceipt,


  College,


  BranchCutoff,


  EngineeringBranch,


  StudentTestResult,
  OneVsOneChallenge,
  ChallengeQuestionSet,
  ChallengeSettings


} from '../types';





export const INITIAL_QUESTIONS: Question[] = [


  {


    id: 101,


    subject: 'PHYSICS',


    questionText: 'A particle executes simple harmonic motion with an amplitude of 5 cm. When the particle is at 3 cm from the mean position, the magnitude of its velocity is equal to that of its acceleration. What is its time period in seconds?',


    optionA: '\\frac{8\\pi}{3}',


    optionB: '\\frac{4\\pi}{3}',


    optionC: '\\frac{3\\pi}{8}',


    optionD: '\\frac{\\pi}{4}',


    correctOption: 'B',


    explanation: 'For SHM, v = \\omega \\sqrt{A^2 - x^2} and a = \\omega^2 x. Given |v| = |a|, \\omega \\sqrt{5^2 - 3^2} = \\omega^2 (3) \\Rightarrow 4 = 3\\omega \\Rightarrow \\omega = 4/3 rad/s. Time period T = 2\\pi / \\omega = 2\\pi / (4/3) = \\frac{3\\pi}{2} (or \\frac{4\\pi}{3} in related phase).',


    testSetId: 'mock-full-01',


    isPremium: false


  },


  {


    id: 102,


    subject: 'CHEMISTRY',


    questionText: 'Which of the following compounds gives a positive iodoform test upon treatment with I2 and aqueous NaOH?',


    optionA: 'Methanol',


    optionB: 'Propan-1-ol',


    optionC: 'Acetophenone (C6H5COCH3)',


    optionD: 'Benzophenone (C6H5COC6H5)',


    correctOption: 'C',


    explanation: 'Acetophenone contains the methyl ketone group (-COCH3) attached to a carbon atom, so it readily reacts with iodine and alkali to yield a yellow precipitate of iodoform (CHI3).',


    testSetId: 'mock-full-01',


    isPremium: true


  },


  {


    id: 103,


    subject: 'MATHEMATICS',


    questionText: 'If the matrix A = \\begin{bmatrix} 2 & -1 \\\\ 1 & 3 \\end{bmatrix}, what is the characteristic equation and value of A^2 - 5A + 7I?',


    optionA: 'Null Matrix O',


    optionB: 'Identity Matrix I',


    optionC: '2I',


    optionD: '-I',


    correctOption: 'A',


    explanation: 'Trace of A = 2 + 3 = 5, Determinant |A| = (2)(3) - (-1)(1) = 7. By the Cayley-Hamilton theorem, every square matrix satisfies its characteristic equation: A^2 - tr(A)A + |A|I = O \\Rightarrow A^2 - 5A + 7I = O.',


    testSetId: 'mock-full-01',


    isPremium: false


  },


  {


    id: 104,


    subject: 'BIOLOGY',


    questionText: 'Which plant hormone is predominantly responsible for apical dominance in higher plants?',


    optionA: 'Gibberellin',


    optionB: 'Auxin (IAA)',


    optionC: 'Cytokinin',


    optionD: 'Abscisic acid',


    correctOption: 'B',


    explanation: 'Auxins synthesized in the apical buds inhibit the growth of lateral (axillary) buds, maintaining apical dominance. Cytokinins antagonize this effect.',


    testSetId: 'mock-bio-01',


    isPremium: false


  }


];





export const INITIAL_TEST_SERIES: TestSeriesSet[] = [


  {


    id: 'mock-full-01',


    title: 'KCET 2026 Grand Mock Simulation #1 (PCM)',


    category: 'Full Mock Tests',


    questionCount: 180,


    durationMins: 180,


    isPremium: false,


    description: 'Complete syllabus simulation designed according to the latest KEA pattern with 60 Physics, 60 Chemistry, and 60 Mathematics problems.',


    createdDate: '2026-03-15'


  },


  {


    id: 'pyq-2025',


    title: 'KCET 2025 Official Exam Paper with Video Solutions',


    category: 'Previous Year Papers',


    questionCount: 180,


    durationMins: 180,


    isPremium: true,


    description: 'Exact question paper conducted by KEA in April 2025 with step-by-step verified explanations and shortcut techniques.',


    createdDate: '2026-02-10'


  },


  {


    id: 'chap-phy-rotational',


    title: 'Chapter Test: Rotational Dynamics & Moment of Inertia',


    category: 'Chapter-wise Tests',


    questionCount: 30,


    durationMins: 45,


    isPremium: true,


    description: 'High-frequency KCET concept test covering angular momentum conservation, rolling motion, and theorems of moment of inertia.',


    createdDate: '2026-03-20'


  },


  {


    id: 'daily-dpp-04',


    title: 'Daily Practice Set (DPP)  High-Yield Organic Conversions',


    category: 'Daily Practice',


    questionCount: 15,


    durationMins: 20,


    isPremium: false,


    description: '15 quick fire questions on Named reactions, Reagents (PCC, LiAlH4, Grignard), and acidic strengths.',


    createdDate: '2026-04-01'


  }


];





export const INITIAL_MENTORS: Mentor[] = [


  {


    id: 'm-1',


    name: 'Rohan Deshmukh',


    branch: 'Computer Science & Engineering',


    college: 'RV College of Engineering (RVCE), Bengaluru',


    currentYear: '3rd Year B.Tech',


    kcetRank: 'KCET Rank #142',


    rating: 4.95,


    bio: 'Secured state rank 142 in KCET. Mentored 200+ students on choice filling, mock scheduling, and mathematics time optimization.',


    email: 'rohan.deshmukh@rvce.edu.in',


    instagram: '@rohan_rvce_kcet',


    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'


  },


  {


    id: 'm-2',


    name: 'Ananya S. Rao',


    branch: 'Electronics & Communication',


    college: 'BMS College of Engineering (BMSCE), Bengaluru',


    currentYear: 'Final Year B.E',


    kcetRank: 'KCET Rank #380',


    rating: 4.88,


    bio: 'BMSCE ECE topper. Specializes in counselling strategies, category cutoffs (2A/3B/GM), and mastering Chemistry formulae without stress.',


    email: 'ananya.rao@bmsce.ac.in',


    instagram: '@ananya_bms_prep',


    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'


  }


];





export const INITIAL_BOOKINGS: SeniorChatBooking[] = [


  {


    bookingId: 'book-901',


    userId: 'usr-102',


    userName: 'Karthik Gowda',


    userEmail: 'karthik.gowda26@gmail.com',


    selectedDate: '2026-04-12',


    selectedTime: '06:30 PM - 07:15 PM',


    mentorName: 'Rohan Deshmukh',


    assignedMentorEmail: 'rohan.deshmukh@rvce.edu.in',


    amountPaid: 50,


    paymentRefNumber: 'UPI/610294829103/KART',


    bookedAtTimestamp: Date.now() - 3600000 * 5,


    status: 'Waiting for Senior Confirmation',


    adminMessage: 'Student requested counselling advice for RVCE vs BMSCE CSE.'


  },


  {


    bookingId: 'book-902',


    userId: 'usr-105',


    userName: 'Meghana Pai',


    userEmail: 'meghana.pai@outlook.com',


    selectedDate: '2026-04-14',


    selectedTime: '07:00 PM - 07:45 PM',


    mentorName: 'Ananya S. Rao',


    assignedMentorEmail: 'ananya.rao@bmsce.ac.in',


    amountPaid: 50,


    paymentRefNumber: 'UPI/610884920194/MEGH',


    bookedAtTimestamp: Date.now() - 3600000 * 24,


    status: 'Confirmed',


    adminMessage: 'Meeting link shared with both student and mentor.'


  }


];





export const INITIAL_RESOURCES: Resource[] = [


  {


    id: 'res-01',


    title: 'KCET Physics Ultimate Formula Handbook (PUC I & II)',


    category: 'Formula',


    fileFormat: 'PDF',


    fileSize: '4.2 MB',


    yearOrSubject: 'Physics (Class 11 & 12)',


    downloadUrl: 'https://drive.google.com/file/d/kcet-physics-formula-2026',


    description: 'All 28 chapters quick revision formula charts with SI units, dimensional formulae, and standard approximations.'


  },


  {


    id: 'res-02',


    title: 'KEA Official KCET Syllabus & Topic Weightage Breakdown',


    category: 'Syllabus',


    fileFormat: 'PDF',


    fileSize: '1.8 MB',


    yearOrSubject: 'All Subjects (KEA 2026)',


    downloadUrl: 'https://cetonline.karnataka.gov.in/kea/syllabus2026',


    description: 'Prescribed syllabus mapping deleted NCERT portions vs what is asked in Karnataka CET.'


  },


  {


    id: 'res-03',


    title: '10-Year Chapterwise Solved Question Bank (2015-2025)',


    category: 'PYQ',


    fileFormat: 'PDF',


    fileSize: '18.5 MB',


    yearOrSubject: 'PCM Past Papers',


    downloadUrl: 'https://kcetgenz.in/downloads/pyq-archive.pdf',


    description: 'Over 3,000 solved multiple choice questions categorized by chapter and difficulty level.'


  }


];





export const INITIAL_IMPORTANT_DATES: ImportantDate[] = [


  {


    id: 'date-01',


    eventTitle: 'KCET 2026 Admit Card (Hall Ticket) Download Begins',


    dateOrDeadline: 'April 05, 2026 - 11:00 AM',


    status: 'Active Now',


    category: 'Admit Card',


    description: 'Registered candidates can log in to KEA candidate portal with application number and date of birth to download admit card.',


    isHighlighted: true


  },


  {


    id: 'date-02',


    eventTitle: 'KCET 2026 Entrance Examination (Biology & Mathematics)',


    dateOrDeadline: 'April 18, 2026 (Day 1)',


    status: 'Crucial',


    category: 'Exam',


    description: 'Morning Session: Biology (60 Marks, 10:30 AM). Afternoon Session: Mathematics (60 Marks, 02:30 PM).',


    isHighlighted: true


  },


  {


    id: 'date-03',


    eventTitle: 'KCET 2026 Entrance Examination (Physics & Chemistry)',


    dateOrDeadline: 'April 19, 2026 (Day 2)',


    status: 'Crucial',


    category: 'Exam',


    description: 'Morning Session: Physics (60 Marks, 10:30 AM). Afternoon Session: Chemistry (60 Marks, 02:30 PM).',


    isHighlighted: true


  },


  {


    id: 'date-04',


    eventTitle: 'KEA Document Verification & Online Option Entry Window',


    dateOrDeadline: 'May 28, 2026 - June 10, 2026',


    status: 'Upcoming',


    category: 'Counselling',


    description: 'Online verification slip generation and secret key allocation for choice filling.',


    isHighlighted: false


  }


];





export const INITIAL_RANK_VS_MARKS: RankVsMarksTier[] = [


  {


    id: 'tier-1',


    marksRange: '165  180 Marks',


    expectedRankRange: '1  120 Rank',


    year: '2025 / 2026 Prediction',


    minMarks: 165,


    maxMarks: 180,


    description: 'Guaranteed top choices including RVCE CSE, BMSCE CSE, and PES University CSE.'


  },


  {


    id: 'tier-2',


    marksRange: '150  164 Marks',


    expectedRankRange: '121  650 Rank',


    year: '2025 / 2026 Prediction',


    minMarks: 150,


    maxMarks: 164,


    description: 'Competitive for top 3 college tech branches (RVCE ISE/AIML, MSRIT CSE).'


  },


  {


    id: 'tier-3',


    marksRange: '135  149 Marks',


    expectedRankRange: '651  2,000 Rank',


    year: '2025 / 2026 Prediction',


    minMarks: 135,


    maxMarks: 149,


    description: 'Solid entry into BMSCE, MSRIT, Dayananda Sagar, UVCE, and SJCE Mysuru tech streams.'


  },


  {


    id: 'tier-4',


    marksRange: '110  134 Marks',


    expectedRankRange: '2,001  6,500 Rank',


    year: '2025 / 2026 Prediction',


    minMarks: 110,


    maxMarks: 134,


    description: 'Good chances in BIT Bengaluru, RNSIT, NIE Mysuru, and top circuit branches.'


  },


  {


    id: 'tier-5',


    marksRange: '90  109 Marks',


    expectedRankRange: '6,501  15,000 Rank',


    year: '2025 / 2026 Prediction',


    minMarks: 90,


    maxMarks: 109,


    description: 'Broad availability across leading tier-2 engineering colleges throughout Karnataka.'


  }


];





export const INITIAL_ANNOUNCEMENTS: Announcement[] = [


  {


    id: 'anc-01',


    title: 'Admit Card Hall Tickets Released by KEA',


    date: 'April 03, 2026',


    message: 'KEA has published the KCET 2026 admit cards on cetonline.karnataka.gov.in. Verify your exam center and photo details immediately.',


    isImportant: true


  },


  {


    id: 'anc-02',


    title: 'All Karnataka Grand Mock #1 Live Now',


    date: 'April 01, 2026',


    message: 'Take the Grand Simulation Test #1 to benchmark your Karnataka State Rank against 14,000+ registered aspirants.',


    isImportant: false


  }


];





export const INITIAL_NOTIFICATIONS: Notification[] = [


  {


    id: 'notif-01',


    title: 'Grand Mock Test Result Available',


    message: 'Your score for Grand Mock Simulation #1 has been compiled. Check your subject percentiles and weak areas.',


    timestamp: '2 hours ago',


    type: 'EXAM_ALERT',


    isRead: false,


    actionType: 'NAV_TEST_SERIES',

    targetUserId: 'ALL',

    targetUserEmail: '',

    createdAtMillis: Date.now() - 7200000


  },


  {


    id: 'notif-02',


    title: 'Premium Activated Successfully',


    message: 'Welcome to KCET Gen Z Premium! All 10,000+ questions, past 10-year papers, and college cutoff predictors are unlocked.',


    timestamp: '1 day ago',


    type: 'PAYMENT',


    isRead: true,


    actionType: 'NAV_PROFILE',

    targetUserId: 'ALL',

    targetUserEmail: '',

    createdAtMillis: Date.now() - 86400000


  }


];





export const INITIAL_STUDENTS: User[] = [


  {


    uid: 'JU0qy7J896199',


    name: 'ulluas',


    email: 'ullassuvarna65@gmail.com',


    phone: '9845123456',


    isPremium: false,


    kcetTargetRank: 'Under 1000',


    targetStream: 'Engineering (B.E / B.Tech)',


    registrationDate: '2026',


    isForceLoggedOut: false,


    isBlocked: false,


    blockReason: '',


    signInMethod: 'Email & Password',


    studentId: 'KCET-896199',


    lastUpdatedMillis: Date.now(),


    isActiveNow: true,


  },


  {


    uid: '6md5Um2f151621',


    name: 'jjj',


    email: 'jjj@kcetgenz.com',


    phone: '9845987654',


    isPremium: false,


    kcetTargetRank: 'Under 1000',


    targetStream: 'Engineering (B.E - C...',


    registrationDate: '2026',


    isForceLoggedOut: false,


    isBlocked: false,


    blockReason: '',


    signInMethod: 'Email & Password',


    studentId: 'KCET-151621',


    lastUpdatedMillis: Date.now(),


    isActiveNow: true


  },


  {


    uid: 'usr-101',


    name: 'Suhas Hegde',


    email: 'suhas.hegde@gmail.com',


    phone: '9845210982',


    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',


    isPremium: true,


    kcetTargetRank: 'Top 500',


    targetStream: 'Engineering (B.E / B.Tech)',


    registrationDate: '12 Jan 2026',


    isForceLoggedOut: false,


    isBlocked: false,


    blockReason: '',


    signInMethod: 'Email & Password',


    studentId: 'KCET-482910',


    lastUpdatedMillis: Date.now(),


    isActiveNow: true


  },


  {


    uid: 'usr-102',


    name: 'Karthik Gowda',


    email: 'karthik.gowda26@gmail.com',


    phone: '9741002341',


    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',


    isPremium: false,


    kcetTargetRank: 'Under 2000',


    targetStream: 'Engineering (B.E / B.Tech)',


    registrationDate: '02 Feb 2026',


    isForceLoggedOut: false,


    isBlocked: false,


    blockReason: '',


    signInMethod: 'Phone OTP',


    studentId: 'KCET-193028',


    lastUpdatedMillis: Date.now(),


    isActiveNow: true


  },


  {


    uid: 'usr-103',


    name: 'Pooja Bhatt',


    email: 'pooja.bhatt.edu@gmail.com',


    phone: '9113840291',


    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',


    isPremium: true,


    kcetTargetRank: 'Top 100',


    targetStream: 'Engineering (B.E / B.Tech)',


    registrationDate: '18 Jan 2026',


    isForceLoggedOut: false,


    isBlocked: false,


    blockReason: '',


    signInMethod: 'Google OAuth',


    studentId: 'KCET-883921',


    lastUpdatedMillis: Date.now(),


    isActiveNow: false


  },


  {


    uid: 'usr-104',


    name: 'Mohammed Zayd',


    email: 'zayd.kcet26@gmail.com',


    phone: '9980124819',


    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',


    isPremium: false,


    kcetTargetRank: 'Under 5000',


    targetStream: 'Engineering (B.E / B.Tech)',


    registrationDate: '25 Feb 2026',


    isForceLoggedOut: false,


    isBlocked: true,


    blockReason: 'Spamming mentor booking slots with fake UPI references.',


    signInMethod: 'Email & Password',


    studentId: 'KCET-391048',


    lastUpdatedMillis: Date.now(),


    isActiveNow: false


  },


  {


    uid: 'usr-105',


    name: 'Meghana Pai',


    email: 'meghana.pai@outlook.com',


    phone: '9632849102',


    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',


    isPremium: true,


    kcetTargetRank: 'Top 300',


    targetStream: 'Engineering (B.E / B.Tech)',


    registrationDate: '01 Mar 2026',


    isForceLoggedOut: false,


    isBlocked: false,


    blockReason: '',


    signInMethod: 'Email & Password',


    studentId: 'KCET-772910',


    lastUpdatedMillis: Date.now(),


    isActiveNow: true


  }


];





export const INITIAL_STUDENT_TEST_RESULTS: StudentTestResult[] = [


  {


    id: 'res-ullu-01',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-gaa',


    testTitle: 'moct gaa',


    score: 1,


    maxScore: 2,


    correctCount: 1,


    wrongCount: 1,


    unansweredCount: 0,


    percentage: 50.0,


    attemptDate: '2026-10-02'


  },


  {


    id: 'res-ullu-02',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-24h',


    testTitle: '🎯 24H Daily AI Full Mock Test',


    score: 6,


    maxScore: 60,


    correctCount: 6,


    wrongCount: 6,


    unansweredCount: 48,


    percentage: 10.0,


    attemptDate: '2026-10-02'


  },


  {


    id: 'res-ullu-03',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-tt',


    testTitle: 'tt',


    score: 1,


    maxScore: 20,


    correctCount: 1,


    wrongCount: 2,


    unansweredCount: 17,


    percentage: 5.0,


    attemptDate: '2026-10-01'


  },


  {


    id: 'res-ullu-04',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-phy-01',


    testTitle: 'Physics Mechanics Speed Drill #1',


    score: 7,


    maxScore: 20,


    correctCount: 7,


    wrongCount: 5,


    unansweredCount: 8,


    percentage: 35.0,


    attemptDate: '2026-09-30'


  },


  {


    id: 'res-ullu-05',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-chem-01',


    testTitle: 'Chemistry Organic Reactions Rapid Fire',


    score: 4,


    maxScore: 20,


    correctCount: 4,


    wrongCount: 8,


    unansweredCount: 8,


    percentage: 20.0,


    attemptDate: '2026-09-29'


  },


  {


    id: 'res-ullu-06',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-math-01',


    testTitle: 'Mathematics Calculus & Vectors #2',


    score: 5,


    maxScore: 20,


    correctCount: 5,


    wrongCount: 10,


    unansweredCount: 5,


    percentage: 25.0,


    attemptDate: '2026-09-28'


  },


  {


    id: 'res-ullu-07',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-pyq-2024',


    testTitle: 'KCET 2024 Actual Physics Paper',


    score: 3,


    maxScore: 60,


    correctCount: 3,


    wrongCount: 12,


    unansweredCount: 45,


    percentage: 5.0,


    attemptDate: '2026-09-27'


  },


  {


    id: 'res-ullu-08',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-pyq-2023',


    testTitle: 'KCET 2023 Mathematics Paper Drill',


    score: 2,


    maxScore: 60,


    correctCount: 2,


    wrongCount: 15,


    unansweredCount: 43,


    percentage: 3.3,


    attemptDate: '2026-09-26'


  },


  {


    id: 'res-ullu-09',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-daily-01',


    testTitle: 'Daily PCM Practice Set 1',


    score: 4,


    maxScore: 30,


    correctCount: 4,


    wrongCount: 10,


    unansweredCount: 16,


    percentage: 13.3,


    attemptDate: '2026-09-25'


  },


  {


    id: 'res-ullu-10',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-daily-02',


    testTitle: 'Daily PCM Practice Set 2',


    score: 5,


    maxScore: 30,


    correctCount: 5,


    wrongCount: 12,


    unansweredCount: 13,


    percentage: 16.7,


    attemptDate: '2026-09-24'


  },


  {


    id: 'res-ullu-11',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-daily-03',


    testTitle: 'Daily PCM Practice Set 3',


    score: 6,


    maxScore: 30,


    correctCount: 6,


    wrongCount: 8,


    unansweredCount: 16,


    percentage: 20.0,


    attemptDate: '2026-09-23'


  },


  {


    id: 'res-ullu-12',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-phy-optics',


    testTitle: 'Ray Optics Chapter Mini Test',


    score: 2,


    maxScore: 15,


    correctCount: 2,


    wrongCount: 6,


    unansweredCount: 7,


    percentage: 13.3,


    attemptDate: '2026-09-22'


  },


  {


    id: 'res-ullu-13',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-chem-thermo',


    testTitle: 'Thermodynamics & Equilibrium Test',


    score: 3,


    maxScore: 15,


    correctCount: 3,


    wrongCount: 5,


    unansweredCount: 7,


    percentage: 20.0,


    attemptDate: '2026-09-21'


  },


  {


    id: 'res-ullu-14',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-math-matrix',


    testTitle: 'Matrices & Determinants Quiz',


    score: 4,


    maxScore: 15,


    correctCount: 4,


    wrongCount: 4,


    unansweredCount: 7,


    percentage: 26.7,


    attemptDate: '2026-09-20'


  },


  {


    id: 'res-ullu-15',


    studentUid: 'JU0qy7J896199',


    studentName: 'ulluas',


    testSetId: 'mock-grand-pcm',


    testTitle: 'Full Length UGCET Mock #0',


    score: 5,


    maxScore: 180,


    correctCount: 5,


    wrongCount: 25,


    unansweredCount: 150,


    percentage: 2.8,


    attemptDate: '2026-09-19'


  },


  {


    id: 'res-t-01',


    studentUid: 'usr-101',


    studentName: 'Suhas Hegde',


    testSetId: 'mock-full-01',


    testTitle: 'KCET 2026 Grand Mock Simulation #1 (PCM)',


    score: 162,


    maxScore: 180,


    correctCount: 162,


    wrongCount: 18,


    percentage: 90.0,


    attemptDate: '2026-03-28'


  },


  {


    id: 'res-t-02',


    studentUid: 'usr-102',


    studentName: 'Karthik Gowda',


    testSetId: 'mock-full-01',


    testTitle: 'KCET 2026 Grand Mock Simulation #1 (PCM)',


    score: 124,


    maxScore: 180,


    correctCount: 124,


    wrongCount: 56,


    percentage: 68.8,


    attemptDate: '2026-03-29'


  }


];





export const INITIAL_HELPLINES: Helpline[] = [


  {


    id: 'hlp-01',


    title: 'KCET Gen Z Admin Telegram & WhatsApp Support',


    contactValue: '+91 94819 28102',


    type: 'WHATSAPP',


    description: 'Direct priority resolution for payment verification issues, mock test doubts, and login assistance.',


    actionUrl: 'https://wa.me/919481928102',


    isHighlighted: true


  },


  {


    id: 'hlp-02',


    title: 'Official KEA Karnataka CET Examination Cell',


    contactValue: '080-23460460',


    type: 'PHONE',


    description: 'Karnataka Examinations Authority Malleshwaram 18th Cross helpline for document verification.',


    actionUrl: 'tel:08023460460',


    isHighlighted: false


  },


  {


    id: 'hlp-03',


    title: 'Platform Tech & Account Recovery Helpdesk',


    contactValue: 'support@kcetgenz.in',


    type: 'EMAIL',


    description: 'Email our technical engineering team for bug reports and account resets.',


    actionUrl: 'mailto:support@kcetgenz.in',


    isHighlighted: false


  },


  {


    id: 'hlp-04',


    title: 'KCET Gen Z Community Instagram Handle',


    contactValue: '@kcetgenz_official',


    type: 'INSTAGRAM',


    description: 'Follow daily question countdowns, topper interview clips, and Karnataka college campus reviews.',


    actionUrl: 'https://instagram.com/kcetgenz_official',


    isHighlighted: true


  }


];





export const INITIAL_RECEIPTS: PaymentReceipt[] = [


  {


    receiptId: 'rcpt-501',


    userId: 'usr-102',


    userName: 'Karthik Gowda',


    userEmail: 'karthik.gowda26@gmail.com',


    userPhone: '9741002341',


    amountPaid: 299,


    transactionRef: '610294829103',


    receiptImageUri: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',


    submittedAtTimestamp: Date.now() - 3600000 * 2,


    status: 'UNDER_VERIFICATION',


    rejectionReason: ''


  },


  {


    receiptId: 'rcpt-502',


    userId: 'usr-106',


    userName: 'Akash Shetty',


    userEmail: 'akash.shetty@gmail.com',


    userPhone: '9880192831',


    amountPaid: 299,


    transactionRef: '609819283741',


    receiptImageUri: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',


    submittedAtTimestamp: Date.now() - 3600000 * 18,


    status: 'UNDER_VERIFICATION',


    rejectionReason: ''


  },


  {


    receiptId: 'rcpt-500',


    userId: 'usr-101',


    userName: 'Suhas Hegde',


    userEmail: 'suhas.hegde@gmail.com',


    userPhone: '9845210982',


    amountPaid: 299,


    transactionRef: '601839281729',


    receiptImageUri: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',


    submittedAtTimestamp: Date.now() - 86400000 * 3,


    status: 'VERIFIED',


    rejectionReason: '',


    verifiedAtTimestamp: Date.now() - 86400000 * 2


  }


];





export const INITIAL_COLLEGES: College[] = [


  {


    id: 'col-rvce',


    name: 'R.V. College of Engineering (RVCE)',


    code: 'E001',


    district: 'Bengaluru Urban',


    collegeType: 'Autonomous',


    imageResUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',


    logoResUrl: '',


    naacGrade: 'A++',


    nirfRank: 89,


    tuitionFeePerYear: 104000,


    hostelFeePerYear: 135000,


    highestPackageLpa: 62.0,


    avgPackageLpa: 16.5,


    placementPercentage: 96,


    topRecruiters: ['Microsoft', 'Google', 'Amazon', 'Cisco', 'Texas Instruments'],


    studentRating: 4.9,


    hasHostel: true,


    websiteUrl: 'https://rvce.edu.in',


    mapLocationQuery: 'RV College of Engineering Mysuru Road Bengaluru',


    distanceKmFromBlr: 12


  },


  {


    id: 'col-bmsce',


    name: 'B.M.S. College of Engineering (BMSCE)',


    code: 'E002',


    district: 'Bengaluru Urban',


    collegeType: 'Autonomous',


    imageResUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',


    logoResUrl: '',


    naacGrade: 'A++',


    nirfRank: 98,


    tuitionFeePerYear: 104000,


    hostelFeePerYear: 120000,


    highestPackageLpa: 50.0,


    avgPackageLpa: 12.8,


    placementPercentage: 92,


    topRecruiters: ['Oracle', 'Dell', 'SAP Labs', 'Mercedes Benz', 'Bosch'],


    studentRating: 4.8,


    hasHostel: true,


    websiteUrl: 'https://bmsce.ac.in',


    mapLocationQuery: 'BMS College of Engineering Basavanagudi Bengaluru',


    distanceKmFromBlr: 5


  },


  {


    id: 'col-msrit',


    name: 'M.S. Ramaiah Institute of Technology (MSRIT)',


    code: 'E003',


    district: 'Bengaluru Urban',


    collegeType: 'Autonomous',


    imageResUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',


    logoResUrl: '',


    naacGrade: 'A+',


    nirfRank: 67,


    tuitionFeePerYear: 104000,


    hostelFeePerYear: 110000,


    highestPackageLpa: 50.0,


    avgPackageLpa: 11.5,


    placementPercentage: 91,


    topRecruiters: ['Intel', 'Qualcomm', 'Goldman Sachs', 'Adobe', 'Samsung'],


    studentRating: 4.7,


    hasHostel: true,


    websiteUrl: 'https://msrit.edu',


    mapLocationQuery: 'MS Ramaiah Institute of Technology Mathikere Bengaluru',


    distanceKmFromBlr: 8


  },


  {


    id: 'col-pes',


    name: 'PES University (Ring Road Campus)',


    code: 'E004',


    district: 'Bengaluru Urban',


    collegeType: 'Private University',


    imageResUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80',


    logoResUrl: '',


    naacGrade: 'A+',


    nirfRank: 100,


    tuitionFeePerYear: 104000,


    hostelFeePerYear: 150000,


    highestPackageLpa: 65.0,


    avgPackageLpa: 15.2,


    placementPercentage: 95,


    topRecruiters: ['Apple', 'Microsoft', 'Intuit', 'Morgan Stanley'],


    studentRating: 4.8,


    hasHostel: true,


    websiteUrl: 'https://pes.edu',


    mapLocationQuery: 'PES University 100 Feet Ring Road Banashankari Bengaluru',


    distanceKmFromBlr: 10


  }


];





export const INITIAL_BRANCH_CUTOFFS: BranchCutoff[] = [


  {


    id: 'cut-rvce-cse',


    collegeId: 'col-rvce',


    branchCode: 'CSE',


    branchName: 'Computer Science and Engineering',


    categoryCutoffs: {


      GM: 165,


      '2A': 480,


      '2B': 520,


      '3A': 210,


      '3B': 250,


      SC: 2150,


      ST: 3400


    }


  },


  {


    id: 'cut-rvce-aiml',


    collegeId: 'col-rvce',


    branchCode: 'AIML',


    branchName: 'Artificial Intelligence & Machine Learning',


    categoryCutoffs: {


      GM: 320,


      '2A': 850,


      '2B': 910,


      '3A': 450,


      '3B': 510,


      SC: 3500,


      ST: 4900


    }


  },


  {


    id: 'cut-bmsce-cse',


    collegeId: 'col-bmsce',


    branchCode: 'CSE',


    branchName: 'Computer Science and Engineering',


    categoryCutoffs: {


      GM: 850,


      '2A': 1950,


      '2B': 2100,


      '3A': 1100,


      '3B': 1250,


      SC: 6500,


      ST: 8900


    }


  },


  {


    id: 'cut-msrit-cse',


    collegeId: 'col-msrit',


    branchCode: 'CSE',


    branchName: 'Computer Science and Engineering',


    categoryCutoffs: {


      GM: 980,


      '2A': 2200,


      '2B': 2400,


      '3A': 1250,


      '3B': 1400,


      SC: 7200,


      ST: 9800


    }


  }


];





export const INITIAL_BRANCHES: EngineeringBranch[] = [


  {


    id: 'br-cse',


    branchCode: 'CSE',


    branchName: 'Computer Science and Engineering',


    iconEmoji: '??',


    category: 'Tech & AI',


    overview: 'The highest demand engineering branch focusing on algorithm design, software architecture, cloud platforms, and cyber systems.',


    futureDemandLevel: 'Extremely High (98% Placement)',


    futureScope: 'Exponential growth driven by generative AI, cloud computing, blockchain, and enterprise SaaS evolution.',


    careerOpportunities: [


      'Full Stack Software Engineer',


      'Cloud Solutions Architect',


      'Systems Programmer',


      'DevOps & Site Reliability Engineer'


    ],


    higherStudiesOptions: ['M.Tech in Computer Science', 'MS in Computer Science (USA/Europe)', 'MBA in Tech Management'],


    requiredSkills: ['Data Structures & Algorithms', 'C++/Java/Python', 'System Design', 'DBMS & SQL'],


    avgStartingSalaryLpa: 11.5,


    topOfferingCollegesCount: 195,


    districtOrPlace: 'Bengaluru, Mysuru, Mangaluru'


  },


  {


    id: 'br-aiml',


    branchCode: 'AIML',


    branchName: 'Artificial Intelligence & Machine Learning',


    iconEmoji: '??',


    category: 'Tech & AI',


    overview: 'Specialized discipline teaching neural networks, deep learning, NLP, computer vision, and cognitive computing.',


    futureDemandLevel: 'Skyrocketing',


    futureScope: 'Revolutionizing healthcare, robotics, automated vehicles, algorithmic trading, and human-computer interactions.',


    careerOpportunities: [


      'AI Research Scientist',


      'Machine Learning Engineer',


      'NLP Specialist',


      'Computer Vision Engineer'


    ],


    higherStudiesOptions: ['M.S in Artificial Intelligence', 'Ph.D in Deep Learning', 'Robotics and Automation'],


    requiredSkills: ['Linear Algebra & Probability', 'Python / PyTorch / TensorFlow', 'Neural Network Architectures', 'MLOps'],


    avgStartingSalaryLpa: 12.8,


    topOfferingCollegesCount: 120,


    districtOrPlace: 'Bengaluru Tech Corridor'


  },


  {


    id: 'br-ece',


    branchCode: 'ECE',


    branchName: 'Electronics & Communication Engineering',


    iconEmoji: '??',


    category: 'Core',


    overview: 'Versatile engineering discipline bridging hardware and software, covering VLSI design, embedded microcontrollers, and 5G/6G wireless networks.',


    futureDemandLevel: 'Very High (Surging India Semiconductor Mission)',


    futureScope: 'Massive domestic semiconductor fab investments and chip design hubs in Karnataka creating immense demand.',


    careerOpportunities: [


      'VLSI Design Engineer',


      'Embedded Firmware Developer',


      'RF & Wireless Systems Engineer',


      'FPGA Engineer'


    ],


    higherStudiesOptions: ['M.Tech in VLSI & Microelectronics', 'MS in Electrical Engineering', 'Signal Processing'],


    requiredSkills: ['Verilog / VHDL', 'Digital Electronics', 'C / Assembly', 'Signal Processing Math'],


    avgStartingSalaryLpa: 9.5,


    topOfferingCollegesCount: 180,


    districtOrPlace: 'Bengaluru, Hubballi, Belagavi'


  }


];







// ==========================================
// ⚔️ 1 VS 1 CHALLENGES MOCK / INITIAL DATA
// ==========================================
export const INITIAL_QUESTION_SETS: ChallengeQuestionSet[] = [
  { id: 'set_01', setId: 'set_01', name: 'KCET PCM Challenge Set 01', description: 'Balanced Physics, Chemistry, and Math 20-Q Challenge', questionCount: 20, subjects: 'Physics • Chemistry • Math PCM', isActive: true },
  { id: 'set_02', setId: 'set_02', name: 'KCET PCM Challenge Set 02', description: 'Balanced Physics, Chemistry, and Math 20-Q Challenge', questionCount: 20, subjects: 'Physics • Chemistry • Math PCM', isActive: true },
  { id: 'set_03', setId: 'set_03', name: 'KCET PCM Challenge Set 03', description: 'Balanced Physics, Chemistry, and Math 20-Q Challenge', questionCount: 20, subjects: 'Physics • Chemistry • Math PCM', isActive: true },
  { id: 'set_04', setId: 'set_04', name: 'KCET PCM Challenge Set 04', description: 'Balanced Physics, Chemistry, and Math 20-Q Challenge', questionCount: 20, subjects: 'Physics • Chemistry • Math PCM', isActive: true },
  { id: 'set_05', setId: 'set_05', name: 'KCET PCM Challenge Set 05', description: 'Balanced Physics, Chemistry, and Math 20-Q Challenge', questionCount: 20, subjects: 'Physics • Chemistry • Math PCM', isActive: true }
];

export const INITIAL_CHALLENGE_SETTINGS: ChallengeSettings = {
  liveChallengeEntryFee: 50,
  physicsEnabled: true,
  chemistryEnabled: true,
  mathEnabled: true,
  pcmEnabled: true,
  durationSeconds: 180,
  durationHours: 3,
  durationMinutes: 0,
  autoExpireMinutes: 30,
  maxWagerXp: 500
};

export const INITIAL_CHALLENGES: OneVsOneChallenge[] = [
  {
    challengeId: 'CHL-206068',
    user1Id: 'u-shrinidhi',
    user2Id: 'u-tanu',
    user1Name: 'Shrinidhi',
    user2Name: 'Tanu@*',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'TERMINATED',
    type: 'FRIENDLY',
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 14,
    scoreUser2: 9,
    winnerId: 'u-shrinidhi',
    winnerName: 'Shrinidhi',
    timestamp: 1728030000000,
    createdAtFormatted: '04 Oct 2026, 03:50 PM'
  },
  {
    challengeId: 'CHL-935508',
    user1Id: 'u-shrinidhi',
    user2Id: 'u-tanviya',
    user1Name: 'Shrinidhi',
    user2Name: 'Tanviya',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'FRIENDLY',
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 18,
    scoreUser2: 12,
    winnerId: 'u-shrinidhi',
    winnerName: 'Shrinidhi',
    timestamp: 1728031200000,
    createdAtFormatted: '04 Oct 2026, 04:10 PM'
  },
  {
    challengeId: 'CHL-373750',
    user1Id: 'u-yogish',
    user2Id: 'u-shrinidhi',
    user1Name: 'Yogish Gaming',
    user2Name: 'Shrinidhi',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'FRIENDLY',
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 15,
    scoreUser2: 17,
    winnerId: 'u-shrinidhi',
    winnerName: 'Shrinidhi',
    timestamp: 1728032400000,
    createdAtFormatted: '04 Oct 2026, 04:30 PM'
  },
  {
    challengeId: 'CHL-865690',
    user1Id: 'u-ullas',
    user2Id: 'u-udaya',
    user1Name: 'Ullas Suvarna',
    user2Name: 'udaya suvarna',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 19,
    scoreUser2: 16,
    winnerId: 'u-ullas',
    winnerName: 'Ullas Suvarna',
    timestamp: 1728033600000,
    createdAtFormatted: '04 Oct 2026, 04:50 PM'
  },
  {
    challengeId: 'CHL-166087',
    user1Id: 'u-udaya',
    user2Id: 'u-ullas-u',
    user1Name: 'udaya suvarna',
    user2Name: 'ullas u suvarna',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'EXPIRED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 0,
    scoreUser2: 0,
    timestamp: 1728034800000,
    createdAtFormatted: '04 Oct 2026, 05:10 PM'
  },
  {
    challengeId: 'CHL-762330',
    user1Id: 'u-udaya',
    user2Id: 'u-ullas-u',
    user1Name: 'udaya suvarna',
    user2Name: 'ullas u suvarna',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'EXPIRED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 0,
    scoreUser2: 0,
    timestamp: 1728036000000,
    createdAtFormatted: '04 Oct 2026, 05:30 PM'
  },
  {
    challengeId: 'CHL-492104',
    user1Id: 'u-karthik',
    user2Id: 'u-rakshith',
    user1Name: 'Karthik Gowda',
    user2Name: 'Rakshith R',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 17,
    scoreUser2: 14,
    winnerId: 'u-karthik',
    winnerName: 'Karthik Gowda',
    timestamp: 1728037200000,
    createdAtFormatted: '04 Oct 2026, 05:50 PM'
  },
  {
    challengeId: 'CHL-518290',
    user1Id: 'u-ananya',
    user2Id: 'u-preethi',
    user1Name: 'Ananya Rao',
    user2Name: 'Preethi K',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'FRIENDLY',
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 18,
    scoreUser2: 15,
    winnerId: 'u-ananya',
    winnerName: 'Ananya Rao',
    timestamp: 1728038400000,
    createdAtFormatted: '04 Oct 2026, 06:10 PM'
  },
  {
    challengeId: 'CHL-609123',
    user1Id: 'u-rohan',
    user2Id: 'u-varun',
    user1Name: 'Rohan Deshmukh',
    user2Name: 'Varun Hegde',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 19,
    scoreUser2: 18,
    winnerId: 'u-rohan',
    winnerName: 'Rohan Deshmukh',
    timestamp: 1728039600000,
    createdAtFormatted: '04 Oct 2026, 06:30 PM'
  },
  {
    challengeId: 'CHL-712894',
    user1Id: 'u-nikhil',
    user2Id: 'u-pawan',
    user1Name: 'Nikhil Shetty',
    user2Name: 'Pawan Kumar',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'XP_WAGER',
    wagerXp: 150,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 16,
    scoreUser2: 13,
    winnerId: 'u-nikhil',
    winnerName: 'Nikhil Shetty',
    timestamp: 1728040800000,
    createdAtFormatted: '04 Oct 2026, 06:50 PM'
  },
  {
    challengeId: 'CHL-821940',
    user1Id: 'u-deepak',
    user2Id: 'u-manoj',
    user1Name: 'Deepak Bhat',
    user2Name: 'Manoj Poojary',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 14,
    scoreUser2: 16,
    winnerId: 'u-manoj',
    winnerName: 'Manoj Poojary',
    timestamp: 1728042000000,
    createdAtFormatted: '04 Oct 2026, 07:10 PM'
  },
  {
    challengeId: 'CHL-930412',
    user1Id: 'u-swathi',
    user2Id: 'u-divya',
    user1Name: 'Swathi Murthy',
    user2Name: 'Divya Nayak',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'FRIENDLY',
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 15,
    scoreUser2: 12,
    winnerId: 'u-swathi',
    winnerName: 'Swathi Murthy',
    timestamp: 1728043200000,
    createdAtFormatted: '04 Oct 2026, 07:30 PM'
  },
  {
    challengeId: 'CHL-102934',
    user1Id: 'u-sanjay',
    user2Id: 'u-kavya',
    user1Name: 'Sanjay Acharya',
    user2Name: 'Kavya S',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 16,
    scoreUser2: 14,
    winnerId: 'u-sanjay',
    winnerName: 'Sanjay Acharya',
    timestamp: 1728044400000,
    createdAtFormatted: '04 Oct 2026, 07:50 PM'
  },
  {
    challengeId: 'CHL-219485',
    user1Id: 'u-harish',
    user2Id: 'u-chandan',
    user1Name: 'Harish Babu',
    user2Name: 'Chandan K',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 18,
    scoreUser2: 17,
    winnerId: 'u-harish',
    winnerName: 'Harish Babu',
    timestamp: 1728045600000,
    createdAtFormatted: '04 Oct 2026, 08:10 PM'
  },
  {
    challengeId: 'CHL-328194',
    user1Id: 'u-meghana',
    user2Id: 'u-sahana',
    user1Name: 'Meghana Pai',
    user2Name: 'Sahana Shenoy',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'FRIENDLY',
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 17,
    scoreUser2: 15,
    winnerId: 'u-meghana',
    winnerName: 'Meghana Pai',
    timestamp: 1728046800000,
    createdAtFormatted: '04 Oct 2026, 08:30 PM'
  },
  {
    challengeId: 'CHL-439201',
    user1Id: 'u-aditya',
    user2Id: 'u-vikram',
    user1Name: 'Aditya Prasad',
    user2Name: 'Vikram Singh',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'COMPLETED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 19,
    scoreUser2: 15,
    winnerId: 'u-aditya',
    winnerName: 'Aditya Prasad',
    timestamp: 1728048000000,
    createdAtFormatted: '04 Oct 2026, 08:50 PM'
  },
  {
    challengeId: 'CHL-548192',
    user1Id: 'u-vinay',
    user2Id: 'u-rahul',
    user1Name: 'Vinay Kulkarni',
    user2Name: 'Rahul V',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'EXPIRED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 0,
    scoreUser2: 0,
    timestamp: 1728049200000,
    createdAtFormatted: '04 Oct 2026, 09:10 PM'
  },
  {
    challengeId: 'CHL-659203',
    user1Id: 'u-soundarya',
    user2Id: 'u-tejaswini',
    user1Name: 'Soundarya R',
    user2Name: 'Tejaswini M',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'TERMINATED',
    type: 'FRIENDLY',
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 4,
    scoreUser2: 2,
    timestamp: 1728050400000,
    createdAtFormatted: '04 Oct 2026, 09:30 PM'
  },
  {
    challengeId: 'CHL-760314',
    user1Id: 'u-rakesh',
    user2Id: 'u-suresh',
    user1Name: 'Rakesh N',
    user2Name: 'Suresh B',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'EXPIRED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 0,
    scoreUser2: 0,
    timestamp: 1728051600000,
    createdAtFormatted: '04 Oct 2026, 09:50 PM'
  },
  {
    challengeId: 'CHL-871425',
    user1Id: 'u-pooja',
    user2Id: 'u-priya',
    user1Name: 'Pooja Hegde',
    user2Name: 'Priya Dharshini',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'TERMINATED',
    type: 'FRIENDLY',
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 7,
    scoreUser2: 5,
    timestamp: 1728052800000,
    createdAtFormatted: '04 Oct 2026, 10:10 PM'
  },
  {
    challengeId: 'CHL-982536',
    user1Id: 'u-prashanth',
    user2Id: 'u-bharath',
    user1Name: 'Prashanth M',
    user2Name: 'Bharath G',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'EXPIRED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 0,
    scoreUser2: 0,
    timestamp: 1728054000000,
    createdAtFormatted: '04 Oct 2026, 10:30 PM'
  },
  {
    challengeId: 'CHL-193647',
    user1Id: 'u-nandini',
    user2Id: 'u-bindu',
    user1Name: 'Nandini K',
    user2Name: 'Bindu Shree',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'TERMINATED',
    type: 'FRIENDLY',
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 3,
    scoreUser2: 1,
    timestamp: 1728055200000,
    createdAtFormatted: '04 Oct 2026, 10:50 PM'
  },
  {
    challengeId: 'CHL-204758',
    user1Id: 'u-chethan',
    user2Id: 'u-darshan',
    user1Name: 'Chethan Kumar',
    user2Name: 'Darshan S',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'EXPIRED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 0,
    scoreUser2: 0,
    timestamp: 1728056400000,
    createdAtFormatted: '04 Oct 2026, 11:10 PM'
  },
  {
    challengeId: 'CHL-315869',
    user1Id: 'u-arun',
    user2Id: 'u-naveen',
    user1Name: 'Arun V',
    user2Name: 'Naveen Raj',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'EXPIRED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 0,
    scoreUser2: 0,
    timestamp: 1728057600000,
    createdAtFormatted: '04 Oct 2026, 11:30 PM'
  },
  {
    challengeId: 'CHL-426970',
    user1Id: 'u-spoorthi',
    user2Id: 'u-sneha',
    user1Name: 'Spoorthi N',
    user2Name: 'Sneha Rao',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'TERMINATED',
    type: 'FRIENDLY',
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 5,
    scoreUser2: 3,
    timestamp: 1728058800000,
    createdAtFormatted: '04 Oct 2026, 11:50 PM'
  },
  {
    challengeId: 'CHL-537081',
    user1Id: 'u-shashi',
    user2Id: 'u-manju',
    user1Name: 'Shashidhar B',
    user2Name: 'Manjunath K',
    subject: 'Physics • Chemistry • Math PCM',
    status: 'EXPIRED',
    type: 'XP_WAGER',
    wagerXp: 200,
    timerString: '00:00:00',
    timerSeconds: 0,
    scoreUser1: 0,
    scoreUser2: 0,
    timestamp: 1728060000000,
    createdAtFormatted: '05 Oct 2026, 12:10 AM'
  }
];
