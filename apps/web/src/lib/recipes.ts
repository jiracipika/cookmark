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

/** Built-ins first, then clipped recipes (client-side). */
export function findRecipe(id: string) {
  return getRecipe(id) ?? loadCustomRecipes().find((recipe) => recipe.id === id);
}

/** True when the id points at a clipped (user-saved) recipe. */
export function isCustomRecipeId(id: string): boolean {
  return id.startsWith('clip-');
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

export function deleteCustomRecipe(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const next = loadCustomRecipes().filter((recipe) => recipe.id !== id);
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — nothing to persist.
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

/* ── Recipe text parsing (clip by paste) ─────────────────────────────── */

export type ParsedRecipe = {
  title: string | null;
  time: string | null;
  servings: number | null;
  ingredients: string[];
  steps: string[];
};

const INGREDIENTS_HEADER = /^(?:#{1,6}\s*)?ingredients\s*:?\s*$/i;
const STEPS_HEADER = /^(?:#{1,6}\s*)?(?:instructions|directions|steps|method|preparation)\s*:?\s*$/i;
const BULLET = /^\s*(?:[-*•·]|\d+[.)])\s+/;
const SERVINGS_LINE = /\b(?:serves|servings?|makes|yields?)\s*[:\-]?\s*(\d{1,3})\b/i;
const TIME_LINE = /\b(\d{1,3}(?:\s*(?:-|–|to)\s*\d{1,3})?\s*(?:minutes?|mins?|hours?|hrs?))\b/i;

/** True when a section-less line reads like an ingredient (bullets or a leading quantity). Numbered lines read as steps, not ingredients. */
function looksLikeIngredient(line: string): boolean {
  if (/^\s*(?:[-*•·])/.test(line)) return true;
  if (/^\s*\d+[.)]/.test(line)) return false;
  return /^\s*(?:\d|\d\/\d|½|¼|¾|⅓|⅔)/.test(line) && /\d/.test(line);
}

function stripBullet(line: string): string {
  return line.replace(BULLET, '').trim();
}

/** True for short preamble lines that only state servings or time. */
function looksLikeMetadata(line: string): boolean {
  if (line.length > 60) return false;
  if (BULLET.test(line)) return false;
  return SERVINGS_LINE.test(line) || /\b\d{1,3}\s*(?:minutes?|mins?|hours?|hrs?)\b/i.test(line);
}

/**
 * Parse pasted recipe text into a structured draft. Recognizes
 * "Ingredients" / "Instructions" (or Directions/Steps/Method/Preparation)
 * section headers with optional markdown hashes or a trailing colon, strips
 * bullets and numbering, and pulls servings/time out of the text. Text with
 * no headers falls back to a per-line heuristic: quantity/bullet lines are
 * ingredients, everything else is steps, and the first step-looking line
 * before any ingredient is treated as the title. Returns nulls (not
 * guesses) when title/time/servings are absent so the UI can decide.
 */
export function parseRecipeText(text: string): ParsedRecipe {
  const normalized = text.replace(/\r\n?/g, '\n');
  const servingsMatch = normalized.match(SERVINGS_LINE);
  const timeMatch = normalized.match(TIME_LINE);

  let section: 'unknown' | 'ingredients' | 'steps' = 'unknown';
  const ingredients: string[] = [];
  const steps: string[] = [];
  let title: string | null = null;

  for (const raw of normalized.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (INGREDIENTS_HEADER.test(line)) {
      section = 'ingredients';
      continue;
    }
    if (STEPS_HEADER.test(line)) {
      section = 'steps';
      continue;
    }
    if (section === 'ingredients') {
      ingredients.push(stripBullet(line));
    } else if (section === 'steps') {
      steps.push(stripBullet(line));
    } else if (looksLikeMetadata(line)) {
      // Serves/time lines belong to the metadata fields, not the steps list.
      continue;
    } else if (looksLikeIngredient(line)) {
      ingredients.push(stripBullet(line));
    } else if (title === null) {
      title = line.replace(/^#{1,6}\s+/, '');
    } else {
      steps.push(stripBullet(line));
    }
  }

  return {
    title,
    time: timeMatch ? timeMatch[1].replace(/\s+/g, ' ').toLowerCase() : null,
    servings: servingsMatch ? parseInt(servingsMatch[1], 10) : null,
    ingredients: ingredients.filter(Boolean),
    steps: steps.filter(Boolean),
  };
}
