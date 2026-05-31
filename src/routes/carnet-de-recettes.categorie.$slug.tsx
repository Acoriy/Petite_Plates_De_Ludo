import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listPublishedRecipes, listCategories } from "@/lib/recipes";
import { RecipeCard } from "@/components/site/RecipeCard";
import { CategoryImage } from "@/components/site/CategoryImage";

export const Route = createFileRoute("/carnet-de-recettes/categorie/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Recettes ${params.slug} — Ludo` },
      { name: "description", content: `Toutes les recettes de la catégorie ${params.slug} par Ludo.` },
      { property: "og:title", content: `Catégorie ${params.slug}` },
      { property: "og:url", content: `/carnet-de-recettes/categorie/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/carnet-de-recettes/categorie/${params.slug}` }],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes", "cat", slug],
    queryFn: () => listPublishedRecipes({ categorySlug: slug }),
  });
  const cat = cats.find((c) => c.slug === slug);

  return (
    <div className="container mx-auto px-4 py-16 md:px-8">
      <Link to="/carnet-de-recettes" className="text-sm text-muted-foreground hover:text-primary">
        ← Tout le carnet
      </Link>

      <header className="mt-8 flex flex-col items-center text-center">
        <div className="h-40 w-full max-w-xl overflow-hidden rounded-3xl border-2 border-border shadow-[var(--shadow-soft)]">
          <CategoryImage category={cat ?? { name: slug, image_url: null }} className="h-40 w-full" rounded="rounded-3xl" />
        </div>
        <span className="mt-6 inline-flex rounded-full bg-honey/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          Catégorie
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{cat?.name ?? slug}</h1>
        {cat?.description && <p className="mt-3 max-w-xl text-muted-foreground">{cat.description}</p>}
        <p className="mt-2 text-sm text-muted-foreground">
          {recipes.length} recette{recipes.length > 1 ? "s" : ""}
        </p>
      </header>

      {isLoading ? (
        <p className="mt-12 text-center text-muted-foreground">Chargement des recettes…</p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} index={i} />
          ))}
        </div>
      )}

      {recipes.length === 0 && !isLoading && (
        <p className="mt-12 text-center text-muted-foreground">Aucune recette dans cette catégorie pour le moment.</p>
      )}
    </div>
  );
}
