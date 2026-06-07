export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: string; // 'info' | 'success' | 'warning' | 'error'
  read: boolean;
  createdAt: string;
}
