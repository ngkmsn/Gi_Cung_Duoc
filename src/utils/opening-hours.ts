import { Restaurant } from '@/types/restaurant';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export function isRestaurantOpenNow(restaurant: Restaurant, date: Date = new Date()): boolean {
  if (restaurant.is_open_now !== undefined) {
    return restaurant.is_open_now;
  }

  if (!restaurant.opening_hours) {
    // Default to open if no specific closed hours recorded
    return true;
  }

  const dayIndex = date.getDay();
  const dayKey = DAY_KEYS[dayIndex];
  const todayHours = restaurant.opening_hours[dayKey as keyof typeof restaurant.opening_hours];

  if (!todayHours || !todayHours.open || !todayHours.close) {
    return true;
  }

  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);

  const openMinutes = (openH || 0) * 60 + (openM || 0);
  let closeMinutes = (closeH || 0) * 60 + (closeM || 0);

  // If close time is past midnight (e.g., 01:00)
  if (closeMinutes < openMinutes) {
    closeMinutes += 24 * 60;
    if (currentMinutes < openMinutes) {
      return currentMinutes + 24 * 60 <= closeMinutes;
    }
  }

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}
