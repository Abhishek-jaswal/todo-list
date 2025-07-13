import { useState } from 'react';
import { FaTrash, FaCheck, FaUndo, FaPen } from 'react-icons/fa';

// ✅ Add created_at to Task type
export type Task = {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
};

type Props = {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
  isCompleted?: boolean;
};

// ✅ Time formatter
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TaskCard = ({ task, onComplete, onDelete, onEdit, isCompleted = false }: Props) => {
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
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onComplete}
        />
        <div className="flex flex-col w-full">
          {isEditing ? (
            <input
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={e => e.key === 'Enter' && handleEdit()}
              className="bg-white border px-2 py-1 rounded"
              autoFocus
            />
          ) : (
            <span className="cursor-pointer">{task.text}</span>
          )}
          {/* ✅ Show time ago */}
          <span className="text-xs text-gray-500 mt-1">
            Created: {formatTimeAgo(task.created_at)}
          </span>
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
        <button onClick={onComplete} className="text-green-600 hover:text-green-800" title={isCompleted ? "Undo" : "Complete"}>
          {isCompleted ? <FaUndo /> : <FaCheck />}
        </button>
        <button onClick={onDelete} className="text-red-600 hover:text-red-800" title="Delete">
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
