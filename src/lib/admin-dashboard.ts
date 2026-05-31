import { supabase } from "@/integrations/supabase/client";
import type { Category, Recipe } from "@/lib/recipes";

const SELECT_RECIPE =
  "id,slug,title,description,ingredients,instructions,astuces,prep_time,cook_time,servings,difficulty,cover_image,gallery,category_id,tags,views,likes,featured,status,seo_title,seo_description,published_at,created_at,updated_at,category:categories(id,name,slug,image_url)";

const SELECT_CATEGORY = "id,name,slug,description,image_url,display_order";

/** Toutes les recettes (brouillons inclus) pour le dashboard admin. */
export async function listAdminRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select(SELECT_RECIPE)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Recipe[];
}

export async function listCategoriesForAdmin(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(SELECT_CATEGORY)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}
