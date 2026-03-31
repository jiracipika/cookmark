export interface Recipe {
  id: string;
  title: string;
  emoji: string;
  time: string;
  servings: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
  savedAt?: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  aisle: string;
  checked: boolean;
}

export type MealPlan = Record<string, Record<string, string>>;

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type MealKey = 'Breakfast' | 'Lunch' | 'Dinner';
