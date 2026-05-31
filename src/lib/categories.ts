import { supabase } from "@/integrations/supabase/client";
import { slugifyTitle } from "@/lib/slugify";
import type { Category } from "@/lib/recipes";

const SELECT_CATEGORY = "id,name,slug,description,image_url,display_order,created_at,updated_at";

export async function uploadCategoryImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("recipe-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("recipe-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function createCategory(input: {
  name: string;
  image_url: string;
  description?: string;
}): Promise<Category> {
  const slug = slugifyTitle(input.name);
  const { data: last } = await supabase
    .from("categories")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name.trim(),
      slug,
      image_url: input.image_url,
      description: input.description?.trim() || null,
      display_order: (last?.display_order ?? 0) + 1,
      emoji: null,
    })
    .select(SELECT_CATEGORY)
    .single();

  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
