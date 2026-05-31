import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import ludoPortrait from "@/assets/ludo-portrait.jpg";
import ludoCooking from "@/assets/ludo-cooking.jpg";

export const Route = createFileRoute("/qui-suis-je")({
  head: () => ({
    meta: [
      { title: "Qui suis-je ? — Ludo, créateur des Petits Plats" },
      { name: "description", content: "L'histoire de Ludo, chef autodidacte derrière Les Petits Plats : passion, cuisine maison, humour. Découvrez le chef derrière les recettes." },
      { property: "og:title", content: "Qui suis-je ? — Les Petits Plats de Ludo" },
      { property: "og:description", content: "Chef autodidacte, passionné de cuisine maison. Voici mon histoire." },
      { property: "og:url", content: "/qui-suis-je" },
    ],
    links: [{ rel: "canonical", href: "/qui-suis-je" }],
  }),
  component: AboutPage,
});

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function AboutPage() {
  return (
    <div className="overflow-hidden bg-[var(--cream)]">
      <AboutHero />
      <NarrativeSection
        eyebrow="★ Chapitre 1 ★"
        title="L'enfant qui regardait <em>mijoter</em>."
        image={ludoPortrait}
        imageAlt="Portrait de Ludo, chef autodidacte"
        side="right"
        paragraphs={[
          "Tout a commencé dans la cuisine de ma grand-mère, un tabouret en formica sous les fesses, le nez au ras de la cocotte. Je ne comprenais pas grand-chose à ce qui se passait — mais je savais qu'à l'instant où le beurre noisette parfumait la pièce, le monde s'arrêtait deux secondes pour respirer.",
          "Pendant longtemps, j'ai cru que cuisiner, c'était un truc qui appartenait aux autres : les chefs en veste blanche, les mères qui « savaient », les tantes qui « avaient le geste ». Spoiler : c'est faux. Le geste, ça s'apprend. La gourmandise, ça se transmet. Et l'humour autour de la table, ça se cultive comme on cultive le basilic — avec un peu d'eau, beaucoup de soleil, et l'envie sincère de faire plaisir.",
          "Alors un jour, j'ai cassé mon premier œuf en cachette. Puis le deuxième. Puis les douze de la boîte. Ma mère hurlait, mais l'omelette était bonne. C'est exactement ce moment-là — entre le cri et la fourchette — que j'ai compris que j'allais y passer ma vie.",
        ]}
        sticker="Promis, j'ai progressé."
      />

      <NarrativeSection
        eyebrow="★ Chapitre 2 ★"
        title="Aujourd'hui, je <em>raconte des plats</em>."
        image={ludoCooking}
        imageAlt="Ludo en cuisine, en pleine préparation"
        side="left"
        paragraphs={[
          "Les Petits Plats, c'est ma façon de transmettre ce que ma grand-mère, mes ratés et mes amis m'ont appris : qu'une recette, ce n'est pas une liste de courses, c'est une petite histoire avec un début (le marché), un milieu (la patience) et une fin heureuse (la part qu'on se ressert en cachette).",
          "Ici, vous trouverez des plats simples, francs, parfois roboratifs, souvent rigolos. Pas de vocabulaire pompeux, pas de matériel à 400 €, pas de « pincée d'azote liquide ». Juste des produits que vous trouvez vraiment, des étapes que vous suivez vraiment, et un résultat qui fait dire « encore » vraiment.",
          "Mon obsession ? Que vous refermiez la page avec une envie : enfiler un tablier, mettre la radio un peu trop fort, et nourrir quelqu'un que vous aimez. Si à la fin il y a des rires, des miettes, et un petit silence gourmand — alors j'ai gagné ma journée.",
        ]}
        sticker="Bienvenue à la maison."
      />

      <QuoteSection />
    </div>
  );
}

function AboutHero() {
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-16">
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[var(--sage)]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-[var(--caramel)]/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
        className="container relative mx-auto max-w-3xl px-4 text-center md:px-8"
      >
        <p className="font-hand text-3xl text-[var(--caramel)]">Enchanté —</p>
        <h1 className="mt-2 font-display text-5xl font-bold leading-[1.02] tracking-tight text-[var(--espresso)] md:text-7xl">
          Moi, c'est <span className="italic text-[var(--caramel)]">Ludo.</span>
        </h1>
        <p className="mt-6 text-base leading-relaxed text-[var(--espresso)]/75 md:text-lg">
          Deux chapitres, une cuisine, et beaucoup trop de beurre.
          Voici l'histoire — la vraie, celle qu'on raconte en mangeant.
        </p>
      </motion.div>
    </section>
  );
}

function NarrativeSection({
  eyebrow, title, image, imageAlt, side, paragraphs, sticker,
}: {
  eyebrow: string; title: string; image: string; imageAlt: string;
  side: "left" | "right"; paragraphs: string[]; sticker: string;
}) {
  const imageFirst = side === "left";

  return (
    <section className="relative py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: imageFirst ? -60 : 60, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: EASE_OUT }}
            className={`relative lg:col-span-5 ${imageFirst ? "lg:order-1" : "lg:order-2"}`}
          >
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-[var(--espresso)] shadow-[var(--shadow-deep)]">
              <img src={image} alt={imageAlt} loading="lazy" className="aspect-[4/5] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--espresso)]/30 via-transparent to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, rotate: imageFirst ? -8 : 8, scale: 0.8 }}
              whileInView={{ opacity: 1, rotate: imageFirst ? -6 : 6, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring", stiffness: 180, damping: 14 }}
              className={`absolute ${imageFirst ? "-right-4 -bottom-5" : "-left-4 -bottom-5"} max-w-[200px] rounded-2xl border-2 border-[var(--espresso)] bg-[var(--caramel)] px-4 py-2.5 font-hand text-lg text-[var(--cream)] shadow-[4px_4px_0_0_var(--espresso)]`}
            >
              {sticker}
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
            className={`lg:col-span-7 ${imageFirst ? "lg:order-2" : "lg:order-1"}`}
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } } }}
              className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--caramel)]"
            >
              {eyebrow}
            </motion.p>
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } } }}
              className="mt-4 font-display text-4xl font-bold leading-[1.05] text-[var(--espresso)] md:text-6xl"
              dangerouslySetInnerHTML={{ __html: title.replace(/<em>/g, '<em class="text-[var(--caramel)]">') }}
            />
            <div className="mt-8 space-y-6">
              {paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } } }}
                  className="text-base leading-[1.85] text-[var(--espresso)]/80 md:text-lg"
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function QuoteSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--espresso)] py-24 text-[var(--cream)] md:py-32">
      <div aria-hidden className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[var(--caramel)]/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[var(--sage)]/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="container relative mx-auto max-w-3xl px-4 text-center md:px-8"
      >
        <Quote className="mx-auto h-10 w-10 text-[var(--caramel)]" />
        <p className="mt-6 font-display text-3xl font-bold leading-tight md:text-5xl">
          « La cuisine, c'est de l'amour <em className="text-[var(--caramel)]">rendu visible.</em> »
        </p>
        <p className="mt-8 font-hand text-3xl text-[var(--caramel)]">— Ludo</p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/carnet-de-recettes"
            className="group inline-flex items-center gap-3 rounded-full bg-[var(--caramel)] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cream)] shadow-[var(--shadow-deep)] transition-transform hover:scale-[1.03]"
          >
            Voir le carnet de recettes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/contact"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cream)] underline-offset-8 hover:text-[var(--caramel)] hover:underline"
          >
            Me contacter
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
