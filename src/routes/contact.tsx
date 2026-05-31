import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Facebook } from "lucide-react";
import { CHEF_CONTACT } from "@/lib/site-config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Les Petits Plats de Ludo" },
      { name: "description", content: "Envoyez un message à Ludo : questions, partenariats, suggestions de recettes." },
      { property: "og:title", content: "Contact — Ludo" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(80),
  email: z.string().trim().email("Email invalide").max(255),
  message: z.string().trim().min(10, "Message trop court").max(2000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = schema.safeParse(form);
    if (!res.success) { toast.error(res.error.issues[0].message); return; }
    setSending(true);
    setTimeout(() => {
      toast.success("Message envoyé ! Ludo vous répond bientôt 🥐");
      setForm({ name: "", email: "", message: "" });
      setSending(false);
    }, 800);
  };

  return (
    <div className="container mx-auto px-4 py-16 md:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <p className="font-hand text-2xl text-primary">On papote ?</p>
        <h1 className="mt-1 font-display text-5xl font-bold md:text-6xl">Contactez Ludo</h1>
        <p className="mt-4 text-muted-foreground">Une question, une idée de recette, un partenariat ? Écrivez-moi.</p>
      </header>

      <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <a href={`mailto:${CHEF_CONTACT.email}`} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary">
            <Mail className="h-5 w-5 text-primary" /><span className="text-sm font-semibold">{CHEF_CONTACT.email}</span>
          </a>
          <a href={CHEF_CONTACT.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary">
            <Facebook className="h-5 w-5 text-primary" /><span className="text-sm font-semibold">Page Facebook</span>
          </a>
          <a href={CHEF_CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">IG</span>
            <span className="text-sm font-semibold">Instagram</span>
          </a>
          <div className="rounded-2xl border border-border bg-card p-4 text-sm font-semibold text-muted-foreground">
            📍 {CHEF_CONTACT.location}
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" maxLength={80} className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-sm outline-none focus:border-primary" />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email" maxLength={255} className="h-12 w-full rounded-xl border-2 border-border bg-background px-4 text-sm outline-none focus:border-primary" />
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Votre message…" rows={6} maxLength={2000} className="w-full rounded-xl border-2 border-border bg-background p-4 text-sm outline-none focus:border-primary" />
          <button disabled={sending} className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-warm)] transition-transform hover:scale-[1.02] disabled:opacity-60">
            {sending ? "Envoi…" : "Envoyer le message"}
          </button>
        </form>
      </div>
    </div>
  );
}
