import { useState } from 'react';
import { FaTrash, FaCheck, FaUndo, FaPen } from 'react-icons/fa';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  created?: string;
  priority?: 'Low' | 'Medium' | 'High';
  due_date?: string;
};

type Props = {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
  isCompleted?: boolean;
};

const formatTimeAgo = (date?: string) => {
  if (!date) return '';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const formatDueIn = (dueDate?: string) => {
  if (!dueDate) return '';
  const diffMs = new Date(dueDate).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? 'Overdue' : `Due in ${diffDays}d`;
};

const getPriorityColor = (priority?: Task['priority']) => {
  switch (priority) {
    case 'High':
      return 'bg-gray-800 text-white';
    case 'Medium':
      return 'bg-gray-700 text-white';
    case 'Low':
      return 'bg-gray-600 text-white';
    default:
      return 'bg-gray-700 text-white';
  }
};

const TaskCard = ({
  task,
  onComplete,
  onDelete,
  onEdit,
  isCompleted = false,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const overdue =
    task.due_date && new Date(task.due_date) < new Date();

  const saveEdit = () => {
    if (!editText.trim()) return;
    onEdit(editText);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded mb-2 shadow transition ${
        getPriorityColor(task.priority)
      } ${overdue ? 'border border-red-500' : ''}`}
    >
      {/* TOP ROW */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={onComplete}
          />

          {isEditing ? (
            <input
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={e => e.key === 'Enter' && saveEdit()}
              className="bg-white text-black px-2 py-1 rounded"
              autoFocus
            />
          ) : (
            <span
              className={`font-semibold ${
                task.completed ? 'line-through opacity-70' : ''
              }`}
            >
              {task.text}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} title="Edit">
              <FaPen />
            </button>
          )}

          <button onClick={onComplete} title={isCompleted ? 'Undo' : 'Complete'}>
            {isCompleted ? <FaUndo /> : <FaCheck />}
          </button>

          <button onClick={onDelete} title="Delete">
            <FaTrash />
          </button>
        </div>
      </div>

      {/* META */}
      <div className="flex justify-between text-xs opacity-80">
        <span>Created {formatTimeAgo(task.created)}</span>
        <span className={overdue ? 'text-red-400 font-semibold' : ''}>
          {formatDueIn(task.due_date)}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
