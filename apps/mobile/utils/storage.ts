import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, GroceryItem, MealPlan } from '../types';

const KEYS = {
  RECIPES: 'cookmark:recipes',
  GROCERY: 'cookmark:grocery',
  MEAL_PLAN: 'cookmark:mealplan',
};

// ── Recipes ──────────────────────────────────────────────────────────────────

export async function getRecipes(): Promise<Recipe[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.RECIPES);
    if (!raw) return [];
    return JSON.parse(raw) as Recipe[];
  } catch {
    return [];
  }
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  try {
    const existing = await getRecipes();
    const idx = existing.findIndex((r) => r.id === recipe.id);
    if (idx >= 0) {
      existing[idx] = recipe;
    } else {
      existing.unshift({ ...recipe, savedAt: Date.now() });
    }
    await AsyncStorage.setItem(KEYS.RECIPES, JSON.stringify(existing));
  } catch (e) {
    console.error('saveRecipe error', e);
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  try {
    const existing = await getRecipes();
    const updated = existing.filter((r) => r.id !== id);
    await AsyncStorage.setItem(KEYS.RECIPES, JSON.stringify(updated));
  } catch (e) {
    console.error('deleteRecipe error', e);
  }
}

// ── Grocery ───────────────────────────────────────────────────────────────────

export async function getGroceryItems(): Promise<GroceryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.GROCERY);
    if (!raw) return [];
    return JSON.parse(raw) as GroceryItem[];
  } catch {
    return [];
  }
}

export async function saveGroceryItems(items: GroceryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.GROCERY, JSON.stringify(items));
  } catch (e) {
    console.error('saveGroceryItems error', e);
  }
}

// ── Meal Plan ─────────────────────────────────────────────────────────────────

export async function getMealPlan(): Promise<MealPlan> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.MEAL_PLAN);
    if (!raw) return {};
    return JSON.parse(raw) as MealPlan;
  } catch {
    return {};
  }
}

export async function saveMealPlan(plan: MealPlan): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.MEAL_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error('saveMealPlan error', e);
  }
}
