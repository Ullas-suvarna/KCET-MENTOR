import React, { useRef, useState, useEffect } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TabItem {
  id: string;
  name: string;
  badge: number | string;
  isPendingYellow?: boolean;
  isStudentView?: boolean;
}

interface TabBarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onSelectTab }) => {
  const {
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
    helplines,
    receipts,
    colleges,
    branches,
    challenges
  } = useAdminData();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const pendingReceiptsCount = receipts.filter(r => r.status === 'UNDER_VERIFICATION').length;

  const tabs: TabItem[] = [
    { 
      id: 'questions', 
      name: 'Questions', 
      badge: questions.length 
    },
    { 
      id: 'test-series', 
      name: '🏆 Test Series', 
      badge: testSeries.length 
    },
    { 
      id: 'mentors', 
      name: '💬 Mentors & Chat', 
      badge: `${mentors.length} M • ${bookings.length} B` 
    },
    { 
      id: 'resources', 
      name: '🔗 Resources & Links', 
      badge: resources.length 
    },
    { 
      id: 'dates', 
      name: 'Dates', 
      badge: dates.length 
    },
    { 
      id: 'rank-marks', 
      name: 'Rank vs Marks', 
      badge: rankTiers.length 
    },
    { 
      id: 'announcements', 
      name: '📢 Announce & Push', 
      badge: announcements.length + notifications.length 
    },
    { 
      id: 'students', 
      name: '👨‍🎓 Students', 
      badge: students.length 
    },
    { 
      id: 'helplines', 
      name: '📞 Helplines', 
      badge: helplines.length 
    },
    { 
      id: 'receipts', 
      name: '💳 Receipts', 
      badge: pendingReceiptsCount > 0 ? `${pendingReceiptsCount} PENDING` : `${receipts.length}`, 
      isPendingYellow: pendingReceiptsCount > 0 
    },
    { 
      id: 'colleges', 
      name: '🏛️ Colleges & Cutoffs', 
      badge: colleges.length 
    },
    { 
      id: 'branches', 
      name: '🔬 Branch Explorer', 
      badge: branches.length 
    },
    { 
      id: 'challenges', 
      name: '⚔️ 1v1 Challenges', 
      badge: challenges.length 
    },
    {
      id: 'student-view',
      name: '🎓 Student Branch Explorer',
      badge: 'PREVIEW',
      isStudentView: true
    }
  ];

  // Update arrow indicators on scroll
  const handleCheckScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    handleCheckScroll();
    window.addEventListener('resize', handleCheckScroll);
    return () => window.removeEventListener('resize', handleCheckScroll);
  }, []);

  // Smooth mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftStart(scrollRef.current.scrollLeft);
    setHasDragged(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.6;
    if (Math.abs(walk) > 4) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeftStart - walk;
    handleCheckScroll();
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  // Mouse wheel horizontal scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    if (e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
      handleCheckScroll();
    }
  };

  const scrollSide = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(handleCheckScroll, 350);
  };

  return (
    <div className="bg-[#312E81] border-b border-[#1E1B4B] sticky top-[57px] z-30 shadow-inner relative select-none">
      {/* Left Scroll Button Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scrollSide('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#1E1B4B]/90 hover:bg-[#4338CA] text-white flex items-center justify-center shadow-lg border border-indigo-500/40 backdrop-blur-sm transition-all"
          title="Scroll Left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Main Draggable Tab Container */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onWheel={handleWheel}
        onScroll={handleCheckScroll}
        className={`max-w-7xl w-full mx-auto overflow-x-auto dark-scrollbar flex items-center px-2 sm:px-4 py-1.5 gap-1.5 no-wrap transition-colors ${
          isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ scrollBehavior: isMouseDown ? 'auto' : 'smooth' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!hasDragged) {
                  onSelectTab(tab.id);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all duration-150 shrink-0 pointer-events-auto ${
                tab.isStudentView
                  ? isActive 
                    ? 'bg-[#10B981] text-white shadow-md scale-[1.02]' 
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80 hover:text-white'
                  : isActive
                  ? 'bg-white text-[#1E1B4B] shadow-md scale-[1.02]'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-700/40'
              }`}
            >
              <span>{tab.name}</span>
              <span
                className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full transition-all ${
                  tab.isStudentView
                    ? 'bg-emerald-400 text-slate-950 shadow-sm'
                    : tab.isPendingYellow
                    ? 'bg-[#FCD34D] text-[#78350F] shadow-sm animate-pulse'
                    : isActive
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'bg-[#1E1B4B]/80 text-indigo-200'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Scroll Button Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scrollSide('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#1E1B4B]/90 hover:bg-[#4338CA] text-white flex items-center justify-center shadow-lg border border-indigo-500/40 backdrop-blur-sm transition-all"
          title="Scroll Right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
