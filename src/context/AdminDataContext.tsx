import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  StudentTestResult,
  Helpline,
  PaymentReceipt,
  College,
  BranchCutoff,
  EngineeringBranch,
  DeletedStudent,
  BookingStatus,
  OneVsOneChallenge,
  ChallengeQuestionSet,
  ChallengeSettings
} from '../types';
import {
  INITIAL_QUESTIONS,
  INITIAL_TEST_SERIES,
  INITIAL_MENTORS,
  INITIAL_BOOKINGS,
  INITIAL_RESOURCES,
  INITIAL_IMPORTANT_DATES,
  INITIAL_RANK_VS_MARKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STUDENTS,
  INITIAL_STUDENT_TEST_RESULTS,
  INITIAL_HELPLINES,
  INITIAL_RECEIPTS,
  INITIAL_COLLEGES,
  INITIAL_BRANCH_CUTOFFS,
  INITIAL_BRANCHES,
  INITIAL_CHALLENGES,
  INITIAL_QUESTION_SETS,
  INITIAL_CHALLENGE_SETTINGS
} from '../services/mockData';
import { ToastContainer, ToastItem, ToastType } from '../components/common/Toast';
import { ConfirmModal, ConfirmDialogState } from '../components/common/ConfirmModal';
import { db, rtdb, collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, writeBatch, ref, rtdbSet, onValue, ADMIN_IDENTIFIER } from '../services/firebase';
import { deduplicateStudentProfiles } from '../utils/studentDedup';
interface AdminDataContextType {
  // Auth
  isAuthenticated: boolean;
  adminEmail: string;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  // Firebase status
  isFirebaseLive: boolean;
  syncStatus: string;
  seedDefaultsToFirebase: () => Promise<void>;
  // Data collections
  questions: Question[];
  testSeries: TestSeriesSet[];
  mentors: Mentor[];
  bookings: SeniorChatBooking[];
  resources: Resource[];
  dates: ImportantDate[];
  rankTiers: RankVsMarksTier[];
  announcements: Announcement[];
  notifications: Notification[];
  students: User[];
  studentTestResults: StudentTestResult[];
  helplines: Helpline[];
  receipts: PaymentReceipt[];
  colleges: College[];
  cutoffs: BranchCutoff[];
  branches: EngineeringBranch[];
  deletedStudents: DeletedStudent[];
  // CRUD Actions
  saveQuestion: (q: Question) => Promise<void>;
  deleteQuestion: (id: number) => Promise<void>;
  saveTestSeries: (ts: TestSeriesSet) => Promise<void>;
  deleteTestSeries: (id: string) => Promise<void>;
  saveMentor: (m: Mentor) => Promise<void>;
  deleteMentor: (id: string, mentorName?: string) => Promise<void>;
  updateBooking: (b: SeniorChatBooking) => Promise<void>;
  saveBooking: (b: SeniorChatBooking) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  saveResource: (r: Resource, notifyStudents?: boolean) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  saveDate: (d: ImportantDate) => Promise<void>;
  deleteDate: (id: string) => Promise<void>;
  saveRankTier: (tier: RankVsMarksTier) => Promise<void>;
  deleteRankTier: (id: string) => Promise<void>;
  sendBroadcast: (notif: Partial<Notification>, makeBanner?: boolean) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updateStudent: (student: Partial<User> & { uid: string }) => Promise<void>;
  togglePremium: (uid: string, current: boolean, email?: string, studentId?: string) => Promise<void>;
  blockStudent: (uid: string, reason: string) => Promise<void>;
  unblockStudent: (uid: string) => Promise<void>;
  forceLogoutStudent: (uid: string) => Promise<void>;
  forceLogoutAllStudents: () => Promise<void>;
  deleteStudentPermanently: (uid: string, email: string) => Promise<void>;
  saveTestResult: (res: StudentTestResult) => Promise<void>;
  deleteTestResult: (id: string) => Promise<void>;
  saveHelpline: (h: Helpline) => Promise<void>;
  deleteHelpline: (id: string) => Promise<void>;
  // Responsive Toast System
  toasts: ToastItem[];
  showToast: (title: string, message?: string, type?: ToastType, duration?: number) => void;
  notifySuccess: (message: string, title?: string) => void;
  notifyError: (message: string, title?: string) => void;
  notifyInfo: (message: string, title?: string) => void;
  notifyWarning: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
  requestConfirm: (options: { title?: string; message: string; itemName?: string; confirmText?: string; cancelText?: string; isDestructive?: boolean; }) => Promise<boolean>;
  approveReceipt: (receipt: PaymentReceipt) => Promise<void>;
  rejectReceipt: (receiptId: string, reason: string) => Promise<void>;
  saveCollege: (c: College) => Promise<void>;
  deleteCollege: (id: string) => Promise<void>;
  saveCutoff: (cutoff: BranchCutoff) => Promise<void>;
  deleteCutoff: (id: string) => Promise<void>;
  saveBranch: (b: EngineeringBranch) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  // ⚔️ 1 vs 1 Challenges
  challenges: OneVsOneChallenge[];
  questionSets: ChallengeQuestionSet[];
  challengeSettings: ChallengeSettings;
  saveChallenge: (challenge: OneVsOneChallenge) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
  toggleQuestionSet: (id: string, active: boolean) => Promise<void>;
  updateChallengeSettings: (settings: Partial<ChallengeSettings>) => Promise<void>;
}
const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);
export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('kcet_admin_auth') === 'true';
  });
  const [adminEmail] = useState(ADMIN_IDENTIFIER);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Syncing with Firestore...');

  // Universal Warning & Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDestructive: true,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const requestConfirm = (options: { title?: string; message: string; itemName?: string; confirmText?: string; cancelText?: string; isDestructive?: boolean; }): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title: options.title || 'Warning: Action Required',
        message: options.message,
        itemName: options.itemName,
        confirmText: options.confirmText || (options.isDestructive !== false ? 'Confirm Delete' : 'Confirm'),
        cancelText: options.cancelText || 'Cancel',
        isDestructive: options.isDestructive !== false,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  // Responsive System Toast Notification State & Helpers
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showToast = (title: string, message?: string, type: ToastType = 'success', duration = 3500) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newToast: ToastItem = { id, title, message, type, duration };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  };

  const notifySuccess = (message: string, title: string = 'Success') => {
    showToast(title, message, 'success');
  };

  const notifyError = (message: string, title: string = 'Error') => {
    showToast(title, message, 'error', 4500);
  };

  const notifyInfo = (message: string, title: string = 'Notice') => {
    showToast(title, message, 'info');
  };

  const notifyWarning = (message: string, title: string = 'Warning') => {
    showToast(title, message, 'warning', 4000);
  };
  // State collections initialized with local Karnataka defaults
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [testSeries, setTestSeries] = useState<TestSeriesSet[]>(INITIAL_TEST_SERIES);
  const [mentors, setMentors] = useState<Mentor[]>(INITIAL_MENTORS);
  const [bookings, setBookings] = useState<SeniorChatBooking[]>(INITIAL_BOOKINGS);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [dates, setDates] = useState<ImportantDate[]>(INITIAL_IMPORTANT_DATES);
  const [rankTiers, setRankTiers] = useState<RankVsMarksTier[]>(INITIAL_RANK_VS_MARKS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [students, setStudents] = useState<User[]>(INITIAL_STUDENTS);
  const [studentTestResults, setStudentTestResults] = useState<StudentTestResult[]>(INITIAL_STUDENT_TEST_RESULTS);
  const [helplines, setHelplines] = useState<Helpline[]>(INITIAL_HELPLINES);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(INITIAL_RECEIPTS);
  const [colleges, setColleges] = useState<College[]>(INITIAL_COLLEGES);
  const [cutoffs, setCutoffs] = useState<BranchCutoff[]>(() => {
    const saved = localStorage.getItem('kcet_admin_cutoffs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_BRANCH_CUTOFFS;
  });
  const [branches, setBranches] = useState<EngineeringBranch[]>(INITIAL_BRANCHES);
  // ⚔️ 1 vs 1 Challenges State
  const [challenges, setChallenges] = useState<OneVsOneChallenge[]>([]);
  const [questionSets, setQuestionSets] = useState<ChallengeQuestionSet[]>(INITIAL_QUESTION_SETS);
  const [challengeSettings, setChallengeSettings] = useState<ChallengeSettings>(INITIAL_CHALLENGE_SETTINGS);
  const [deletedStudents, setDeletedStudents] = useState<DeletedStudent[]>([]);
  // Pending admin overrides — keyed by student uid.
  // mergeAndEmit applies these so the UI never flickers back to stale data
  // while onSnapshot is still propagating the Firestore write.
  const pendingStudentOverrides = useRef<Map<string, Partial<User>>>(new Map());
  // Tracks deleted mentor IDs and names to guarantee immediate UI updates without race condition flicker
  const deletedMentorIds = useRef<Set<string>>(new Set());
  const deletedMentorNames = useRef<Set<string>>(new Set());

  // Real-time Firestore snapshot synchronization
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    try {
      // 1. Questions
      unsubs.push(onSnapshot(collection(db, 'questions'), (snap) => {
        if (!snap.empty) {
          const list: Question[] = [];
          snap.forEach(d => list.push({ ...d.data() } as Question));
          setQuestions(list);
          setIsFirebaseLive(true);
        }
      }, () => {}));
      // 2. Test Series Sets
      unsubs.push(onSnapshot(collection(db, 'test_series_sets'), (snap) => {
        if (!snap.empty) {
          const list: TestSeriesSet[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as TestSeriesSet));
          setTestSeries(list);
        }
      }, () => {}));
      // 3. Mentors — Dual-Database Synchronization (Firestore + Realtime Database 'registeredMentors')
      let fsMentorsList: Mentor[] = [];
      let rtdbMentorsList: Mentor[] = [];
      let regMentorsFsList: Mentor[] = [];
      let seniorMentorsFsList: Mentor[] = [];

      const syncMentorsMultiSource = () => {
        const combined = [...rtdbMentorsList, ...fsMentorsList, ...regMentorsFsList, ...seniorMentorsFsList];
        const map = new Map<string, Mentor>();

        for (const m of combined) {
          if (!m || !m.name) continue;
          const cleanName = m.name.trim();
          const normName = cleanName.toLowerCase();
          const mentorId = m.id || normName;

          // If deleted locally by admin, ignore from incoming snapshots
          if (deletedMentorIds.current.has(mentorId) || deletedMentorNames.current.has(normName)) {
            continue;
          }

          // Dedup by normalized name or ID
          let matchedKey = '';
          for (const [k, existing] of map.entries()) {
            if (k === normName || existing.id === mentorId || existing.name.toLowerCase() === normName) {
              matchedKey = k;
              break;
            }
          }

          if (matchedKey) {
            const existing = map.get(matchedKey)!;
            map.set(matchedKey, {
              id: existing.id || mentorId,
              name: existing.name || cleanName,
              branch: existing.branch || m.branch || '',
              college: existing.college || m.college || '',
              currentYear: existing.currentYear || m.currentYear || '',
              kcetRank: existing.kcetRank || m.kcetRank || '',
              rating: existing.rating || Number(m.rating) || 5.0,
              bio: existing.bio || m.bio || '',
              email: existing.email || m.email || '',
              instagram: existing.instagram || m.instagram || '',
              photoUrl: existing.photoUrl || m.photoUrl || ''
            });
          } else {
            map.set(normName, {
              id: mentorId,
              name: cleanName,
              branch: m.branch || '',
              college: m.college || '',
              currentYear: m.currentYear || '',
              kcetRank: m.kcetRank || '',
              rating: Number(m.rating) || 5.0,
              bio: m.bio || '',
              email: m.email || '',
              instagram: m.instagram || '',
              photoUrl: m.photoUrl || ''
            });
          }
        }

        const merged = Array.from(map.values());
        if (merged.length > 0 || (fsMentorsList.length === 0 && rtdbMentorsList.length === 0)) {
          setMentors(merged);
        }
      };

      // 3A. Firestore Collection: 'mentors'
      unsubs.push(onSnapshot(collection(db, 'mentors'), (snap) => {
        fsMentorsList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Mentor));
        syncMentorsMultiSource();
      }, (err) => console.warn('Firestore mentors listener notice:', err)));

      // 3B. Firestore Collection: 'registered_mentors'
      unsubs.push(onSnapshot(collection(db, 'registered_mentors'), (snap) => {
        regMentorsFsList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Mentor));
        syncMentorsMultiSource();
      }, () => {}));

      // 3C. Firestore Collection: 'senior_mentors'
      unsubs.push(onSnapshot(collection(db, 'senior_mentors'), (snap) => {
        seniorMentorsFsList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Mentor));
        syncMentorsMultiSource();
      }, () => {}));

      // 3D. Realtime Database (RTDB): 'registeredMentors' (Direct match to Android observeAllSeniorMentors)
      try {
        const mentorsRtdbRef = ref(rtdb, 'registeredMentors');
        const unsubRtdbMentors = onValue(mentorsRtdbRef, (snap) => {
          try {
            const val = snap.val();
            if (!val) {
              rtdbMentorsList = [];
            } else if (Array.isArray(val)) {
              rtdbMentorsList = val.filter(Boolean).map((item, idx) => ({
                id: item.id || ('rtdb-' + idx),
                name: item.name || '',
                branch: item.branch || '',
                college: item.college || '',
                currentYear: item.currentYear || '',
                kcetRank: item.kcetRank || '',
                rating: Number(item.rating) || 5.0,
                bio: item.bio || '',
                email: item.email || '',
                instagram: item.instagram || '',
                photoUrl: item.photoUrl || ''
              }));
            } else if (typeof val === 'object') {
              rtdbMentorsList = Object.entries(val).map(([k, item]: [string, any]) => ({
                id: item?.id || k,
                name: item?.name || k.replace(/_/g, ' '),
                branch: item?.branch || '',
                college: item?.college || '',
                currentYear: item?.currentYear || '',
                kcetRank: item?.kcetRank || '',
                rating: Number(item?.rating) || 5.0,
                bio: item?.bio || '',
                email: item?.email || '',
                instagram: item?.instagram || '',
                photoUrl: item?.photoUrl || ''
              }));
            }
            syncMentorsMultiSource();
          } catch (e) {
            console.warn('RTDB registeredMentors parse notice:', e);
          }
        }, (err) => console.warn('RTDB registeredMentors listener notice:', err));
        unsubs.push(() => unsubRtdbMentors());
      } catch (e) {
        console.warn('Could not attach RTDB /registeredMentors listener:', e);
      }

      // 4. Senior Chat Bookings (Firestore + Realtime Database)
      unsubs.push(onSnapshot(collection(db, 'senior_chat_bookings'), (snap) => {
        const list: SeniorChatBooking[] = [];
        snap.forEach(d => list.push({ bookingId: d.id, ...d.data() } as SeniorChatBooking));
        setBookings(list);
      }, () => {}));

      try {
        const bookingsRtdbRef = ref(rtdb, 'senior_chat_bookings');
        const unsubRtdbBookings = onValue(bookingsRtdbRef, (snap) => {
          try {
            const val = snap.val();
            if (val && typeof val === 'object') {
              const rtdbList: SeniorChatBooking[] = Object.entries(val).map(([k, item]: [string, any]) => ({
                bookingId: item?.bookingId || k,
                ...(typeof item === 'object' ? item : {})
              }));
              setBookings(prev => {
                if (prev.length === 0) return rtdbList;
                const map = new Map<string, SeniorChatBooking>();
                prev.forEach(b => map.set(b.bookingId, b));
                rtdbList.forEach(b => {
                  if (!map.has(b.bookingId)) {
                    map.set(b.bookingId, b);
                  }
                });
                return Array.from(map.values());
              });
            }
          } catch (e) {
            console.warn('RTDB senior_chat_bookings notice:', e);
          }
        }, () => {});
        unsubs.push(() => unsubRtdbBookings());
      } catch (e) {
        console.warn('Could not attach RTDB /senior_chat_bookings listener:', e);
      }
      // 5. Resources
      unsubs.push(onSnapshot(collection(db, 'resources'), (snap) => {
        if (!snap.empty) {
          const list: Resource[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Resource));
          setResources(list);
        }
      }, () => {}));
      // 6. Important Dates
      unsubs.push(onSnapshot(collection(db, 'important_dates'), (snap) => {
        if (!snap.empty) {
          const list: ImportantDate[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as ImportantDate));
          setDates(list);
        }
      }, () => {}));
      // 7. Rank vs Marks
      unsubs.push(onSnapshot(collection(db, 'rank_vs_marks'), (snap) => {
        if (!snap.empty) {
          const list: RankVsMarksTier[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as RankVsMarksTier));
          setRankTiers(list);
        }
      }, () => {}));
      // 8. Announcements
      unsubs.push(onSnapshot(collection(db, 'announcements'), (snap) => {
        if (!snap.empty) {
          const list: Announcement[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Announcement));
          setAnnouncements(list);
        }
      }, () => {}));
      // 9. Notifications
      unsubs.push(onSnapshot(collection(db, 'notifications'), (snap) => {
        if (!snap.empty) {
          const list: Notification[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Notification));
          setNotifications(list);
        }
      }, () => {}));

      // 10. ⚔️ 1 vs 1 Challenges (Realtime Firestore onSnapshot on 'challenges' - 100% Real Android App Parity)
      const parseChallengeDoc = (d: any): OneVsOneChallenge => {
        const data = d.data();
        const id = d.id;
        const cAt = typeof data.createdAt === 'number' 
          ? data.createdAt 
          : (data.createdAt?.toMillis ? data.createdAt.toMillis() : (typeof data.timestamp === 'number' ? data.timestamp : (data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now())));

        const user1Id = data.challengerId || data.user1Id || '';
        const user2Id = data.challengedId || data.user2Id || '';
        const user1Name = data.challengerName || data.user1Name || data.challengerId || 'Student 1';
        const user2Name = data.challengedName || data.user2Name || data.challengedId || 'Student 2';
        const user1Avatar = data.challengerPhoto || data.user1Avatar;
        const user2Avatar = data.challengedPhoto || data.user2Avatar;

        const rawStatus = (data.status || 'WAITING').toUpperCase();
        
        const scoreUser1 = data.challengerScore !== null && data.challengerScore !== undefined 
          ? Number(data.challengerScore) 
          : (data.scoreUser1 !== undefined ? Number(data.scoreUser1) : 0);
        const scoreUser2 = data.challengedScore !== null && data.challengedScore !== undefined 
          ? Number(data.challengedScore) 
          : (data.scoreUser2 !== undefined ? Number(data.scoreUser2) : 0);

        const isXp = data.challengeType === 'XP' || data.xpChallenge === true || (data.entryXP && data.entryXP > 0) || data.type === 'XP_WAGER';
        const wagerXp = data.entryXP || data.wagerXp || (isXp ? 200 : 0);

        const winnerId = data.winnerId || null;
        let winnerName = data.winnerName;
        if (!winnerName && winnerId) {
          if (winnerId === user1Id) winnerName = user1Name;
          else if (winnerId === user2Id) winnerName = user2Name;
        }

        const timerString = data.timerString || '00:00:00';

        const createdAtFormatted = data.createdAtFormatted || new Date(cAt).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        });

        const subjectStr = data.subject || (data.questionSetId ? ('PCM Set ' + String(data.questionSetId).replace('set_', '').toUpperCase()) : 'Physics • Chemistry • Math PCM');

        return {
          challengeId: id,
          user1Id,
          user2Id,
          user1Name,
          user2Name,
          user1Avatar,
          user2Avatar,
          subject: subjectStr,
          status: rawStatus as any,
          type: (isXp ? 'XP_WAGER' : 'FRIENDLY') as any,
          wagerXp,
          entryXP: data.entryXP,
          prizeXP: data.prizeXP,
          timerString,
          timerSeconds: data.timerSeconds || 0,
          scoreUser1,
          scoreUser2,
          winnerId,
          winnerName,
          loserId: data.loserId,
          timestamp: cAt,
          createdAt: cAt,
          createdAtFormatted,
          questionSetId: data.questionSetId,
          questionIds: data.questionIds,
          paused: Boolean(data.paused),
          draw: Boolean(data.draw),
          terminationReason: data.terminationReason,
          notes: data.notes
        };
      };

      let realAndroidChallenges: OneVsOneChallenge[] = [];
      let legacyChallenges: OneVsOneChallenge[] = [];

      const syncAllChallenges = () => {
        const map = new Map<string, OneVsOneChallenge>();
        legacyChallenges.forEach(c => map.set(c.challengeId, c));
        // Real Android 'challenges' collection is authoritative
        realAndroidChallenges.forEach(c => map.set(c.challengeId, c));

        const list = Array.from(map.values());
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setChallenges(list);
      };

      // Listen directly to Android's primary 'challenges' collection in real-time!
      unsubs.push(onSnapshot(collection(db, 'challenges'), (snap) => {
        realAndroidChallenges = snap.docs.map(d => parseChallengeDoc(d));
        syncAllChallenges();
      }, (err) => console.warn('Firestore challenges listener notice:', err)));

      // Listen also to 'one_vs_one_challenges' if any doc exists
      unsubs.push(onSnapshot(collection(db, 'one_vs_one_challenges'), (snap) => {
        legacyChallenges = snap.docs.map(d => parseChallengeDoc(d));
        syncAllChallenges();
      }, (err) => console.warn('Firestore one_vs_one_challenges listener notice:', err)));

      // Realtime Database listener for chatConfig/price, chatConfig/challengeSettings & challengeConfig/timer
      try {
        const priceRef = ref(rtdb, 'chatConfig/price');
        const unsubPrice = onValue(priceRef, (snap) => {
          const p = snap.val();
          if (p !== null && p !== undefined) {
            setChallengeSettings(prev => ({ ...prev, liveChallengeEntryFee: Number(p) || prev.liveChallengeEntryFee }));
          }
        }, () => {});
        unsubs.push(() => unsubPrice());

        // Unified Android Reactive Config Path: chatConfig/challengeSettings
        const challengeSettingsRef = ref(rtdb, 'chatConfig/challengeSettings');
        const unsubChallengeSettings = onValue(challengeSettingsRef, (snap) => {
          const val = snap.val();
          if (val && typeof val === 'object') {
            setChallengeSettings(prev => ({
              ...prev,
              liveChallengeEntryFee: val.price !== undefined ? Number(val.price) : prev.liveChallengeEntryFee,
              durationSeconds: val.durationSeconds !== undefined ? Number(val.durationSeconds) : prev.durationSeconds,
              physicsEnabled: val.enabledSubjects?.PHYSICS !== undefined ? val.enabledSubjects.PHYSICS : prev.physicsEnabled,
              chemistryEnabled: val.enabledSubjects?.CHEMISTRY !== undefined ? val.enabledSubjects.CHEMISTRY : prev.chemistryEnabled,
              mathEnabled: val.enabledSubjects?.MATH !== undefined ? val.enabledSubjects.MATH : prev.mathEnabled,
              pcmEnabled: val.enabledSubjects?.PCM !== undefined ? val.enabledSubjects.PCM : prev.pcmEnabled,
            }));
          }
        }, () => {});
        unsubs.push(() => unsubChallengeSettings());

        const timerRef = ref(rtdb, 'challengeConfig/timer');
        const unsubTimer = onValue(timerRef, (snap) => {
          const t = snap.val();
          if (t && typeof t === 'object') {
            setChallengeSettings(prev => ({
              ...prev,
              durationHours: t.hours !== undefined ? Number(t.hours) : prev.durationHours,
              durationMinutes: t.minutes !== undefined ? Number(t.minutes) : prev.durationMinutes
            }));
          }
        }, () => {});
        unsubs.push(() => unsubTimer());

        unsubs.push(onSnapshot(collection(db, 'challenge_question_sets'), (snap) => {
          if (!snap.empty) {
            const remoteMap = new Map<string, any>();
            snap.forEach(d => remoteMap.set(d.id, d.data()));

            // Merge with INITIAL_QUESTION_SETS so default 5 sets always have complete metadata
            const merged: ChallengeQuestionSet[] = INITIAL_QUESTION_SETS.map((init, idx) => {
              const remote = remoteMap.get(init.id);
              if (!remote) return init;
              return {
                ...init,
                ...remote,
                name: remote.name || init.name || ('KCET PCM Challenge Set ' + String(idx + 1).padStart(2, '0')),
                questionCount: remote.questionCount !== undefined ? Number(remote.questionCount) : init.questionCount,
                subjects: remote.subjects || init.subjects,
                isActive: remote.isActive !== undefined ? Boolean(remote.isActive) : init.isActive
              };
            });

            // Add any custom sets created dynamically
            remoteMap.forEach((data, id) => {
              if (!INITIAL_QUESTION_SETS.some(s => s.id === id)) {
                merged.push({
                  id,
                  name: data.name || ('KCET PCM Challenge Set ' + id),
                  questionCount: data.questionCount !== undefined ? Number(data.questionCount) : 20,
                  subjects: data.subjects || 'Physics • Chemistry • Math PCM',
                  isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
                  ...data
                });
              }
            });

            setQuestionSets(merged);
          } else {
            setQuestionSets(INITIAL_QUESTION_SETS);
          }
        }, () => {}));
      } catch (e) {
        console.warn('Challenge listeners notice:', e);
      }
      // 10. Users / Students — Multi-source merge with full deduplication
      // Combines /users + /user_accounts + /user_profiles (shared Android schema) through the
      // 5-way clustering algorithm and filters /deleted_students in real time.
      {
        let rawUsers:    (Partial<User> & { docId?: string })[] = [];
        let rawAccounts: (Partial<User> & { docId?: string })[] = [];
        let rawProfiles: (Partial<User> & { docId?: string })[] = [];
        let deletedSet:  Set<string> = new Set();

        const mergeAndEmit = () => {
          const combined = [...rawUsers, ...rawAccounts, ...rawProfiles];
          let unique: User[] = deduplicateStudentProfiles(combined, deletedSet);

          // Apply any pending admin overrides so the UI reflects edits instantly.
          // The override is cleared once Firestore confirms the write via onSnapshot.
          if (pendingStudentOverrides.current.size > 0) {
            unique = unique.map(s => {
              const override = pendingStudentOverrides.current.get(s.uid);
              if (!override) return s;
              // Once Firestore data matches the override, clear it
              const overrideKeys = Object.keys(override) as (keyof User)[];
              const firestoreHasUpdate = overrideKeys.every(k =>
                k === 'lastUpdatedMillis' || (s as any)[k] === (override as any)[k]
              );
              if (firestoreHasUpdate) {
                pendingStudentOverrides.current.delete(s.uid);
              }
              return { ...s, ...override };
            });
          }

          setStudents(unique);
        };

        // 10a. /users collection
        unsubs.push(onSnapshot(collection(db, 'users'), (snap) => {
          rawUsers = snap.docs.map(d => ({ docId: d.id, ...(d.data() as any) }));
          mergeAndEmit();
        }, (err) => { console.warn('users onSnapshot:', err); }));

        // 10b. /user_accounts (sanitized-email-keyed docs written by Android)
        unsubs.push(onSnapshot(collection(db, 'user_accounts'), (snap) => {
          rawAccounts = snap.docs.map(d => ({ docId: d.id, ...(d.data() as any) }));
          mergeAndEmit();
        }, () => {}));

        // 10c. /user_profiles (shared profile & credentials collection written by Android App)
        unsubs.push(onSnapshot(collection(db, 'user_profiles'), (snap) => {
          rawProfiles = snap.docs.map(d => ({ docId: d.id, ...(d.data() as any) }));
          mergeAndEmit();
        }, () => {}));

        // 10d. /deleted_students — reactive filter + state sync
        unsubs.push(onSnapshot(collection(db, 'deleted_students'), (snap) => {
          deletedSet = new Set(snap.docs.flatMap(d => {
            const data = d.data() as any;
            const entries = [d.id.trim()];
            if (data.uid)   entries.push((data.uid   as string).trim());
            if (data.email) entries.push((data.email as string).trim().toLowerCase());
            return entries;
          }));
          setDeletedStudents(snap.docs.map(d => d.data() as DeletedStudent));
          mergeAndEmit();
        }, () => {}));
      }
      // 11. Test Results
      unsubs.push(onSnapshot(collection(db, 'test_results'), (snap) => {
        if (!snap.empty) {
          const list: StudentTestResult[] = snap.docs.map(d => {
            const data = d.data();
            // Normalize Android field names → web field names so the filter
            // and display logic works regardless of which platform wrote the doc.
            return {
              id: d.id,
              // Identity — prefer Android fields, fall back to web fields
              studentUid:   data.userId      || data.studentUid   || '',
              studentName:  data.userName    || data.studentName  || '',
              studentEmail: (data.userEmail  || data.studentEmail || '').toLowerCase(),
              studentId:    data.studentId   || '',
              // Test metadata
              testSetId:    data.attemptId   || data.testSetId    || d.id,
              testTitle:    data.testName    || data.testTitle    || 'Unnamed Test',
              // Scores
              score:        Number(data.score        || 0),
              maxScore:     Number(data.totalQuestions || data.maxScore || 0),
              correctCount: Number(data.correctCount || 0),
              wrongCount:   Number(data.wrongCount   || 0),
              unansweredCount: Number(data.unansweredCount ?? 0),
              percentage:   Number(data.percentage   || 0),
              timeTakenSeconds: Number(data.timeTakenSeconds || 0),
              // Timestamp — convert epoch ms to readable date string
              timestamp:    data.timestamp || 0,
              attemptDate:  data.attemptDate || (
                data.timestamp
                  ? new Date(data.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : ''
              ),
              // Keep raw Android fields too (for reference)
              userId:    data.userId,
              userName:  data.userName,
              userEmail: data.userEmail,
              testName:  data.testName,
              totalQuestions: data.totalQuestions,
              attemptId: data.attemptId,
            } as StudentTestResult;
          });
          // Sort newest first
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setStudentTestResults(list);
        }
      }, () => {}));
      // 12. Helplines
      unsubs.push(onSnapshot(collection(db, 'helplines'), (snap) => {
        if (!snap.empty) {
          const list: Helpline[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Helpline));
          setHelplines(list);
        }
      }, () => {}));
      // 13. Payment Receipts
      unsubs.push(onSnapshot(collection(db, 'payment_receipts'), (snap) => {
        if (!snap.empty) {
          const list: PaymentReceipt[] = [];
          snap.forEach(d => list.push({ receiptId: d.id, ...d.data() } as PaymentReceipt));
          setReceipts(list);
        }
      }, () => {}));
      // 14. Colleges
      unsubs.push(onSnapshot(collection(db, 'colleges'), (snap) => {
        if (!snap.empty) {
          const list: College[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as College));
          setColleges(list);
        }
      }, () => {}));
      // 15. Branch Cutoffs (Exact match with Android /branch_cutoffs schema)
      unsubs.push(onSnapshot(collection(db, 'branch_cutoffs'), (snap) => {
        const list: BranchCutoff[] = [];
        snap.forEach(d => {
          const data = d.data() as any;
          const rawMap = data.categoryCutoffs || data.category_cutoffs;
          const categoryCutoffsMap: Record<string, number> = {
            GM: Number(rawMap?.GM ?? data.GM ?? data.gm ?? 1200),
            '2A': Number(rawMap?.['2A'] ?? data['2A'] ?? data.cat2A ?? 2100),
            '2B': Number(rawMap?.['2B'] ?? data['2B'] ?? data.cat2B ?? 2300),
            '3A': Number(rawMap?.['3A'] ?? data['3A'] ?? data.cat3A ?? 1400),
            '3B': Number(rawMap?.['3B'] ?? data['3B'] ?? data.cat3B ?? 1500),
            SC: Number(rawMap?.SC ?? data.SC ?? data.sc ?? 12000),
            ST: Number(rawMap?.ST ?? data.ST ?? data.st ?? 18000)
          };

          const rawCollegeId = data.collegeId || data.college_id || (d.id.includes('_') ? d.id.split('_')[0] : '');
          const rawBranchCode = (data.branchCode || data.branch_code || (d.id.includes('_') ? d.id.split('_')[1] : 'CSE')).toUpperCase().trim();

          list.push({
            id: d.id,
            collegeId: rawCollegeId,
            branchCode: rawBranchCode,
            branchName: data.branchName || data.branch_name || rawBranchCode,
            categoryCutoffs: categoryCutoffsMap
          });
        });

        if (list.length > 0) {
          setCutoffs(list);
          try { localStorage.setItem('kcet_admin_cutoffs', JSON.stringify(list)); } catch (e) {}
        }
      }, (error) => {
        console.warn('Firestore onSnapshot branch_cutoffs notice:', error);
      }));
      // 16. Engineering Branches
      unsubs.push(onSnapshot(collection(db, 'engineering_branches'), (snap) => {
        if (!snap.empty) {
          const list: EngineeringBranch[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as EngineeringBranch));
          setBranches(list);
        }
      }, () => {}));
      // Note: deleted_students is now handled inside the three-source student merge block (10c) above.
      // 18. Realtime Database /user_premium (Instant socket listener ~50ms)
      try {
        const premiumRef = ref(rtdb, 'user_premium');
        const unsubRtdb = onValue(premiumRef, (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val() as Record<string, boolean | string>;
            if (val && typeof val === 'object') {
              setStudents(prev => {
                let changed = false;
                const updated = prev.map(student => {
                  const sUid = (student.uid || '').replace(/[@.]/g, '_');
                  const sEmail = (student.email || '').replace(/[@.]/g, '_');
                  const sId = (student.studentId || '').replace(/[@.]/g, '_');

                  const rtdbRaw = val[sUid] ?? (sEmail ? val[sEmail] : undefined) ?? (sId ? val[sId] : undefined);
                  if (rtdbRaw !== undefined) {
                    const rtdbStatus = rtdbRaw === true || rtdbRaw === 'true';
                    if (student.isPremium !== rtdbStatus) {
                      changed = true;
                      return { ...student, isPremium: rtdbStatus };
                    }
                  }
                  return student;
                });
                return changed ? updated : prev;
              });
            }
          }
        }, (err) => {
          console.warn('RTDB user_premium onValue listener notice:', err);
        });
        unsubs.push(() => unsubRtdb());
      } catch (e) {
        console.warn('Could not attach RTDB /user_premium listener:', e);
      }
      setSyncStatus('Connected to Firestore & Realtime DB');
      setIsFirebaseLive(true);
    } catch (e: any) {
      console.warn('Firestore real-time sync notice:', e?.message || e);
      setSyncStatus('Local Sync Active (Offline Resilient)');
    }
    return () => {
      unsubs.forEach(u => u());
    };
  }, []);
  // Admin Login authentication
  const loginAdmin = async (password: string): Promise<boolean> => {
    // Master admin password for KCET Gen Z console
    const ADMIN_MASTER_PASSWORD = 'Ullas@17082006';
    // Simulate real auth delay
    await new Promise(r => setTimeout(r, 650));
    if (password === ADMIN_MASTER_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('kcet_admin_auth', 'true');
      return true;
    }
    return false;
  };
  const logoutAdmin = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kcet_admin_auth');
  };
  // Seed default dataset to Firestore on demand
  const seedDefaultsToFirebase = async () => {
    try {
      setSyncStatus('Seeding initial dataset to Firestore...');
      // Seed Questions
      for (const q of INITIAL_QUESTIONS) {
        await setDoc(doc(db, 'questions', String(q.id)), q);
      }
      // Seed Test Series
      for (const ts of INITIAL_TEST_SERIES) {
        await setDoc(doc(db, 'test_series_sets', ts.id), ts);
      }
      // Seed Colleges
      for (const c of INITIAL_COLLEGES) {
        await setDoc(doc(db, 'colleges', c.id), c);
      }
      // Seed Cutoffs
      for (const cut of INITIAL_BRANCH_CUTOFFS) {
        await setDoc(doc(db, 'branch_cutoffs', cut.id), cut);
      }
      // Seed Branches
      for (const b of INITIAL_BRANCHES) {
        await setDoc(doc(db, 'engineering_branches', b.id), b);
      }
      // Seed Students
      for (const s of INITIAL_STUDENTS) {
        await setDoc(doc(db, 'users', s.uid), s);
      }
      // Seed Mentors (Dual-Database Sync: Firestore + RTDB registeredMentors)
      for (const m of INITIAL_MENTORS) {
        const cleanKey = (m.name || '').replace(/[.#$\[\]\/@]/g, '_').trim();
        await setDoc(doc(db, 'mentors', m.id), m);
        await setDoc(doc(db, 'registered_mentors', m.id), m);
        await setDoc(doc(db, 'senior_mentors', m.id), m);
        try {
          await rtdbSet(ref(rtdb, 'registeredMentors/' + cleanKey), m);
        } catch (e) {
          // ignore RTDB seed warning
        }
      }
      // Seed Bookings (Dual-Database Sync: Firestore + RTDB)
      for (const bk of INITIAL_BOOKINGS) {
        await setDoc(doc(db, 'senior_chat_bookings', bk.bookingId), bk);
        try {
          await rtdbSet(ref(rtdb, 'senior_chat_bookings/' + bk.bookingId), bk);
        } catch (e) {
          // ignore RTDB seed warning
        }
      }
      // Seed Resources
      for (const r of INITIAL_RESOURCES) {
        await setDoc(doc(db, 'resources', r.id), r);
      }
      // Seed Dates
      for (const dt of INITIAL_IMPORTANT_DATES) {
        await setDoc(doc(db, 'important_dates', dt.id), dt);
      }
      // Seed Helplines
      for (const h of INITIAL_HELPLINES) {
        await setDoc(doc(db, 'helplines', h.id), h);
      }
      // Seed Receipts
      for (const rc of INITIAL_RECEIPTS) {
        await setDoc(doc(db, 'payment_receipts', rc.receiptId), rc);
      }
      // Seed Rank Tiers
      for (const rt of INITIAL_RANK_VS_MARKS) {
        await setDoc(doc(db, 'rank_vs_marks', rt.id), rt);
      }
      // Seed 1v1 Challenges (Dual-Database Sync: Firestore + RTDB)
      for (const ch of INITIAL_CHALLENGES) {
        await setDoc(doc(db, 'one_vs_one_challenges', ch.challengeId), ch);
        try {
          await rtdbSet(ref(rtdb, 'one_vs_one_challenges/' + ch.challengeId), ch);
        } catch (e) {}
      }
      // Seed Question Sets
      for (const qs of INITIAL_QUESTION_SETS) {
        await setDoc(doc(db, 'challenge_question_sets', qs.id), qs);
      }
      setSyncStatus('All collections seeded to Firestore!');
    } catch (e: any) {
      console.error('Seeding error:', e);
      setSyncStatus(`Seeding notice: ${e.message || 'Stored locally'}`);
    }
  };
  // --- CRUD ACTIONS ---
  // 1. Questions
  const saveQuestion = async (q: Question) => {
    setQuestions(prev => {
      const idx = prev.findIndex(item => item.id === q.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = q;
        return updated;
      }
      return [q, ...prev];
    });
    try {
      await setDoc(doc(db, 'questions', String(q.id)), q);
    } catch (e) {
      console.warn('Saved question locally', e);
    }
  };
  const deleteQuestion = async (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    try {
      await deleteDoc(doc(db, 'questions', String(id)));
    } catch (e) {
      console.warn('Deleted question locally', e);
    }
  };
  // 2. Test Series
  const saveTestSeries = async (ts: TestSeriesSet) => {
    setTestSeries(prev => {
      const idx = prev.findIndex(item => item.id === ts.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = ts;
        return u;
      }
      return [ts, ...prev];
    });
    try {
      await setDoc(doc(db, 'test_series_sets', ts.id), ts);
    } catch (e) {
      console.warn('Saved test set locally', e);
    }
  };
  const deleteTestSeries = async (id: string) => {
    setTestSeries(prev => prev.filter(ts => ts.id !== id));
    try {
      await deleteDoc(doc(db, 'test_series_sets', id));
    } catch (e) {
      console.warn('Deleted test set locally', e);
    }
  };
  // 3. Mentors & Bookings (Dual-Database Sync: Firestore + Realtime Database)
  const sanitizeKey = (k: string) => (k || '').replace(/[.#$\[\]\/@]/g, '_').trim();

  const saveMentor = async (m: Mentor) => {
    const mentorId = m.id || ('m-' + Date.now());
    const mentorName = m.name.trim();
    const normName = mentorName.toLowerCase();
    const cleanKey = sanitizeKey(mentorName);
    const cleanId = sanitizeKey(mentorId);

    // Remove from locally deleted sets if re-adding/updating
    deletedMentorIds.current.delete(mentorId);
    deletedMentorIds.current.delete(cleanId);
    deletedMentorNames.current.delete(normName);
    deletedMentorNames.current.delete(cleanKey);

    const profile: Mentor & { updatedAtTimestamp: number } = {
      id: mentorId,
      name: mentorName,
      branch: m.branch || '',
      college: m.college || '',
      currentYear: m.currentYear || '',
      kcetRank: m.kcetRank || '',
      rating: Number(m.rating) || 5.0,
      bio: m.bio || '',
      email: m.email || '',
      instagram: m.instagram || '',
      photoUrl: m.photoUrl || '',
      updatedAtTimestamp: Date.now()
    };

    // 1. Optimistic UI update
    setMentors(prev => {
      const idx = prev.findIndex(item => item.id === mentorId || item.name.toLowerCase() === normName);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = profile;
        return u;
      }
      return [profile, ...prev];
    });

    // 2. Dual-Database Write (Concurrent Promise.all)
    const tasks: Promise<any>[] = [];

    // A. Realtime Database (Reactive UI Layer for Android App & Web)
    try {
      tasks.push(rtdbSet(ref(rtdb, 'registeredMentors/' + cleanKey), profile));
      if (cleanId !== cleanKey) {
        tasks.push(rtdbSet(ref(rtdb, 'registeredMentors/' + cleanId), profile));
      }
    } catch (err) {
      console.warn('RTDB saveSeniorMentor error:', err);
    }

    // B. Firestore (Primary Data Store) across all 3 collections
    try {
      tasks.push(setDoc(doc(db, 'mentors', mentorId), profile));
      tasks.push(setDoc(doc(db, 'registered_mentors', mentorId), profile));
      tasks.push(setDoc(doc(db, 'senior_mentors', mentorId), profile));
      if (cleanKey !== mentorId) {
        tasks.push(setDoc(doc(db, 'mentors', cleanKey), profile));
      }
    } catch (err) {
      console.warn('Firestore saveSeniorMentor error:', err);
    }

    await Promise.all(tasks).catch(e => console.warn('Dual-sync saveMentor notice:', e));
  };

  const deleteMentor = async (id: string, mentorNameParam?: string) => {
    // 1. Resolve exact mentor name and ID
    const target = mentors.find(m => m.id === id || m.name === id || (mentorNameParam && m.name === mentorNameParam));
    const mentorName = (mentorNameParam || target?.name || id).trim();
    const normName = mentorName.toLowerCase();
    const cleanKey = sanitizeKey(mentorName);
    const cleanId = sanitizeKey(id);

    // 2. Mark as locally deleted (Guarantees instant UI response without bounce-back)
    deletedMentorIds.current.add(id);
    deletedMentorIds.current.add(cleanId);
    deletedMentorNames.current.add(normName);
    deletedMentorNames.current.add(cleanKey);

    setMentors(prev => prev.filter(m => m.id !== id && m.name.toLowerCase() !== normName && m.id !== cleanKey));

    const tasks: Promise<any>[] = [];

    // 3. Delete from Realtime Database (registeredMentors node — triggers Android app UI update instantly)
    try {
      tasks.push(rtdbSet(ref(rtdb, 'registeredMentors/' + cleanKey), null));
      tasks.push(rtdbSet(ref(rtdb, 'registeredMentors/' + cleanId), null));
      tasks.push(rtdbSet(ref(rtdb, 'globally_deleted_mentors/' + cleanKey), Date.now()));
    } catch (err) {
      console.warn('RTDB deleteSeniorMentor error:', err);
    }

    // 4. Delete from Cloud Firestore across all 3 collections (Permanent storage)
    try {
      tasks.push(deleteDoc(doc(db, 'mentors', id)));
      tasks.push(deleteDoc(doc(db, 'registered_mentors', id)));
      tasks.push(deleteDoc(doc(db, 'senior_mentors', id)));
      if (cleanKey !== id) {
        tasks.push(deleteDoc(doc(db, 'mentors', cleanKey)));
        tasks.push(deleteDoc(doc(db, 'registered_mentors', cleanKey)));
        tasks.push(deleteDoc(doc(db, 'senior_mentors', cleanKey)));
      }
      tasks.push(setDoc(doc(db, 'deleted_mentors', cleanKey), {
        id,
        name: mentorName,
        deletedAtMillis: Date.now()
      }));
    } catch (err) {
      console.warn('Firestore deleteSeniorMentor error:', err);
    }

    await Promise.all(tasks).catch(e => console.warn('Dual-sync deleteMentor notice:', e));
  };

  const updateBooking = async (b: SeniorChatBooking) => {
    setBookings(prev => {
      const idx = prev.findIndex(item => item.bookingId === b.bookingId);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = b;
        return u;
      }
      return [b, ...prev];
    });

    const tasks: Promise<any>[] = [
      setDoc(doc(db, 'senior_chat_bookings', b.bookingId), b)
    ];
    try {
      tasks.push(rtdbSet(ref(rtdb, 'senior_chat_bookings/' + b.bookingId), b));
    } catch (e) {
      // RTDB fallback
    }
    await Promise.all(tasks).catch(e => console.warn('Dual-sync updateBooking notice:', e));
  };

  const saveBooking = updateBooking;

  const deleteBooking = async (id: string) => {
    setBookings(prev => prev.filter(b => b.bookingId !== id));

    const tasks: Promise<any>[] = [
      deleteDoc(doc(db, 'senior_chat_bookings', id))
    ];
    try {
      tasks.push(rtdbSet(ref(rtdb, 'senior_chat_bookings/' + id), null));
    } catch (e) {
      // RTDB fallback
    }
    await Promise.all(tasks).catch(e => console.warn('Dual-sync deleteBooking notice:', e));
  };
  // 4. Resources
  const saveResource = async (r: Resource, notifyStudents = false) => {
    setResources(prev => {
      const idx = prev.findIndex(item => item.id === r.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = r;
        return u;
      }
      return [r, ...prev];
    });
    try {
      await setDoc(doc(db, 'resources', r.id), r);
      if (notifyStudents) {
        await sendBroadcast({
          title: `New Study Material: ${r.title}`,
          message: `New ${r.category} resource uploaded (${r.fileSize}). Tap to review and download.`,
          type: 'STUDY_MATERIAL',
          actionType: 'NAV_RESOURCES'
        });
      }
    } catch (e) {
      console.warn('Saved resource locally', e);
    }
  };
  const deleteResource = async (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, 'resources', id));
    } catch (e) {
      console.warn('Deleted resource locally', e);
    }
  };
  // 5. Important Dates
  const saveDate = async (d: ImportantDate) => {
    setDates(prev => {
      const idx = prev.findIndex(item => item.id === d.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = d;
        return u;
      }
      return [d, ...prev];
    });
    try {
      await setDoc(doc(db, 'important_dates', d.id), d);
    } catch (e) {
      console.warn('Saved date locally', e);
    }
  };
  const deleteDate = async (id: string) => {
    setDates(prev => prev.filter(d => d.id !== id));
    try {
      await deleteDoc(doc(db, 'important_dates', id));
    } catch (e) {
      console.warn('Deleted date locally', e);
    }
  };
  // 6. Rank vs Marks
  const saveRankTier = async (tier: RankVsMarksTier) => {
    setRankTiers(prev => {
      const idx = prev.findIndex(item => item.id === tier.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = tier;
        return u;
      }
      return [tier, ...prev];
    });
    try {
      await setDoc(doc(db, 'rank_vs_marks', tier.id), tier);
    } catch (e) {
      console.warn('Saved rank tier locally', e);
    }
  };
  const deleteRankTier = async (id: string) => {
    setRankTiers(prev => prev.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, 'rank_vs_marks', id));
    } catch (e) {
      console.warn('Deleted rank tier locally', e);
    }
  };
  // 7. Announcements & Notifications — Dual-Write Pipeline
  const sendBroadcast = async (notif: Partial<Notification>, makeBanner = false) => {
    const createdAtMillis = Date.now();

    // Determine targeting — CRITICAL: Firestore drops undefined fields, so we must
    // always write explicit string values. The Android app relies on these exact
    // values to decide who receives the notification:
    //   • Broadcast  → targetUserId = "ALL",  targetUserEmail = ""
    //   • Targeted   → targetUserId = student UID, targetUserEmail = student email
    const isTargeted = !!(notif.targetUserId && notif.targetUserId.trim() !== '' && notif.targetUserId.toUpperCase() !== 'ALL');
    const resolvedTargetUserId    = isTargeted ? notif.targetUserId!.trim()                       : 'ALL';
    const resolvedTargetUserEmail = isTargeted ? (notif.targetUserEmail || '').trim().toLowerCase() : '';

    // Human-readable timestamp (e.g. "04 Oct, 03:30 PM")
    const humanTimestamp = new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(new Date(createdAtMillis));

    if (makeBanner) {
      // ── DUAL-WRITE: Announcement banner + linked broadcast notification ──
      // IDs are intentionally linked: ann_<ts> ↔ notif_ann_<ts> for clean deletion.
      const ancId   = `ann_${createdAtMillis}`;
      const notifId = `notif_${ancId}`;

      const isUrgent = notif.type === 'EXAM_ALERT';
      const rawTitle = (notif.title || 'Important Announcement').trim();

      // 1. Write /announcements — populates student Home Screen banner
      const newAnc: Announcement = {
        id: ancId,
        title: rawTitle,
        date: humanTimestamp,
        message: notif.message || '',
        isImportant: isUrgent
      };
      setAnnouncements(prev => [newAnc, ...prev]);
      try {
        await setDoc(doc(db, 'announcements', ancId), newAnc);
      } catch (e) {
        console.warn('Saved announcement banner locally', e);
      }

      // 2. Write /notifications — triggers bell badge on student devices
      // Urgent: "🚨 IMPORTANT: <title>", Standard: "📢 <title>"
      const notifTitle = isUrgent ? `🚨 IMPORTANT: ${rawTitle}` : `📢 ${rawTitle}`;
      const newNotif: Notification = {
        id: notifId,
        title: notifTitle,
        message: notif.message || '',
        timestamp: humanTimestamp,
        type: isUrgent ? 'EXAM_ALERT' : 'ANNOUNCEMENT',
        isRead: false,
        actionType: 'NONE',   // Students tap the announcement card on Home; NONE keeps bell feed clean
        targetUserId: 'ALL',
        targetUserEmail: '',
        createdAtMillis
      };
      setNotifications(prev => [newNotif, ...prev]);
      try {
        await setDoc(doc(db, 'notifications', notifId), newNotif);
      } catch (e) {
        console.warn('Saved announcement notification locally', e);
      }

    } else {
      // ── SINGLE-WRITE: Direct push notification (targeted or global) ──
      const notifId = notif.id || `notif-${createdAtMillis}`;
      const newNotif: Notification = {
        id: notifId,
        title: notif.title || 'Platform Notice',
        message: notif.message || '',
        timestamp: humanTimestamp,
        type: notif.type || 'ANNOUNCEMENT',
        isRead: false,
        actionType: notif.actionType || 'NONE',
        targetUserId: resolvedTargetUserId,
        targetUserEmail: resolvedTargetUserEmail,
        createdAtMillis
      };
      setNotifications(prev => [newNotif, ...prev]);
      try {
        await setDoc(doc(db, 'notifications', notifId), newNotif);
      } catch (e) {
        console.warn('Saved notification locally', e);
      }
    }
  };
  const deleteAnnouncement = async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    // Also remove the linked notification (notif_ann_<ts> pattern) from state
    const linkedNotifId = `notif_${id}`;
    setNotifications(prev => prev.filter(n => n.id !== linkedNotifId));
    try {
      await deleteDoc(doc(db, 'announcements', id));
      // Delete linked notification from Firestore
      try { await deleteDoc(doc(db, 'notifications', linkedNotifId)); } catch (_) {}
      // Register in globally_deleted_notifications so Android removes it from all devices
      try {
        await setDoc(doc(db, 'globally_deleted_notifications', linkedNotifId), {
          id: linkedNotifId, deletedBy: 'admin', deletedAtMillis: Date.now()
        });
        await rtdbSet(ref(rtdb, `globally_deleted_notifications/${linkedNotifId}`), true);
      } catch (_) {}
    } catch (e) {
      console.warn('Deleted announcement locally', e);
    }
  };
  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notifications', id));
      await setDoc(doc(db, 'deleted_notifications', id), { deletedAt: Date.now() });
      await rtdbSet(ref(rtdb, `globally_deleted_notifications/${id}`), true);
    } catch (e) {
      console.warn('Deleted notification locally', e);
    }
  };
  // 8. Students Moderation
  const updateStudent = async (student: Partial<User> & { uid: string }) => {
    const nowMillis = Date.now();

    // ── Step 1: Look up current student (needed for email fallback + name diff) ──
    const currentStudent = students.find(s => s.uid === student.uid);
    const previousName   = currentStudent?.name;
    const effectiveEmail = (student.email || currentStudent?.email || '').toLowerCase().trim();

    // ── Step 2: Build full Firestore payload (Android schema) ─────────────────
    const payload: Record<string, unknown> = {
      ...student,
      lastUpdatedMillis: nowMillis,
    };
    if (student.studentId)        payload.formattedStudentId = student.studentId;
    if (student.formattedStudentId) payload.studentId = student.formattedStudentId;

    // ── Step 3: Register override FIRST — mergeAndEmit will apply it immediately
    //           This prevents onSnapshot from ever reverting the UI to stale data.
    pendingStudentOverrides.current.set(student.uid, {
      ...(payload as Partial<User>),
      lastUpdatedMillis: nowMillis,
    });

    // ── Step 4: Optimistic local state update (instant) ──────────────────────
    setStudents(prev => {
      const idx = prev.findIndex(s => s.uid === student.uid);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = { ...u[idx], ...(payload as Partial<User>), lastUpdatedMillis: nowMillis };
        return u;
      }
      return prev;
    });

    // ── Step 5: Fire all Firestore writes CONCURRENTLY ────────────────────────
    //           (Promise.all → only 1-2 onSnapshot emissions instead of 4+)
    const sanitizedEmailDoc = effectiveEmail.replace(/[@.]/g, '_');
    const androidEmailKey   = effectiveEmail.replace('.', '_').replace('@', '_');

    const writes: Promise<void>[] = [
      setDoc(doc(db, 'users',        student.uid), payload, { merge: true }),
      setDoc(doc(db, 'user_profiles', student.uid), payload, { merge: true }),
    ];
    if (effectiveEmail) {
      writes.push(setDoc(doc(db, 'users',         sanitizedEmailDoc), payload, { merge: true }));
      writes.push(setDoc(doc(db, 'user_accounts', effectiveEmail),    payload, { merge: true }));
      if (androidEmailKey !== sanitizedEmailDoc && androidEmailKey !== effectiveEmail) {
        writes.push(setDoc(doc(db, 'user_accounts', androidEmailKey), payload, { merge: true }));
      }
    }

    // Catch write errors without blocking the UI
    Promise.all(writes).then(async () => {
      // ── Step 6: Background — leaderboard + test_results name sync ────────
      const newName = (student.name || currentStudent?.name || '').trim();
      if (newName && previousName && newName !== previousName.trim()) {
        try {
          await setDoc(doc(db, 'leaderboard', student.uid), {
            name: newName,
            lastUpdatedMillis: nowMillis,
          }, { merge: true });
        } catch (_) {}

        try {
          const { query, where, getDocs } = await import('firebase/firestore');
          const q = query(collection(db, 'test_results'), where('userId', '==', student.uid));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const batchWrite = writeBatch(db);
            snap.docs.forEach(d => {
              batchWrite.set(d.ref, { userName: newName, studentName: newName }, { merge: true });
            });
            await batchWrite.commit();
          }
        } catch (_) {}
      }

      // Safety: clear override after 5 s even if Firestore auto-clear didn't trigger
      setTimeout(() => {
        pendingStudentOverrides.current.delete(student.uid);
      }, 5000);
    }).catch(e => {
      console.warn('updateStudent Firebase sync error:', e);
      // On failure, clear the override so the UI reverts to real Firestore state
      pendingStudentOverrides.current.delete(student.uid);
    });
  };

  const togglePremium = async (uid: string, current: boolean, studentEmail?: string, studentId?: string) => {
    const newStatus = !current;
    const now = Date.now();

    // Identify target student and all aliases
    const target = students.find(s => s.uid === uid || (studentEmail && s.email?.toLowerCase() === studentEmail.toLowerCase()));
    const effectiveEmail = (studentEmail || target?.email || '').toLowerCase().trim();
    const effectiveStudentId = (studentId || target?.studentId || '').trim();
    const emailDocId = effectiveEmail.replace(/[@.]/g, '_');
    const sanitizedUid = (uid || '').replace(/[@.]/g, '_');

    // 1. Optimistic Local State Update
    setStudents(prev => prev.map(s => {
      if (s.uid === uid || (effectiveEmail && s.email?.toLowerCase() === effectiveEmail)) {
        return { ...s, isPremium: newStatus, lastUpdatedMillis: now };
      }
      return s;
    }));

    const updatePayload = {
      isPremium: Boolean(newStatus),
      premium: Boolean(newStatus),
      lastUpdatedMillis: now
    };

    // 2. Realtime Database (RTDB) Fast-Path (~50ms push to active student devices)
    try {
      if (sanitizedUid) {
        await rtdbSet(ref(rtdb, `user_premium/${sanitizedUid}`), Boolean(newStatus));
      }
      if (emailDocId && emailDocId !== sanitizedUid) {
        await rtdbSet(ref(rtdb, `user_premium/${emailDocId}`), Boolean(newStatus));
      }
      if (effectiveStudentId) {
        const sanitizedSid = effectiveStudentId.replace(/[@.]/g, '_');
        await rtdbSet(ref(rtdb, `user_premium/${sanitizedSid}`), Boolean(newStatus));
      }
    } catch (rtdbErr) {
      console.warn('RTDB user_premium update notice:', rtdbErr);
    }

    // 3. Cloud Firestore Persistent Storage (Multi-Key Invalidation & Merge)
    try {
      const batch = writeBatch(db);

      if (uid) {
        batch.set(doc(db, 'users', uid), updatePayload, { merge: true });
        batch.set(doc(db, 'user_profiles', uid), updatePayload, { merge: true });
      }
      if (emailDocId && emailDocId !== uid) {
        batch.set(doc(db, 'users', emailDocId), updatePayload, { merge: true });
      }
      if (effectiveEmail) {
        batch.set(doc(db, 'user_accounts', effectiveEmail), {
          isPremium: Boolean(newStatus),
          lastUpdatedMillis: now
        }, { merge: true });
      }

      await batch.commit();
    } catch (fsErr) {
      console.warn('Firestore user premium batch update notice:', fsErr);
    }

    // 4. Send Broadcast Notification
    if (newStatus) {
      await sendBroadcast({
        title: '👑 Premium Access Granted!',
        message: 'Your KCET Gen Z account has been upgraded to Premium by Admin. All mock tests and college predictor features are unlocked.',
        type: 'PAYMENT',
        actionType: 'NAV_PROFILE',
        targetUserId: uid,
        targetUserEmail: effectiveEmail
      });
    } else {
      await sendBroadcast({
        title: 'Premium Access Revoked',
        message: 'Your KCET Gen Z Premium access has been set to Free plan by Admin.',
        type: 'PAYMENT',
        actionType: 'NAV_PROFILE',
        targetUserId: uid,
        targetUserEmail: effectiveEmail
      });
    }
  };
  const blockStudent = async (uid: string, reason: string) => {
    await updateStudent({
      uid,
      isBlocked: true,
      blockReason: reason,
      isForceLoggedOut: true
    });
  };
  const unblockStudent = async (uid: string) => {
    await updateStudent({
      uid,
      isBlocked: false,
      blockReason: ''
    });
  };
  const forceLogoutStudent = async (uid: string) => {
    await updateStudent({
      uid,
      isForceLoggedOut: true
    });
  };
  const forceLogoutAllStudents = async () => {
    setStudents(prev => prev.map(s => ({ ...s, isForceLoggedOut: true })));
    for (const s of students) {
      try {
        await updateDoc(doc(db, 'users', s.uid), { isForceLoggedOut: true });
      } catch (e) {}
    }
    try {
      await rtdbSet(ref(rtdb, 'system_config/force_logout_all'), true);
    } catch (e) {}
  };
  const deleteStudentPermanently = async (uid: string, email: string) => {
    const student = students.find(s => s.uid === uid || (email && s.email.toLowerCase() === email.toLowerCase()));
    const effectiveName = student?.name || 'Student';
    const effectiveEmail = (email || student?.email || '').toLowerCase().trim();
    const sanitizedEmailDoc = effectiveEmail ? effectiveEmail.replace(/[@.]/g, '_') : '';
    const sanitizedUid = (uid || '').replace(/[@.]/g, '_');

    setStudents(prev => prev.filter(s => s.uid !== uid && (effectiveEmail ? s.email.toLowerCase() !== effectiveEmail : true)));
    const deletedEntry: DeletedStudent = {
      uid,
      email: effectiveEmail,
      name: effectiveName,
      deletedAt: Date.now()
    };
    setDeletedStudents(prev => [deletedEntry, ...prev]);

    // 1. Cloud Firestore Multi-Collection Cleanup
    try {
      const batch = writeBatch(db);
      if (uid) batch.delete(doc(db, 'users', uid));
      if (uid) batch.delete(doc(db, 'user_profiles', uid));
      if (sanitizedEmailDoc && sanitizedEmailDoc !== uid) batch.delete(doc(db, 'users', sanitizedEmailDoc));
      if (effectiveEmail) batch.delete(doc(db, 'user_accounts', effectiveEmail));
      if (uid) batch.delete(doc(db, 'leaderboard', uid));
      
      batch.set(doc(db, 'deleted_students', uid), {
        uid,
        email: effectiveEmail,
        name: effectiveName,
        deletedAtMillis: Date.now()
      });

      await batch.commit();
    } catch (e) {
      console.warn('Firestore multi-doc delete notice:', e);
    }

    // 2. Clean test_results for student — match both web (studentUid/studentEmail) and Android (userId/userEmail) field names
    try {
      const resultsToDelete = studentTestResults.filter(r =>
        r.studentUid === uid || r.userId === uid ||
        (effectiveEmail && (r.studentEmail === effectiveEmail || r.userEmail === effectiveEmail))
      );
      for (const res of resultsToDelete) {
        await deleteDoc(doc(db, 'test_results', res.id));
      }
      setStudentTestResults(prev => prev.filter(r =>
        r.studentUid !== uid && r.userId !== uid &&
        (effectiveEmail ? (r.studentEmail !== effectiveEmail && r.userEmail !== effectiveEmail) : true)
      ));
    } catch (e) {}

    // 3. Realtime Database Cleanup
    try {
      if (sanitizedUid) {
        await rtdbSet(ref(rtdb, `presence/${sanitizedUid}`), null);
        await rtdbSet(ref(rtdb, `live_xp/${sanitizedUid}`), null);
        await rtdbSet(ref(rtdb, `user_premium/${sanitizedUid}`), null);
      }
      if (sanitizedEmailDoc && sanitizedEmailDoc !== sanitizedUid) {
        await rtdbSet(ref(rtdb, `user_premium/${sanitizedEmailDoc}`), null);
      }
    } catch (e) {}
  };
  // Student Test Results
  const saveTestResult = async (res: StudentTestResult) => {
    setStudentTestResults(prev => {
      const idx = prev.findIndex(r => r.id === res.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = res;
        return u;
      }
      return [res, ...prev];
    });
    try {
      await setDoc(doc(db, 'test_results', res.id), res);
    } catch (e) {
      console.warn('Saved test result locally', e);
    }
  };
  const deleteTestResult = async (id: string) => {
    setStudentTestResults(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, 'test_results', id));
    } catch (e) {
      console.warn('Deleted test result locally', e);
    }
  };
  // 9. Helplines
  const saveHelpline = async (h: Helpline) => {
    setHelplines(prev => {
      const idx = prev.findIndex(item => item.id === h.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = h;
        return u;
      }
      return [h, ...prev];
    });
    try {
      await setDoc(doc(db, 'helplines', h.id), h);
    } catch (e) {
      console.warn('Saved helpline locally', e);
    }
  };
  const deleteHelpline = async (id: string) => {
    setHelplines(prev => prev.filter(h => h.id !== id));
    try {
      await deleteDoc(doc(db, 'helplines', id));
    } catch (e) {
      console.warn('Deleted helpline locally', e);
    }
  };
  // 10. Receipts
  const approveReceipt = async (receipt: PaymentReceipt) => {
    const now = Date.now();
    const updated: PaymentReceipt = {
      ...receipt,
      status: 'VERIFIED',
      verifiedAtTimestamp: now
    };
    setReceipts(prev => prev.map(r => r.receiptId === receipt.receiptId ? updated : r));

    // Automatically grant premium to student across RTDB & Firestore
    const targetUid = receipt.userId || (students.find(s => s.email.toLowerCase() === receipt.userEmail.toLowerCase())?.uid || '');
    if (targetUid) {
      await togglePremium(targetUid, false, receipt.userEmail);
    }

    try {
      await setDoc(doc(db, 'payment_receipts', receipt.receiptId), {
        ...updated,
        verifiedAtMillis: now
      }, { merge: true });

      // Send confirmation broadcast
      await sendBroadcast({
        title: '💳 Payment Verified!',
        message: 'Your payment receipt has been approved. Premium test series unlocked!',
        type: 'PAYMENT',
        actionType: 'NAV_PRACTICE',
        targetUserId: targetUid,
        targetUserEmail: receipt.userEmail
      });
    } catch (e) {
      console.warn('Approved receipt locally', e);
    }
  };
  const rejectReceipt = async (receiptId: string, reason: string) => {
    const target = receipts.find(r => r.receiptId === receiptId);
    if (!target) return;
    const updated: PaymentReceipt = {
      ...target,
      status: 'REJECTED',
      rejectionReason: reason
    };
    setReceipts(prev => prev.map(r => r.receiptId === receiptId ? updated : r));
    // Send push notification about rejection
    await sendBroadcast({
      title: 'Payment Verification Notice',
      message: `Your payment receipt of ?${target.amountPaid} was rejected. Reason: ${reason}. Please resubmit in the Profile tab.`,
      type: 'PAYMENT',
      actionType: 'NAV_PROFILE',
      targetUserId: target.userId,
      targetUserEmail: target.userEmail
    });
    try {
      await setDoc(doc(db, 'payment_receipts', receiptId), updated);
    } catch (e) {
      console.warn('Rejected receipt locally', e);
    }
  };
  // 11. Colleges & Cutoffs
  const saveCollege = async (c: College) => {
    setColleges(prev => {
      const idx = prev.findIndex(item => item.id === c.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = c;
        return u;
      }
      return [c, ...prev];
    });
    try {
      await setDoc(doc(db, 'colleges', c.id), c);
    } catch (e) {
      console.warn('Saved college locally', e);
    }
  };
  const deleteCollege = async (id: string) => {
    setColleges(prev => prev.filter(c => c.id !== id));
    // Also remove cutoffs for this college
    setCutoffs(prev => prev.filter(cut => cut.collegeId !== id));
    try {
      await deleteDoc(doc(db, 'colleges', id));
      await setDoc(doc(db, 'deleted_colleges', id), { collegeId: id, deletedAt: Date.now() });
    } catch (e) {
      console.warn('Deleted college locally', e);
    }
  };
  const saveCutoff = async (cutoff: BranchCutoff) => {
    const cleanBranch = cutoff.branchCode.toUpperCase().trim();
    const docId = `${cutoff.collegeId}_${cleanBranch}`;

    const categoryMap: Record<string, number> = {
      GM: Number(cutoff.categoryCutoffs?.GM) || 1200,
      '2A': Number(cutoff.categoryCutoffs?.['2A']) || 2100,
      '2B': Number(cutoff.categoryCutoffs?.['2B']) || 2300,
      '3A': Number(cutoff.categoryCutoffs?.['3A']) || 1400,
      '3B': Number(cutoff.categoryCutoffs?.['3B']) || 1500,
      SC: Number(cutoff.categoryCutoffs?.SC) || 12000,
      ST: Number(cutoff.categoryCutoffs?.ST) || 18000
    };

    const payload = {
      collegeId: cutoff.collegeId,
      branchCode: cleanBranch,
      branchName: cutoff.branchName || cleanBranch,
      categoryCutoffs: categoryMap,
      lastUpdated: Date.now()
    };

    // Update local state and persistent storage
    setCutoffs(prev => {
      const idx = prev.findIndex(item => item.id === docId || (item.collegeId === cutoff.collegeId && item.branchCode === cleanBranch));
      let updated: BranchCutoff[];
      const item: BranchCutoff = {
        id: docId,
        collegeId: cutoff.collegeId,
        branchCode: cleanBranch,
        branchName: cutoff.branchName || cleanBranch,
        categoryCutoffs: categoryMap
      };

      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = item;
      } else {
        updated = [item, ...prev];
      }
      try { localStorage.setItem('kcet_admin_cutoffs', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // Writes to the exact Firestore path /branch_cutoffs/{collegeId}_{branchCode} used by Android
    await setDoc(doc(db, 'branch_cutoffs', docId), payload, { merge: true });
  };

  const deleteCutoff = async (id: string, collegeId?: string, branchCode?: string) => {
    let docId = id;
    if (collegeId && branchCode) {
      docId = `${collegeId}_${branchCode.toUpperCase().trim()}`;
    } else if (!docId.includes('_')) {
      const target = cutoffs.find(c => c.id === id);
      if (target) {
        docId = `${target.collegeId}_${target.branchCode.toUpperCase().trim()}`;
      }
    }

    setCutoffs(prev => {
      const updated = prev.filter(c => c.id !== id && c.id !== docId);
      try { localStorage.setItem('kcet_admin_cutoffs', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    await deleteDoc(doc(db, 'branch_cutoffs', docId));
    if (docId !== id) {
      try { await deleteDoc(doc(db, 'branch_cutoffs', id)); } catch (e) {}
    }
  };
  // 12. Branch Explorer
  const saveBranch = async (b: EngineeringBranch) => {
    setBranches(prev => {
      const idx = prev.findIndex(item => item.id === b.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = b;
        return u;
      }
      return [b, ...prev];
    });
    try {
      await setDoc(doc(db, 'engineering_branches', b.id), b);
    } catch (e) {
      console.warn('Saved branch locally', e);
    }
  };
  const deleteBranch = async (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'engineering_branches', id));
      await setDoc(doc(db, 'deleted_branches', id), { branchId: id, deletedAt: Date.now() });
    } catch (e) {
      console.warn('Deleted branch locally', e);
    }
  };

  // ⚔️ 1 vs 1 Challenges Operations (Dual-Database Sync: Firestore + Realtime Database)
  const saveChallenge = async (challenge: OneVsOneChallenge) => {
    setChallenges(prev => {
      const idx = prev.findIndex(item => item.challengeId === challenge.challengeId);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = challenge;
        return u;
      }
      return [challenge, ...prev];
    });

    const tasks: Promise<any>[] = [
      setDoc(doc(db, 'one_vs_one_challenges', challenge.challengeId), challenge)
    ];
    try {
      tasks.push(rtdbSet(ref(rtdb, 'one_vs_one_challenges/' + challenge.challengeId), challenge));
    } catch (e) {}

    await Promise.all(tasks).catch(e => console.warn('Dual-sync saveChallenge error:', e));
  };

  const deleteChallenge = async (id: string) => {
    setChallenges(prev => prev.filter(c => c.challengeId !== id));

    // Two-step atomic deletion (Firestore 'challenges' + 'one_vs_one_challenges' + Realtime Database)
    const tasks: Promise<any>[] = [
      deleteDoc(doc(db, 'challenges', id)),
      deleteDoc(doc(db, 'one_vs_one_challenges', id)),
      setDoc(doc(db, 'deleted_challenges', id), {
        challengeId: id,
        deletedAtMillis: Date.now()
      })
    ];
    try {
      tasks.push(rtdbSet(ref(rtdb, 'challenges/' + id), null));
      tasks.push(rtdbSet(ref(rtdb, 'one_vs_one_challenges/' + id), null));
      tasks.push(rtdbSet(ref(rtdb, 'active_challenges/' + id), null));
    } catch (e) {}

    await Promise.all(tasks).catch(e => console.warn('Dual-sync deleteChallenge error:', e));
    notifySuccess('Challenge permanently deleted and synced with App.', 'Challenge Deleted');
  };

  const toggleQuestionSet = async (id: string, active: boolean) => {
    setQuestionSets(prev => prev.map(s => s.id === id ? { ...s, isActive: active } : s));

    const setItem = questionSets.find(s => s.id === id) || INITIAL_QUESTION_SETS.find(s => s.id === id);
    const payload = {
      id,
      name: setItem?.name || ('KCET PCM Challenge Set ' + id.replace('set-', '')),
      questionCount: setItem?.questionCount || 20,
      subjects: setItem?.subjects || 'Physics • Chemistry • Math PCM',
      isActive: active
    };

    const tasks: Promise<any>[] = [
      setDoc(doc(db, 'challenge_question_sets', id), payload, { merge: true })
    ];
    try {
      tasks.push(rtdbSet(ref(rtdb, 'challenge_question_sets/' + id), payload));
    } catch (e) {}

    await Promise.all(tasks).catch(e => console.warn('Toggle question set error:', e));
    notifySuccess('Question set ' + (active ? 'activated' : 'deactivated') + ' and synced with App.', 'Set Updated');
  };

  const updateChallengeSettings = async (settings: Partial<ChallengeSettings>) => {
    setChallengeSettings(prev => {
      const next = { ...prev, ...settings };
      const tasks: Promise<any>[] = [
        setDoc(doc(db, 'challenge_settings', 'global'), next, { merge: true })
      ];
      try {
        if (settings.liveChallengeEntryFee !== undefined) {
          tasks.push(rtdbSet(ref(rtdb, 'chatConfig/price'), Number(settings.liveChallengeEntryFee)));
        }
        // Unified Android RTDB sync: chatConfig/challengeSettings
        tasks.push(rtdbSet(ref(rtdb, 'chatConfig/challengeSettings'), {
          price: Number(next.liveChallengeEntryFee) || 50,
          durationSeconds: Number(next.durationSeconds) || 120,
          enabledSubjects: {
            PHYSICS: Boolean(next.physicsEnabled),
            CHEMISTRY: Boolean(next.chemistryEnabled),
            MATH: Boolean(next.mathEnabled),
            PCM: Boolean(next.pcmEnabled)
          }
        }));
        if (settings.durationHours !== undefined || settings.durationMinutes !== undefined) {
          tasks.push(rtdbSet(ref(rtdb, 'challengeConfig/timer'), {
            hours: next.durationHours,
            minutes: next.durationMinutes
          }));
        }
      } catch (e) {}
      Promise.all(tasks).catch(e => console.warn('Update challenge settings error:', e));
      return next;
    });
    notifySuccess('Challenge settings updated and broadcasted to all students.', 'Settings Synced');
  };
  return (
    <AdminDataContext.Provider
      value={{
        isAuthenticated,
        adminEmail,
        loginAdmin,
        logoutAdmin,
        isFirebaseLive,
        syncStatus,
        seedDefaultsToFirebase,
        questions,
        testSeries,
        mentors,
        bookings,
        resources,
        dates,
        rankTiers,
        announcements,
        notifications,
        students,
        studentTestResults,
        helplines,
        receipts,
        colleges,
        cutoffs,
        branches,
        deletedStudents,
        saveQuestion,
        deleteQuestion,
        saveTestSeries,
        deleteTestSeries,
        saveMentor,
        deleteMentor,
        updateBooking,
        saveBooking,
        deleteBooking,
        saveResource,
        deleteResource,
        saveDate,
        deleteDate,
        saveRankTier,
        deleteRankTier,
        sendBroadcast,
        deleteAnnouncement,
        deleteNotification,
        updateStudent,
        togglePremium,
        blockStudent,
        unblockStudent,
        forceLogoutStudent,
        forceLogoutAllStudents,
        deleteStudentPermanently,
        saveTestResult,
        deleteTestResult,
        saveHelpline,
        deleteHelpline,
        approveReceipt,
        rejectReceipt,
        saveCollege,
        deleteCollege,
        saveCutoff,
        deleteCutoff,
        saveBranch,
        toasts,
        showToast,
        notifySuccess,
        notifyError,
        notifyInfo,
        notifyWarning,
        dismissToast,
        requestConfirm,
        deleteBranch,
        challenges,
        questionSets,
        challengeSettings,
        saveChallenge,
        deleteChallenge,
        toggleQuestionSet,
        updateChallengeSettings
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal dialog={confirmDialog} />
    </AdminDataContext.Provider>
  );
};
export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};