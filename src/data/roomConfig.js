/**
 * ROOM_CONFIG — standardized header icons, colors, and metadata
 * Used across all room browser pages for visual consistency (audit #79)
 */

export const ROOM_CONFIG = {
  stats: {
    icon: 'bar-chart',
    label: 'Stats Room',
    color: 'var(--accent)',
    bg: 'var(--accent-bg)',
    shortcut: 's',
  },
  metrics: {
    icon: 'trending-up',
    label: 'Metrics Room',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    shortcut: 'm',
  },
  rca: {
    icon: 'alert-triangle',
    label: 'RCA Room',
    color: 'var(--yellow)',
    bg: 'var(--yellow-bg)',
    shortcut: 'r',
  },
  cases: {
    icon: 'clipboard',
    label: 'Cases Room',
    color: 'var(--orange, #f97316)',
    bg: 'var(--orange-bg, rgba(249, 115, 22, 0.1))',
    shortcut: 'c',
  },
  code: {
    icon: 'file-text',
    label: 'Programming Lab',
    color: 'var(--purple)',
    bg: 'var(--purple-bg)',
    shortcut: 'o',
  },
  'product-design': {
    icon: 'layout',
    label: 'Product Design Room',
    color: 'var(--purple)',
    bg: 'var(--purple-bg)',
    shortcut: 'd',
  },
  prioritization: {
    icon: 'target',
    label: 'Prioritization Room',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    shortcut: 'p',
  },
  behavioral: {
    icon: 'mic',
    label: 'Behavioral Room',
    color: 'var(--accent)',
    bg: 'var(--accent-bg)',
    shortcut: 'b',
  },
  estimation: {
    icon: 'calculator',
    label: 'Estimation Room',
    color: 'var(--blue, #3b82f6)',
    bg: 'var(--blue-bg, rgba(59, 130, 246, 0.1))',
    shortcut: 'e',
  },
  'stat-foundations': {
    icon: 'flask',
    label: 'Stat Foundations',
    color: 'var(--teal)',
    bg: 'var(--teal-bg)',
    shortcut: null,
  },
  'metrics-foundations': {
    icon: 'flask',
    label: 'Metrics Foundations',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    shortcut: null,
  },
  'rca-foundations': {
    icon: 'flask',
    label: 'RCA Foundations',
    color: 'var(--yellow)',
    bg: 'var(--yellow-bg)',
    shortcut: null,
  },
  'exp-foundations': {
    icon: 'flask',
    label: 'Experimentation Foundations',
    color: 'var(--accent)',
    bg: 'var(--accent-bg)',
    shortcut: null,
  },
  'growth-analytics': {
    icon: 'bar-chart',
    label: 'Growth Analytics Room',
    color: 'var(--teal)',
    bg: 'var(--teal-bg)',
    shortcut: 'g',
  },
  bi: {
    icon: 'bar-chart',
    label: 'BI Room',
    color: 'var(--yellow)',
    bg: 'var(--yellow-bg)',
    shortcut: null,
  },
  'spot-the-flaw': {
    icon: 'alert-triangle',
    label: 'Spot the Flaw',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    shortcut: 'f',
  },
  'take-home': {
    icon: 'clipboard',
    label: 'Take-Home Room',
    color: 'var(--yellow)',
    bg: 'var(--yellow-bg)',
    shortcut: null,
  },
  instrumentation: {
    icon: 'building-2',
    label: 'Instrumentation Room',
    color: 'var(--teal)',
    bg: 'var(--teal-bg)',
    shortcut: null,
  },
  sql: {
    icon: 'database',
    label: 'SQL Lab',
    color: 'var(--purple)',
    bg: 'var(--purple-bg)',
    shortcut: 'q',
  },
};

/**
 * Get icon + color config for a room
 * Usage: const cfg = getRoomConfig('metrics'); → { icon: 'trending-up', color: 'var(--green)', ... }
 */
export function getRoomConfig(roomId) {
  return ROOM_CONFIG[roomId] || {
    icon: 'bookmark',
    label: roomId,
    color: 'var(--text)',
    bg: 'var(--surface)',
    shortcut: null,
  };
}
