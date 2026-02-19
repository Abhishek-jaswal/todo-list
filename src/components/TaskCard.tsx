import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  return diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Due today' : `Due in ${diffDays}d`;
};

const PRIORITY_CONFIG = {
  High: { bar: '#ef4444', badge: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'High' },
  Medium: { bar: '#f59e0b', badge: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Med' },
  Low: { bar: '#22c55e', badge: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Low' },
};

const TaskCard = ({ task, onComplete, onDelete, onEdit, isCompleted = false }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [hovered, setHovered] = useState(false);

  const overdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
  const pCfg = PRIORITY_CONFIG[task.priority || 'Medium'];
  const dueLabel = formatDueIn(task.due_date);

  const saveEdit = () => {
    if (!editText.trim()) return;
    onEdit(editText);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        background: isCompleted
          ? 'rgba(255,255,255,0.02)'
          : 'rgba(255,255,255,0.05)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '14px',
        padding: '14px 16px',
        marginBottom: '10px',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'border-color 0.2s ease, background 0.2s ease',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      {/* Priority bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: '3px',
        background: overdue ? '#ef4444' : pCfg.bar,
        borderRadius: '14px 0 0 14px',
      }} />

      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '6px' }}>
        {/* Checkbox */}
        <button
          onClick={onComplete}
          style={{
            flexShrink: 0,
            width: '22px', height: '22px',
            borderRadius: '50%',
            border: `2px solid ${task.completed ? pCfg.bar : 'rgba(255,255,255,0.2)'}`,
            background: task.completed ? pCfg.bar : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {task.completed && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <input
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={e => e.key === 'Enter' && saveEdit()}
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: task.completed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
              textDecoration: task.completed ? 'line-through' : 'none',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s',
            }}>
              {task.text}
            </span>
          )}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {(hovered || isEditing) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
            >
              {!isEditing && (
                <ActionBtn
                  onClick={() => setIsEditing(true)}
                  color="rgba(108,59,250,0.8)"
                  title="Edit"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </ActionBtn>
              )}
              <ActionBtn onClick={onDelete} color="rgba(239,68,68,0.8)" title="Delete">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </ActionBtn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meta row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginTop: '10px', paddingLeft: '6px',
        flexWrap: 'wrap',
      }}>
        {/* Priority badge */}
        {task.priority && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            padding: '2px 8px', borderRadius: '20px',
            background: pCfg.badge, color: pCfg.text,
            letterSpacing: '0.04em',
          }}>
            {pCfg.label}
          </span>
        )}

        {/* Created */}
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
          {formatTimeAgo(task.created)}
        </span>

        {/* Due */}
        {dueLabel && (
          <span style={{
            fontSize: '0.72rem', fontWeight: 500, marginLeft: 'auto',
            color: overdue ? '#ef4444' : dueLabel === 'Due today' ? '#f59e0b' : 'rgba(255,255,255,0.4)',
          }}>
            {overdue ? '⚠ ' : dueLabel === 'Due today' ? '⏰ ' : '📅 '}{dueLabel}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const ActionBtn = ({ onClick, color, title, children }: any) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: '28px', height: '28px',
      borderRadius: '8px',
      border: 'none',
      background: color,
      color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      transition: 'opacity 0.15s, transform 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.opacity = '1', e.currentTarget.style.transform = 'scale(1.1)')}
    onMouseLeave={e => (e.currentTarget.style.opacity = '0.85', e.currentTarget.style.transform = 'scale(1)')}
  >
    {children}
  </button>
);

export default TaskCard;
