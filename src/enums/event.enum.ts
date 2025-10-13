export const EVENT_STATUS = {
  open: 'open',
  closed: 'closed',
  completed: 'completed',
} as const;

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];
