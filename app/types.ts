export interface Chore
{
  id: number;
  name: string;
  statuses: { [key: string]: boolean };
}


export interface User
{
  username: string;
  token: string;
}


export type Days = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
