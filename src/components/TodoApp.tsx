import { useEffect, useState } from 'react';
import TaskCard from './TaskCard';
import { pb } from '../lib/pocketbase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaPlus,
  FaSortAmountDown,
  FaSortAmountUp,
} from 'react-icons/fa';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'Low' | 'Medium' | 'High';
  due_date?: string;
  created?: string;
  user?: string;
};

export default function TodoApp() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const [filterPriority, setFilterPriority] = useState('All');
  const [filterDueToday, setFilterDueToday] = useState(false);
  const [sortBy, setSortBy] = useState<'created' | 'due_date'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  /* ---------------- FETCH TASKS ---------------- */
  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      const records = await pb.collection('tasks').getFullList<Task>({
        sort: '-created',
        filter: `user="${user.id}"`,
      });
      setTasks(records);
    };

    fetchTasks();
  }, [user]);

  /* ---------------- CRUD ---------------- */

  const addTask = async () => {
    if (!newTask.trim() || !user) return;

    const task = await pb.collection('tasks').create<Task>({
      text: newTask,
      completed: false,
      priority,
      due_date: dueDate || null,
      user: user.id,
    });

    setTasks(prev => [...prev, task]);
    setNewTask('');
    setPriority('Medium');
    setDueDate('');
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

  /* ---------------- HELPERS ---------------- */

  const isDueToday = (date?: string) => {
    if (!date) return false;
    return date === new Date().toISOString().split('T')[0];
  };

  const sortTasks = (list: Task[]) => {
    return [...list].sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  };

  const filterAndSort = (completed: boolean) =>
    sortTasks(
      tasks
        .filter(t => t.completed === completed)
        .filter(t => filterPriority === 'All' || t.priority === filterPriority)
        .filter(t => !filterDueToday || isDueToday(t.due_date))
    );

  /* ---------------- UI ---------------- */

  return (
    <div
      className={`${
        darkMode
          ? 'bg-gray-100 text-black'
          : 'bg-gradient-to-br from-gray-900 to-gray-950 text-white'
      } min-h-screen transition`}
    >
      {/* HEADER */}
      <header className="bg-indigo-600 shadow py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-3xl font-bold flex gap-2">📝 To-do List</h1>

        <div className="flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 underline"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* ADD TASK */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow grid md:grid-cols-5 gap-4">
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Add a new task..."
              className="md:col-span-2 px-4 py-2 bg-gray-700 rounded"
            />

            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="px-4 py-2 rounded bg-gray-700"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="px-4 py-2 rounded bg-gray-700"
            />

            <button
              onClick={addTask}
              className="bg-indigo-500 hover:bg-indigo-600 rounded flex items-center gap-2 justify-center"
            >
              <FaPlus /> Add
            </button>
          </div>
        </motion.div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 my-6">
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded bg-gray-700"
          >
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filterDueToday}
              onChange={e => setFilterDueToday(e.target.checked)}
            />
            Due Today
          </label>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded bg-gray-700"
          >
            <option value="created">Created</option>
            <option value="due_date">Due Date</option>
          </select>

          <button
            onClick={() =>
              setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
            }
            className="px-3 py-2 rounded bg-gray-700 flex items-center gap-2"
          >
            {sortOrder === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
          </button>
        </div>

        {/* LISTS */}
        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-gray-800 p-4 rounded">
            <h2 className="text-xl mb-4">🕒 Pending</h2>
            {filterAndSort(false).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={() =>
                  updateTask(task.id, { completed: true })
                }
                onDelete={() => setTaskToDelete(task)}
                onEdit={text => updateTask(task.id, { text })}
              />
            ))}
          </section>

          <section className="bg-white dark:bg-gray-800 p-4 rounded">
            <h2 className="text-xl mb-4">✅ Completed</h2>
            {filterAndSort(true).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted
                onComplete={() =>
                  updateTask(task.id, { completed: false })
                }
                onDelete={() => setTaskToDelete(task)}
                onEdit={text => updateTask(task.id, { text })}
              />
            ))}
          </section>
        </div>
      </main>

      {/* DELETE MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="font-bold mb-4">
              Delete “{taskToDelete.text}”?
            </h3>
            <div className="flex justify-end gap-3">
              <button onClick={() => setTaskToDelete(null)}>Cancel</button>
              <button
                onClick={confirmDeleteTask}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
