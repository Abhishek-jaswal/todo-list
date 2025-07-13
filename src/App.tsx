import { useState } from 'react';
import TaskCard from './components/TaskCard';

export type Task = {
  id: number;
  text: string;
  completed: boolean;
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask('');
  };

  const toggleComplete = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const editTask = (id: number, text: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text } : task
    ));
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

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
              onComplete={() => toggleComplete(task.id)}
              onDelete={() => deleteTask(task.id)}
              onEdit={(text) => editTask(task.id, text)}
            />
          ))}
        </div>

        {/* Completed Tasks */}
        <div className="bg-blue-200 p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Completed Task</h2>
          {completedTasks.length === 0 && <p className="text-gray-600">No completed tasks</p>}
          {completedTasks.map(task => (
            <TaskCard
             task={task}
              key={task.id}
             
              onComplete={() => toggleComplete(task.id)}
              onDelete={() => deleteTask(task.id)}
              onEdit={(text) => editTask(task.id, text)}
              isCompleted
            />
          ))}
        </div>
      </div>
    </div>
  );
}
