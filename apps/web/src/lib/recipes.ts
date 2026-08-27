export type Recipe = {
  id: string;
  title: string;
  time: string;
  servings: number;
  tags: string[];
  emoji: string;
  ingredients: string[];
  steps: string[];
};

export const recipes: Recipe[] = [
  { id: 'r1', title: 'Creamy Garlic Pasta', time: '20 min', servings: 4, tags: ['Quick', 'Italian'], emoji: '🍝', ingredients: ['pasta', 'garlic', 'cream', 'parmesan'], steps: ['Boil pasta', 'Sauté garlic in butter', 'Add cream and parmesan', 'Toss with pasta'] },
  { id: 'r2', title: 'Avocado Toast', time: '5 min', servings: 2, tags: ['Quick', 'Healthy'], emoji: '🥑', ingredients: ['bread', 'avocado', 'lemon', 'salt'], steps: ['Toast bread', 'Mash avocado with lemon', 'Spread and season'] },
  { id: 'r3', title: 'Chicken Stir Fry', time: '25 min', servings: 3, tags: ['Quick', 'Asian'], emoji: '🍳', ingredients: ['chicken', 'vegetables', 'soy sauce', 'rice'], steps: ['Cut chicken', 'Stir fry veggies', 'Add chicken and sauce', 'Serve over rice'] },
  { id: 'r4', title: 'Banana Pancakes', time: '15 min', servings: 2, tags: ['Quick', 'Breakfast'], emoji: '🥞', ingredients: ['banana', 'eggs', 'flour', 'milk'], steps: ['Mash banana', 'Mix with eggs and flour', 'Cook on pan'] },
  { id: 'r5', title: 'Mushroom Risotto', time: '40 min', servings: 4, tags: ['Italian', 'Comfort'], emoji: '🍚', ingredients: ['rice', 'mushrooms', 'onion', 'broth', 'parmesan'], steps: ['Sauté onion and mushrooms', 'Add rice', 'Slowly add broth', 'Stir in parmesan'] },
  { id: 'r6', title: 'Greek Salad', time: '10 min', servings: 2, tags: ['Healthy', 'Quick'], emoji: '🥗', ingredients: ['tomato', 'cucumber', 'feta', 'olives'], steps: ['Chop vegetables', 'Add feta and olives', 'Dress with olive oil'] },
  { id: 'r7', title: 'Chocolate Mug Cake', time: '5 min', servings: 1, tags: ['Dessert', 'Quick'], emoji: '🍫', ingredients: ['flour', 'sugar', 'cocoa', 'milk', 'oil'], steps: ['Mix dry ingredients', 'Add wet ingredients', 'Microwave 90 seconds'] },
  { id: 'r8', title: 'Tom Yum Soup', time: '30 min', servings: 4, tags: ['Asian', 'Soup'], emoji: '🍜', ingredients: ['shrimp', 'mushrooms', 'lemongrass', 'chili'], steps: ['Boil broth with lemongrass', 'Add mushrooms', 'Add shrimp', 'Season'] },
];

export function getRecipe(id: string) {
  return recipes.find((recipe) => recipe.id === id);
}

/* ── Saved (clipped) recipes ─────────────────────────────────────────── */

const CUSTOM_KEY = 'cookmark-custom-recipes';

export function loadCustomRecipes(): Recipe[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomRecipe(recipe: Recipe): void {
  if (typeof window === 'undefined') return;
  try {
    const next = [recipe, ...loadCustomRecipes()].slice(0, 50);
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked — clipping silently unavailable.
  }
}

/** All built-in recipes plus any clipped ones (client-side). */
export function getAllRecipes(): Recipe[] {
  return [...loadCustomRecipes(), ...recipes];
}

/* ── Planner storage ─────────────────────────────────────────────────── */

export type WeekPlan = Record<string, Record<string, string>>; // day -> meal -> recipeId | ''

const PLAN_KEY = 'cookmark-week-plan';

export function loadWeekPlan(): WeekPlan {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PLAN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveWeekPlan(plan: WeekPlan): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch {
    // Ignore storage failures.
  }
}

/* ── Grocery list generation ─────────────────────────────────────────── */

const AISLE_KEYWORDS: [RegExp, string][] = [
  [/chicken|beef|pork|shrimp|steak/i, 'Meat'],
  [/milk|cheese|parmesan|feta|butter|cream|egg/i, 'Dairy'],
  [/banana|avocado|tomato|lettuce|onion|garlic|lemon|cucumber|pepper|apple/i, 'Produce'],
  [/bread|bun|tortilla/i, 'Bakery'],
  [/ice cream|frozen/i, 'Frozen'],
];

export function guessAisle(ingredient: string): string {
  for (const [pattern, aisle] of AISLE_KEYWORDS) {
    if (pattern.test(ingredient)) return aisle;
  }
  return 'Pantry';
}

/**
 * Build a grocery list from a week plan. Deterministic order, deduped by
 * normalized ingredient name. Returns {name, aisle} pairs keyed for
 * direct merge into the grocery list store.
 */
export function generateGroceryFromPlan(
  plan: WeekPlan,
  catalog: Recipe[],
): { id: string; name: string; aisle: string }[] {
  const seen = new Map<string, { id: string; name: string; aisle: string }>();
  for (const meals of Object.values(plan)) {
    for (const recipeId of Object.values(meals)) {
      if (!recipeId) continue;
      const recipe = catalog.find((r) => r.id === recipeId);
      if (!recipe) continue;
      for (const ingredient of recipe.ingredients) {
        const key = ingredient.trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.set(key, {
          id: `gen-${key.replace(/[^a-z0-9]+/g, '-')}`,
          name: ingredient,
          aisle: guessAisle(ingredient),
        });
      }
    }
  }
  return Array.from(seen.values());
}
