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
  onPriorityChange: (priority: 'Low' | 'Medium' | 'High') => void;
  onDueDateChange: (dueDate: string) => void;
  isCompleted?: boolean;
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDueIn(dueDate?: string) {
  if (!dueDate) return '';
  const diffMs = new Date(dueDate).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? `Overdue` : `Due in ${diffDays}d`;
}

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'High': return 'bg-gray-700 text-gray-200';
    case 'Medium': return 'bg-gray-600 text-gray-200';
    case 'Low': return 'bg-gray-500 text-gray-200';
    default: return 'bg-gray-400 text-gray-200';
  }
};

const TaskCard = ({
  task,
  onComplete,
  onDelete,
  onEdit,
  // onPriorityChange,
  // onDueDateChange,
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

  const overdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div className={`flex flex-col gap-2 p-3 rounded mb-2 shadow ${overdue ? 'border-2 bg-red-500' : ''} ${getPriorityColor(task.priority)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={task.completed} onChange={onComplete} />
          {isEditing ? (
            <input
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={e => e.key === 'Enter' && handleEdit()}
              className="bg-white text-black px-2 py-1 rounded"
              autoFocus
            />
          ) : (
            <span className="font-semibold">{task.text}</span>
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

      <div className="flex flex-col sm:flex-row gap-2 justify-between text-sm">
        <div>
          <span className="text-xs">Created: {formatTimeAgo(task.created_at!)}</span>
        </div>
        <div className="flex gap-2 items-center">
          {/* <select
            value={task.priority || 'Medium'}
            onChange={e => onPriorityChange(e.target.value as 'Low' | 'Medium' | 'High')}
            className="text-black px-1 rounded"
            title="Set priority"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select> */}

          {/* <input
            type="date"
            value={task.due_date || ''}
            onChange={e => onDueDateChange(e.target.value)}
            className="text-black px-1 rounded"
            title="Set due date"
          /> */}
          <span>{formatDueIn(task.due_date)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
