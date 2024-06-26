export interface Chore
{
  id: string;
  name: string;
  statuses: { [key: string]: string };
  user_id?: string;
}


export interface User
{
  username: string;
  token: string;
}


export type Days = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export const DAYS: Days[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  id: string;
  message: string;
  type: AlertType;
}
