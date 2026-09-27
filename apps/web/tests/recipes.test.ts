import { beforeEach, describe, expect, it, vi } from 'vitest';

// storage stub: recipes.ts uses window.localStorage throughout.
const store = new Map<string, string>();
vi.stubGlobal('window', {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
});

import {
  generateGroceryFromPlan,
  getAllRecipes,
  getRecipe,
  guessAisle,
  loadCustomRecipes,
  loadWeekPlan,
  saveCustomRecipe,
  saveWeekPlan,
  recipes,
  type Recipe,
  type WeekPlan,
} from '../src/lib/recipes';

beforeEach(() => store.clear());

describe('guessAisle', () => {
  it('classifies the keyword families', () => {
    expect(guessAisle('chicken breast')).toBe('Meat');
    expect(guessAisle('parmesan')).toBe('Dairy');
    expect(guessAisle('Avocado')).toBe('Produce');
    expect(guessAisle('sourdough bread')).toBe('Bakery');
    expect(guessAisle('frozen peas')).toBe('Frozen');
  });
  it('falls back to Pantry and is case-insensitive', () => {
    expect(guessAisle('soy sauce')).toBe('Pantry');
    expect(guessAisle('CHICKEN')).toBe('Meat');
  });
  it('first matching family wins (eggs -> Dairy, not Pantry)', () => {
    expect(guessAisle('eggs')).toBe('Dairy');
  });
});

describe('generateGroceryFromPlan', () => {
  const catalog: Recipe[] = [
    {
      id: 'r1', title: 'Pasta', time: '', servings: 1, tags: [], emoji: '',
      ingredients: ['Pasta', ' garlic '], steps: [],
    },
    {
      id: 'r2', title: 'Salad', time: '', servings: 1, tags: [], emoji: '',
      ingredients: ['garlic', 'tomato'], steps: [],
    },
  ];
  const plan: WeekPlan = {
    mon: { lunch: 'r1', dinner: 'r2' },
    tue: { lunch: 'r1' }, // same recipe twice -> dedup
    wed: { lunch: '' },   // empty slot -> skipped
    thu: { lunch: 'nope' }, // unknown id -> skipped
  };

  it('dedupes by normalized name across days and meals', () => {
    const list = generateGroceryFromPlan(plan, catalog);
    const names = list.map((i) => i.name.toLowerCase().trim());
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('pasta');
    expect(names.filter((n) => n === 'garlic').length).toBe(1);
  });

  it('is deterministic in first-seen order and skips empty/unknown slots', () => {
    const a = generateGroceryFromPlan(plan, catalog);
    const b = generateGroceryFromPlan(plan, catalog);
    expect(a).toEqual(b);
    expect(a.map((i) => i.name.toLowerCase().trim())).toEqual(['pasta', 'garlic', 'tomato']);
  });

  it('assigns aisles via guessAisle', () => {
    const list = generateGroceryFromPlan(plan, catalog);
    expect(list.find((i) => i.name.toLowerCase() === 'pasta')!.aisle).toBe('Pantry');
    expect(list.find((i) => i.name.toLowerCase() === 'tomato')!.aisle).toBe('Produce');
  });
});

describe('custom recipes + planner storage', () => {
  const custom: Recipe = {
    id: 'c1', title: 'Custom Curry', time: '30 min', servings: 2,
    tags: [], emoji: '🍛', ingredients: ['chicken', 'coconut milk'], steps: ['cook'],
  };

  it('clips custom recipes (newest first) and merges with built-ins', () => {
    saveCustomRecipe(custom);
    expect(loadCustomRecipes()[0].title).toBe('Custom Curry');
    const all = getAllRecipes();
    expect(all.length).toBe(recipes.length + 1);
    expect(all[0].title).toBe('Custom Curry');
  });

  it('week plan round-trips and starts empty', () => {
    expect(loadWeekPlan()).toEqual({});
    const plan: WeekPlan = { mon: { dinner: 'r3' } };
    saveWeekPlan(plan);
    expect(loadWeekPlan()).toEqual(plan);
  });

  it('getRecipe finds built-ins by id', () => {
    expect(getRecipe('r3')?.title).toBe('Chicken Stir Fry');
    expect(getRecipe('nope')).toBeUndefined();
  });
});
