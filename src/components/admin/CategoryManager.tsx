import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { listCategoriesForAdmin } from "@/lib/admin-dashboard";
import { createCategory, deleteCategory, uploadCategoryImage, updateCategory } from "@/lib/categories";
import { humanizeError } from "@/lib/form-errors";
import { CategoryImage } from "@/components/site/CategoryImage";
import type { Category } from "@/lib/recipes";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Nom trop court (2 caractères minimum)").max(80),
  image_url: z.string().url("Image invalide — utilisez une URL valide ou uploadez un fichier"),
});

export function CategoryManager() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<{ name: string; slug: string; image_url?: string | null }>({ name: "", slug: "", image_url: "" });
  const [form, setForm] = useState({ name: "", image_url: "" });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: categories = [], refetch, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: listCategoriesForAdmin,
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadCategoryImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Image envoyée");
    } catch (err) {
      toast.error(humanizeError(err));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = categorySchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      await createCategory(parsed.data);
      toast.success("Catégorie créée — visible sur tout le site");
      setForm({ name: "", image_url: "" });
      refetch();
      invalidateAll();
    } catch (err) {
      toast.error(humanizeError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (cat: Category) => {
    if (!confirm(`Supprimer la catégorie « ${cat.name} » ?`)) return;
    try {
      await deleteCategory(cat.id);
      toast.success("Catégorie supprimée");
      refetch();
      invalidateAll();
    } catch (err) {
      toast.error(humanizeError(err));
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingForm({ name: cat.name, slug: cat.slug, image_url: cat.image_url ?? undefined });
  };

  const saveEdit = async (id: string) => {
    setBusy(true);
    try {
      await updateCategory(id, { name: editingForm.name, slug: editingForm.slug, image_url: editingForm.image_url ?? null });
      toast.success("Catégorie mise à jour");
      setEditingId(null);
      refetch();
      invalidateAll();
    } catch (err) {
      toast.error(humanizeError(err));
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold">Ajouter une catégorie</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nom + image uniquement. La catégorie apparaît immédiatement dans la navigation, l&apos;accueil et le carnet.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Nom de la catégorie</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex : Entrées, Plats du dimanche…"
              className="mt-1.5 h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Image de la catégorie</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://… ou uploadez ci-dessous"
              className="mt-1.5 h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm"
            />
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background py-4 text-sm text-muted-foreground hover:border-primary">
              <ImageIcon className="h-4 w-4" />
              {uploading ? "Envoi en cours…" : "Choisir une image depuis l'ordinateur"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && void onUpload(e.target.files[0])}
              />
            </label>
            {form.image_url && (
              <div className="mt-3 h-36 w-full overflow-hidden rounded-xl border border-border">
                <img src={form.image_url} alt="Aperçu" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={busy || uploading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {busy ? "Création…" : "Créer la catégorie"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-bold">Catégories existantes ({categories.length})</h3>
        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Chargement…</p>
        ) : categories.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Aucune catégorie. Ajoutez-en une ci-dessus.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
                  <li key={cat.id} className="flex gap-3 rounded-2xl border border-border bg-background p-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <CategoryImage category={cat} className="h-16 w-16" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {editingId === cat.id ? (
                        <div className="space-y-1">
                          <input value={editingForm.name} onChange={e => setEditingForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm" />
                          <input value={editingForm.slug} onChange={e => setEditingForm(f => ({ ...f, slug: e.target.value }))} className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm" />
                          <input value={editingForm.image_url ?? ""} onChange={e => setEditingForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Image URL" className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm" />
                        </div>
                      ) : (
                        <>
                          <p className="truncate font-semibold">{cat.name}</p>
                          <p className="truncate text-xs text-muted-foreground">/{cat.slug}</p>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {editingId === cat.id ? (
                        <>
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(cat.id)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Enregistrer</button>
                            <button onClick={() => setEditingId(null)} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">Annuler</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(cat)} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">Éditer</button>
                            <button type="button" onClick={() => void remove(cat)} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">Supprimer</button>
                          </div>
                        </>
                      )}
                    </div>
                  </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
