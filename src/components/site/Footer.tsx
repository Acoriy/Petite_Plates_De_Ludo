import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listCategories } from "@/lib/recipes";
import { CHEF_CONTACT } from "@/lib/site-config";
import { CategoryImage } from "@/components/site/CategoryImage";

export function Footer() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  return (
    <footer className="mt-24 text-cream" style={{ backgroundColor: "#85511C" }}>
      <div className="container mx-auto px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-honey text-2xl">
                👨‍🍳
              </div>
              <div>
                <p className="font-display text-xl font-bold text-cream">Les Petits Plats</p>
                <p className="font-hand text-lg text-honey -mt-1">de Ludo</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/85">
              Des recettes qui sentent bon le beurre noisette, racontées avec un brin
              d'humour et beaucoup d'amour. Bienvenue dans la cuisine de Ludo.
            </p>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wider text-honey">Catégories</p>
            <ul className="mt-4 space-y-2 text-sm text-cream/90">
              {categories.length === 0 ? (
                <>
                  <li><Link to="/carnet-de-recettes" className="transition-colors hover:text-honey">Toutes les recettes</Link></li>
                  <li><Link to="/carnet-de-recettes" className="transition-colors hover:text-honey">Catégories</Link></li>
                </>
              ) : (
                categories.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/carnet-de-recettes/categorie/$slug"
                      params={{ slug: c.slug }}
                      className="inline-flex items-center gap-2 transition-colors hover:text-honey"
                    >
                      <span className="h-6 w-6 shrink-0 overflow-hidden rounded-md">
                        <CategoryImage category={c} className="h-6 w-6" rounded="rounded-md" />
                      </span>
                      {c.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wider text-honey">Le site</p>
            <ul className="mt-4 space-y-2 text-sm text-cream/90">
              <li><Link to="/carnet-de-recettes" className="transition-colors hover:text-honey">Toutes les recettes</Link></li>
              <li><Link to="/qui-suis-je" className="transition-colors hover:text-honey">À propos de Ludo</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-honey">Contact</Link></li>
            </ul>

            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-honey">Me suivre</p>
            <div className="mt-3 flex gap-3">
              <a
                href={CHEF_CONTACT.facebook}
                target="_blank" rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-cream/15 text-cream transition-all hover:bg-honey hover:text-espresso hover:scale-110"
                aria-label="Facebook"
              >
                <span className="text-base font-bold">f</span>
              </a>
              <a
                href={`mailto:${CHEF_CONTACT.email}`}
                className="grid h-10 w-10 place-items-center rounded-full bg-cream/15 text-cream transition-all hover:bg-honey hover:text-espresso hover:scale-110"
                aria-label="Email"
              >
                <span className="text-base">✉</span>
              </a>
              <a
                href={CHEF_CONTACT.instagram}
                target="_blank" rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-cream/15 text-cream transition-all hover:bg-honey hover:text-espresso hover:scale-110"
                aria-label="Instagram"
              >
                <span className="text-[11px] font-bold">IG</span>
              </a>
            </div>
            <p className="mt-3 text-xs text-cream/80">{CHEF_CONTACT.location}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-cream/20 pt-8 text-xs text-cream/80 md:flex-row">
          <p>© {new Date().getFullYear()} Les Petits Plats de Ludo — Mijoté avec 🧡.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link to="/mentions-legales" className="transition-colors hover:text-honey">Mentions légales</Link>
            <Link to="/confidentialite" className="transition-colors hover:text-honey">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
