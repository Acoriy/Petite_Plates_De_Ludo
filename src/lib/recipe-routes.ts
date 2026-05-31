/** Lien vers la page détail d'une recette. */
export function recipeDetailLink(slug: string) {
  return {
    to: `/carnet-de-recettes/${slug}` as const,
  };
}
