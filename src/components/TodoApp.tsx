// Redesigned TodoApp.tsx with full polished UI and UX
import { useEffect, useState } from 'react';
import TaskCard from './TaskCard';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

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
    <div className={`${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-black'} min-h-screen transition duration-300 px-4 py-6`}>      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold">📝 To-do List</h1>
          <div className="flex items-center gap-2">
            <button className="text-blue-500 underline" onClick={async () => { await supabase.auth.signOut(); location.reload(); }}>Logout</button>
            <button onClick={() => setDarkMode(!darkMode)} className="text-xl px-2 py-1 rounded transition">
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>

        {/* Task Input */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col md:flex-row gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="What do you need to do?"
            className="flex-1 px-4 py-2 rounded border focus:outline-none"
          />
          <select value={priority} onChange={e => setPriority(e.target.value as any)} className="px-2 py-2 rounded border">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="px-2 py-2 rounded border"
          />
          <button onClick={addTask} className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded shadow">Add</button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="border px-2 py-1 rounded">
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={filterDueToday} onChange={e => setFilterDueToday(e.target.checked)} />
            Due Today
          </label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="border px-2 py-1 rounded">
            <option value="created_at">Created</option>
            <option value="due_date">Due Date</option>
          </select>
          <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="border px-2 py-1 rounded">
            {sortOrder === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
          </button>
        </div>

        {/* Task Lists */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-2">🕒 Pending</h2>
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
            {filterAndSort(false).length === 0 && <p className="text-gray-600">No pending tasks</p>}
          </div>
{/* Progress Container */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
  <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded shadow">
    <p className="text-sm text-gray-600 dark:text-gray-300">Total Tasks</p>
    <h3 className="text-2xl font-bold">{tasks.length}</h3>
  </div>
  <div className="bg-blue-200 dark:bg-blue-800 p-4 rounded shadow">
    <p className="text-sm text-blue-900 dark:text-blue-200">Pending</p>
    <h3 className="text-2xl font-bold">{filterAndSort(false).length}</h3>
  </div>
  <div className="bg-green-200 dark:bg-green-800 p-4 rounded shadow">
    <p className="text-sm text-green-900 dark:text-green-200">Completed</p>
    <h3 className="text-2xl font-bold">{filterAndSort(true).length}</h3>
  </div>
</div>

          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-2">✅ Completed</h2>
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
            {filterAndSort(true).length === 0 && <p className="text-gray-600">No completed tasks</p>}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-80">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete this task?</h3>
            <p className="mb-4">"{taskToDelete.text}"</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={confirmDeleteTask} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
