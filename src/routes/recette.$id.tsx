import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, Users, Check } from "lucide-react";
import type { Recipe } from "@/lib/recipes";
import { getRecipeById } from "@/lib/recipes";
import { LikeButton } from "@/components/site/LikeButton";

export const Route = createFileRoute("/recette/$id")({
  loader: async ({ params }) => {
    const recipe = await getRecipeById(params.id);
    if (!recipe) throw notFound();
    return { recipe };
  },
  component: RecipeDetailPage,
});

function RecipeDetailPage() {
  const { id } = Route.useParams();
  const { recipe: initial } = Route.useLoaderData() as { recipe: Recipe };

  const { data: recipe = initial, isLoading, error } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => getRecipeById(id),
    initialData: initial,
  });

  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (isLoading) return <div className="container mx-auto py-24 text-center">Chargement de la recette…</div>;
  if (error || !recipe) return <div className="container mx-auto py-24 text-center">Recette introuvable.</div>;

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.instructions) ? recipe.instructions : [];

  const toggle = (i: number) => setChecked((p) => ({ ...p, [i]: !p[i] }));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {recipe.cover_image && (
            <img src={recipe.cover_image} alt={recipe.title} className="w-full rounded-2xl object-cover" />
          )}

          <h1 className="mt-6 text-4xl font-bold">{recipe.title}</h1>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><Clock className="h-5 w-5" /> {recipe.prep_time + recipe.cook_time} min</span>
            <span className="inline-flex items-center gap-2"><Users className="h-5 w-5" /> {recipe.servings} pers.</span>
          </div>

          <div className="mt-8 prose max-w-none">
            <h2>Préparation</h2>
            <ol className="mt-4 list-decimal space-y-4">
              {steps.map((s, idx) => (
                <li key={idx} className="space-y-1">
                  <div className="font-semibold">Étape {idx + 1}</div>
                  <div>{(s as any).text ?? s}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="md:col-span-1">
          <div className="rounded-2xl border p-6 shadow">
            <h3 className="text-lg font-semibold">Ingrédients</h3>
            <p className="text-sm text-muted-foreground mt-1">Cliquez pour cocher</p>

            <ul className="mt-4 space-y-2">
              {ingredients.map((ing, i) => (
                <li
                  key={i}
                  onClick={() => toggle(i)}
                  className={`flex items-start gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                    checked[i] ? "opacity-40 line-through text-muted-foreground bg-secondary/50" : "hover:bg-secondary/5"
                  }`}
                >
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${checked[i] ? "bg-primary text-primary-foreground" : "bg-background"}`}>
                    {checked[i] ? <Check className="h-4 w-4" /> : null}
                  </span>
                  <div>
                    <div className="text-sm">
                      {ing.quantity ? `${ing.quantity} ${ing.unit ?? ""}` : ""}
                      <span className="ml-1">{ing.name}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <LikeButton slug={recipe.slug} initial={recipe.likes} size="md" />
          </div>
        </aside>
      </div>
    </div>
  );
}
