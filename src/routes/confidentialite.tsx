import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Les Petits Plats de Ludo" },
      { name: "description", content: "Politique de confidentialité, gestion des données personnelles et des cookies sur Les Petits Plats de Ludo." },
      { property: "og:title", content: "Politique de confidentialité" },
    ],
    links: [{ rel: "canonical", href: "/confidentialite" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-16 md:px-8">
      <p className="font-hand text-2xl text-primary">Vos données, vos règles</p>
      <h1 className="mt-1 font-display text-5xl font-bold">Politique de confidentialité</h1>
      <div className="prose mt-10 space-y-6 text-foreground/90 text-sm leading-relaxed">
        <section>
          <h2 className="font-display text-2xl font-bold">Données collectées</h2>
          <p>Nous ne collectons aucune donnée personnelle sans votre accord. Lors de votre navigation, des données techniques (type de navigateur, pages consultées) peuvent être enregistrées de manière anonyme à des fins statistiques.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">Cookies</h2>
          <p>Le site utilise des cookies pour :</p>
          <ul className="ml-6 list-disc">
            <li>Mémoriser votre préférence de consentement.</li>
            <li>Empêcher qu'un même visiteur "aime" plusieurs fois la même recette.</li>
            <li>Mesurer l'audience de façon anonyme.</li>
            <li>Servir des publicités personnalisées via Google AdSense (uniquement si vous acceptez).</li>
          </ul>
          <p>Vous pouvez à tout moment supprimer les cookies via les paramètres de votre navigateur.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">Google AdSense</h2>
          <p>Ce site est susceptible d'afficher des publicités fournies par Google AdSense. Google et ses partenaires peuvent utiliser des cookies pour diffuser des annonces basées sur vos visites antérieures. Vous pouvez désactiver l'utilisation des cookies de publicité personnalisée en visitant <a className="text-primary hover:underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">les paramètres des annonces Google</a>.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">Vos droits</h2>
          <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits : <a href="mailto:ludo@example.com" className="text-primary hover:underline">ludo@example.com</a>.</p>
        </section>
      </div>
    </article>
  );
}