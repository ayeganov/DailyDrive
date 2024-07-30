import assert from 'assert';
import axios from 'axios';


export async function update_reward_stars(user_id: string, reward: string, _value: string|number, operation: string, amount: string|number): Promise<string>
{
  const reward_update = { operation: operation, reward: reward, amount: amount, target_user_id: user_id };

  const result = await axios.post(`/backend/api/v1/rewards/update`, reward_update);
  return result.data.value.toString();
}


export async function update_reward_time(user_id: string, reward: string, _value: string|number, operation: string, amount: string|number): Promise<string>
{
  assert(typeof amount === 'string', 'Amount must be a string');
  const [amountHours, amountMinutes] = amount.split(':').map(Number);

  const amountTotalMinutes = amountHours * 60 + amountMinutes;

  const reward_update = { operation: operation,
                          reward: reward,
                          amount: amountTotalMinutes,
                          target_user_id: user_id };

  const result = await axios.post(`/backend/api/v1/rewards/update`, reward_update);
  const newTotalMinutes = result.data.value;

  const sign = newTotalMinutes < 0 ? '-' : '';
  const newHours = Math.floor(Math.abs(newTotalMinutes) / 60);
  const newMinutes = Math.abs(newTotalMinutes % 60);

  return `${sign}${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}
