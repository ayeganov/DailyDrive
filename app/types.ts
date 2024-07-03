export interface Chore
{
  id: string;
  name: string;
  statuses: { [key: string]: string };
  user_id?: string;
}


export interface User
{
  id: string;
  username: string;
  token: string;
  email: string;
  is_superuser: boolean;
}


export type Days = 'Chore' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export const DAYS: Days[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  id: string;
  message: string;
  type: AlertType;
}
