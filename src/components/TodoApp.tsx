// Polished, full-page UI for TodoApp with animations and vibrant theme
import { useEffect, useState } from 'react';
import TaskCard from './TaskCard';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaSignOutAlt, FaPlus, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';


export type Task = {
  id: number;
  text: string;
  completed: boolean;
  user_id?: string;
  created_at?: string;
  priority?: 'Low' | 'Medium' | 'High';
  due_date?: string;
};

export default function TodoApp() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterDueToday, setFilterDueToday] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      const { data, error } = await supabase.from('tasks').select('*').eq('user_id', user.id);
      if (error) console.error('Fetch error:', error.message);
      else setTasks(data || []);
    };
    fetchTasks();
  }, [user]);

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const { error } = await supabase.from('tasks').delete().eq('id', taskToDelete.id);
    if (!error) setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
    else console.error('Delete task error:', error.message);
    setTaskToDelete(null);
  };

  const addTask = async () => {
    if (!newTask.trim() || !user) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ text: newTask, completed: false, user_id: user.id, priority, due_date: dueDate }])
      .select()
      .single();
    if (!error && data) {
      setTasks(prev => [...prev, data]);
      setNewTask('');
      setPriority('Medium');
      setDueDate('');
    } else {
      console.error('Add task error:', error?.message);
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
    if (!error && data) setTasks(prev => prev.map(t => (t.id === id ? data : t)));
    else console.error('Update task error:', error?.message);
  };

  const isDueToday = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate === today;
  };

  const sortTasks = (list: Task[]) => {
    return [...list].sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  };

  const filterAndSort = (completed: boolean) => {
    return sortTasks(
      tasks.filter(t => t.completed === completed)
        .filter(t => filterPriority === 'All' || t.priority === filterPriority)
        .filter(t => !filterDueToday || isDueToday(t.due_date))
    );
  };

  return (
    <div className={`${darkMode ?  'bg-gray-300 to-white text-black': 'bg-gradient-to-br from-gray-900 to-gray-950 text-white'} min-h-screen transition duration-300`}>      
      <header className="bg-indigo-600 dark:bg-gray-900 shadow py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">📝 To-do List</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="text-xl px-2 py-1 rounded text-white">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); location.reload(); }}
            className="text-white underline flex items-center gap-1">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Add a new task..."
              className="md:col-span-2 px-4 py-2 bg-gray-700 rounded border focus:outline-none"
            />
            <select value={priority} onChange={e => setPriority(e.target.value as any)} className="px-4 py-2 rounded border bg-white dark:bg-gray-700">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="px-4 py-2 rounded border bg-white dark:bg-gray-700"
            />
            <button onClick={addTask} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2  rounded shadow flex items-center gap-2 transition-all duration-300">
              <FaPlus /> Add
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="border px-3 py-2 rounded bg-white dark:bg-gray-700">
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={filterDueToday} onChange={e => setFilterDueToday(e.target.checked)} />
              Due Today
            </label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="border px-3 py-2 rounded bg-white dark:bg-gray-700">
              <option value="created_at">Created</option>
              <option value="due_date">Due Date</option>
            </select>
            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="border px-3 py-2 rounded flex items-center gap-2 bg-white dark:bg-gray-700">
              {sortOrder === 'asc' ? <><FaSortAmountDown /> Asc</> : <><FaSortAmountUp /> Desc</>}
            </button>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-bold">Total Tasks</p>
                <h3 className="text-2xl font-bold">{tasks.length}</h3>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
                <p className="text-sm text-blue-500 font-bold">Pending</p>
                <h3 className="text-2xl font-bold">{filterAndSort(false).length}</h3>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
                <p className="text-sm text-green-700 font-bold">Completed</p>
                <h3 className="text-2xl font-bold">{filterAndSort(true).length}</h3>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span>Progress</span>
                <span>{tasks.length > 0 ? `${Math.round((filterAndSort(true).length / tasks.length) * 100)}%` : '0%'}</span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  className="bg-green-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: tasks.length > 0 ? `${(filterAndSort(true).length / tasks.length) * 100}%` : '0%' }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Task Lists */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🕒 Pending</h2>
            {filterAndSort(false).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={() => updateTask(task.id, { completed: true })}
                onDelete={() => setTaskToDelete(task)}
                onEdit={(text) => updateTask(task.id, { text })}
                onPriorityChange={(priority) => updateTask(task.id, { priority })}
                onDueDateChange={(date) => updateTask(task.id, { due_date: date })}
              />
            ))}
            {filterAndSort(false).length === 0 && <p className="text-gray-500">No pending tasks</p>}
          </motion.section>

          <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">✅ Completed</h2>
            {filterAndSort(true).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted
                onComplete={() => updateTask(task.id, { completed: false })}
                onDelete={() => setTaskToDelete(task)}
                onEdit={(text) => updateTask(task.id, { text })}
                onPriorityChange={(priority) => updateTask(task.id, { priority })}
                onDueDateChange={(date) => updateTask(task.id, { due_date: date })}
              />
            ))}
            {filterAndSort(true).length === 0 && <p className="text-gray-500">No completed tasks</p>}
          </motion.section>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Oops! Want to remove this task?</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">"{taskToDelete.text}"</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={confirmDeleteTask} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
