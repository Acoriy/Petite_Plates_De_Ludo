import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { listPublishedRecipes, listCategories } from "@/lib/recipes";
import { RecipeCard } from "@/components/site/RecipeCard";
import { CategoryImage } from "@/components/site/CategoryImage";
import { FunnyLoader, RecipeCardSkeleton } from "@/components/site/FunnyLoader";

export const Route = createFileRoute("/carnet-de-recettes")({
  head: () => ({
    meta: [
      { title: "Carnet de recettes — Les Petits Plats de Ludo" },
      { name: "description", content: "Parcourez tout le carnet de recettes de Ludo : entrées, plats, desserts et plus." },
      { property: "og:title", content: "Le carnet de recettes — Ludo" },
      { property: "og:description", content: "Toutes les recettes maison de Ludo, à filtrer et rechercher." },
      { property: "og:url", content: "/carnet-de-recettes" },
    ],
    links: [{ rel: "canonical", href: "/carnet-de-recettes" }],
  }),
  component: CarnetPage,
});

function CarnetPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const { data: recipes = [], isLoading, isError } = useQuery({
    queryKey: ["recipes", "all"],
    queryFn: () => listPublishedRecipes(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const filtered = useMemo(
    () =>
      recipes.filter(
        (r) =>
          (!cat || r.category?.slug === cat) &&
          (!q ||
            r.title.toLowerCase().includes(q.toLowerCase()) ||
            r.description.toLowerCase().includes(q.toLowerCase())),
      ),
    [recipes, q, cat],
  );

  return (
    <div className="container mx-auto px-4 py-16 md:px-8">
      <header className="text-center">
        <p className="font-hand text-2xl text-primary">À table !</p>
        <h1 className="mt-1 font-display text-5xl font-bold md:text-6xl">Le carnet de recettes</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Recettes 100 % dynamiques depuis la base. {recipes.length} recette{recipes.length !== 1 ? "s" : ""} à explorer.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tarte, risotto, brioche…"
            className="h-14 w-full rounded-full border-2 border-border bg-card pl-12 pr-6 text-base shadow-[var(--shadow-soft)] outline-none transition-colors focus:border-primary"
          />
        </div>

        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setCat(null)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                !cat ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-primary/10"
              }`}
            >
              Toutes
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.slug)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  cat === c.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-primary/10"
                }`}
              >
                <span className="h-7 w-7 overflow-hidden rounded-full">
                  <CategoryImage category={c} className="h-7 w-7" rounded="rounded-full" />
                </span>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <>
          <FunnyLoader />
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : isError ? (
        <p className="mt-16 text-center text-destructive">Impossible de charger les recettes. Réessayez plus tard.</p>
      ) : (
        <>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r, i) => (
              <RecipeCard key={r.id} recipe={r} index={i} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-16 text-center text-muted-foreground">
              {recipes.length === 0
                ? "Aucune recette publiée pour le moment. Ajoutez-en depuis le dashboard Ludo."
                : "Aucune recette trouvée. Essayez autre chose."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
