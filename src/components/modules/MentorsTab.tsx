import React, { useState } from 'react';



import { 



  MessageSquare, 



  Users, 



  CheckCircle2, 



  Clock, 



  Plus, 



  Trash2, 



  Edit3, 



  ExternalLink, 



  Phone, 



  Mail, 



  Instagram, 



  Star, 



  ChevronDown, 



  Info, 



  Calendar, 



  DollarSign, 



  ShieldCheck, 



  X,



  RefreshCw,



  Search,
  Receipt,
  ZoomIn,
  Download,
  Copy,
  Check
} from 'lucide-react';



import { useAdminData } from '../../context/AdminDataContext';



import { Mentor, SeniorChatBooking, BookingStatus } from '../../types';







export const MentorsTab: React.FC = () => {



  const { mentors, bookings, saveMentor, deleteMentor, saveBooking, deleteBooking, sendBroadcast, notifySuccess, notifyError, notifyWarning, notifyInfo, requestConfirm } = useAdminData();







  // Active Main Tab: "bookings" | "mentors"



  const [activeMainTab, setActiveMainTab] = useState<'bookings' | 'mentors'>('bookings');







  // Bookings Filter Pill: "all" | "pending" | "confirmed" | "unassigned"



  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'unassigned'>('all');







  // Local state for each booking's assigned mentor and admin message



  const [selectedMentorsMap, setSelectedMentorsMap] = useState<Record<string, string>>({});



  const [adminNotesMap, setAdminNotesMap] = useState<Record<string, string>>({});
  // Receipt viewer lightbox
  const [viewingReceiptBooking, setViewingReceiptBooking] = useState<SeniorChatBooking | null>(null);
  const [receiptCopied, setReceiptCopied] = useState(false);








  // Add / Edit Mentor Modal State



  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);



  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);



  const [mentorFormData, setMentorFormData] = useState<Mentor>({



    id: `mentor-${Date.now()}`,



    name: '',



    branch: 'Computer Science & Engineering',



    college: 'R.V. College of Engineering (RVCE)',



    currentYear: '3rd Year B.E.',



    kcetRank: 'Rank #450',



    rating: 4.9,



    bio: 'Guided 80+ KCET aspirants for Option Entry and Counselling.',



    email: '',



    instagram: '',



    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'



  });







  // Selected Mentor Detail Modal



  const [detailMentor, setDetailMentor] = useState<Mentor | null>(null);







  // Counters



  const totalMentors = mentors.length;



  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;



  const pendingBookings = bookings.filter(b => b.status === 'Under Verification' || b.status === 'Waiting for Senior Confirmation').length;



  const unassignedBookings = bookings.filter(b => !b.assignedMentorEmail || b.assignedMentorEmail.trim() === '').length;







  // Filter Bookings List



  const filteredBookings = bookings.filter(b => {



    if (bookingFilter === 'confirmed') return b.status === 'Confirmed';



    if (bookingFilter === 'pending') return b.status === 'Under Verification' || b.status === 'Waiting for Senior Confirmation';



    if (bookingFilter === 'unassigned') return !b.assignedMentorEmail || b.assignedMentorEmail.trim() === '';



    return true;



  });







  // Action: Verify Payment & Assign Mentor



  const handleVerifyPaymentAndAssign = async (booking: SeniorChatBooking) => {



    const assignedMentorName = selectedMentorsMap[booking.bookingId] || booking.mentorName || (mentors[0]?.name || 'Ullas');



    const mentorObj = mentors.find(m => m.name === assignedMentorName);







    const updated: SeniorChatBooking = {



      ...booking,



      mentorName: assignedMentorName,



      assignedMentorEmail: mentorObj?.email || 'mentor@kcetgenz.com',



      status: 'Waiting for Senior Confirmation',



      adminMessage: adminNotesMap[booking.bookingId] || 'Payment verified. Mentor assigned for your session.'



    };







    await saveBooking(updated);







    await sendBroadcast({



      title: 'Mentor Assigned for 1-on-1 Chat',



      message: `Your payment of ₹${booking.amountPaid} is verified. ${assignedMentorName} is assigned for ${booking.selectedDate} at ${booking.selectedTime}.`,



      type: 'BOOKING',



      targetUserId: booking.userId,



      targetUserEmail: booking.userEmail



    });







    notifySuccess(`Payment verified and assigned ${assignedMentorName} for ${booking.userName}!`, 'Booking Confirmed');



  };







  // Action: Confirm Slot



  const handleConfirmSlot = async (booking: SeniorChatBooking) => {



    const assignedMentorName = selectedMentorsMap[booking.bookingId] || booking.mentorName || (mentors[0]?.name || 'Ullas');



    const mentorObj = mentors.find(m => m.name === assignedMentorName);







    const updated: SeniorChatBooking = {



      ...booking,



      mentorName: assignedMentorName,



      assignedMentorEmail: mentorObj?.email || booking.assignedMentorEmail || 'mentor@kcetgenz.com',



      status: 'Confirmed',



      adminMessage: adminNotesMap[booking.bookingId] || 'Your senior mentoring call is confirmed.'



    };







    await saveBooking(updated);







    await sendBroadcast({



      title: 'Senior Mentoring Session Confirmed! 🎉',



      message: `Your session with ${assignedMentorName} on ${booking.selectedDate} (${booking.selectedTime}) is confirmed.`,



      type: 'BOOKING',



      targetUserId: booking.userId,



      targetUserEmail: booking.userEmail



    });







    notifySuccess(`Slot Confirmed for ${booking.userName}!`, 'Slot Confirmed');



  };







  // Action: Suggest Other Time



  const handleSuggestOtherTime = async (booking: SeniorChatBooking) => {



    const note = prompt('Enter suggested date/time for the student:', '2026-04-14 at 07:00 PM');



    if (!note) return;







    const updated: SeniorChatBooking = {



      ...booking,



      status: 'Reschedule Needed',



      adminMessage: `Reschedule Requested: ${note}`



    };







    await saveBooking(updated);







    await sendBroadcast({



      title: 'Senior Chat Reschedule Requested',



      message: `Admin requested a time adjustment for your mentoring session: ${note}. Please check your app.`,



      type: 'BOOKING',



      targetUserId: booking.userId,



      targetUserEmail: booking.userEmail



    });



  };







  // Action: Decline Booking



  const handleDecline = async (booking: SeniorChatBooking) => {



    const reason = prompt('Reason for declining this senior booking:', 'Mentor unavailable / Invalid payment UTR');



    if (!reason) return;







    const updated: SeniorChatBooking = {



      ...booking,



      status: 'Declined',



      rejectionReason: reason,



      adminMessage: `Booking Declined: ${reason}`



    };







    await saveBooking(updated);







    await sendBroadcast({



      title: 'Mentoring Booking Declined',



      message: `Your booking could not be confirmed. Reason: ${reason}. Refund will be initiated if applicable.`,



      type: 'BOOKING',



      targetUserId: booking.userId,



      targetUserEmail: booking.userEmail



    });



  };







  // Action: End 1-on-1 Chat Session



  const handleEndChatSession = async (booking: SeniorChatBooking) => {



    if (confirm(`End 1-on-1 chat session for ${booking.userName}? This will archive the live room.`)) {



      const updated: SeniorChatBooking = {



        ...booking,



        status: 'Expired',



        adminMessage: 'Mentorship session concluded successfully.'



      };



      await saveBooking(updated);



    }



  };







  // Action: Save Mentor (Modal)



  const handleSaveMentorForm = async (e: React.FormEvent) => {



    e.preventDefault();



    if (!mentorFormData.name.trim()) return;



    await saveMentor(mentorFormData);



    setIsMentorModalOpen(false);



  };







  const handleOpenAddMentor = () => {



    setEditingMentorId(null);



    setMentorFormData({



      id: `mentor-${Date.now()}`,



      name: '',



      branch: 'Computer Science & Engineering',



      college: 'R.V. College of Engineering (RVCE)',



      currentYear: '3rd Year B.E.',



      kcetRank: 'Rank #450',



      rating: 4.9,



      bio: 'Guided 80+ KCET aspirants for Option Entry and Counselling.',



      email: '',



      instagram: '',



      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'



    });



    setIsMentorModalOpen(true);



  };







  return (



    <div className="w-full space-y-6 animate-fadeIn pb-16">



      {/* ============================================================ */}



      {/* 1. Top Dark Card: Senior Mentorship & Chat Management        */}



      {/* ============================================================ */}



      <div className="bg-[#1E1B4B] text-white rounded-3xl p-6 shadow-md space-y-4">



        <div className="space-y-1">



          <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 text-white">



            <span className="text-xl">💬</span>



            Senior Mentorship & Chat Management



          </h2>



          <p className="text-sm text-indigo-200 font-medium">



            Review registered mentors, inspect credentials, and assign mentors to students.



          </p>



        </div>







        {/* 3 Metric Cards inside Dark Header */}



        <div className="grid grid-cols-3 gap-3 pt-1">



          {/* Card 1: Mentors */}



          <div className="bg-[#2E2A72]/70 border border-indigo-500/30 rounded-2xl p-3 text-center space-y-0.5">



            <span className="text-[11px] font-bold text-indigo-200 flex items-center justify-center gap-1">



              <span>👨‍🏫</span> Mentors



            </span>



            <span className="text-xl sm:text-2xl font-black text-white block">



              {totalMentors}



            </span>



          </div>







          {/* Card 2: Confirmed */}



          <div className="bg-[#2E2A72]/70 border border-indigo-500/30 rounded-2xl p-3 text-center space-y-0.5">



            <span className="text-[11px] font-bold text-indigo-200 flex items-center justify-center gap-1">



              <span>🎯</span> Confirmed



            </span>



            <span className="text-xl sm:text-2xl font-black text-[#10B981] block">



              {confirmedBookings}



            </span>



          </div>







          {/* Card 3: Pending */}



          <div className="bg-[#2E2A72]/70 border border-indigo-500/30 rounded-2xl p-3 text-center space-y-0.5">



            <span className="text-[11px] font-bold text-indigo-200 flex items-center justify-center gap-1">



              <span>📫</span> Pending



            </span>



            <span className="text-xl sm:text-2xl font-black text-[#FBBF24] block">



              {pendingBookings}



            </span>



          </div>



        </div>



      </div>







      {/* ============================================================ */}



      {/* 2. Main Tab Buttons: Student Bookings vs Registered Mentors */}



      {/* ============================================================ */}



      <div className="grid grid-cols-2 gap-3">



        {/* Tab 1: Student Bookings */}



        <button



          onClick={() => setActiveMainTab('bookings')}



          className={`h-12 rounded-2xl text-sm font-black shadow-sm transition-all flex items-center justify-center gap-2 ${



            activeMainTab === 'bookings'



              ? 'bg-[#4F46E5] text-white shadow-md'



              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'



          }`}



        >



          <span>🧾</span>



          <span>Student Bookings ({bookings.length})</span>



        </button>







        {/* Tab 2: Registered Mentors */}



        <button



          onClick={() => setActiveMainTab('mentors')}



          className={`h-12 rounded-2xl text-sm font-black shadow-sm transition-all flex items-center justify-center gap-2 ${



            activeMainTab === 'mentors'



              ? 'bg-[#4F46E5] text-white shadow-md'



              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'



          }`}



        >



          <span>🎓</span>



          <span>Registered Mentors ({mentors.length})</span>



        </button>



      </div>







      {/* ============================================================ */}



      {/* TAB 1: Student Bookings View                                 */}



      {/* ============================================================ */}



      {activeMainTab === 'bookings' && (



        <div className="space-y-4">



          {/* Sub-Filter Pills */}



          <div className="flex items-center gap-2 overflow-x-auto pb-1">



            <button



              onClick={() => setBookingFilter('all')}



              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${



                bookingFilter === 'all'



                  ? 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 font-black'



                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'



              }`}



            >



              All ({bookings.length})



            </button>







            <button



              onClick={() => setBookingFilter('pending')}



              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${



                bookingFilter === 'pending'



                  ? 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 font-black'



                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'



              }`}



            >



              Pending ({pendingBookings})



            </button>







            <button



              onClick={() => setBookingFilter('confirmed')}



              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${



                bookingFilter === 'confirmed'



                  ? 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 font-black'



                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'



              }`}



            >



              Confirmed ({confirmedBookings})



            </button>







            <button



              onClick={() => setBookingFilter('unassigned')}



              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${



                bookingFilter === 'unassigned'



                  ? 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 font-black'



                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'



              }`}



            >



              Unassigned ({unassignedBookings})



            </button>



          </div>







          {/* Bookings List */}



          {filteredBookings.length === 0 ? (



            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">



              <span className="text-3xl block mb-2">📫</span>



              <h4 className="font-bold text-slate-800 text-sm">No bookings in this filter</h4>



              <p className="text-sm text-slate-500 mt-1">



                Student bookings for senior mentorship will appear here in real-time.



              </p>



            </div>



          ) : (



            <div className="space-y-5">



              {filteredBookings.map((booking) => {



                const assignedMentorObj = mentors.find(m => 



                  m.name === (selectedMentorsMap[booking.bookingId] || booking.mentorName)



                );







                const currentMentorName = selectedMentorsMap[booking.bookingId] !== undefined



                  ? selectedMentorsMap[booking.bookingId]



                  : (booking.mentorName || (mentors[0]?.name || 'Ullas'));







                const currentAdminNote = adminNotesMap[booking.bookingId] !== undefined



                  ? adminNotesMap[booking.bookingId]



                  : (booking.adminMessage || 'Your senior mentoring call is confirmed.');







                return (



                  <div 



                    key={booking.bookingId}



                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4"



                  >



                    {/* Header: Student Name & Status Badge */}



                    <div className="flex items-start justify-between gap-3">



                      <div>



                        <h3 className="text-base font-black text-slate-900 leading-tight">



                          {booking.userName}



                        </h3>



                        <p className="text-sm text-slate-500 font-medium mt-0.5">



                          {booking.userEmail}



                        </p>



                      </div>







                      {/* Status Badge */}



                      <span className={`px-3 py-1 rounded-xl text-sm font-black capitalize ${



                        booking.status === 'Confirmed'



                          ? 'bg-[#DCFCE7] text-[#15803D]'



                          : booking.status === 'Declined'



                          ? 'bg-[#FEE2E2] text-[#B91C1C]'



                          : 'bg-[#FEF3C7] text-[#B45309]'



                      }`}>



                        {booking.status}



                      </span>



                    </div>







                    {/* Requested Info Row */}



                    <div className="grid grid-cols-3 gap-2 text-sm pt-1">



                      <div>



                        <span className="block text-[10px] uppercase font-bold text-slate-500">Requested Date</span>



                        <span className="font-black text-slate-900 text-sm sm:text-sm">



                          {booking.selectedDate}



                        </span>



                      </div>



                      <div>



                        <span className="block text-[10px] uppercase font-bold text-slate-500">Requested Time</span>



                        <span className="font-black text-slate-900 text-sm sm:text-sm">



                          {booking.selectedTime}



                        </span>



                      </div>



                      <div>



                        <span className="block text-[10px] uppercase font-bold text-slate-500">Amount Paid</span>



                        <span className="font-black text-[#16A34A] text-sm sm:text-sm">



                          ₹{booking.amountPaid}



                        </span>



                      </div>



                    </div>







                    {/* Payment UTR + Receipt Viewer Banner */}
                    <div className="p-3 bg-[#FEF9C3] rounded-2xl border border-[#FDE047] space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#854D0E]">
                          <span>💳</span>
                          <span>Payment UTR / Txn Ref: <strong className="font-mono text-[#713F12]">{booking.paymentRefNumber || 'Not provided'}</strong></span>
                        </div>
                        {(booking.receiptUrl?.trim() || booking.receiptImageUri?.trim()) ? (
                          <button
                            onClick={() => setViewingReceiptBooking(booking)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-sm transition-all cursor-pointer shrink-0"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>🧾 View Receipt</span>
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold italic shrink-0">
                            <Receipt className="w-3.5 h-3.5 opacity-50" />
                            <span>Receipt not uploaded</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#854D0E]">
                        <span>💰</span>
                        <span>Amount Paid: <strong>₹{booking.amountPaid || 50}</strong></span>
                      </div>
                    </div>

                    {/* Assigned Mentor Card (Light Green Container) */}



                    <div className="p-3.5 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] space-y-2">



                      <div className="flex items-center justify-between">



                        <div className="flex items-center gap-2">



                          <span className="text-base">🎓</span>



                          <span className="text-sm font-black text-emerald-950">



                            Assigned Mentor: {currentMentorName}



                          </span>



                        </div>



                        <span className="px-2 py-0.5 rounded-md bg-[#16A34A] text-white text-[10px] font-black tracking-wider">



                          VERIFIED



                        </span>



                      </div>







                      {assignedMentorObj && (



                        <div className="flex items-center justify-between text-sm text-emerald-900/80 font-semibold pt-1 border-t border-emerald-200/60">



                          <div className="flex items-center gap-2">



                            <span>🎓 {assignedMentorObj.branch}</span>



                            <span>•</span>



                            <span>🔬 {assignedMentorObj.college}</span>



                          </div>



                          <button



                            onClick={() => setDetailMentor(assignedMentorObj)}



                            className="text-[11px] font-bold text-teal-800 hover:underline flex items-center gap-0.5"



                          >



                            <span>Details</span>



                            <Info className="w-3.5 h-3.5" />



                          </button>



                        </div>



                      )}







                      {assignedMentorObj?.email && (



                        <div className="text-[11px] text-emerald-800 font-medium">



                          📞 {assignedMentorObj.email}



                        </div>



                      )}



                    </div>







                    {/* Assign Senior Mentor Dropdown */}



                    <div className="relative">



                      <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">



                        Assign Senior Mentor



                      </label>



                      <div className="relative">



                        <select



                          value={currentMentorName}



                          onChange={(e) => {



                            const val = e.target.value;



                            setSelectedMentorsMap(prev => ({ ...prev, [booking.bookingId]: val }));



                          }}



                          className="w-full h-14 pl-4 pr-10 bg-white border border-slate-400 rounded-2xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"



                        >



                          {mentors.map(m => (



                            <option key={m.id} value={m.name}>



                              {m.name} ({m.college} • {m.branch})



                            </option>



                          ))}



                        </select>



                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />



                      </div>



                    </div>







                    {/* Admin Message / Verification Note (Outlined Box) */}



                    <div className="relative">



                      <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-[#4F46E5] z-10">



                        Admin Message / Verification Note



                      </label>



                      <textarea



                        rows={2}



                        value={currentAdminNote}



                        onChange={(e) => {



                          const val = e.target.value;



                          setAdminNotesMap(prev => ({ ...prev, [booking.bookingId]: val }));



                        }}



                        className="w-full p-4 bg-white border-2 border-[#4F46E5] rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"



                      />



                    </div>







                    {/* Action Buttons Grid */}



                    <div className="space-y-2.5 pt-1">



                      {/* Row 1: Verify Payment & Assign (Blue) | Confirm Slot (Green) */}



                      <div className="grid grid-cols-2 gap-3">



                        <button



                          onClick={() => handleVerifyPaymentAndAssign(booking)}



                          className="h-12 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"



                        >



                          <span>💳 Verify Payment & Assign</span>



                        </button>







                        <button



                          onClick={() => handleConfirmSlot(booking)}



                          className="h-12 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"



                        >



                          <span>✅ Confirm Slot</span>



                        </button>



                      </div>







                      {/* Row 2: Suggest Other Time (Orange) | Decline (White with red outline) */}



                      <div className="grid grid-cols-2 gap-3">



                        <button



                          onClick={() => handleSuggestOtherTime(booking)}



                          className="h-12 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"



                        >



                          <span>💬 Suggest Other Time</span>



                        </button>







                        <button



                          onClick={() => handleDecline(booking)}



                          className="h-12 rounded-2xl bg-white hover:bg-rose-50 border-2 border-slate-300 text-[#DC2626] text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"



                        >



                          <span>✕ Decline</span>



                        </button>



                      </div>







                      {/* Row 3: End 1-on-1 Chat Session (Purple Full Width) */}



                      <button



                        onClick={() => handleEndChatSession(booking)}



                        className="w-full h-12 rounded-2xl bg-[#6B21A8] hover:bg-[#581C87] text-white text-sm font-black shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"



                      >



                        <span>🛑</span>



                        <span>End 1-on-1 Chat Session</span>



                      </button>







                      {/* Row 4: Delete Request (White Full Width with Trash) */}



                      <button



                        onClick={async () => {



                          if (confirm(`Delete booking request from ${booking.userName}?`)) {



                            await deleteBooking(booking.bookingId);



                          }



                        }}



                        className="w-full h-12 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"



                      >



                        <span>🗑️</span>



                        <span>Delete Request</span>



                      </button>



                    </div>



                  </div>



                );



              })}



            </div>



          )}



        </div>



      )}







      {/* ============================================================ */}



      {/* TAB 2: Registered Mentors Catalog View                       */}



      {/* ============================================================ */}



      {activeMainTab === 'mentors' && (



        <div className="space-y-4">



          <div className="flex items-center justify-between px-1">



            <h3 className="text-sm font-black text-slate-900">



              Verified Senior Mentors ({mentors.length})



            </h3>







            <button



              onClick={handleOpenAddMentor}



              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm shadow transition-all active:scale-95"



            >



              <Plus className="w-4 h-4" />



              <span>+ Add Senior Mentor</span>



            </button>



          </div>







          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">



            {mentors.map((mentor) => (



              <div 



                key={mentor.id}



                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"



              >



                <div className="space-y-3">



                  <div className="flex items-center gap-3">



                    <img 



                      src={mentor.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'} 



                      alt={mentor.name}



                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0" 



                    />



                    <div>



                      <h4 className="font-extrabold text-sm text-slate-900">{mentor.name}</h4>



                      <p className="text-sm text-indigo-600 font-bold">{mentor.kcetRank}</p>



                      <p className="text-[11px] text-slate-500 font-medium">{mentor.currentYear}</p>



                    </div>



                  </div>







                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm space-y-1">



                    <div className="font-bold text-slate-800">🎓 {mentor.college}</div>



                    <div className="text-slate-600">📚 {mentor.branch}</div>



                  </div>







                  <p className="text-sm text-slate-600 line-clamp-2">



                    {mentor.bio}



                  </p>



                </div>







                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">



                  <div className="flex items-center gap-1 text-amber-500 font-black">



                    <Star className="w-3.5 h-3.5 fill-amber-400" />



                    <span>{mentor.rating}</span>



                  </div>







                  <div className="flex items-center gap-2">



                    <button



                      onClick={() => {



                        setEditingMentorId(mentor.id);



                        setMentorFormData({ ...mentor });



                        setIsMentorModalOpen(true);



                      }}



                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px]"



                    >



                      Edit



                    </button>



                    <button



                      onClick={async () => {



                        if (confirm(`Delete mentor ${mentor.name}?`)) {



                          await deleteMentor(mentor.id, mentor.name);



                        }



                      }}



                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"



                    >



                      <Trash2 className="w-3.5 h-3.5" />



                    </button>



                  </div>



                </div>



              </div>



            ))}



          </div>



        </div>



      )}







      {/* Mentor Details Modal */}



      {detailMentor && (



        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">



          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">



            <div className="flex items-center justify-between pb-3 border-b border-slate-100">



              <h3 className="font-black text-base text-slate-900">Mentor Credentials</h3>



              <button



                onClick={() => setDetailMentor(null)}



                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"



              >



                ✕



              </button>



            </div>







            <div className="flex items-center gap-3">



              <img src={detailMentor.photoUrl} alt={detailMentor.name} className="w-16 h-16 rounded-2xl object-cover border" />



              <div>



                <h4 className="font-extrabold text-base text-slate-900">{detailMentor.name}</h4>



                <p className="text-sm text-indigo-600 font-bold">{detailMentor.kcetRank}</p>



                <p className="text-sm text-slate-500">{detailMentor.college}</p>



              </div>



            </div>







            <div className="space-y-2 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl">



              <div><strong>Branch:</strong> {detailMentor.branch}</div>



              <div><strong>Year:</strong> {detailMentor.currentYear}</div>



              <div><strong>Email:</strong> {detailMentor.email || 'N/A'}</div>



              <div><strong>Rating:</strong> ⭐ {detailMentor.rating} / 5.0</div>



              <div><strong>Bio:</strong> {detailMentor.bio}</div>



            </div>







            <div className="pt-2 flex justify-end">



              <button



                onClick={() => setDetailMentor(null)}



                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold"



              >



                Close



              </button>



            </div>



          </div>



        </div>



      )}







      {/* Add / Edit Mentor Modal */}



      {isMentorModalOpen && (



        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">



          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">



            <div className="flex items-center justify-between pb-3 border-b border-slate-100">



              <h3 className="font-black text-base text-slate-900">



                {editingMentorId ? 'Edit Senior Mentor' : 'Add Senior Mentor'}



              </h3>



              <button



                onClick={() => setIsMentorModalOpen(false)}



                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"



              >



                ✕



              </button>



            </div>







            <form onSubmit={handleSaveMentorForm} className="space-y-3 text-sm">



              <div>



                <label className="block font-bold text-slate-700 mb-1">Mentor Name</label>



                <input



                  type="text"



                  value={mentorFormData.name}



                  onChange={(e) => setMentorFormData({ ...mentorFormData, name: e.target.value })}



                  placeholder="e.g. Rohan Deshmukh"



                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"



                  required



                />



              </div>







              <div className="grid grid-cols-2 gap-3">



                <div>



                  <label className="block font-bold text-slate-700 mb-1">College</label>



                  <input



                    type="text"



                    value={mentorFormData.college}



                    onChange={(e) => setMentorFormData({ ...mentorFormData, college: e.target.value })}



                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"



                    required



                  />



                </div>



                <div>



                  <label className="block font-bold text-slate-700 mb-1">Branch</label>



                  <input



                    type="text"



                    value={mentorFormData.branch}



                    onChange={(e) => setMentorFormData({ ...mentorFormData, branch: e.target.value })}



                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"



                    required



                  />



                </div>



              </div>







              <div className="grid grid-cols-2 gap-3">



                <div>



                  <label className="block font-bold text-slate-700 mb-1">KCET Rank</label>



                  <input



                    type="text"



                    value={mentorFormData.kcetRank}



                    onChange={(e) => setMentorFormData({ ...mentorFormData, kcetRank: e.target.value })}



                    placeholder="e.g. Rank #450"



                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"



                  />



                </div>



                <div>



                  <label className="block font-bold text-slate-700 mb-1">Current Year</label>



                  <input



                    type="text"



                    value={mentorFormData.currentYear}



                    onChange={(e) => setMentorFormData({ ...mentorFormData, currentYear: e.target.value })}



                    placeholder="e.g. 3rd Year B.E."



                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"



                  />



                </div>



              </div>







              <div>



                <label className="block font-bold text-slate-700 mb-1">Email</label>



                <input



                  type="email"



                  value={mentorFormData.email}



                  onChange={(e) => setMentorFormData({ ...mentorFormData, email: e.target.value })}



                  placeholder="mentor@gmail.com"



                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"



                />



              </div>







              <div>



                <label className="block font-bold text-slate-700 mb-1">Mentor Bio / Highlights</label>



                <textarea



                  rows={2}



                  value={mentorFormData.bio}



                  onChange={(e) => setMentorFormData({ ...mentorFormData, bio: e.target.value })}



                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"



                />



              </div>







              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">



                <button



                  type="button"



                  onClick={() => setIsMentorModalOpen(false)}



                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"



                >



                  Cancel



                </button>



                <button



                  type="submit"



                  className="px-5 py-2 rounded-xl bg-[#4F46E5] text-white font-bold shadow"



                >



                  Save Mentor



                </button>



              </div>



            </form>



          </div>



        </div>



      )}




      {/* ── Receipt Lightbox Modal ─────────────────────────────────────────── */}
      {viewingReceiptBooking && (() => {
        const receiptSrc = viewingReceiptBooking.receiptUrl || viewingReceiptBooking.receiptImageUri || '';
        // Determine what kind of receipt data we have
        const isBase64    = receiptSrc.startsWith('data:');          // Base64 data URI from Android
        const isHttpUrl   = receiptSrc.startsWith('http');            // Firebase Storage or CDN URL
        const isContentUri = receiptSrc.startsWith('content://');     // Local Android device URI
        const hasReceipt  = isBase64 || isHttpUrl || isContentUri;

        return (
          <div
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setViewingReceiptBooking(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* ── Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <div className="min-w-0">
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">Payment Receipt — {viewingReceiptBooking.userName}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                    <span className="font-mono">{viewingReceiptBooking.bookingId}</span>
                    {' · '}UTR: <span className="font-mono font-black text-amber-700">{viewingReceiptBooking.paymentRefNumber || '—'}</span>
                    {' · '}₹{viewingReceiptBooking.amountPaid || 50}
                  </p>
                </div>
                <button
                  onClick={() => setViewingReceiptBooking(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors shrink-0 ml-2"
                >✕</button>
              </div>

              {/* ── Receipt Image Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {(isBase64 || isHttpUrl) ? (
                  /* ✅ Base64 data URI or HTTP URL — renders directly in browser */
                  <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                    <img
                      src={receiptSrc}
                      alt="Payment Receipt uploaded by student"
                      className="w-full max-h-[60vh] object-contain rounded-2xl"
                      onError={e => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const fallback = img.parentElement?.querySelector('.receipt-fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                    <div className="receipt-fallback hidden text-center py-8 text-sm text-slate-500 space-y-2">
                      <Receipt className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="font-semibold">Image could not be loaded</p>
                      <p className="text-xs text-slate-400">The data may be corrupted or the URL has expired.</p>
                    </div>
                  </div>
                ) : isContentUri ? (
                  /* ⚠️ Local Android device URI — can't load in browser */
                  <div className="text-center py-10 space-y-3 bg-amber-50 rounded-2xl border border-amber-200 px-6">
                    <Receipt className="w-14 h-14 mx-auto text-amber-400" />
                    <p className="text-sm font-black text-amber-800">Local Android Device URI</p>
                    <p className="text-xs font-mono text-slate-600 bg-white rounded-xl p-3 break-all border border-amber-200">{receiptSrc}</p>
                    <p className="text-xs text-amber-700 font-semibold">
                      This URI points to a file on the student's device and cannot be displayed in a web browser.
                      The student needs to update their app — newer versions upload to Firebase Storage and share a public URL.
                    </p>
                  </div>
                ) : (
                  /* ❌ No receipt at all */
                  <div className="text-center py-10 space-y-3">
                    <Receipt className="w-14 h-14 mx-auto text-slate-300" />
                    <p className="text-sm font-black text-slate-500">No Receipt Image Uploaded</p>
                    <p className="text-xs text-slate-400">The student submitted only a UTR reference number without attaching a screenshot.</p>
                  </div>
                )}
              </div>

              {/* ── Action Bar */}
              <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2 flex-wrap shrink-0 bg-slate-50/70">
                {/* Student Info chip */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white rounded-xl px-3 py-1.5 border border-slate-200 mr-auto">
                  <span>📅</span>
                  <span>{viewingReceiptBooking.selectedDate} · {viewingReceiptBooking.selectedTime}</span>
                </div>

                {/* Copy UTR */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(viewingReceiptBooking.paymentRefNumber || '');
                    setReceiptCopied(true);
                    setTimeout(() => setReceiptCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-black border border-amber-200 cursor-pointer transition-colors"
                >
                  {receiptCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{receiptCopied ? 'Copied!' : 'Copy UTR'}</span>
                </button>

                {/* Download — only for HTTP URLs */}
                {isHttpUrl && (
                  <a
                    href={receiptSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-black border border-indigo-200 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}

                {/* Save Base64 as file */}
                {isBase64 && (
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = receiptSrc;
                      a.download = `receipt_${viewingReceiptBooking.bookingId}.jpg`;
                      a.click();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save Receipt</span>
                  </button>
                )}

                <button
                  onClick={() => setViewingReceiptBooking(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black cursor-pointer transition-colors"
                >✕ Close</button>
              </div>
            </div>
          </div>
        );
      })()}    </div>



  );



};



