export interface Chore
{
  id: number;
  name: string;
  statuses: { [key: string]: boolean };
}


export type Days = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
