import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Les Petits Plats de Ludo" },
      { name: "description", content: "Mentions légales du site Les Petits Plats de Ludo." },
      { property: "og:title", content: "Mentions légales" },
    ],
    links: [{ rel: "canonical", href: "/mentions-legales" }],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-16 md:px-8">
      <p className="font-hand text-2xl text-primary">Les petites lignes</p>
      <h1 className="mt-1 font-display text-5xl font-bold">Mentions légales</h1>
      <div className="prose mt-10 space-y-6 text-foreground/90">
        <section>
          <h2 className="font-display text-2xl font-bold">Éditeur du site</h2>
          <p className="mt-2 text-sm">Le présent site « Les Petits Plats de Ludo » est édité par Ludo, créatrice de contenu culinaire.</p>
          <p className="text-sm">Contact : <a href="mailto:ludo@example.com" className="text-primary hover:underline">ludo@example.com</a></p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">Hébergement</h2>
          <p className="mt-2 text-sm">Site hébergé sur l'infrastructure Lovable / Cloudflare.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">Propriété intellectuelle</h2>
          <p className="mt-2 text-sm">L'ensemble des recettes, textes, photographies et illustrations sont la propriété exclusive de leur autrice, sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">Responsabilité</h2>
          <p className="mt-2 text-sm">Les recettes sont partagées à titre informatif. L'éditrice ne saurait être tenue responsable d'éventuelles allergies, intolérances ou réactions liées à la préparation des recettes.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">Contact</h2>
          <p className="mt-2 text-sm">Pour toute question, écrivez à <a href="mailto:ludo@example.com" className="text-primary hover:underline">ludo@example.com</a>.</p>
        </section>
      </div>
    </article>
  );
}