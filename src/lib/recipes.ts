import { supabase } from "@/integrations/supabase/client";

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}
export interface Instruction {
  step: number;
  text: string;
  image?: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  astuces: string | null;
  chef_notes?: string | null;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: "Facile" | "Moyen" | "Difficile";
  cover_image: string | null;
  gallery: string[] | null;
  category_id: string | null;
  tags: string[] | null;
  views: number;
  likes: number;
  featured: boolean;
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string; slug: string; image_url: string | null } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

const SELECT_RECIPE_BASE =
  "id,slug,title,description,ingredients,instructions,astuces,prep_time,cook_time,servings,difficulty,cover_image,gallery,category_id,tags,views,likes,featured,status,seo_title,seo_description,published_at,created_at,updated_at,category:categories(id,name,slug,image_url)";

const SELECT_RECIPE_WITH_CHEF = `${SELECT_RECIPE_BASE},chef_notes`;
const SELECT_CATEGORY = "id,name,slug,description,image_url,display_order";

function selectRecipeFields(includeChefNotes = true) {
  return includeChefNotes ? SELECT_RECIPE_WITH_CHEF : SELECT_RECIPE_BASE;
}

async function selectRecipe(query: ReturnType<typeof supabase.from> & { select: (cols: string) => any }) {
  const { data, error } = await query.select(selectRecipeFields(true));
  if (!error) return { data, error };
  if (error.message?.includes("chef_notes")) {
    return query.select(selectRecipeFields(false));
  }
  return { data, error };
}

/** Recettes publiées depuis Supabase uniquement (100 % dynamique). */
export async function listPublishedRecipes(opts?: {
  limit?: number;
  featured?: boolean;
  categorySlug?: string;
}): Promise<Recipe[]> {
  let categoryId: string | null = null;
  if (opts?.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", opts.categorySlug)
      .maybeSingle();
    categoryId = cat?.id ?? "__none__";
  }

  const buildListQuery = (includeChefNotes = true) => {
    let q = supabase
      .from("recipes")
      .select(selectRecipeFields(includeChefNotes))
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (opts?.featured) q = q.eq("featured", true);
    if (categoryId) q = q.eq("category_id", categoryId);
    if (opts?.limit) q = q.limit(opts.limit);
    return q;
  };

  let result = await buildListQuery(true);
  if (result.error && result.error.message?.includes("chef_notes")) {
    result = await buildListQuery(false);
  }
  if (result.error) throw result.error;
  return (result.data ?? []) as unknown as Recipe[];
}

function normalizeSlug(input: string): string {
  // Normalisation tolérante pour éviter les mismatches entre le slug affiché et le slug stocké en DB.
  // - trim pour enlever espaces
  // - decode si le slug vient déjà encodé
  // - lower pour éviter les variations de casse
  return input.trim().replace(/\/+$/g, "").replace(/^\/+/, "").toLowerCase();
  // decodeURIComponent peut throw si la chaîne n'est pas encodée correctement
  // donc on protège.
}

function safeDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const normalized = normalizeSlug(safeDecode(slug));

  let result = await supabase
    .from("recipes")
    .select(selectRecipeFields(true))
    .eq("slug", normalized)
    .eq("status", "published")
    .maybeSingle();
  if (result.error && result.error.message?.includes("chef_notes")) {
    result = await supabase
      .from("recipes")
      .select(selectRecipeFields(false))
      .eq("slug", normalized)
      .eq("status", "published")
      .maybeSingle();
  }
  if (result.error) throw result.error;
  return result.data ? (result.data as unknown as Recipe) : null;
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  let result = await supabase
    .from("recipes")
    .select(selectRecipeFields(true))
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (result.error && result.error.message?.includes("chef_notes")) {
    result = await supabase
      .from("recipes")
      .select(selectRecipeFields(false))
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
  }
  if (result.error) throw result.error;
  return result.data ? (result.data as unknown as Recipe) : null;
}

/** Catégories depuis Supabase uniquement (100 % dynamique). */
export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(SELECT_CATEGORY)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function incrementViews(slug: string) {
  await supabase.rpc("increment_recipe_views", { _slug: slug });
}

export async function incrementLikes(slug: string) {
  await supabase.rpc("increment_recipe_likes", { _slug: slug });
}
