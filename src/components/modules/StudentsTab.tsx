import React, { useState } from 'react';
import { 
  Users, 
  Crown, 
  Search, 
  PowerOff, 
  Trash2, 
  Edit3, 
  Bell, 
  Lock, 
  BarChart2, 
  CheckCircle2, 
  X,
  RefreshCw,
  Award,
  Calendar,
  Sparkles,
  FileEdit,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  Printer,
  KeyRound
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { User, StudentTestResult } from '../../types';
import { StudentDossierModal } from '../modals/StudentDossierModal';
import { buildStudentDossierRecord } from '../../utils/studentDossierExporter';

export const StudentsTab: React.FC = () => {
  const { 
    students, 
    studentTestResults, 
    togglePremium, 
    updateStudent, 
    blockStudent, 
    unblockStudent, 
    forceLogoutStudent, 
    forceLogoutAllStudents, 
    deleteStudentPermanently,
    saveTestResult,
    deleteTestResult,
    sendBroadcast,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    requestConfirm
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'PREMIUM' | 'FREE' | 'BLOCKED'>('ALL');

  // Modals State
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [originalStudent, setOriginalStudent] = useState<User | null>(null);
  const [blockingStudent, setBlockingStudent] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [viewingResultsStudent, setViewingResultsStudent] = useState<User | null>(null);
  const [messagingStudent, setMessagingStudent] = useState<User | null>(null);
  const [directMsgTitle, setDirectMsgTitle] = useState('');
  const [directMsgBody, setDirectMsgBody] = useState('');
  const [editingResult, setEditingResult] = useState<StudentTestResult | null>(null);
  // PIN Protection for Permanent Delete
  const [deletingStudent, setDeletingStudent] = useState<User | null>(null);
  const [deletePin, setDeletePin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Dossier / Credentials ──────────────────────────────────────────────────
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);  // which card's credential was just copied

  const handleCopyCredential = (uid: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const totalCount = students.length;
  const premiumCount = students.filter(s => s && s.isPremium).length;
  const activeNowCount = students.filter(s => s && s.isActiveNow && !s.isBlocked && !s.isForceLoggedOut).length;
  const blockedCount = students.filter(s => s && s.isBlocked).length;

  // Confirm Block Student
  const handleBlockConfirm = async () => {
    if (!blockingStudent) return;
    if (!blockReason.trim()) {
      notifyWarning('Mandatory block reason is required.');
      return;
    }
    await blockStudent(blockingStudent.uid, blockReason, blockingStudent.email);
    notifyWarning(`Student "${blockingStudent.name || blockingStudent.email}" has been blocked.`, 'Student Blocked');
    setBlockingStudent(null);
    setBlockReason('');
  };

  // Edit Profile Save — full field coverage matching Android schema
  const handleEditProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const diffs: string[] = [];
    if (originalStudent) {
      if ((originalStudent.name || '').trim() !== (editingStudent.name || '').trim())
        diffs.push(`• Name: '${originalStudent.name}' → '${editingStudent.name}'`);
      if ((originalStudent.email || '').trim() !== (editingStudent.email || '').trim())
        diffs.push(`• Email: '${originalStudent.email}' → '${editingStudent.email}'`);
      if ((originalStudent.phone || '').trim() !== (editingStudent.phone || '').trim())
        diffs.push(`• Phone: '${originalStudent.phone || 'None'}' → '${editingStudent.phone || 'None'}'`);
      if ((originalStudent.studentId || '').trim() !== (editingStudent.studentId || '').trim())
        diffs.push(`• Student ID: '${originalStudent.studentId || 'None'}' → '${editingStudent.studentId}'`);
      if ((originalStudent.password || '').trim() !== (editingStudent.password || '').trim())
        diffs.push(`• Password updated`);
      if ((originalStudent.kcetTargetRank || '').trim() !== (editingStudent.kcetTargetRank || '').trim())
        diffs.push(`• Rank: '${originalStudent.kcetTargetRank || 'Under 1000'}' → '${editingStudent.kcetTargetRank}'`);
      if ((originalStudent.targetStream || '').trim() !== (editingStudent.targetStream || '').trim())
        diffs.push(`• Stream: '${originalStudent.targetStream || 'Engineering'}' → '${editingStudent.targetStream}'`);
    }

    const now = new Date();
    const formattedTime = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', '
      + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();

    // Full payload — matches Android's updateUserProfileByAdmin schema exactly
    const updatePayload: Partial<User> & { uid: string } = {
      uid:               editingStudent.uid,
      name:              editingStudent.name,
      email:             editingStudent.email,
      phone:             editingStudent.phone || '',
      studentId:         editingStudent.studentId || editingStudent.formattedStudentId || '',
      formattedStudentId: editingStudent.formattedStudentId || editingStudent.studentId || '',
      password:          editingStudent.password || editingStudent.displayPassword || '',
      displayPassword:   editingStudent.password || editingStudent.displayPassword || '',
      kcetTargetRank:    editingStudent.kcetTargetRank,
      targetStream:      editingStudent.targetStream,
      isPremium:         editingStudent.isPremium,
      isBlocked:         editingStudent.isBlocked,
      blockReason:       editingStudent.blockReason || '',
      isForceLoggedOut:  editingStudent.isForceLoggedOut,
      signInMethod:      editingStudent.signInMethod || 'Email & Password',
    };

    if (diffs.length > 0) {
      updatePayload.lastProfileUpdateNote = diffs.join('\n');
      updatePayload.lastProfileUpdateTime = formattedTime;
    } else if (editingStudent.lastProfileUpdateNote) {
      updatePayload.lastProfileUpdateNote = editingStudent.lastProfileUpdateNote;
      updatePayload.lastProfileUpdateTime = editingStudent.lastProfileUpdateTime || formattedTime;
    }

    await updateStudent(updatePayload);
    notifySuccess(`Profile record fully updated for ${editingStudent.name}!`, 'Profile Saved');
    setEditingStudent(null);
    setOriginalStudent(null);
  };


  // Send Direct Push Notification
  const handleSendDirectMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingStudent || !directMsgTitle.trim() || !directMsgBody.trim()) return;

    await sendBroadcast({
      title: directMsgTitle,
      message: directMsgBody,
      type: 'SYSTEM',
      actionType: 'NAV_PROFILE',
      targetUserId: messagingStudent.uid,
      targetUserEmail: messagingStudent.email
    });

    setMessagingStudent(null);
    setDirectMsgTitle('');
    setDirectMsgBody('');
    notifySuccess(`Direct push notification sent to ${messagingStudent.name}!`);
  };

  // PIN Protected Permanent Student Deletion
  const handleConfirmDeleteWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingStudent) return;
    
    if (deletePin.trim() !== '1111') {
      setPinError('❌ Invalid Security PIN! Deletion aborted.');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteStudentPermanently(deletingStudent.uid, deletingStudent.email);
      notifySuccess(`Student "${deletingStudent.name || deletingStudent.email}" permanently deleted and blacklisted.`, 'Student Deleted');
      setDeletingStudent(null);
      setDeletePin('');
      setPinError('');
    } catch (error: any) {
      notifyError(`Failed to delete student: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit Test Result Score
  const handleScoreEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;
    const total = editingResult.maxScore || editingResult.totalQuestions || 0;
    const percentage = total > 0 ? Number(((editingResult.score / total) * 100).toFixed(1)) : 0;
    await saveTestResult({
      ...editingResult,
      maxScore: total,
      percentage
    });
    notifySuccess(`Score updated for ${editingResult.testTitle || editingResult.testName}!`, 'Score Saved');
    setEditingResult(null);
  };

  // Filter Students
  const filtered = students.filter(s => {
    if (!s) return false;
    if (filterMode === 'PREMIUM' && !s.isPremium) return false;
    if (filterMode === 'FREE' && s.isPremium) return false;
    if (filterMode === 'BLOCKED' && !s.isBlocked) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(q);
    const emailMatch = (s.email || '').toLowerCase().includes(q);
    const phoneMatch = Boolean(s.phone && s.phone.includes(q));
    const idMatch = Boolean(s.studentId && s.studentId.toLowerCase().includes(q));
    const uidMatch = Boolean(s.uid && s.uid.toLowerCase().includes(q));
    return nameMatch || emailMatch || phoneMatch || idMatch || uidMatch;
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* 4 Header Metric Cards with Clear Large Text */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="moving-border-card rounded-2xl p-4 sm:p-5 shadow-sm text-center">
          <span className="text-sm sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider">Total Students</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalCount}</div>
        </div>

        <div className="moving-border-card rounded-2xl p-4 sm:p-5 shadow-sm text-center">
          <span className="text-sm sm:text-sm font-extrabold text-amber-600 uppercase tracking-wider">👑 Premium</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{premiumCount}</div>
        </div>

        <div className="moving-border-card rounded-2xl p-4 sm:p-5 shadow-sm text-center">
          <span className="text-sm sm:text-sm font-extrabold text-emerald-600 uppercase tracking-wider">🟢 Active</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{activeNowCount}</div>
        </div>

        <div className="moving-border-card rounded-2xl p-4 sm:p-5 shadow-sm text-center">
          <span className="text-sm sm:text-sm font-extrabold text-rose-600 uppercase tracking-wider">🔴 Blocked</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{blockedCount}</div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 moving-border-indigo p-4 sm:p-5 rounded-2xl shadow-sm w-full">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, ID, or phone..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 cursor-pointer"
          >
            <option value="ALL">All Students ({totalCount})</option>
            <option value="PREMIUM">👑 Premium Only ({premiumCount})</option>
            <option value="FREE">Free Students</option>
            <option value="BLOCKED">🚫 Blocked</option>
          </select>

          <button
            onClick={async () => {
              const confirmed = await requestConfirm({
                title: 'Force Logout All Students',
                message: 'Are you sure you want to force-logout all active student sessions across Karnataka? All students will need to sign in again.',
                confirmText: 'Yes, Force Logout All',
                cancelText: 'Cancel',
                isDestructive: true
              });
              if (confirmed) {
                await forceLogoutAllStudents();
                notifyWarning('All active student devices have been force-logged out.', 'Devices Logged Out');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-black border border-rose-200 whitespace-nowrap transition-colors cursor-pointer"
            title="Force Logout All Active Devices"
          >
            🚪 Logout All
          </button>
        </div>
      </div>

      {/* ── Dossier Action Banner ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <KeyRound className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <span className="text-sm font-black text-indigo-900">Student Credentials & Dossier Directory</span>
            <span className="block text-xs text-indigo-600 font-medium">Download complete credentials — IDs, passwords, academic info, and test performance</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Reveal / Hide all passwords */}
          <button
            onClick={() => setShowAllPasswords(prev => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
              showAllPasswords
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
            }`}
            title={showAllPasswords ? 'Hide all passwords' : 'Reveal all passwords on cards'}
          >
            {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAllPasswords ? 'Hide Passwords' : 'Reveal All Passwords'}</span>
          </button>

          {/* Quick Print */}
          <button
            onClick={() => setIsDossierOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>🖨️ Quick Print PDF</span>
          </button>

          {/* Full Export Modal */}
          <button
            onClick={() => setIsDossierOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>📥 Download Dossier</span>
          </button>
        </div>
      </div>

      {/* Dossier Export Modal */}
      <StudentDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        records={students.map((s, idx) => buildStudentDossierRecord(s, idx, studentTestResults))}
        onNotify={(msg, title) => notifySuccess(msg, title)}
      />

      {/* ============================================================ */}
      {/* Student Cards Grid (Clear, Highly Readable Text & Metrics)   */}
      {/* ============================================================ */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 font-semibold">No students match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filtered.map((student) => {
            if (!student) return null;
            const studentUid = student.uid || 'usr-temp';
            const studentName = student.name || 'Student';
            const studentEmail = student.email || 'student@kcetgenz.com';
            const studentId = student.studentId || ('KCET-' + (studentUid.length > 6 ? studentUid.slice(-6) : '872995'));

            const studentResults = studentTestResults.filter(r => {
              if (!r) return false;
              const cleanUid      = studentUid.trim().toLowerCase();
              const cleanEmail    = studentEmail.trim().toLowerCase();
              const cleanId       = studentId.trim().toLowerCase();
              const cleanName     = studentName.trim().toLowerCase();

              const tUid   = (r.studentUid   || '').trim().toLowerCase();
              const tEmail = (r.studentEmail || '').trim().toLowerCase();
              const tId    = (r.studentId    || '').trim().toLowerCase();
              const tName  = (r.studentName  || '').trim().toLowerCase();

              const matchUid   = cleanUid   !== '' && (tUid === cleanUid   || tUid === cleanEmail || tUid === cleanId);
              const matchEmail = cleanEmail !== '' && tEmail !== '' && tEmail === cleanEmail;
              const matchId    = cleanId    !== '' && tId   !== '' && tId   === cleanId;
              const matchName  = cleanName  !== '' && cleanName !== 'student' && tName !== '' && tName === cleanName
                                 && (tUid === cleanUid || !r.studentUid);
              return matchUid || matchEmail || matchId || matchName;
            });
            const testCount = studentResults.length;
            const avgScorePct = testCount > 0 
              ? (studentResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / testCount).toFixed(1) + '%'
              : 'N/A';
            const bestPts = testCount > 0 
              ? `${Math.max(...studentResults.map(r => r.score || 0))} pts`
              : 'N/A';

            const hasUpdateNotice = Boolean(student.lastProfileUpdateNote && student.lastProfileUpdateNote.trim().length > 0);
            const updateNote = student.lastProfileUpdateNote || '';
            const updateTime = student.lastProfileUpdateTime || '';

            return (
              <div 
                key={studentUid}
                className="moving-border-card rounded-3xl shadow-sm p-5 sm:p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* 1. Header: Avatar, Name, Email, ID + Badges */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Avatar + Details */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Rounded Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] border-2 border-amber-400 flex items-center justify-center text-2xl font-black text-amber-900 shrink-0 shadow-sm">
                        {(studentName.trim()[0] || 'S').toUpperCase()}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">
                          {studentName}
                        </h3>
                        <p className="text-sm font-semibold text-slate-600 truncate">
                          {studentEmail}
                        </p>

                        <div className="flex items-center gap-2 text-sm flex-wrap pt-0.5">
                          <span className="px-2.5 py-1 rounded-md bg-purple-100 text-[#5B21B6] font-mono font-black text-sm flex items-center gap-1">
                            <span className="font-extrabold">ID</span>
                            <span>{studentId}</span>
                          </span>
                          <span className="text-slate-500 font-mono text-sm font-bold">
                            • UID: {studentUid.length > 7 ? studentUid.slice(0, 7) + '...' : studentUid}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Badges: Premium/Free, Trash, Active Status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        {student.isPremium ? (
                          <span className="px-3 py-1 rounded-xl text-sm sm:text-sm font-black bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] flex items-center gap-1 shadow-sm">
                            <span>👑</span> PREMIUM
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-xl text-sm sm:text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            FREE
                          </span>
                        )}

                        {/* Red Trash button */}
                        <button
                          onClick={() => {
                            setDeletingStudent(student);
                            setDeletePin('');
                            setPinError('');
                          }}
                          className="w-8 h-8 rounded-xl bg-[#FEE2E2] hover:bg-rose-200 text-[#DC2626] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                          title="Delete Student Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Active / Blocked Status */}
                      {student.isBlocked ? (
                        <span className="px-3 py-1 rounded-xl text-sm font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <span>🔴</span> BLOCKED
                        </span>
                      ) : student.isForceLoggedOut ? (
                        <span className="px-3 py-1 rounded-xl text-sm font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <span>🟡</span> LOGGED OUT
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl text-sm font-black bg-[#DCFCE7] text-[#15803D] border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Metadata 2x2 Grid with Crisp Readable Text */}
                  <div className="moving-border-subtle rounded-2xl p-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎯</span>
                      <span className="text-slate-600 font-bold">Rank:</span>
                      <strong className="text-[#2563EB] font-black text-sm">
                        {student.kcetTargetRank || 'Under 1000'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-base">📅</span>
                      <span className="text-slate-600 font-bold">Joined:</span>
                      <strong className="text-slate-900 font-black text-sm">
                        {student.registrationDate ? student.registrationDate.slice(0, 4) : '2026'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">🎓</span>
                      <span className="text-slate-600 font-bold truncate">Stream:</span>
                      <strong className="text-slate-900 font-black text-sm truncate">
                        {student.targetStream || 'Engineering (B.E / B.Tech)'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">🔐</span>
                      <span className="text-slate-600 font-bold">Auth:</span>
                      <strong className="text-slate-900 font-black text-sm truncate">
                        {student.signInMethod || 'Email & Password'}
                      </strong>
                    </div>
                  </div>

                  {/* 3. 🔐 Login Credentials Panel */}
                  {(() => {
                    const credId = student.formattedStudentId || studentId;
                    const credLogin = studentEmail || student.phone || credId;
                    const credPass  = student.password || student.displayPassword || 'kcet@user2026';
                    const wasCopied = copiedUid === studentUid;
                    return (
                      <div className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-800 mb-1">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Login Credentials &amp; Password</span>
                        </div>

                        {/* Student ID row */}
                        <div className="flex items-center justify-between gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200">
                          <div className="min-w-0">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Student ID</span>
                            <span className="font-mono font-black text-indigo-700 text-sm">{credId}</span>
                          </div>
                          <button
                            onClick={() => handleCopyCredential(studentUid + '_id', credId)}
                            className="shrink-0 p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors cursor-pointer"
                            title="Copy Student ID"
                          >
                            {copiedUid === studentUid + '_id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Login Identifier row */}
                        <div className="flex items-center justify-between gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200">
                          <div className="min-w-0 flex-1">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Login Identifier</span>
                            <span className="font-medium text-slate-800 text-sm truncate block">{credLogin}</span>
                          </div>
                          <button
                            onClick={() => handleCopyCredential(studentUid + '_login', credLogin)}
                            className="shrink-0 p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors cursor-pointer"
                            title="Copy Login"
                          >
                            {copiedUid === studentUid + '_login' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Password row */}
                        <div className="flex items-center justify-between gap-2 bg-white rounded-xl px-3 py-2 border border-red-100">
                          <div className="min-w-0 flex-1">
                            <span className="block text-[10px] font-bold text-red-400 uppercase tracking-wide">Password</span>
                            <span className={`font-mono font-black text-sm ${showAllPasswords ? 'text-red-700' : 'text-slate-300 tracking-widest'}`}>
                              {showAllPasswords ? credPass : '••••••••••'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setShowAllPasswords(prev => !prev)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 transition-colors cursor-pointer"
                              title={showAllPasswords ? 'Hide password' : 'Reveal password'}
                            >
                              {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopyCredential(studentUid + '_pass', credPass)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors cursor-pointer"
                              title="Copy password"
                            >
                              {copiedUid === studentUid + '_pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4. PROFILE INFO UPDATED BANNER */}
                  {hasUpdateNotice && (
                    <div className="moving-border-amber rounded-2xl p-3.5 space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-[#854D0E] font-black text-sm sm:text-base">
                        <span className="text-base">📝</span>
                        <span>Profile Info Updated ({updateTime})</span>
                      </div>
                      <p className="text-[#713F12] font-bold text-sm pl-7">
                        {updateNote}
                      </p>
                    </div>
                  )}

                  {/* 4. Performance Metrics Banner */}
                  <div className="moving-border-emerald rounded-2xl p-3.5 flex items-center justify-around text-sm font-extrabold text-[#15803D]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📝</span>
                      <span>Tests Taken: <strong className="text-slate-950 font-black text-base">{testCount}</strong></span>
                    </div>
                    <div className="w-px h-5 bg-emerald-400" />
                    <div className="flex items-center gap-2">
                      <span className="text-base">📊</span>
                      <span>Avg: <strong className="text-slate-950 font-black text-base">{avgScorePct}</strong></span>
                    </div>
                    <div className="w-px h-5 bg-emerald-400" />
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏆</span>
                      <span>Best: <strong className="text-slate-950 font-black text-base">{bestPts}</strong></span>
                    </div>
                  </div>
                </div>

                {/* 5. Action Buttons Grid */}
                <div className="space-y-3 pt-2">
                  {/* Row 1: Edit | Push | Logout */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => {
                        setOriginalStudent({ ...student });
                        setEditingStudent({ ...student });
                      }}
                      className="h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <span className="text-base">✏️</span>
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setMessagingStudent(student);
                        setDirectMsgTitle(`Alert for ${studentName}`);
                      }}
                      className="h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <span className="text-base">🔔</span>
                      <span>Push</span>
                    </button>

                    <button
                      onClick={async () => {
                        const confirmed = await requestConfirm({
                          title: `Force Logout Student`,
                          message: `Are you sure you want to force logout ${studentName}? Their active mobile app session will terminate.`,
                          itemName: studentEmail || studentName,
                          confirmText: 'Logout Student',
                          cancelText: 'Cancel',
                          isDestructive: true
                        });
                        if (confirmed) {
                          await forceLogoutStudent(studentUid, studentEmail);
                          notifyInfo(`Force logged out ${studentName}.`, 'Session Terminated');
                        }
                      }}
                      className="h-11 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                    >
                      <span className="text-base">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>

                  {/* Row 2: Revoke/Grant | Block/Unblock | Scores */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={async () => {
                        const willBePremium = !student.isPremium;
                        await togglePremium(studentUid, student.isPremium, studentEmail, studentId);
                        if (willBePremium) {
                          notifySuccess(`👑 Granted Premium Access to ${studentName}! (RTDB & Firestore synced)`, 'Premium Granted');
                        } else {
                          notifyInfo(`Revoked Premium Access from ${studentName}.`, 'Premium Revoked');
                        }
                      }}
                      className={`h-11 rounded-2xl border text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                        student.isPremium 
                          ? 'bg-amber-50 hover:bg-amber-100 border-amber-400 text-[#854D0E]' 
                          : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <span className="text-base">👑</span>
                      <span>{student.isPremium ? 'Revoke' : 'Grant'}</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (student.isBlocked) {
                          await unblockStudent(studentUid, studentEmail);
                          notifySuccess(`Student "${studentName}" unblocked successfully!`, 'Student Unblocked');
                        } else {
                          setBlockingStudent(student);
                        }
                      }}
                      className="h-11 rounded-2xl bg-white hover:bg-rose-50 border border-slate-300 text-[#DC2626] text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <span className="text-base">🚫</span>
                      <span>{student.isBlocked ? 'Unblock' : 'Block'}</span>
                    </button>

                    <button
                      onClick={() => setViewingResultsStudent(student)}
                      className="h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-indigo-700 text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <span className="text-base">📊</span>
                      <span>Scores ({testCount})</span>
                    </button>
                  </div>

                  {/* Row 3: Delete Student Permanently */}
                  <button
                    onClick={() => {
                      setDeletingStudent(student);
                      setDeletePin('');
                      setPinError('');
                    }}
                    className="w-full h-12 rounded-2xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-sm font-black shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <span className="text-base">🗑️</span>
                    <span>Delete Student Permanently</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: PIN Confirmation for Permanent Student Deletion */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 text-2xl shadow-sm">
                  🔒
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 leading-tight">Security PIN Required</h3>
                  <p className="text-xs font-bold text-rose-600">Permanent Student Deletion</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setDeletingStudent(null);
                  setDeletePin('');
                  setPinError('');
                }} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Warning Box */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold">
                <span className="text-base">⚠️</span>
                <span>Irreversible Action</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed font-semibold">
                You are about to permanently delete <strong className="font-black text-rose-900">{deletingStudent.name || 'Student'}</strong> (<span className="font-mono">{deletingStudent.email}</span>). All profile records, test scores, and account data will be wiped and blacklisted.
              </p>
            </div>

            {/* PIN Input Form */}
            <form onSubmit={handleConfirmDeleteWithPin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Enter 4-Digit Security PIN:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    autoFocus
                    value={deletePin}
                    onChange={(e) => {
                      setDeletePin(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="••••"
                    className="w-full py-3 px-4 text-center tracking-[0.5em] text-2xl font-black font-mono bg-slate-50 border-2 border-slate-300 focus:border-rose-500 focus:bg-white rounded-2xl outline-none transition-all text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal"
                    required
                  />
                </div>
                {pinError && (
                  <p className="text-xs font-black text-rose-600 mt-2 flex items-center gap-1.5 animate-bounce">
                    <span>⚠️</span>
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingStudent(null);
                    setDeletePin('');
                    setPinError('');
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-lg shadow-rose-200 text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 1: Edit Profile */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <span>✏️</span>
                  <span>Edit Student Record</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Syncs to Firestore: users • user_profiles • user_accounts • leaderboard
                </p>
              </div>
              <button onClick={() => setEditingStudent(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleEditProfileSave} className="overflow-y-auto flex-1 px-6 py-4 space-y-4 text-sm">

              {/* Section: Personal Info */}
              <div className="space-y-3">
                <p className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>👤</span> Personal Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Full Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email <span className="text-rose-500">*</span></label>
                    <input
                      type="email"
                      value={editingStudent.email}
                      onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editingStudent.phone || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      placeholder="+91 98450 00000"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Credentials */}
              <div className="space-y-3">
                <p className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔐</span> Login Credentials
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold">
                  ⚠️ Changing the Student ID or Password here updates Firestore but does not reset Firebase Auth — the student will continue using their original Auth password unless reset via Firebase Console.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student ID (Formatted)</label>
                    <input
                      type="text"
                      value={editingStudent.formattedStudentId || editingStudent.studentId || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, formattedStudentId: e.target.value, studentId: e.target.value })}
                      placeholder="KCET-000001"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-indigo-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Login Password</label>
                    <input
                      type="text"
                      value={editingStudent.password || editingStudent.displayPassword || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value, displayPassword: e.target.value })}
                      placeholder="kcet@user2026"
                      className="w-full p-2.5 bg-slate-50 border border-red-200 rounded-xl font-mono font-bold text-red-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section: KCET Academics */}
              <div className="space-y-3">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎯</span> KCET Academics
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target KCET Rank</label>
                    <input
                      type="text"
                      value={editingStudent.kcetTargetRank || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, kcetTargetRank: e.target.value })}
                      placeholder="e.g. Under 500"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Stream</label>
                    <input
                      type="text"
                      value={editingStudent.targetStream || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, targetStream: e.target.value })}
                      placeholder="e.g. Engineering (CS/IS)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-sm cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-sm shadow-md cursor-pointer transition-colors"
                >
                  💾 Save All Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal 2: Block Reason */}
      {blockingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <h3 className="font-black text-lg text-rose-900">Block Student: {blockingStudent.name}</h3>
            <p className="text-sm text-slate-600 font-medium">Please provide a mandatory reason for blocking this student account:</p>
            <textarea
              rows={3}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="e.g. Suspicious payment receipt tampering / Terms violation..."
              className="w-full p-3 bg-rose-50/50 border border-rose-300 rounded-xl text-sm font-medium text-slate-900"
              required
            />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setBlockingStudent(null)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-sm font-bold text-slate-700">Cancel</button>
              <button onClick={handleBlockConfirm} className="px-6 py-2.5 rounded-xl bg-[#DC2626] text-white text-sm font-bold shadow-md">Confirm Block</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Push Notification */}
      {messagingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-lg text-slate-900">Send Push Notification to {messagingStudent.name}</h3>
            <form onSubmit={handleSendDirectMsg} className="space-y-3.5 text-sm">
              <input
                type="text"
                value={directMsgTitle}
                onChange={(e) => setDirectMsgTitle(e.target.value)}
                placeholder="Notification Title"
                className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm text-slate-900"
                required
              />
              <textarea
                rows={3}
                value={directMsgBody}
                onChange={(e) => setDirectMsgBody(e.target.value)}
                placeholder="Message body..."
                className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900"
                required
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setMessagingStudent(null)} className="px-5 py-2.5 rounded-xl bg-slate-100 font-bold text-sm text-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#0D9488] text-white font-bold text-sm shadow-md">Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Scores & Performance Test History Modal */}
      {viewingResultsStudent && (() => {
        const studentUid = viewingResultsStudent.uid || 'usr-temp';
        const studentName = viewingResultsStudent.name || 'Student';
        const studentId = viewingResultsStudent.studentId || ('KCET-' + (studentUid.length > 6 ? studentUid.slice(-6) : '896199'));

        const studentEmail = viewingResultsStudent.email || '';
        const studentResults = (() => {
          const cleanUid   = studentUid.trim().toLowerCase();
          const cleanEmail = studentEmail.trim().toLowerCase();
          const cleanId    = studentId.trim().toLowerCase();
          const cleanName  = studentName.trim().toLowerCase();
          return studentTestResults.filter(r => {
            if (!r) return false;
            const tUid   = (r.studentUid   || '').trim().toLowerCase();
            const tEmail = (r.studentEmail || '').trim().toLowerCase();
            const tId    = (r.studentId    || '').trim().toLowerCase();
            const tName  = (r.studentName  || '').trim().toLowerCase();
            const matchUid   = cleanUid   !== '' && (tUid === cleanUid   || tUid === cleanEmail || tUid === cleanId);
            const matchEmail = cleanEmail !== '' && tEmail !== '' && tEmail === cleanEmail;
            const matchId    = cleanId    !== '' && tId   !== '' && tId   === cleanId;
            const matchName  = cleanName  !== '' && cleanName !== 'student' && tName !== '' && tName === cleanName
                               && (tUid === cleanUid || !r.studentUid);
            return matchUid || matchEmail || matchId || matchName;
          });
        })();

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#F5F4FA] rounded-[30px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 space-y-4 max-h-[88vh] flex flex-col">
              {/* Header */}
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2 flex-wrap leading-tight">
                  <span className="text-2xl">📊</span>
                  <span>Test History: {studentName}</span>
                  <span className="text-slate-900">({studentId})</span>
                </h3>
                <p className="text-sm font-bold text-slate-500">
                  Total Tests Attempted: {studentResults.length}
                </p>
              </div>

              {/* Body: Cards List or Empty Notice */}
              {studentResults.length === 0 ? (
                <div className="py-8 text-slate-500 text-sm sm:text-base font-semibold">
                  No mock test attempt records found for this student.
                </div>
              ) : (
                <div className="overflow-y-auto space-y-3.5 max-h-[52vh] pr-1">
                  {studentResults.map((r) => {
                    const total      = r.maxScore || r.totalQuestions || 0;
                    const unanswered = r.unansweredCount != null
                      ? r.unansweredCount
                      : Math.max(0, total - ((r.correctCount || 0) + (r.wrongCount || 0)));
                    const timeSecs   = r.timeTakenSeconds || 0;
                    const timeStr    = timeSecs > 0
                      ? `${Math.floor(timeSecs / 60)}m ${timeSecs % 60}s`
                      : null;
                    const dateStr    = r.attemptDate || (r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
                    return (
                      <div 
                        key={r.id} 
                        className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/70 space-y-3"
                      >
                        {/* Top: Title and Score */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-900 text-base truncate">
                            {r.testTitle || r.testName || 'Unnamed Test'}
                          </span>
                          <span className="font-extrabold text-[#15803D] text-base shrink-0 whitespace-nowrap">
                            Score: {r.score}{total > 0 ? `/${total}` : ''}
                          </span>
                        </div>

                        {/* Middle: Metrics & Percentage */}
                        <div className="flex items-center justify-between text-sm font-bold">
                          <div className="flex items-center gap-3 flex-wrap text-slate-800">
                            <span className="flex items-center gap-1">
                              <span>✅</span>
                              <span>Correct: {r.correctCount}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span>❌</span>
                              <span>Wrong: {r.wrongCount}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span>⚪</span>
                              <span>Unanswered: {unanswered}</span>
                            </span>
                          </div>
                          <span className="font-black text-slate-900 text-base">
                            {Number(r.percentage || 0).toFixed(1)}%
                          </span>
                        </div>

                        {/* Date & Time Row */}
                        {(dateStr || timeStr) && (
                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                            {dateStr && <span>📅 {dateStr}</span>}
                            {timeStr && <span>⏱ {timeStr}</span>}
                          </div>
                        )}

                        {/* Bottom: Edit and Delete actions */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setEditingResult(r)}
                            className="text-[#4F46E5] hover:text-[#4338CA] text-sm font-black flex items-center gap-1.5 transition-colors"
                          >
                            <span>✏️</span>
                            <span>Edit Score</span>
                          </button>
                          <button
                            onClick={async () => {
                              const ok = await requestConfirm({
                                title: 'Delete Test Score Record',
                                itemName: `${r.testTitle || r.testName || 'Test'} (${r.score}${total > 0 ? `/${total}` : ''})`,
                                message: `Are you sure you want to remove this test attempt score from the student's record?`,
                                isDestructive: true
                              });
                              if (ok) {
                                await deleteTestResult(r.id);
                                notifySuccess(`Score record for "${r.testTitle || r.testName}" deleted.`, 'Score Deleted');
                              }
                            }}
                            className="text-[#DC2626] hover:text-[#B91C1C] p-1 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end pt-3 border-t border-slate-200/60">
                <button
                  onClick={() => setViewingResultsStudent(null)}
                  className="px-9 py-3 rounded-2xl bg-[#5B4DFB] hover:bg-[#4E3EF8] text-white font-black text-base shadow-md transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Score Editor Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-sm">
            <div className="flex items-center justify-between pb-2 border-b">
              <h4 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                <span>✏️</span>
                <span>Edit Score Record</span>
              </h4>
              <button 
                onClick={() => setEditingResult(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScoreEditSave} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Test Title</label>
                <input
                  type="text"
                  value={editingResult.testTitle}
                  onChange={(e) => setEditingResult({ ...editingResult, testTitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Score Obtained</label>
                  <input
                    type="number"
                    value={editingResult.score}
                    onChange={(e) => {
                      const sc = parseInt(e.target.value) || 0;
                      setEditingResult({ ...editingResult, score: sc, correctCount: sc });
                    }}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-emerald-600 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Score</label>
                  <input
                    type="number"
                    value={editingResult.maxScore}
                    onChange={(e) => setEditingResult({ ...editingResult, maxScore: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Wrong Answers</label>
                  <input
                    type="number"
                    value={editingResult.wrongCount}
                    onChange={(e) => setEditingResult({ ...editingResult, wrongCount: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-rose-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unanswered</label>
                  <input
                    type="number"
                    value={editingResult.unansweredCount ?? Math.max(0, (editingResult.maxScore || editingResult.totalQuestions || 0) - (editingResult.score + editingResult.wrongCount))}
                    onChange={(e) => setEditingResult({ ...editingResult, unansweredCount: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-600 text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl flex items-center justify-between text-indigo-900 font-bold">
                <span>Calculated Percentage:</span>
                <span className="text-base font-black">
                  {(editingResult.maxScore || editingResult.totalQuestions || 0) > 0 
                    ? ((editingResult.score / (editingResult.maxScore || editingResult.totalQuestions || 1)) * 100).toFixed(1) 
                    : '0.0'}%
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setEditingResult(null)} 
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl shadow-md text-sm"
                >
                  Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
