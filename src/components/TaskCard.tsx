import { useState } from 'react';
import type { Task } from '../App';
import { FaTrash, FaCheck, FaUndo } from 'react-icons/fa';

type Props = {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
  isCompleted?: boolean;
};

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
        {isEditing ? (
          <input
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={e => e.key === 'Enter' && handleEdit()}
            className="bg-white border px-2 py-1 rounded w-full"
            autoFocus
          />
        ) : (
          <span
            className="cursor-pointer w-full"
            onClick={() => setIsEditing(true)}
          >
            {task.text}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button onClick={onComplete} className="text-green-600 hover:text-green-800">
          {isCompleted ? <FaUndo /> : <FaCheck />}
        </button>
        <button onClick={onDelete} className="text-red-600 hover:text-red-800">
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
