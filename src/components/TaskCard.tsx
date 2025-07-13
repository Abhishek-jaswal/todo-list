import { useState } from 'react';
// Define Task type here if not available elsewhere
export type Task = {
  id: number;
  text: string;
  completed: boolean;
};
import { FaTrash, FaCheck, FaUndo, FaPen } from 'react-icons/fa';

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
          <span className="flex items-center justify-between w-full">
            <span className="cursor-pointer">{task.text}</span>
          </span>
        )}
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
