import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import TaskCard from './components/TaskCard';

type Task = {
  id: number;
  text: string;
  completed: boolean;
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  // 🔄 Load tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error.message);
      } else {
        setTasks(data || []);
      }
    };

    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ text: newTask, completed: false }])
      .select()
      .single();

    if (error) {
      console.error('Add task error:', error.message);
      return;
    }

    setTasks(prev => [...prev, data]);
    setNewTask('');
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update task error:', error.message);
      return;
    }

    setTasks(prev => prev.map(t => (t.id === id ? data : t)));
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Delete task error:', error.message);
      return;
    }

    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to your To-do-List</h1>

      <div className="flex w-full max-w-xl mb-6">
        <input
          type="text"
          placeholder="Enter a task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          className="flex-1 border px-3 py-2 rounded-l bg-blue-100 focus:outline-none"
        />
        <button
          onClick={addTask}
          className="bg-sky-400 px-4 py-2 text-white font-semibold rounded-r"
        >
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Task List */}
        <div className="bg-blue-200 p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Task List</h2>
          {pendingTasks.length === 0 && <p className="text-gray-600">No pending tasks</p>}
          {pendingTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={() => updateTask(task.id, { completed: true })}
              onDelete={() => deleteTask(task.id)}
              onEdit={(text) => updateTask(task.id, { text })}
            />
          ))}
        </div>

        {/* Completed Tasks */}
        <div className="bg-blue-200 p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Completed Task</h2>
          {completedTasks.length === 0 && <p className="text-gray-600">No completed tasks</p>}
          {completedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isCompleted
              onComplete={() => updateTask(task.id, { completed: false })}
              onDelete={() => deleteTask(task.id)}
              onEdit={(text) => updateTask(task.id, { text })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
