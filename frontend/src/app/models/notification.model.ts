export enum NotificationType {
  APPOINTMENT_REQUESTED = 'appointment_requested',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_REJECTED = 'appointment_rejected',
  APPOINTMENT_COMPLETED = 'appointment_completed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
}

export interface AppNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

export const NOTIFICATION_ICON: Record<NotificationType, string> = {
  [NotificationType.APPOINTMENT_REQUESTED]: '📩',
  [NotificationType.APPOINTMENT_CONFIRMED]: '✅',
  [NotificationType.APPOINTMENT_REJECTED]: '⛔',
  [NotificationType.APPOINTMENT_COMPLETED]: '📋',
  [NotificationType.APPOINTMENT_CANCELLED]: '❌',
};
