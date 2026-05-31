-- Likes RPC + admin search RPC
CREATE OR REPLACE FUNCTION public.increment_recipe_likes(_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.recipes SET likes = likes + 1 WHERE slug = _slug AND status = 'published';
$$;

GRANT EXECUTE ON FUNCTION public.increment_recipe_likes(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_recipe_views(text) TO anon, authenticated;