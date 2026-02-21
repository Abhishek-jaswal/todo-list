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
  isDark: boolean;
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
  High: { bar: '#f43f5e', badge_dark: 'rgba(244,63,94,0.15)', badge_light: 'rgba(244,63,94,0.1)', text: '#f43f5e', label: 'High' },
  Medium: { bar: '#f59e0b', badge_dark: 'rgba(245,158,11,0.15)', badge_light: 'rgba(245,158,11,0.1)', text: '#d97706', label: 'Med' },
  Low: { bar: '#10b981', badge_dark: 'rgba(16,185,129,0.15)', badge_light: 'rgba(16,185,129,0.1)', text: '#059669', label: 'Low' },
};

const TaskCard = ({ task, onComplete, onDelete, onEdit, isCompleted = false, isDark }: Props) => {
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

  const cardBg = isDark
    ? hovered ? 'rgba(255,255,255,0.07)' : isCompleted ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.045)'
    : hovered ? 'rgba(0,0,0,0.04)' : isCompleted ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.95)';

  const cardBorder = isDark
    ? hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'
    : hovered ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.08)';

  const textColor = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(15,15,20,0.88)';
  const textMuted = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(15,15,20,0.35)';
  const completedColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,15,20,0.25)';
  const checkBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '16px',
        padding: '14px 16px',
        marginBottom: '8px',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
        boxShadow: hovered
          ? isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)'
          : isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Priority bar */}
      <div style={{
        position: 'absolute', left: 0, top: 8, bottom: 8,
        width: '3px',
        background: overdue ? '#f43f5e' : pCfg.bar,
        borderRadius: '0 3px 3px 0',
        opacity: isCompleted ? 0.4 : 1,
      }} />

      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
        {/* Checkbox */}
        <button
          onClick={onComplete}
          style={{
            flexShrink: 0,
            width: '20px', height: '20px',
            borderRadius: '6px',
            border: `1.5px solid ${task.completed ? pCfg.bar : checkBorder}`,
            background: task.completed ? pCfg.bar : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
        >
          {task.completed && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
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
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                borderRadius: '8px',
                padding: '5px 10px',
                color: textColor,
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 450,
              color: task.completed ? completedColor : textColor,
              textDecoration: task.completed ? 'line-through' : 'none',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s',
              letterSpacing: '-0.01em',
            }}>
              {task.text}
            </span>
          )}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {(hovered || isEditing) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.12 }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
            >
              {!isEditing && (
                <ActionBtn onClick={() => setIsEditing(true)} isDark={isDark} title="Edit" accent="#6366f1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </ActionBtn>
              )}
              <ActionBtn onClick={onDelete} isDark={isDark} title="Delete" accent="#f43f5e">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
        marginTop: '10px', paddingLeft: '8px',
        flexWrap: 'wrap',
      }}>
        {task.priority && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 600,
            padding: '2px 7px', borderRadius: '20px',
            background: isDark ? pCfg.badge_dark : pCfg.badge_light,
            color: pCfg.text,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {pCfg.label}
          </span>
        )}

        <span style={{ fontSize: '0.7rem', color: textMuted, letterSpacing: '0.01em' }}>
          {formatTimeAgo(task.created)}
        </span>

        {dueLabel && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 500, marginLeft: 'auto',
            color: overdue ? '#f43f5e' : dueLabel === 'Due today' ? '#f59e0b' : textMuted,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            {overdue ? '⚠' : dueLabel === 'Due today' ? '⏰' : '📅'} {dueLabel}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const ActionBtn = ({ onClick, isDark, title, children, accent }: any) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: '27px', height: '27px',
      borderRadius: '8px',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = accent + '22';
      e.currentTarget.style.borderColor = accent + '55';
      e.currentTarget.style.color = accent;
      e.currentTarget.style.transform = 'scale(1.08)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
      e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
      e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    {children}
  </button>
);

export default TaskCard;
