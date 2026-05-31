-- Add chef_notes support to recipes for Ludo admin notes and detail page display
ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS chef_notes text;
