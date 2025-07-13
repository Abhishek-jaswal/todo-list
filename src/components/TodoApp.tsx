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

  // Filter & Sort
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterDueToday, setFilterDueToday] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (error) console.error('Fetch error:', error.message);
      else setTasks(data || []);
    };

    fetchTasks();
  }, [user]);

  const addTask = async () => {
    if (!newTask.trim() || !user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ text: newTask, completed: false, user_id: user.id, priority, due_date: dueDate }])
      .select()
      .single();

    if (error) {
      console.error('Add task error:', error.message);
      return;
    }

    setTasks(prev => [...prev, data]);
    setNewTask('');
    setPriority('Medium');
    setDueDate('');
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) console.error('Update task error:', error.message);
    else setTasks(prev => prev.map(t => (t.id === id ? data : t)));
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error('Delete task error:', error.message);
    else setTasks(prev => prev.filter(t => t.id !== id));
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
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  };

  const filterAndSort = (completed: boolean) => {
    return sortTasks(
      tasks.filter(t => t.completed === completed)
        .filter(t => (filterPriority === 'All' || t.priority === filterPriority))
        .filter(t => (!filterDueToday || isDueToday(t.due_date)))
    );
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} min-h-screen flex flex-col items-center justify-center px-4 py-6`}>
      <div className="flex justify-between items-center w-full max-w-4xl mb-6">
        <h1 className="text-3xl font-bold">Welcome to your To-do-List</h1>
        <div className="flex gap-4">
          <button className="underline text-blue-600" onClick={async () => { await supabase.auth.signOut(); location.reload(); }}>
            Logout
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="text-sm border px-2 py-1 rounded">
            {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-xl mb-6 gap-2">
        <input
          type="text"
          placeholder="Enter a task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          className="flex-1 border px-3 py-2 rounded bg-blue-100 focus:outline-none"
        />
        <select
          value={priority}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'Low' || value === 'Medium' || value === 'High') {
              setPriority(value);
            }
          }}
          className="border px-2 py-2 rounded"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="border px-2 py-2 rounded"
        />
        <button
          onClick={addTask}
          className="bg-sky-400 px-4 py-2 text-white font-semibold rounded"
        >
          Add
        </button>
      </div>

      <div className="w-full max-w-4xl flex flex-wrap gap-4 mb-6">
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={filterDueToday} onChange={e => setFilterDueToday(e.target.checked)} />
          Due Today
        </label>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'created_at' | 'due_date')}
          className="border px-2 py-1 rounded"
        >
          <option value="created_at">Sort by Created</option>
          <option value="due_date">Sort by Due Date</option>
        </select>

        <button
          onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
          className="border px-2 py-1 rounded"
        >
          {sortOrder === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-blue-200 p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Task List</h2>
          {filterAndSort(false).length === 0 && <p className="text-gray-600">No pending tasks</p>}
          {filterAndSort(false).map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={() => updateTask(task.id, { completed: true })}
              onDelete={() => deleteTask(task.id)}
              onEdit={(text) => updateTask(task.id, { text })}
              onPriorityChange={(priority) => updateTask(task.id, { priority })}
              onDueDateChange={(date) => updateTask(task.id, { due_date: date })}
            />
          ))}
        </div>

        <div className="bg-blue-200 p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Completed Task</h2>
          {filterAndSort(true).length === 0 && <p className="text-gray-600">No completed tasks</p>}
          {filterAndSort(true).map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isCompleted
              onComplete={() => updateTask(task.id, { completed: false })}
              onDelete={() => deleteTask(task.id)}
              onEdit={(text) => updateTask(task.id, { text })}
              onPriorityChange={(priority) => updateTask(task.id, { priority })}
              onDueDateChange={(date) => updateTask(task.id, { due_date: date })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
