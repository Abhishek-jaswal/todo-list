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

// ---------- Icons ----------
const Icon = {
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  SortAsc: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  SortDesc: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  Clock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Check: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Filter: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  ),
};

export default function TodoApp() {
  const { user, logout } = useAuth();

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

  /* ---- FETCH ---- */
  useEffect(() => {
    if (!user) return;
    pb.collection('tasks').getFullList<Task>({ sort: '-created', filter: `user="${user.id}"` })
      .then(setTasks);
  }, [user]);

  /* ---- CRUD ---- */
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

  /* ---- HELPERS ---- */
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

  /* ---- UI ---- */
  return (
    <div style={{ minHeight: '100vh', background: '#08090f', fontFamily: "'DM Sans', sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        input, select, button { font-family: 'DM Sans', sans-serif; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.4); cursor: pointer; }
        .hover-lift:hover { transform: translateY(-1px); }
        @media (max-width: 640px) {
          .add-grid { grid-template-columns: 1fr !important; }
          .filter-row { flex-wrap: wrap; }
        }
      `}</style>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,59,250,0.12) 0%, transparent 70%)', top: -150, left: -150 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', bottom: -100, right: -100 }} />
      </div>

      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,9,15,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 20px',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6c3bfa,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>TaskFlow</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user?.avatar && (
              <img src={user.avatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid rgba(108,59,250,0.5)' }} />
            )}
            <button
              onClick={logout}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.82rem', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Icon.Logout /> Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 100px', position: 'relative', zIndex: 1 }}>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total', value: tasks.length, color: '#6c3bfa' },
            { label: 'Pending', value: tasks.filter(t => !t.completed).length, color: '#f59e0b' },
            { label: 'Done', value: tasks.filter(t => t.completed).length, color: '#22c55e' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '16px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ADD TASK PANEL */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 16 }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(108,59,250,0.3)',
                borderRadius: 16, padding: '20px',
              }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>New Task</p>
                <div className="add-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10 }}>
                  <input
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    placeholder="What needs to be done?"
                    autoFocus
                    style={{
                      padding: '10px 14px', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'white', fontSize: '0.92rem', outline: 'none',
                    }}
                  />
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    style={{
                      padding: '10px 12px', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'white', fontSize: '0.88rem', outline: 'none',
                    }}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    style={{
                      padding: '10px 12px', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'white', fontSize: '0.88rem', outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => setAdding(false)}
                    style={{
                      padding: '9px 18px', borderRadius: 10, fontSize: '0.88rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                    }}
                  >Cancel</button>
                  <button
                    onClick={addTask}
                    style={{
                      padding: '9px 22px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600,
                      border: 'none',
                      background: 'linear-gradient(135deg, #6c3bfa, #2563eb)',
                      color: 'white', cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(108,59,250,0.35)',
                    }}
                  >Add Task</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOOLBAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', borderRadius: 12, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            flex: '0 0 auto',
          }}>
            {(['pending', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px', fontSize: '0.83rem', fontWeight: 500, cursor: 'pointer',
                  border: 'none',
                  background: activeTab === tab ? 'rgba(108,59,250,0.7)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {tab === 'pending' ? <Icon.Clock /> : <Icon.Check />}
                {tab === 'pending' ? `Pending (${pending.length})` : `Done (${completed.length})`}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
            <Icon.Filter />
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              style={selectStyle}
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterDueToday} onChange={e => setFilterDueToday(e.target.checked)} />
              Today
            </label>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={selectStyle}
            >
              <option value="created">Created</option>
              <option value="due_date">Due Date</option>
            </select>

            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              style={{ ...selectStyle, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.2)' }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{activeTab === 'pending' ? '✨' : '🎉'}</div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700 }}>
                {activeTab === 'pending' ? 'No pending tasks' : 'Nothing completed yet'}
              </p>
              <p style={{ fontSize: '0.83rem', marginTop: 4 }}>
                {activeTab === 'pending' ? 'Hit + to add your first task' : 'Complete some tasks to see them here'}
              </p>
            </motion.div>
          ) : (
            displayed.map(task => (
              <TaskCard
                key={task.id}
                task={task}
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
      <button
        onClick={() => setAdding(a => !a)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 100,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6c3bfa, #2563eb)',
          border: 'none', color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(108,59,250,0.5)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: adding ? 'rotate(45deg)' : 'rotate(0)',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(108,59,250,0.7)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(108,59,250,0.5)'}
      >
        <Icon.Plus />
      </button>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {taskToDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20,
            }}
            onClick={() => setTaskToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#131420', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: '28px 28px', width: '100%', maxWidth: 380,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>Delete task?</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', marginBottom: 24, lineHeight: 1.5 }}>
                "<span style={{ color: 'rgba(255,255,255,0.7)' }}>{taskToDelete.text}</span>" will be permanently removed.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setTaskToDelete(null)}
                  style={{
                    padding: '10px 20px', borderRadius: 12, fontSize: '0.88rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                  }}
                >Cancel</button>
                <button
                  onClick={confirmDeleteTask}
                  style={{
                    padding: '10px 24px', borderRadius: 12, fontSize: '0.88rem', fontWeight: 600,
                    border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                  }}
                >Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '7px 12px', borderRadius: 10, fontSize: '0.82rem',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.04)',
  color: 'rgba(255,255,255,0.6)', outline: 'none',
};
