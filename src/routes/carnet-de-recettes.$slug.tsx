import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { getRecipeBySlug, incrementViews, listPublishedRecipes } from "@/lib/recipes";
import { RecipeDetailExperience } from "@/components/site/RecipeDetailExperience";

export const Route = createFileRoute("/carnet-de-recettes/$slug")({
  loader: async ({ params }) => {
    const recipe = await getRecipeBySlug(params.slug);
    if (!recipe) throw notFound();
    return { recipe };
  },
  head: ({ params, loaderData }) => {
    const r = loaderData?.recipe;
    return {
      meta: [
        { title: r?.seo_title ?? `${r?.title} — Les Petits Plats de Ludo` },
        { name: "description", content: r?.seo_description ?? r?.description ?? "" },
        { property: "og:title", content: r?.title ?? "" },
        { property: "og:description", content: r?.description ?? "" },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/carnet-de-recettes/${params.slug}` },
        ...(r?.cover_image ? [{ property: "og:image", content: r.cover_image }] : []),
      ],
      links: [{ rel: "canonical", href: `/carnet-de-recettes/${params.slug}` }],
      scripts: r
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Recipe",
                name: r.title,
                description: r.description,
                image: r.cover_image,
                author: { "@type": "Person", name: "Ludo" },
                prepTime: `PT${r.prep_time}M`,
                cookTime: `PT${r.cook_time}M`,
                totalTime: `PT${r.prep_time + r.cook_time}M`,
                recipeYield: `${r.servings} portions`,
                recipeIngredient: r.ingredients.map((i) => `${i.quantity} ${i.unit} ${i.name}`.trim()),
                recipeInstructions: r.instructions.map((i) => ({ "@type": "HowToStep", text: i.text })),
              }),
            },
          ]
        : [],
    };
  },
  component: RecipePage,
  notFoundComponent: () => (
    <div className="container mx-auto py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Recette introuvable</h1>
      <Link to="/carnet-de-recettes" className="mt-6 inline-block text-primary hover:underline">
        ← Retourner au carnet
      </Link>
    </div>
  ),
});

function RecipePage() {
  const { slug } = Route.useParams();
  const { recipe: initial } = Route.useLoaderData();
  const { data: recipe = initial } = useQuery({
    queryKey: ["recipe", slug],
    queryFn: () => getRecipeBySlug(slug),
    initialData: initial,
  });

  const { data: allPublished = [] } = useQuery({
    queryKey: ["recipes", "related", slug],
    queryFn: () => listPublishedRecipes({ limit: 12 }),
  });

  const related = useMemo(() => {
    if (!recipe) return [];
    const sameCategory = allPublished.filter(
      (r) => r.slug !== recipe.slug && r.category_id === recipe.category_id,
    );
    const others = allPublished.filter(
      (r) => r.slug !== recipe.slug && r.category_id !== recipe.category_id,
    );
    return [...sameCategory, ...others];
  }, [allPublished, recipe]);

  useEffect(() => {
    if (slug) incrementViews(slug).catch(() => {});
  }, [slug]);

  if (!recipe) return null;

  return <RecipeDetailExperience recipe={recipe} related={related} />;
}
