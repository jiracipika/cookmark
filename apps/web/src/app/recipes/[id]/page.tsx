import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipe, recipes } from '../../../lib/recipes';

export function generateStaticParams() {
  return recipes.map(({ id }) => ({ id }));
}

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const recipe = getRecipe(params.id);

  if (!recipe) notFound();

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/recipes" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 16, display: 'inline-block' }}>← All recipes</Link>
        <article style={{ padding: 24, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
          <div aria-hidden="true" style={{ fontSize: 48, marginBottom: 12 }}>{recipe.emoji}</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--ios-label)', marginBottom: 8 }}>{recipe.title}</h1>
          <p style={{ fontSize: 14, color: 'var(--ios-label3)', marginBottom: 24 }}>{recipe.time} · {recipe.servings} servings · {recipe.tags.join(' · ')}</p>

          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Ingredients</h2>
          <ul style={{ margin: '0 0 24px 20px', color: 'var(--ios-label2)' }}>
            {recipe.ingredients.map(ingredient => <li key={ingredient} style={{ padding: '5px 0' }}>{ingredient}</li>)}
          </ul>

          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Directions</h2>
          <ol style={{ listStyle: 'none' }}>
            {recipe.steps.map((step, index) => (
              <li key={step} style={{ display: 'flex', gap: 12, marginBottom: 14, color: 'var(--ios-label2)', lineHeight: 1.5 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ios-blue)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </div>
  );
}