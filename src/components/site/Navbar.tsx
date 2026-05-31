import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ChefHat } from "lucide-react";
import { listCategories } from "@/lib/recipes";
import { CategoryImage } from "@/components/site/CategoryImage";
import { cn } from "@/lib/utils";

const NAV_LINKS: { to: "/" | "/carnet-de-recettes" | "/qui-suis-je" | "/contact"; label: string; hasDropdown?: boolean }[] = [
  { to: "/", label: "Accueil" },
  { to: "/carnet-de-recettes", label: "Carnet de recettes", hasDropdown: true },
  { to: "/qui-suis-je", label: "Qui suis-je ?" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverRecipes, setHoverRecipes] = useState(false);
  const { location } = useRouterState();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    staleTime: 60_000,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 no-print",
        scrolled ? "bg-background/85 backdrop-blur-md shadow-[var(--shadow-soft)]" : "bg-transparent",
      )}
    >
      <nav className="container mx-auto flex h-20 items-center justify-between gap-6 px-4 md:px-8">
        <Link to="/" className="group flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 0.5 }}
            className="grid h-11 w-11 place-items-center rounded-full bg-[var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-warm)]"
          >
            <ChefHat className="h-5 w-5" />
          </motion.div>
          <div className="leading-tight">
            <p className="font-display text-lg font-bold text-foreground">Les Petits Plats</p>
            <p className="-mt-1 font-hand text-sm text-primary">de Ludo</p>
          </div>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li
              key={link.to}
              className="relative"
              onMouseEnter={() => link.hasDropdown && setHoverRecipes(true)}
              onMouseLeave={() => link.hasDropdown && setHoverRecipes(false)}
            >
              <Link
                to={link.to}
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: link.to === "/" }}
              >
                {link.label}
              </Link>
              <AnimatePresence>
                {link.hasDropdown && hoverRecipes && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.28 }}
                    className="absolute left-1/2 top-full z-40 mt-3 -translate-x-1/2 w-[70vw] max-w-[1200px] rounded-2xl border border-border bg-popover p-6 shadow-[var(--shadow-deep)]"
                  >
                    <div className="flex items-center justify-between px-2">
                      <p className="font-hand text-base text-primary">Par catégorie</p>
                      <Link
                        to="/carnet-de-recettes"
                        className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                      >
                        Voir toutes les recettes →
                      </Link>
                    </div>

                    {categories.length === 0 ? (
                      <p className="px-3 py-6 text-sm text-muted-foreground">Aucune catégorie pour le moment.</p>
                    ) : (
                      <motion.div className="mt-4 flex flex-wrap gap-4 overflow-hidden px-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {categories.map((cat, i) => (
                          <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex w-1/3 min-w-[180px] max-w-[260px] items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground/80 transition-all hover:bg-secondary hover:text-primary"
                          >
                            <Link
                              to="/carnet-de-recettes/categorie/$slug"
                              params={{ slug: cat.slug }}
                              className="flex items-center gap-3 w-full"
                            >
                              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                                <CategoryImage category={cat} className="h-12 w-12" rounded="rounded-lg" />
                              </span>
                              <span className="line-clamp-2">{cat.name}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            to="/carnet-de-recettes"
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground md:inline-flex"
            aria-label="Rechercher"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            to="/carnet-de-recettes"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-warm)] transition-transform hover:scale-105 md:inline-flex"
          >
            Carnet de recettes
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-secondary lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <ul className="container mx-auto flex flex-col gap-1 p-4">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="block rounded-xl px-4 py-3 text-base font-semibold transition-colors hover:bg-secondary"
                    activeProps={{ className: "text-primary bg-secondary" }}
                    activeOptions={{ exact: l.to === "/" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {categories.length > 0 && (
                <li className="mt-2 border-t border-border pt-3">
                  <p className="px-4 pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Catégories</p>
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to="/carnet-de-recettes/categorie/$slug"
                        params={{ slug: cat.slug }}
                        className="flex items-center gap-2 rounded-xl bg-secondary p-2 text-sm font-semibold"
                      >
                        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                          <CategoryImage category={cat} className="h-10 w-10" rounded="rounded-lg" />
                        </span>
                        <span className="line-clamp-2 text-xs">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </li>
              )}
              <li>
                <Link
                  to="/carnet-de-recettes"
                  className="mt-2 block rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground"
                >
                  Carnet de recettes
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
