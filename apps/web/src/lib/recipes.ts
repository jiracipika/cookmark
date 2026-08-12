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
