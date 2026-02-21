import { useEffect, useState } from 'react';
import TaskCard from './TaskCard';
import { pb } from '../lib/pocketbase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'Low' | 'Medium' | 'High';
  due_date?: string;
  created?: string;
  user?: string;
};

// ---- Icons ----
const Icon = {
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Sun: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  Clock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Filter: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  ),
  SortAsc: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  SortDesc: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  ),
};

export default function TodoApp() {
  const { user, logout } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterDueToday, setFilterDueToday] = useState(false);
  const [sortBy, setSortBy] = useState<'created' | 'due_date'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [adding, setAdding] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    if (!user) return;
    pb.collection('tasks').getFullList<Task>({ sort: '-created', filter: `user="${user.id}"` })
      .then(setTasks);
  }, [user]);

  const addTask = async () => {
    if (!newTask.trim() || !user) return;
    const task = await pb.collection('tasks').create<Task>({
      text: newTask, completed: false, priority,
      due_date: dueDate || null, user: user.id,
    });
    setTasks(prev => [...prev, task]);
    setNewTask(''); setPriority('Medium'); setDueDate('');
    setAdding(false);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = await pb.collection('tasks').update<Task>(id, updates);
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    await pb.collection('tasks').delete(taskToDelete.id);
    setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
    setTaskToDelete(null);
  };

  const isDueToday = (date?: string) =>
    !!date && date === new Date().toISOString().split('T')[0];

  const filterAndSort = (completed: boolean) =>
    [...tasks]
      .filter(t => t.completed === completed)
      .filter(t => filterPriority === 'All' || t.priority === filterPriority)
      .filter(t => !filterDueToday || isDueToday(t.due_date))
      .sort((a, b) => {
        const aV = a[sortBy] || ''; const bV = b[sortBy] || '';
        return sortOrder === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
      });

  const pending = filterAndSort(false);
  const completed = filterAndSort(true);
  const displayed = activeTab === 'pending' ? pending : completed;

  // ---- Theme tokens ----
  const t = {
    bg: isDark ? '#0c0d14' : '#f5f5f7',
    surface: isDark ? '#13141f' : '#ffffff',
    surfaceHover: isDark ? '#1a1b2a' : '#f0f0f5',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
    borderFocus: isDark ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.5)',
    text: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(10,10,20,0.9)',
    textMuted: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(10,10,20,0.4)',
    accent: '#6366f1',
    accentGlow: isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.2)',
    headerBg: isDark ? 'rgba(12,13,20,0.85)' : 'rgba(245,245,247,0.85)',
    inputBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    selectBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    glowPurple: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
    glowBlue: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
  };

  const selectStyle: React.CSSProperties = {
    padding: '7px 11px', borderRadius: '10px', fontSize: '0.8rem',
    border: `1px solid ${t.border}`,
    background: t.selectBg,
    color: t.textMuted,
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      fontFamily: "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif",
      color: t.text,
      transition: 'background 0.3s ease, color 0.3s ease',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}; border-radius: 4px; }
        input, select, button, textarea { font-family: 'DM Sans', system-ui, sans-serif; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: ${isDark ? 'invert(1) opacity(0.35)' : 'opacity(0.45)'};
          cursor: pointer;
        }
        select option { background: ${isDark ? '#1a1b2a' : '#ffffff'}; color: ${t.text}; }
        @media (max-width: 640px) {
          .add-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Ambient background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: `radial-gradient(circle, ${t.glowPurple} 0%, transparent 70%)`,
          top: -200, left: -200, transition: 'all 0.5s ease',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: `radial-gradient(circle, ${t.glowBlue} 0%, transparent 70%)`,
          bottom: -150, right: -150, transition: 'all 0.5s ease',
        }} />
      </div>

      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: t.headerBg,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.border}`,
        padding: '0 24px',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <div style={{
          maxWidth: 740, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 58,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${t.accentGlow}`,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '-0.03em',
              color: t.text,
            }}>
              TaskFlow
            </span>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              style={{
                width: 34, height: 34, borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.inputBg,
                color: t.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = t.borderFocus;
                e.currentTarget.style.color = t.accent;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = t.border;
                e.currentTarget.style.color = t.textMuted;
              }}
            >
              {isDark ? <Icon.Sun /> : <Icon.Moon />}
            </button>

            {/* User avatar */}
            {user?.profile && (
              <img
                src={user.profile}
                alt=""
                style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${t.border}` }}
              />
            )}



            {/* Logout */}
            <button
              onClick={logout}
              title="Sign out"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 13px', borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.inputBg,
                color: t.textMuted,
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(244,63,94,0.4)';
                e.currentTarget.style.color = '#f43f5e';
                e.currentTarget.style.background = 'rgba(244,63,94,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = t.border;
                e.currentTarget.style.color = t.textMuted;
                e.currentTarget.style.background = t.inputBg;
              }}
            >
              <Icon.Logout /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ maxWidth: 740, margin: '0 auto', padding: '32px 24px 120px', position: 'relative', zIndex: 1 }}>

        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2rem)',
            letterSpacing: '-0.04em',
            color: t.text,
            lineHeight: 1.1,
          }}>
            My Tasks
          </h1>
          <p style={{ marginTop: 6, fontSize: '0.85rem', color: t.textMuted }}>
            {pending.length} pending · {completed.length} completed
          </p>
        </div>

        {/* ADD TASK PANEL */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                background: t.surface,
                border: `1px solid ${inputFocused ? t.borderFocus : t.border}`,
                borderRadius: 18,
                padding: '20px',
                boxShadow: isDark
                  ? '0 8px 40px rgba(0,0,0,0.35)'
                  : '0 8px 40px rgba(0,0,0,0.08)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}>
                <input
                  placeholder="What needs to be done?"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 450,
                    color: t.text,
                    marginBottom: 16,
                    letterSpacing: '-0.01em',
                  }}
                />

                <div
                  className="add-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr auto',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  {/* Priority */}
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: t.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as any)} style={{ ...selectStyle, width: '100%' }}>
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </div>

                  {/* Due date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: t.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Due date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      style={{ ...selectStyle, width: '100%' }}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
                    <button
                      onClick={() => setAdding(false)}
                      style={{
                        padding: '8px 14px', borderRadius: 10, fontSize: '0.82rem',
                        border: `1px solid ${t.border}`,
                        background: 'transparent', color: t.textMuted, cursor: 'pointer',
                        transition: 'all 0.15s',
                        fontFamily: 'inherit',
                      }}
                    >Cancel</button>
                    <button
                      onClick={addTask}
                      disabled={!newTask.trim()}
                      style={{
                        padding: '8px 18px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
                        border: 'none',
                        background: newTask.trim()
                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                        color: newTask.trim() ? 'white' : t.textMuted,
                        cursor: newTask.trim() ? 'pointer' : 'not-allowed',
                        boxShadow: newTask.trim() ? `0 4px 16px ${t.accentGlow}` : 'none',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                      }}
                    >Add task</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOOLBAR */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 18, flexWrap: 'wrap',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'inline-flex',
            borderRadius: 11, overflow: 'hidden',
            border: `1px solid ${t.border}`,
            background: t.inputBg,
          }}>
            {(['pending', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 14px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                  border: 'none',
                  background: activeTab === tab
                    ? isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)'
                    : 'transparent',
                  color: activeTab === tab ? '#818cf8' : t.textMuted,
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: 'inherit',
                  borderRight: tab === 'pending' ? `1px solid ${t.border}` : 'none',
                }}
              >
                {tab === 'pending' ? <Icon.Clock /> : <Icon.Check />}
                {tab === 'pending' ? `Pending` : `Done`}
                <span style={{
                  background: activeTab === tab
                    ? isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)'
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  color: activeTab === tab ? '#818cf8' : t.textMuted,
                  borderRadius: 6, padding: '0 6px', fontSize: '0.72rem', fontWeight: 600,
                }}>
                  {tab === 'pending' ? pending.length : completed.length}
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: t.border, flexShrink: 0 }} />

          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: t.textMuted }}><Icon.Filter /></span>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={selectStyle}>
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <label style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: '0.8rem', color: t.textMuted, cursor: 'pointer',
              padding: '7px 11px', borderRadius: 10,
              border: `1px solid ${filterDueToday ? t.borderFocus : t.border}`,
              background: filterDueToday ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)') : t.inputBg,
              transition: 'all 0.2s',
              userSelect: 'none',
            }}>
              <input
                type="checkbox"
                checked={filterDueToday}
                onChange={e => setFilterDueToday(e.target.checked)}
                style={{ display: 'none' }}
              />
              Today
            </label>

            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={selectStyle}>
              <option value="created">Created</option>
              <option value="due_date">Due date</option>
            </select>

            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              style={{
                ...selectStyle, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
              }}
            >
              {sortOrder === 'asc' ? <Icon.SortAsc /> : <Icon.SortDesc />}
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>

        {/* TASK LIST */}
        <AnimatePresence mode="popLayout">
          {displayed.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center', padding: '64px 24px',
                color: t.textMuted,
                background: t.surface,
                borderRadius: 20,
                border: `1px solid ${t.border}`,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 14, filter: 'grayscale(0.3)' }}>
                {activeTab === 'pending' ? '✨' : '🎉'}
              </div>
              <p style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '1rem', fontWeight: 700,
                color: t.text, marginBottom: 6,
              }}>
                {activeTab === 'pending' ? 'All clear!' : 'Nothing here yet'}
              </p>
              <p style={{ fontSize: '0.83rem', color: t.textMuted, lineHeight: 1.6 }}>
                {activeTab === 'pending'
                  ? 'Tap the + button to add your first task'
                  : 'Complete some tasks to see them here'}
              </p>
            </motion.div>
          ) : (
            displayed.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isDark={isDark}
                isCompleted={activeTab === 'completed'}
                onComplete={() => updateTask(task.id, { completed: !task.completed })}
                onDelete={() => setTaskToDelete(task)}
                onEdit={text => updateTask(task.id, { text })}
              />
            ))
          )}
        </AnimatePresence>
      </main>

      {/* FAB */}
      <motion.button
        onClick={() => setAdding(a => !a)}
        animate={{ rotate: adding ? 45 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 100,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          border: 'none', color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 24px ${t.accentGlow}`,
          transition: 'box-shadow 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = `0 10px 36px rgba(99,102,241,0.55)`}
        onMouseLeave={e => e.currentTarget.style.boxShadow = `0 6px 24px ${t.accentGlow}`}
      >
        <Icon.Plus />
      </motion.button>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {taskToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 200, padding: 24,
            }}
            onClick={() => setTaskToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 20,
                padding: '28px',
                width: '100%', maxWidth: 380,
                boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.6)' : '0 24px 80px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(244,63,94,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
                border: '1px solid rgba(244,63,94,0.2)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </div>
              <h3 style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800, fontSize: '1.05rem',
                marginBottom: 8, color: t.text,
                letterSpacing: '-0.02em',
              }}>Delete task?</h3>
              <p style={{ color: t.textMuted, fontSize: '0.86rem', marginBottom: 24, lineHeight: 1.6 }}>
                "<span style={{ color: t.text }}>{taskToDelete.text}</span>" will be permanently removed.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setTaskToDelete(null)}
                  style={{
                    padding: '9px 18px', borderRadius: 11, fontSize: '0.84rem',
                    border: `1px solid ${t.border}`,
                    background: 'transparent', color: t.textMuted, cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >Cancel</button>
                <button
                  onClick={confirmDeleteTask}
                  style={{
                    padding: '9px 22px', borderRadius: 11, fontSize: '0.84rem', fontWeight: 600,
                    border: 'none',
                    background: '#f43f5e', color: 'white', cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(244,63,94,0.3)',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e02d4e'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f43f5e'}
                >Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
