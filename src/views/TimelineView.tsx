import React, { useState } from 'react';
import {
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Sparkles,
  Calendar,
  Filter,
  Loader2,
} from 'lucide-react';
import { EventPlan, Task, TaskPriority, TaskStatus, TimelinePhase } from '../types';
import { calculateTaskStats, formatDate } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { planNext7DaysWithAI } from '../services/gemini';
import confetti from 'canvas-confetti';

interface TimelineViewProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ event, onUpdateEvent }) => {
  const { showToast } = useToast();
  const stats = calculateTaskStats(event);

  // View Mode: Milestone Phases vs Event-Day Run-of-Show
  const [activeMode, setActiveMode] = useState<'roadmap' | 'runofshow'>('roadmap');

  // Dynamically extract distinct phases from the event's actual tasks
  const distinctPhases = Array.from(new Set(event.timeline.map((t) => t.phase))).filter(Boolean);
  const activePhases = distinctPhases.length > 0
    ? distinctPhases
    : ['6 months before', '3 months before', '1 month before', '2 weeks before', '1 week before', '3 days before', 'Event day'];

  // Filters
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Run of Show Add Modal
  const [isRosModalOpen, setIsRosModalOpen] = useState(false);
  const [rosTime, setRosTime] = useState('');
  const [rosTitle, setRosTitle] = useState('');
  const [rosDesc, setRosDesc] = useState('');
  const [rosLead, setRosLead] = useState('');

  // Task form state
  const [taskName, setTaskName] = useState('');
  const [taskPhase, setTaskPhase] = useState<TimelinePhase>(activePhases[0] || '1 month before');
  const [taskDeadline, setTaskDeadline] = useState(event.date);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('pending');
  const [taskCategory, setTaskCategory] = useState('General');

  // 7-day planner modal
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [sprintResult, setSprintResult] = useState<{
    summary: string;
    dailyPlan: { day: string; title: string; tasks: string[]; priority: 'high' | 'medium' | 'low'; reason: string }[];
  } | null>(null);

  const openAddModal = (presetPhase?: TimelinePhase) => {
    setEditingTask(null);
    setTaskName('');
    setTaskPhase(presetPhase || activePhases[0] || '1 month before');
    setTaskDeadline(event.date);
    setTaskPriority('medium');
    setTaskStatus('pending');
    setTaskCategory('General');
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskName(task.name);
    setTaskPhase(task.phase);
    setTaskDeadline(task.deadline);
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskCategory(task.category || 'General');
    setIsTaskModalOpen(true);
  };

  const handleToggleStatus = (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === 'completed' ? 'pending' : 'completed';

    if (nextStatus === 'completed') {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // Safe fallback
      }
    }

    const updatedTimeline = event.timeline.map((t) =>
      t.id === task.id ? { ...t, status: nextStatus } : t
    );

    onUpdateEvent({
      ...event,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString(),
    });

    showToast(
      nextStatus === 'completed' ? `Completed: "${task.name}"` : `Marked pending: "${task.name}"`,
      'info'
    );
  };

  const handleToggleRosItem = (id: string) => {
    const rosList = event.runOfShow || [];
    const target = rosList.find((r) => r.id === id);
    const updatedRos = rosList.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );

    if (target && !target.completed) {
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      } catch {}
    }

    onUpdateEvent({
      ...event,
      runOfShow: updatedRos,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveRosItem = () => {
    if (!rosTime.trim() || !rosTitle.trim()) {
      showToast('Please enter both a time and a title for the schedule milestone', 'error');
      return;
    }
    const newItem = {
      id: `ros-${Date.now()}`,
      time: rosTime.trim(),
      title: rosTitle.trim(),
      description: rosDesc.trim(),
      leadPerson: rosLead.trim() || undefined,
      completed: false,
    };
    onUpdateEvent({
      ...event,
      runOfShow: [...(event.runOfShow || []), newItem],
      updatedAt: new Date().toISOString(),
    });
    setIsRosModalOpen(false);
    setRosTime('');
    setRosTitle('');
    setRosDesc('');
    setRosLead('');
    showToast('Event-day schedule item added!', 'success');
  };

  const handleDeleteRosItem = (id: string) => {
    const updated = (event.runOfShow || []).filter((r) => r.id !== id);
    onUpdateEvent({
      ...event,
      runOfShow: updated,
      updatedAt: new Date().toISOString(),
    });
    showToast('Schedule item removed', 'info');
  };

  const handleSaveTask = () => {
    if (!taskName.trim()) {
      showToast('Please enter a task name', 'error');
      return;
    }

    let updatedTimeline: Task[];
    if (editingTask) {
      updatedTimeline = event.timeline.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              name: taskName,
              phase: taskPhase,
              deadline: taskDeadline,
              priority: taskPriority,
              status: taskStatus,
              category: taskCategory,
            }
          : t
      );
      showToast('Task updated!', 'success');
    } else {
      const newTask: Task = {
        id: `t-${Date.now()}`,
        name: taskName,
        phase: taskPhase,
        deadline: taskDeadline,
        priority: taskPriority,
        status: taskStatus,
        category: taskCategory,
      };
      updatedTimeline = [...event.timeline, newTask];
      showToast('New task added to timeline!', 'success');
    }

    onUpdateEvent({
      ...event,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString(),
    });

    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    const updated = event.timeline.filter((t) => t.id !== id);
    onUpdateEvent({
      ...event,
      timeline: updated,
      updatedAt: new Date().toISOString(),
    });
    showToast('Task removed from timeline', 'info');
  };

  const handlePlan7Days = async () => {
    setIsPlannerOpen(true);
    setIsPlanning(true);
    try {
      const plan = await planNext7DaysWithAI(event);
      setSprintResult(plan);
    } catch (err) {
      console.error(err);
      showToast('Failed to generate 7-day plan', 'error');
    } finally {
      setIsPlanning(false);
    }
  };

  // Filter tasks
  const filteredTasks = event.timeline.filter((t) => {
    if (selectedPhase !== 'all' && t.phase !== selectedPhase) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Execution Schedule
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Event Timeline & Milestones
          </h2>
          <p className="text-xs text-slate-500">
            Phase-by-phase action roadmap from planning kickoff to event day
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePlan7Days}
            className="px-4 py-2.5 bg-gradient-to-r from-royal-600 to-brand-600 hover:from-royal-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Plan My Next 7 Days</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher: Milestone Roadmap vs Event-Day Run-of-Show */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveMode('roadmap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'roadmap'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Milestone Roadmap ({stats.total} Tasks)</span>
        </button>
        <button
          onClick={() => setActiveMode('runofshow')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'runofshow'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Event-Day Run of Show ({(event.runOfShow || []).length} Milestones)</span>
        </button>
      </div>

      {activeMode === 'roadmap' ? (
        <>
          {/* Progress Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Overall Timeline Progress: {stats.progressPercent}%
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {stats.completed} of {stats.total} tasks completed • {stats.pending} remaining
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {stats.completed} Done
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {stats.inProgress} In Progress
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {stats.pending} Pending
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-500 via-purple-500 to-royal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Phase Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedPhase('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedPhase === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Phases ({event.timeline.length})
              </button>

              {activePhases.map((phase) => {
                const count = event.timeline.filter((t) => t.phase === phase).length;
                const isSelected = selectedPhase === phase;

                return (
                  <button
                    key={phase}
                    onClick={() => setSelectedPhase(phase)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {phase} ({count})
                  </button>
                );
              })}
            </div>

            {/* Status Dropdown Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Only</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed Only</option>
              </select>
            </div>
          </div>

          {/* Tasks List grouped by phase or active filter */}
          <div className="space-y-6">
            {(selectedPhase === 'all' ? activePhases : [selectedPhase as TimelinePhase]).map((phase) => {
              const phaseTasks = filteredTasks.filter((t) => t.phase === phase);
              if (phaseTasks.length === 0 && selectedPhase === 'all') return null;

              return (
                <div
                  key={phase}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
                >
                  <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                      <h3 className="font-bold text-sm text-slate-900">{phase}</h3>
                      <span className="text-xs text-slate-400">
                        ({phaseTasks.filter((t) => t.status === 'completed').length}/{phaseTasks.length} done)
                      </span>
                    </div>
                    <button
                      onClick={() => openAddModal(phase)}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700"
                    >
                      + Add to {phase}
                    </button>
                  </div>

                  {phaseTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No tasks under this milestone yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {phaseTasks.map((task) => {
                        const isDone = task.status === 'completed';
                        const priorityClass = {
                          high: 'text-rose-700 bg-rose-50 border-rose-200',
                          medium: 'text-amber-700 bg-amber-50 border-amber-200',
                          low: 'text-slate-600 bg-slate-100 border-slate-200',
                        }[task.priority];

                        return (
                          <div
                            key={task.id}
                            className={`p-4 sm:px-6 flex items-start gap-3.5 hover:bg-slate-50/60 transition-colors ${
                              isDone ? 'opacity-70 bg-slate-50/30' : ''
                            }`}
                          >
                            {/* Checkbox trigger */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(task)}
                              className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                              title={isDone ? 'Mark as pending' : 'Mark complete'}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>

                            {/* Task body */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-sm font-bold text-slate-900 ${
                                    isDone ? 'line-through text-slate-400' : ''
                                  }`}
                                >
                                  {task.name}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${priorityClass}`}
                                >
                                  {task.priority}
                                </span>
                                {task.category && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                                    {task.category}
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  Deadline: {task.deadline ? formatDate(task.deadline) : 'Flexible'}
                                </span>
                                <span>•</span>
                                <span className="capitalize font-medium">
                                  Status: {task.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit task"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Event-Day Run of Show Mode */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h3 className="font-extrabold text-base text-slate-900">Event-Day Run of Show</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Minute-by-minute execution cue sheet for coordinators, emcees, and vendor leads on the day of the event
              </p>
            </div>
            <button
              onClick={() => setIsRosModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Schedule Milestone</span>
            </button>
          </div>

          {(!event.runOfShow || event.runOfShow.length === 0) ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
              <Clock className="w-12 h-12 text-purple-300 mx-auto" />
              <h4 className="font-bold text-slate-800">No Run-of-Show Milestones Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add timed cues like guest arrival, ceremony start, cake cutting, dinner service, or wrap-up speeches.
              </p>
              <button
                onClick={() => setIsRosModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Milestone</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {event.runOfShow.map((item) => {
                const isDone = !!item.completed;
                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:px-6 flex items-start gap-4 hover:bg-slate-50/60 transition-colors ${
                      isDone ? 'opacity-70 bg-slate-50/30' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleRosItem(item.id)}
                      className="mt-1 text-slate-400 hover:text-purple-600 transition-colors shrink-0"
                      title={isDone ? 'Mark as pending' : 'Mark executed'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-purple-600 fill-purple-50" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="shrink-0 pt-0.5">
                      <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-mono font-bold text-xs">
                        {item.time}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-bold text-slate-900 ${
                            isDone ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.leadPerson && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                            Lead: {item.leadPerson}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center">
                      <button
                        onClick={() => handleDeleteRosItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={editingTask ? 'Edit Timeline Task' : 'Add New Task'}
        subtitle="Manage deadlines and priority for your milestone checklist"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Task Name / Action Item <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Finalize floral mandap and Gaye Holud stage decor"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Milestone Phase
              </label>
              <select
                value={taskPhase}
                onChange={(e) => setTaskPhase(e.target.value as TimelinePhase)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white cursor-pointer"
              >
                {activePhases.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Deadline Date
              </label>
              <input
                type="date"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white cursor-pointer"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Status
              </label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <input
                type="text"
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                placeholder="e.g., Decor, Venue"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTask}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {editingTask ? 'Save Updates' : 'Add Task'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Plan My Next 7 Days Modal */}
      <Modal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        title="AI 7-Day Sprint Action Plan"
        subtitle="Gemini prioritized execution schedule based on pending deadlines"
        maxWidth="xl"
      >
        {isPlanning ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-royal-600 animate-spin mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-900">Synthesizing 7-Day Sprint...</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Balancing vendor lead times, contract deadlines, and immediate prerequisites
              </p>
            </div>
          </div>
        ) : sprintResult ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-royal-50/70 border border-royal-100 text-xs text-royal-950 leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-royal-900">
                <Sparkles className="w-4 h-4 text-royal-600" /> Sprint Strategy
              </span>
              {sprintResult.summary}
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {sprintResult.dailyPlan.map((d, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-royal-900">{d.day}</span>
                    <span className="text-xs font-bold text-slate-800">{d.title}</span>
                  </div>

                  <ul className="space-y-1">
                    {d.tasks.map((t, ti) => (
                      <li key={ti} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-brand-600 font-bold">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                    💡 Why today: {d.reason}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPlannerOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Add Run-of-Show Milestone Modal */}
      <Modal
        isOpen={isRosModalOpen}
        onClose={() => setIsRosModalOpen(false)}
        title="Add Run-of-Show Milestone"
        subtitle="Schedule a minute-by-minute cue for event day operations"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Time / Cue <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={rosTime}
                onChange={(e) => setRosTime(e.target.value)}
                placeholder="e.g. 18:30 or 6:30 PM"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Milestone Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={rosTitle}
                onChange={(e) => setRosTitle(e.target.value)}
                placeholder="e.g. Cake cutting ceremony & photo session"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={rosDesc}
              onChange={(e) => setRosDesc(e.target.value)}
              placeholder="e.g. Dim ballroom lights, queue birthday track on PA, gather immediate family around the center table"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Lead Person / Coordinator
            </label>
            <input
              type="text"
              value={rosLead}
              onChange={(e) => setRosLead(e.target.value)}
              placeholder="e.g. Party Host, Emcee, Best Man, Tech Lead"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRosModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveRosItem}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Add to Schedule
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

