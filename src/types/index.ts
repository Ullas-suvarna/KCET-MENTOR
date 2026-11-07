export type SubjectType = 'PHYSICS' | 'CHEMISTRY' | 'MATHEMATICS' | 'BIOLOGY';


export type CorrectOption = 'A' | 'B' | 'C' | 'D';





export interface Question {


  id: number;


  subject: SubjectType;


  questionText: string;


  imageUrl?: string;


  optionA: string;


  optionB: string;


  optionC: string;


  optionD: string;


  correctOption: CorrectOption;


  explanation: string;


  testSetId: string;


  isPremium: boolean;


}





export type TestCategory = 


  | 'Full Mock Tests' 


  | 'Previous Year Papers' 


  | 'Chapter-wise Tests' 


  | 'Daily Practice';





export interface TestSeriesSet {


  id: string;


  title: string;


  category: TestCategory;


  questionCount: number;


  durationMins: number;


  isPremium: boolean;


  description: string;


  createdDate: string;


}





export interface Mentor {


  id: string;


  name: string;


  branch: string;


  college: string;


  currentYear: string;


  kcetRank: string;


  rating: number;


  bio: string;


  email: string;


  instagram: string;


  photoUrl: string;


}





export type BookingStatus = 


  | 'Under Verification' 


  | 'Waiting for Senior Confirmation' 


  | 'Confirmed' 


  | 'Reschedule Needed' 


  | 'Declined' 


  | 'Expired';





export interface SeniorChatBooking {


  bookingId: string;


  userId: string;


  userName: string;


  userEmail: string;


  selectedDate: string;


  selectedTime: string;


  mentorName: string;


  assignedMentorEmail: string;


  amountPaid: number;


  paymentRefNumber: string;

  // Receipt image — Android uploads to Firebase Storage and stores URL here
  receiptUrl?: string;
  receiptImageUri?: string;


  bookedAtTimestamp: number;


  status: BookingStatus;


  adminMessage?: string;


  rejectionReason?: string;


}





export type ResourceCategory = 'Syllabus' | 'PYQ' | 'Formula' | 'Tips' | 'Notes';





export interface Resource {


  id: string;


  title: string;


  category: ResourceCategory;


  fileFormat: 'PDF' | string;


  fileSize: string;


  yearOrSubject: string;


  downloadUrl: string;


  description: string;


}





export type DateCategory = 'Exam' | 'Counselling' | 'Application' | 'Results' | 'Admit Card';


export type DateStatus = 'Upcoming' | 'Active Now' | 'Completed' | 'Crucial';





export interface ImportantDate {


  id: string;


  eventTitle: string;


  dateOrDeadline: string;


  status: DateStatus;


  description: string;


  category: DateCategory;


  isHighlighted: boolean;


}





export interface RankVsMarksTier {


  id: string;


  marksRange: string;


  expectedRankRange: string;


  year: string;


  description: string;


  minMarks: number;


  maxMarks: number;


}





export type NotificationType = 


  | 'ANNOUNCEMENT' 


  | 'EXAM_ALERT' 


  | 'STUDY_MATERIAL' 


  | 'COUNSELLING' 


  | 'SYSTEM' 


  | 'PAYMENT' 


  | 'BOOKING';





export type ActionRoute = 


  | 'NAV_PRACTICE' 


  | 'NAV_RESOURCES' 


  | 'NAV_COUNSELLING' 


  | 'NAV_TEST_SERIES' 


  | 'NAV_PROFILE' 


  | 'NONE';





export interface Notification {


  id: string;


  title: string;


  message: string;


  timestamp: string;


  type: NotificationType;


  isRead: boolean;


  actionType?: ActionRoute;


  /** "ALL" for broadcast, or the student's Firebase UID for targeted sends */
  targetUserId: string;


  /** "" for broadcast, or the student's email (lowercase) for targeted sends */
  targetUserEmail: string;


  createdAtMillis: number;


}





export interface Announcement {


  id: string;


  title: string;


  date: string;


  message: string;


  isImportant: boolean;


}





export interface User {


  uid: string;


  name: string;


  email: string;


  phone?: string;


  photoUrl?: string;


  isPremium: boolean;


  kcetTargetRank: string;


  targetStream: string;


  registrationDate: string;


  isForceLoggedOut: boolean;


  isBlocked: boolean;


  blockReason: string;


  signInMethod: string;


  studentId: string;
  formattedStudentId?: string;
  password?: string;
  displayPassword?: string;
  createdAt?: string;
  examYear?: string | number;
  lastUpdatedMillis: number;
  isActiveNow?: boolean;
  lastProfileUpdateNote?: string;
  lastProfileUpdateTime?: string;
}





export interface StudentTestResult {
  // ── Document ID (always present) ──
  id: string;

  // ── Web-side field names (used by mock data & admin edits) ──
  studentUid?: string;
  studentName?: string;
  studentEmail?: string;
  testSetId?: string;
  testTitle?: string;
  maxScore?: number;
  attemptDate?: string;

  // ── Android Firebase field names (written by the student app) ──
  /** Student UID — Android writes this as `userId` */
  userId?: string;
  /** Student full name — Android writes this as `userName` */
  userName?: string;
  /** Student email — Android writes this as `userEmail` */
  userEmail?: string;
  /** Student ID string — Android writes this as `studentId` */
  studentId?: string;
  /** Test name — Android writes this as `testName` */
  testName?: string;
  /** Total questions — Android writes this as `totalQuestions` */
  totalQuestions?: number;
  /** Time taken in seconds — Android writes this as `timeTakenSeconds` */
  timeTakenSeconds?: number;
  /** Epoch ms timestamp — Android writes this as `timestamp` */
  timestamp?: number;
  /** Attempt ID — Android writes this as `attemptId` */
  attemptId?: string;
  /** Unanswered count — both platforms */
  unansweredCount?: number;

  // ── Always present ──
  score: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
}





export type HelplineType = 'EMAIL' | 'PHONE' | 'WHATSAPP' | 'INSTAGRAM';





export interface Helpline {


  id: string;


  title: string;


  contactValue: string;


  type: HelplineType;


  description: string;


  actionUrl: string;


  isHighlighted: boolean;


}





export type ReceiptStatus = 'UNDER_VERIFICATION' | 'VERIFIED' | 'REJECTED';





export interface PaymentReceipt {


  receiptId: string;


  userId: string;


  userName: string;


  userEmail: string;


  userPhone: string;


  amountPaid: number;


  transactionRef: string;


  receiptImageUri: string;


  submittedAtTimestamp: number;


  status: ReceiptStatus;


  rejectionReason: string;


  verifiedAtTimestamp?: number;


}





export type CollegeType = 'Autonomous' | 'Government' | 'Private' | 'Deemed University' | 'Private University';


export type NaacGrade = 'A++' | 'A+' | 'A' | 'B++' | 'B+' | 'B' | 'NA';





export interface College {


  id: string;


  name: string;


  code: string;


  district: string;


  collegeType: CollegeType;


  imageResUrl: string;


  logoResUrl?: string;


  naacGrade: NaacGrade;


  nirfRank: number;


  tuitionFeePerYear: number;


  hostelFeePerYear: number;


  highestPackageLpa: number;


  avgPackageLpa: number;


  placementPercentage: number;


  topRecruiters: string[];


  studentRating: number;


  hasHostel: boolean;


  websiteUrl: string;


  mapLocationQuery: string;


  distanceKmFromBlr: number;


  brochureUrl?: string;


}





export interface BranchCutoff {


  id: string;


  collegeId: string;


  branchCode: string;


  branchName: string;


  categoryCutoffs: Record<string, number>; // GM, 2A, 2B, 3A, 3B, SC, ST


}





export type BranchCategory = 'Tech & AI' | 'Core' | 'Allied & Emerging';





export interface EngineeringBranch {


  id: string;


  branchCode: string;


  branchName: string;


  iconEmoji: string;


  category: BranchCategory;


  overview: string;


  futureDemandLevel: string;


  futureScope: string;


  careerOpportunities: string[];


  higherStudiesOptions: string[];


  requiredSkills: string[];


  avgStartingSalaryLpa: number;


  topOfferingCollegesCount: number;


  districtOrPlace: string;


}





export interface DeletedStudent {
  email: string;
  uid: string;
  name?: string;
  deletedAt: number;
  deletedAtMillis?: number;
}





export const KARNATAKA_DISTRICTS = [


  'Bagalkote',


  'Ballari',


  'Belagavi',


  'Bengaluru Rural',


  'Bengaluru Urban',


  'Bidar',


  'Chamarajanagar',


  'Chikkaballapura',


  'Chikkamagaluru',


  'Chitradurga',


  'Dakshina Kannada',


  'Davanagere',


  'Dharwad',


  'Gadag',


  'Hassan',


  'Haveri',


  'Kalaburagi',


  'Kodagu',


  'Kolar',


  'Koppal',


  'Mandya',


  'Mysuru',


  'Raichur',


  'Ramanagara',


  'Shivamogga',


  'Tumakuru',


  'Udupi',


  'Uttara Kannada',


  'Vijayanagara',


  'Vijayapura',


  'Yadgir'


] as const;





export const CUTOFF_CATEGORIES = ['GM', '2A', '2B', '3A', '3B', 'SC', 'ST'] as const;





export const RANK_RANGES = [


  '1 – 1,000',


  '1,000 – 2,500',


  '2,500 – 5,000',


  '5,000 – 10,000',


  '10,000 – 15,000',


  '15,000 – 25,000',


  '25,000 – 50,000',


  '50,000 – 75,000',


  '75,000 – 100,000+'


] as const;





export const CATEGORY_MULTIPLIERS: Record<string, number> = {


  GM: 1.0,


  '2A': 2.1,


  '2B': 2.4,


  '3A': 1.35,


  '3B': 1.45,


  SC: 5.5,


  ST: 6.8


};





export const DEMANDED_BRANCHES = [


  { code: 'CSE', name: 'Computer Science & Engineering', emoji: '💻' },


  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', emoji: '🤖' },


  { code: 'AIDS', name: 'AI & Data Science', emoji: '📊' },


  { code: 'ISE', name: 'Information Science & Engineering', emoji: '🌐' },


  { code: 'CSD', name: 'Computer Science & Design', emoji: '🎨' },


  { code: 'CSBS', name: 'Computer Science & Business Systems', emoji: '💼' },


  { code: 'ECE', name: 'Electronics & Communication Engineering', emoji: '📡' },


  { code: 'EEE', name: 'Electrical & Electronics Engineering', emoji: '⚡' },


  { code: 'ME', name: 'Mechanical Engineering', emoji: '⚙️' },


  { code: 'CE', name: 'Civil Engineering', emoji: '🏗️' },


  { code: 'RAI', name: 'Robotics & Automation', emoji: '🦾' },


  { code: 'CY', name: 'Cyber Security Engineering', emoji: '🛡️' },


  { code: 'BT', name: 'Biotechnology Engineering', emoji: '🧬' },


  { code: 'AE', name: 'Aeronautical / Aerospace Engineering', emoji: '🚀' }


];





export const STANDARD_BRANCHES = DEMANDED_BRANCHES;

// ==========================================
// ⚔️ 1 VS 1 CHALLENGE CONTROL CENTER TYPES
// ==========================================
export type ChallengeStatus = 
  | 'WAITING' 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'RUNNING' 
  | 'COMPLETED' 
  | 'ABANDONED' 
  | 'TERMINATED' 
  | 'EXPIRED' 
  | 'PAUSED';

export type ChallengeType = 'FRIENDLY' | 'XP_WAGER';

export interface OneVsOneChallenge {
  challengeId: string;
  user1Id: string;
  user2Id: string;
  user1Name: string;
  user2Name: string;
  user1Avatar?: string;
  user2Avatar?: string;
  subject: string;
  status: ChallengeStatus;
  type: ChallengeType;
  wagerXp?: number;
  timerString?: string;
  timerSeconds?: number;
  scoreUser1: number;
  scoreUser2: number;
  winnerId?: string;
  winnerName?: string;
  timestamp?: number | any;
  createdAtFormatted?: string;
  notes?: string;
}

export interface ChallengeQuestionSet {
  id: string;
  name: string;
  questionCount: number;
  subjects: string;
  isActive: boolean;
}

export interface ChallengeSettings {
  liveChallengeEntryFee: number;
  physicsEnabled: boolean;
  chemistryEnabled: boolean;
  mathEnabled: boolean;
  pcmEnabled: boolean;
  durationSeconds: number;
  durationHours: number;
  durationMinutes: number;
  autoExpireMinutes: number;
  maxWagerXp: number;
}



