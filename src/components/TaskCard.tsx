import { useState } from 'react';
import { FaTrash, FaCheck, FaUndo, FaPen } from 'react-icons/fa';

export type Task = {
  id: number;
  text: string;
  completed: boolean;
  user_id?: string;
  created_at?: string;
  priority?: 'Low' | 'Medium' | 'High';
  due_date?: string;
};

type Props = {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
  onPriorityChange?: (priority: Task['priority']) => void;
  onDueDateChange?: (date: string) => void;
  isCompleted?: boolean;
};

// ✅ Utility to format "created X ago"
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ✅ Priority badge styling
const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'High':
      return 'bg-red-500 text-white';
    case 'Medium':
      return 'bg-yellow-400 text-white';
    case 'Low':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

const TaskCard = ({
  task,
  onComplete,
  onDelete,
  onEdit,
  onPriorityChange,
  onDueDateChange,
  isCompleted = false,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleEdit = () => {
    if (editText.trim()) {
      onEdit(editText);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between bg-blue-100 p-2 rounded mb-2">
      <div className="flex items-center gap-2 flex-1">
        <input type="checkbox" checked={task.completed} onChange={onComplete} />

        <div className="flex flex-col w-full">
          {isEditing ? (
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              className="bg-white border px-2 py-1 rounded"
              autoFocus
            />
          ) : (
            <div className="flex items-center justify-between">
              <span className="cursor-pointer">{task.text}</span>
              {task.priority && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              )}
            </div>
          )}

          {/* Meta info section */}
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-600 items-center">
            {task.created_at && (
              <span>Created: {formatTimeAgo(task.created_at)}</span>
            )}
            {onPriorityChange && (
              <select
                value={task.priority || 'Medium'}
                onChange={(e) =>
                  onPriorityChange(e.target.value as Task['priority'])
                }
                className="border px-1 py-0.5 rounded text-xs bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            )}
            {onDueDateChange && (
              <input
                type="date"
                value={task.due_date || ''}
                onChange={(e) => onDueDateChange(e.target.value)}
                className="border px-1 py-0.5 rounded text-xs"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-600 hover:text-gray-800"
            title="Edit"
          >
            <FaPen />
          </button>
        )}
        <button
          onClick={onComplete}
          className="text-green-600 hover:text-green-800"
          title={isCompleted ? 'Undo' : 'Complete'}
        >
          {isCompleted ? <FaUndo /> : <FaCheck />}
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800"
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
