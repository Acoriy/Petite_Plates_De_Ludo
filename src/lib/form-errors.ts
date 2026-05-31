import { z } from "zod";

const FIELD_LABELS: Record<string, string> = {
  title: "Titre",
  slug: "Lien de la recette",
  description: "Description",
  category_id: "Catégorie",
  prep_time: "Temps de préparation",
  cook_time: "Temps de cuisson",
  servings: "Portions",
  difficulty: "Difficulté",
  cover_image: "Image de couverture",
  name: "Nom de l'ingrédient",
  quantity: "Quantité",
  unit: "Unité",
  text: "Texte de l'étape",
  step: "Numéro d'étape",
  ingredients: "Ingrédients",
  instructions: "Étapes",
};

export function humanizeError(err: unknown): string {
  if (err instanceof z.ZodError) {
    return err.issues
      .map((issue) => {
        const key = issue.path[issue.path.length - 1];
        const label = typeof key === "string" ? FIELD_LABELS[key] ?? key : "Champ";
        return `${label} : ${issue.message}`;
      })
      .join(" · ");
  }

  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message: string }).message);
    if (msg.includes("duplicate key") || msg.includes("recipes_slug_key")) {
      return "Une recette avec un lien similaire existe déjà. Modifiez légèrement le titre.";
    }
    if (msg.includes("Invalid login")) return "Email ou mot de passe incorrect.";
    return msg;
  }

  return "Une erreur est survenue. Vérifiez les champs et réessayez.";
}
