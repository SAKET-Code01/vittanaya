import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * ActionPlanPage — Step-by-Step Business Execution Roadmap
 */
export default function ActionPlanPage({ currentProfile: propProfile, onNavigateHome }) {
  const { currentProfile: contextProfile } = useWorkspace();
  const currentProfile = propProfile || contextProfile;

  const navigateBack = onNavigateHome || (() => window.history.back());

  const [tasks, setTasks] = useState([
    { id: 1, phase: 'Phase 1: Legal & Registration', title: 'Obtain Udyam MSME Registration Certificate', done: true, deadline: 'Day 3' },
    { id: 2, phase: 'Phase 1: Legal & Registration', title: 'Local Panchayat / Municipal Trade License NOC', done: true, deadline: 'Day 7' },
    { id: 3, phase: 'Phase 2: DPR & Banking', title: 'Finalize Bankable Detailed Project Report (DPR)', done: true, deadline: 'Day 12' },
    { id: 4, phase: 'Phase 2: DPR & Banking', title: 'Submit PMEGP Online Application via KVIC Portal', done: false, deadline: 'Day 18' },
    { id: 5, phase: 'Phase 3: Sanction & Margin', title: 'Bank Joint Site Inspection & In-Principle Sanction', done: false, deadline: 'Day 28' },
    { id: 6, phase: 'Phase 3: Sanction & Margin', title: 'Deposit 10% Promoter Margin Capital (₹1,00,000)', done: false, deadline: 'Day 35' },
    { id: 7, phase: 'Phase 4: Setup & Launch', title: 'Machinery Procurement & Installation on Site', done: false, deadline: 'Day 50' },
    { id: 8, phase: 'Phase 4: Setup & Launch', title: 'Trial Production Run & Commercial Billing Launch', done: false, deadline: 'Day 60' },
  ]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#607267] mb-1">
            <button
              type="button"
              onClick={navigateBack}
              className="hover:text-[#102A1E] transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-[#102A1E] font-bold">Action Plan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A211D] tracking-tight">
            60-Day Business Execution Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-[#607267] mt-0.5">
            Step-by-step milestone checklist from idea to commercial launch for {currentProfile?.name || 'Your Enterprise'}
          </p>
        </div>

        <button
          type="button"
          onClick={navigateBack}
          className="px-4 py-2 rounded-2xl bg-white border border-[#E8E2D5] text-xs font-bold text-[#1A211D] hover:bg-[#FAF7F2] transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>← Back to Dashboard</span>
        </button>
      </div>

      {/* 2. Progress Tracker Bar */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] p-6 shadow-card-soft space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#1A211D]">
              Execution Progress: {progressPct}% Completed
            </h2>
            <p className="text-xs text-[#607267]">
              {completedCount} of {tasks.length} critical milestones achieved
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#E8F1EC] text-[#2F7757] font-bold text-xs">
            On Track
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] overflow-hidden">
          <div
            className="h-full bg-[#2F7757] transition-all duration-500 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 3. Milestone Tasks List */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] p-6 shadow-card-soft space-y-3">
        <h2 className="text-base font-extrabold text-[#1A211D] mb-4">
          Milestone Checklist
        </h2>

        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                task.done
                  ? 'bg-[#F4F9F6] border-[#D2E3D8]'
                  : 'bg-[#FAF7F2] border-[#E8E2D5] hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                    task.done
                      ? 'bg-[#2F7757] border-[#2F7757] text-white'
                      : 'bg-white border-[#CCD6D0]'
                  }`}
                >
                  {task.done && <span>✓</span>}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#819388] uppercase">
                    {task.phase}
                  </p>
                  <p
                    className={`text-xs font-bold ${
                      task.done ? 'line-through text-[#607267]' : 'text-[#1A211D]'
                    }`}
                  >
                    {task.title}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-[#607267]">
                  {task.deadline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
