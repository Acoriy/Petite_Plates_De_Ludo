import { cn } from "@/lib/utils";

type CategoryLike = { name: string; image_url?: string | null } | null | undefined;

/** Affichage image uniquement — aucune icône / emoji. */
export function CategoryImage({
  category,
  className,
  rounded = "rounded-xl",
}: {
  category: CategoryLike;
  className?: string;
  rounded?: string;
}) {
  const name = category?.name ?? "Catégorie";

  if (category?.image_url) {
    return (
      <img
        src={category.image_url}
        alt={name}
        loading="lazy"
        className={cn("h-full w-full object-cover", rounded, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-[var(--secondary)] text-[var(--espresso)]/40",
        rounded,
        className,
      )}
      aria-hidden
    >
      <span className="font-display text-lg font-bold uppercase tracking-widest">{name.slice(0, 2)}</span>
    </div>
  );
}
