export interface Chore
{
  id: string;
  name: string;
  statuses: { [key: string]: boolean };
  user_id?: string;
}


export interface User
{
  username: string;
  token: string;
}


export type Days = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
