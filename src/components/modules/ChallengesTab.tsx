import React, { useState, useMemo } from 'react';
import { 
  Swords, 
  Trophy, 
  Clock, 
  Flame, 
  Handshake, 
  Sliders, 
  Search, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Play, 
  Pause, 
  DollarSign, 
  Layers, 
  Settings,
  Sparkles,
  ArrowRight,
  Award
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { OneVsOneChallenge, ChallengeStatus, ChallengeType } from '../../types';

export const ChallengesTab: React.FC = () => {
  const {
    challenges,
    questionSets,
    challengeSettings,
    saveChallenge,
    deleteChallenge,
    toggleQuestionSet,
    updateChallengeSettings,
    requestConfirm,
    notifySuccess
  } = useAdminData();

  // Active view: 'dashboard' | 'settings'
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'settings'>('dashboard');

  // Search query & status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Collapsible PCM question sets banner
  const [isQuestionSetsOpen, setIsQuestionSetsOpen] = useState(true);

  // Selected challenge for View Details Modal
  const [selectedChallenge, setSelectedChallenge] = useState<OneVsOneChallenge | null>(null);

  // Local state for Quick Timer Duration setter (Hours & Minutes)
  const [timerHours, setTimerHours] = useState<number>(challengeSettings.durationHours ?? 3);
  const [timerMinutes, setTimerMinutes] = useState<number>(challengeSettings.durationMinutes ?? 0);
  const [isUpdatingTimer, setIsUpdatingTimer] = useState(false);

  // Local state for Control Panel settings
  const [entryFeeInput, setEntryFeeInput] = useState<number>(challengeSettings.liveChallengeEntryFee ?? 50);
  const [physicsToggle, setPhysicsToggle] = useState<boolean>(challengeSettings.physicsEnabled ?? true);
  const [chemistryToggle, setChemistryToggle] = useState<boolean>(challengeSettings.chemistryEnabled ?? true);
  const [mathToggle, setMathToggle] = useState<boolean>(challengeSettings.mathEnabled ?? true);
  const [pcmToggle, setPcmToggle] = useState<boolean>(challengeSettings.pcmEnabled ?? true);
  const [durationSlider, setDurationSlider] = useState<number>(challengeSettings.durationSeconds ?? 180);
  const [maxWagerXpInput, setMaxWagerXpInput] = useState<number>(challengeSettings.maxWagerXp ?? 500);

  // ─────────────────────────────────────────────────────────────
  // Computed Metrics (Matches Screenshot 1 exact counts!)
  // ─────────────────────────────────────────────────────────────
  const totalCount = challenges.length;
  const pendingCount = challenges.filter(c => c.status === 'PENDING' || c.status === 'WAITING').length;
  const runningCount = challenges.filter(c => c.status === 'RUNNING' || c.status === 'IN_PROGRESS').length;
  const completedCount = challenges.filter(c => c.status === 'COMPLETED').length;
  const expiredTermCount = challenges.filter(c => c.status === 'EXPIRED' || c.status === 'TERMINATED' || c.status === 'ABANDONED').length;
  const xpWagersCount = challenges.filter(c => c.type === 'XP_WAGER' || (c.wagerXp && c.wagerXp > 0)).length;
  const friendlyCount = challenges.filter(c => c.type === 'FRIENDLY' || !c.wagerXp).length;

  // ─────────────────────────────────────────────────────────────
  // Filtered Challenges List
  // ─────────────────────────────────────────────────────────────
  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      // 1. Status Filter
      if (statusFilter === 'PENDING' && !(c.status === 'PENDING' || c.status === 'WAITING')) return false;
      if (statusFilter === 'RUNNING' && !(c.status === 'RUNNING' || c.status === 'IN_PROGRESS')) return false;
      if (statusFilter === 'PAUSED' && c.status !== 'PAUSED') return false;
      if (statusFilter === 'COMPLETED' && c.status !== 'COMPLETED') return false;
      if (statusFilter === 'EXPIRED_TERM' && !(c.status === 'EXPIRED' || c.status === 'TERMINATED' || c.status === 'ABANDONED')) return false;
      if (statusFilter === 'XP_WAGER' && !(c.type === 'XP_WAGER' || (c.wagerXp && c.wagerXp > 0))) return false;
      if (statusFilter === 'FRIENDLY' && !(c.type === 'FRIENDLY' || !c.wagerXp)) return false;

      // 2. Search Query (Matches names or challenge ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = c.challengeId.toLowerCase().includes(q);
        const matchesU1 = c.user1Name.toLowerCase().includes(q);
        const matchesU2 = c.user2Name.toLowerCase().includes(q);
        const matchesSubject = (c.subject || '').toLowerCase().includes(q);
        return matchesId || matchesU1 || matchesU2 || matchesSubject;
      }

      return true;
    });
  }, [challenges, statusFilter, searchQuery]);

  // ─────────────────────────────────────────────────────────────
  // Top Winners Aggregated Leaderboard
  // ─────────────────────────────────────────────────────────────
  const topWinners = useMemo(() => {
    const stats = new Map<string, { name: string; wins: number; totalBattles: number; xpWon: number }>();

    challenges.forEach(c => {
      // Record user 1
      if (c.user1Name) {
        const u1 = stats.get(c.user1Name) || { name: c.user1Name, wins: 0, totalBattles: 0, xpWon: 0 };
        u1.totalBattles += 1;
        if (c.winnerName === c.user1Name) {
          u1.wins += 1;
          u1.xpWon += c.wagerXp || 50;
        }
        stats.set(c.user1Name, u1);
      }
      // Record user 2
      if (c.user2Name) {
        const u2 = stats.get(c.user2Name) || { name: c.user2Name, wins: 0, totalBattles: 0, xpWon: 0 };
        u2.totalBattles += 1;
        if (c.winnerName === c.user2Name) {
          u2.wins += 1;
          u2.xpWon += c.wagerXp || 50;
        }
        stats.set(c.user2Name, u2);
      }
    });

    return Array.from(stats.values())
      .filter(w => w.wins > 0)
      .sort((a, b) => b.wins - a.wins || b.xpWon - a.xpWon)
      .slice(0, 8);
  }, [challenges]);

  // ─────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────
  const handleUpdateTimer = async () => {
    setIsUpdatingTimer(true);
    await updateChallengeSettings({
      durationHours: Number(timerHours) || 0,
      durationMinutes: Number(timerMinutes) || 0,
      durationSeconds: ((Number(timerHours) || 0) * 3600) + ((Number(timerMinutes) || 0) * 60)
    });
    setIsUpdatingTimer(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateChallengeSettings({
      liveChallengeEntryFee: Number(entryFeeInput) || 50,
      physicsEnabled: physicsToggle,
      chemistryEnabled: chemistryToggle,
      mathEnabled: mathToggle,
      pcmEnabled: pcmToggle,
      durationSeconds: Number(durationSlider) || 180,
      maxWagerXp: Number(maxWagerXpInput) || 500
    });
  };

  const handleDeleteChallenge = async (challenge: OneVsOneChallenge) => {
    const confirmed = await requestConfirm({
      title: 'Delete 1v1 Challenge Record',
      message: `Permanently delete challenge record "${challenge.challengeId}" between ${challenge.user1Name} and ${challenge.user2Name}?`,
      itemName: `${challenge.challengeId} (${challenge.user1Name} VS ${challenge.user2Name})`,
      confirmText: 'Delete Permanently',
      isDestructive: true
    });

    if (confirmed) {
      await deleteChallenge(challenge.challengeId);
      if (selectedChallenge?.challengeId === challenge.challengeId) {
        setSelectedChallenge(null);
      }
    }
  };

  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case 'RUNNING':
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black tracking-wide bg-emerald-500 text-white shadow-sm flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            RUNNING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black tracking-wide bg-[#4338CA] text-indigo-100 shadow-sm">
            COMPLETED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black tracking-wide bg-[#334155] text-slate-300">
            EXPIRED
          </span>
        );
      case 'TERMINATED':
      case 'ABANDONED':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black tracking-wide bg-[#1E293B] text-slate-300 border border-slate-600">
            TERMINATED
          </span>
        );
      case 'PENDING':
      case 'WAITING':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black tracking-wide bg-amber-500 text-white shadow-sm">
            PENDING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black tracking-wide bg-yellow-500 text-slate-950">
            PAUSED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black tracking-wide bg-slate-700 text-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-5 animate-fadeIn pb-16">

      {/* ─────────────────────────────────────────────────────────────
          1. TOP HERO CARD: ⚔️ 1 VS 1 CHALLENGE CONTROL CENTER
             (Matches Screenshot 1 exact design & 7 metric boxes!)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#1E1B4B] text-white rounded-3xl p-6 shadow-xl space-y-5 border border-indigo-900/60">
        
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚔️</span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
              1 VS 1 CHALLENGE CONTROL CENTER
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-indigo-200 font-medium pl-8">
            Realtime Monitoring, Timer Pause/Resume & Question Set Management
          </p>
        </div>

        {/* 7 Metric Boxes Grid (Exact 1:1 match with Screenshot 1) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
          
          {/* TOTAL */}
          <div className="bg-[#2E2A72]/80 border border-indigo-500/40 rounded-2xl p-3 text-center space-y-0.5 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-indigo-100">{totalCount}</div>
            <div className="text-[10px] font-black text-indigo-300 tracking-wider uppercase">TOTAL</div>
          </div>

          {/* PENDING */}
          <div className="bg-[#3D2C1D]/80 border border-amber-500/40 rounded-2xl p-3 text-center space-y-0.5 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-amber-300">{pendingCount}</div>
            <div className="text-[10px] font-black text-amber-200 tracking-wider uppercase">PENDING</div>
          </div>

          {/* RUNNING */}
          <div className="bg-[#133E38]/80 border border-emerald-500/40 rounded-2xl p-3 text-center space-y-0.5 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-emerald-300">{runningCount}</div>
            <div className="text-[10px] font-black text-emerald-200 tracking-wider uppercase">RUNNING</div>
          </div>

          {/* COMPLETED */}
          <div className="bg-[#1E2E4B]/80 border border-blue-500/40 rounded-2xl p-3 text-center space-y-0.5 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-blue-300">{completedCount}</div>
            <div className="text-[10px] font-black text-blue-200 tracking-wider uppercase">COMPLETED</div>
          </div>

          {/* EXPIRED/TERM */}
          <div className="bg-[#3E1E28]/80 border border-rose-500/40 rounded-2xl p-3 text-center space-y-0.5 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-rose-300">{expiredTermCount}</div>
            <div className="text-[10px] font-black text-rose-200 tracking-wider uppercase">EXPIRED/TERM</div>
          </div>

          {/* XP WAGERS */}
          <div className="bg-[#3D2C1D]/80 border border-orange-500/40 rounded-2xl p-3 text-center space-y-0.5 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-orange-300">{xpWagersCount}</div>
            <div className="text-[10px] font-black text-orange-200 tracking-wider uppercase">XP WAGERS</div>
          </div>

          {/* FRIENDLY */}
          <div className="bg-[#133E38]/80 border border-teal-500/40 rounded-2xl p-3 text-center space-y-0.5 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-teal-300">{friendlyCount}</div>
            <div className="text-[10px] font-black text-teal-200 tracking-wider uppercase">FRIENDLY</div>
          </div>

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SUB-TAB SWITCHER: DASHBOARD VS SETTINGS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
            activeSubTab === 'dashboard'
              ? 'bg-[#4F46E5] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Challenge Dashboard ({challenges.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
            activeSubTab === 'settings'
              ? 'bg-[#4F46E5] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Challenge Settings & Control Panel</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VIEW A: CHALLENGE DASHBOARD (LIST VIEW)
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-5">
          
          {/* Quick Timer Duration Setter (Matching Screenshot 1) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 flex-wrap">
            
            {/* Hours Input */}
            <div className="relative min-w-[120px] flex-1 sm:flex-initial">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[10px] font-bold text-slate-500">
                Hours
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={timerHours}
                onChange={(e) => setTimerHours(Number(e.target.value))}
                className="w-full h-11 px-3.5 pt-1 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            {/* Minutes Input */}
            <div className="relative min-w-[120px] flex-1 sm:flex-initial">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[10px] font-bold text-slate-500">
                Minutes
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Number(e.target.value))}
                className="w-full h-11 px-3.5 pt-1 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdateTimer}
              disabled={isUpdatingTimer}
              className="h-11 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-black shadow transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isUpdatingTimer ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              <span>Update Timer</span>
            </button>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline ml-auto">
              ⏱️ Updates challenge duration across Android App & Web in Realtime
            </span>
          </div>

          {/* Search Bar (Matching Screenshot 1) */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or challenge ID..."
              className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Filter Buttons (Matching Screenshot 1) */}
          <div className="flex items-center gap-1.5 overflow-x-auto dark-scrollbar pb-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-indigo-100 text-[#4F46E5] border border-indigo-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All ({totalCount})
            </button>

            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Pending ({pendingCount})
            </button>

            <button
              onClick={() => setStatusFilter('RUNNING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'RUNNING'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Active/Running ({runningCount})
            </button>

            <button
              onClick={() => setStatusFilter('PAUSED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'PAUSED'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Paused (0)
            </button>

            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'COMPLETED'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Completed ({completedCount})
            </button>

            <button
              onClick={() => setStatusFilter('EXPIRED_TERM')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'EXPIRED_TERM'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Expired/Term ({expiredTermCount})
            </button>

            <button
              onClick={() => setStatusFilter('XP_WAGER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'XP_WAGER'
                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              XP Wagers ({xpWagersCount})
            </button>

            <button
              onClick={() => setStatusFilter('FRIENDLY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'FRIENDLY'
                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Friendly ({friendlyCount})
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. COLLAPSIBLE PCM QUESTION SETS (Matching Screenshot 2)
             ───────────────────────────────────────────────────────────── */}
          <div className="bg-[#1E2235] rounded-3xl p-5 border border-slate-800 text-white shadow-xl space-y-4">
            
            {/* Header + Hide/Show Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <h3 className="text-sm sm:text-base font-black text-white">
                  1v1 PCM Question Sets ({questionSets.filter(s => s.isActive).length} Active Sets)
                </h3>
              </div>
              <button
                onClick={() => setIsQuestionSetsOpen(!isQuestionSetsOpen)}
                className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
              >
                {isQuestionSetsOpen ? (
                  <><span>▲</span><span>Hide</span></>
                ) : (
                  <><span>▼</span><span>Show</span></>
                )}
              </button>
            </div>

            {/* Question Set Cards */}
            {isQuestionSetsOpen && (
              <div className="space-y-3 pt-1">
                {questionSets.map((set, idx) => {
                  const setName = set.name || ('KCET PCM Challenge Set ' + String(idx + 1).padStart(2, '0'));
                  const setQuestions = set.questionCount ?? 20;
                  const setSubjects = set.subjects || 'Physics • Chemistry • Math PCM';
                  return (
                  <div
                    key={set.id}
                    className="bg-[#2A2E45] rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black text-white">{setName}</h4>
                      <p className="text-xs text-slate-400 font-medium">
                        {setQuestions} Questions ({setSubjects})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-black tracking-wider ${
                        set.isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {set.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => toggleQuestionSet(set.id, !set.isActive)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                          set.isActive ? 'bg-[#4F46E5]' : 'bg-slate-600'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            set.isActive ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. LIVE CHALLENGES LIST (Matching Screenshots 2, 3, 4)
             ───────────────────────────────────────────────────────────── */}
          <div className="space-y-3">
            
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-slate-500 tracking-wider uppercase">
                LIVE CHALLENGES LIST ({filteredChallenges.length})
              </h3>
              <span className="text-xs font-bold text-slate-400">
                Realtime Firestore Listener Active
              </span>
            </div>

            {filteredChallenges.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <Swords className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">No Challenges Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No 1v1 battle records matched your search query or filter. When students challenge each other on the Android App, they will appear here instantaneously.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredChallenges.map((challenge) => {
                  const isXp = challenge.type === 'XP_WAGER' || (challenge.wagerXp && challenge.wagerXp > 0);

                  return (
                    <div
                      key={challenge.challengeId}
                      className="bg-[#1E2235] text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3 hover:border-indigo-500/50 transition-all"
                    >
                      {/* Top Row: ID + Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          ID: {challenge.challengeId}
                        </span>
                        <div>{getStatusBadge(challenge.status)}</div>
                      </div>

                      {/* Middle: Matchup Title */}
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                          <span>{challenge.user1Name}</span>
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                            VS
                          </span>
                          <span>{challenge.user2Name}</span>
                        </h4>

                        {/* Subtitle: Type + Timer */}
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 flex-wrap">
                          <span>Type:</span>
                          <span className="text-slate-200 font-bold">
                            {isXp ? `🔥 ${challenge.wagerXp || 200} XP Wager` : '🤝 Friendly'}
                          </span>
                          <span>•</span>
                          <span>Timer: <strong className="font-mono text-slate-200">{challenge.timerString || '00:00:00'}</strong></span>
                          <span>•</span>
                          <span>Score: <strong className="font-mono text-amber-300">{challenge.scoreUser1} - {challenge.scoreUser2}</strong></span>
                        </div>
                      </div>

                      {/* Action Row */}
                      <div className="pt-1 flex items-center justify-between gap-2 flex-wrap border-t border-slate-800/80">
                        <button
                          onClick={() => setSelectedChallenge(challenge)}
                          className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                            {challenge.createdAtFormatted || 'Recorded'}
                          </span>

                          {/* Delete Trash Icon Button */}
                          <button
                            onClick={() => handleDeleteChallenge(challenge)}
                            className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600/30 border border-rose-500/30 transition-all cursor-pointer"
                            title="Delete Challenge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW B: CHALLENGE SETTINGS & CONTROL PANEL
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Left 2 Cols: Global Configuration Form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Global 1v1 Challenge Configurations
                </h3>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                
                {/* Entry Fee (chatConfig/price in RTDB) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Challenge Entry Fee (₹) — Stored in RTDB `chatConfig/price`</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={entryFeeInput}
                    onChange={(e) => setEntryFeeInput(Number(e.target.value))}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                  <p className="text-[11px] text-slate-500">
                    Defines the UPI price or token entry required for premium student battles.
                  </p>
                </div>

                {/* Duration Slider (60s to 300s or Hours) */}
                <div className="space-y-1 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Challenge Duration (Seconds)</span>
                    </span>
                    <span className="text-indigo-600 font-mono font-black">{durationSlider}s ({Math.floor(durationSlider / 60)}m)</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="600"
                    step="30"
                    value={durationSlider}
                    onChange={(e) => setDurationSlider(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
                  />
                </div>

                {/* Max XP Wager Limit */}
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                    <span>Maximum XP Wager Limit per Challenge</span>
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    step="50"
                    value={maxWagerXpInput}
                    onChange={(e) => setMaxWagerXpInput(Number(e.target.value))}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                {/* Subject Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Active Challenge Subject Categories
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    
                    {/* Physics */}
                    <button
                      type="button"
                      onClick={() => setPhysicsToggle(!physicsToggle)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        physicsToggle ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="text-xs">Physics</span>
                      <span className="text-xs">{physicsToggle ? '✓' : '—'}</span>
                    </button>

                    {/* Chemistry */}
                    <button
                      type="button"
                      onClick={() => setChemistryToggle(!chemistryToggle)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        chemistryToggle ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="text-xs">Chemistry</span>
                      <span className="text-xs">{chemistryToggle ? '✓' : '—'}</span>
                    </button>

                    {/* Mathematics */}
                    <button
                      type="button"
                      onClick={() => setMathToggle(!mathToggle)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        mathToggle ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="text-xs">Mathematics</span>
                      <span className="text-xs">{mathToggle ? '✓' : '—'}</span>
                    </button>

                    {/* Full PCM */}
                    <button
                      type="button"
                      onClick={() => setPcmToggle(!pcmToggle)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        pcmToggle ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="text-xs">Full PCM</span>
                      <span className="text-xs">{pcmToggle ? '✓' : '—'}</span>
                    </button>

                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-black shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Save Global Challenge Settings</span>
                  </button>
                </div>

              </form>

            </div>
          </div>

          {/* Right Col: Top Winners Leaderboard */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">
                  Top Battle Champions
                </h3>
              </div>

              <div className="space-y-2">
                {topWinners.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No completed battles recorded yet.
                  </p>
                ) : (
                  topWinners.map((winner, idx) => (
                    <div
                      key={winner.name}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">{winner.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {winner.wins} Wins • {winner.totalBattles} Battles
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                        +{winner.xpWon} XP
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. VIEW DETAILS MODAL
         ───────────────────────────────────────────────────────────── */}
      {selectedChallenge && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedChallenge(null)}
        >
          <div
            className="bg-[#1E2235] text-white rounded-3xl max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  CHALLENGE {selectedChallenge.challengeId}
                </span>
                <h3 className="text-base font-black text-white">
                  Battle Details & Scores
                </h3>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Matchup Header */}
            <div className="bg-[#2A2E45] rounded-2xl p-4 border border-slate-700 space-y-3">
              
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>{selectedChallenge.subject || 'Physics • Chemistry • Math PCM'}</span>
                <div>{getStatusBadge(selectedChallenge.status)}</div>
              </div>

              {/* Head to head scoreboard */}
              <div className="grid grid-cols-3 items-center text-center pt-2">
                
                {/* User 1 */}
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center mx-auto">
                    {selectedChallenge.user1Name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-black text-white truncate max-w-[120px] mx-auto">
                    {selectedChallenge.user1Name}
                  </p>
                  <p className="text-2xl font-black text-indigo-300 font-mono">
                    {selectedChallenge.scoreUser1}
                  </p>
                  {selectedChallenge.winnerName === selectedChallenge.user1Name && (
                    <span className="text-[10px] font-black text-amber-400">👑 WINNER</span>
                  )}
                </div>

                {/* VS */}
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-500 uppercase">VS</span>
                  <p className="text-xs font-mono text-slate-400">{selectedChallenge.timerString || '00:00:00'}</p>
                </div>

                {/* User 2 */}
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center mx-auto">
                    {selectedChallenge.user2Name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-black text-white truncate max-w-[120px] mx-auto">
                    {selectedChallenge.user2Name}
                  </p>
                  <p className="text-2xl font-black text-purple-300 font-mono">
                    {selectedChallenge.scoreUser2}
                  </p>
                  {selectedChallenge.winnerName === selectedChallenge.user2Name && (
                    <span className="text-[10px] font-black text-amber-400">👑 WINNER</span>
                  )}
                </div>

              </div>

            </div>

            {/* Metadata list */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Battle Type:</span>
                <span className="font-bold text-white">
                  {selectedChallenge.type === 'XP_WAGER' ? `🔥 ${selectedChallenge.wagerXp || 200} XP Wager` : '🤝 Friendly'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-white">{selectedChallenge.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Created:</span>
                <span className="font-bold text-white">{selectedChallenge.createdAtFormatted || 'Recorded'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => handleDeleteChallenge(selectedChallenge)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Challenge</span>
              </button>

              <button
                onClick={() => setSelectedChallenge(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-black transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
