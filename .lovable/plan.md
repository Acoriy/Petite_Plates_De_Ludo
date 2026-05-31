
# Plan — Site « Les Petits Plats de Ludo »

## 1. Contradiction à résoudre (likes vs login caché)

Vous avez répondu « Like avec compte utilisateur » mais aussi « ne pas afficher le bouton Connexion / les visiteurs ne doivent pas savoir qu'un dashboard existe ». Les deux sont incompatibles : sans bouton visible, personne ne peut créer de compte → personne ne peut liker.

**Solution proposée (la seule cohérente avec vos contraintes) :**
- **Likes anonymes** : 1 like par navigateur, stocké en `localStorage` + compteur incrémenté en base via une fonction RPC publique. Aucune inscription, aucun frottement, parfait pour le SEO et AdSense.
- Le compteur de likes reste visible et social comme demandé.
- Si plus tard vous voulez des comptes utilisateurs (favoris, commentaires), on les ajoutera ; ce n'est pas un blocage pour AdSense.

Le compte n'existe donc que pour **Ludo** (admin), via `/ludo-admin`.

## 2. Hero améliorée (humour + lecture instantanée)

On garde la structure actuelle et on **enrichit** :
- Photo de Ludo en médaillon flottant à côté de la recette vedette (image `user-uploads://7113.jpg`).
- Stats en temps réel animées (count-up) : **vues totales · likes totaux · nombre de recettes**.
- Bandeau humour : citation rotative parmi 5-6 punchlines + emojis qui dansent (légère animation `framer-motion` déjà en place, on amplifie : 🥐 🍅 🥄 🧀 🍷 qui flottent et tournent doucement).
- Mini barre de recherche **dans la hero** (autocomplete sur titres/tags) → résultat = `/recettes?q=…`.
- CTA principal : « Voir les recettes » ; CTA secondaire : « Suivre Ludo sur Facebook ».
- Pas de bouton Connexion nulle part dans le header/footer.

## 3. Pages publiques

| Route | Rôle |
|---|---|
| `/` | Hero + coups de cœur + catégories + dernières recettes + citation |
| `/recettes` | Liste paginée + filtres (catégorie, temps, difficulté) + recherche |
| `/recettes/$slug` | **Landing page recette** : hero photo plein cadre, titre, temps/portions/difficulté, ingrédients, étapes numérotées, galerie, bouton ❤️ Like (anonyme), compteur de vues, recettes similaires, partage Facebook/WhatsApp |
| `/categories/$slug` | Toutes les recettes d'une catégorie |
| `/a-propos` | Bio de Ludo + portrait (image `user-uploads://17430.jpg`) + lien Facebook |
| `/mentions-legales` & `/politique-confidentialite` | **Requis par AdSense** |

Chaque page : `head()` propre (title, description, og:image), `<h1>` unique, HTML sémantique, alt sur les images, JSON-LD `Recipe` sur les pages recette (gros boost SEO).

## 4. Dashboard caché pour Ludo

- Route secrète : `/ludo-admin` (non listée nulle part, à bookmarker).
- Layout `_authenticated` protège `/ludo-admin/*`. Si pas connecté → formulaire de login email/mot de passe **affiché en place** (pas de redirection vers `/login`, qui n'existe pas publiquement).
- Pages admin :
  - `/ludo-admin` — tableau de bord (stats globales, top recettes)
  - `/ludo-admin/recettes` — liste avec actions (publier/dépublier, éditer, supprimer)
  - `/ludo-admin/recettes/nouvelle` — création
  - `/ludo-admin/recettes/$id` — édition (titre, description, ingrédients dynamiques, étapes dynamiques, upload cover + galerie via bucket `recipe-images`, catégorie, tags, featured, statut)
  - `/ludo-admin/categories` — CRUD catégories
- Seuls les utilisateurs avec rôle `admin` (table `user_roles` déjà en place) accèdent. Le compte de Ludo sera créé une fois et le rôle `admin` ajouté manuellement.

## 5. Design — esprit humour / rire

Direction visuelle (en respectant les tokens `src/styles.css` actuels : palette chaleureuse miel/terracotta/cocoa, polices display+hand) :
- **Micro-animations « blagueuses »** : emoji qui sautille au survol des cartes recette, étoile/poêle qui tourne légèrement, bouton « J'aime » qui fait un bounce + confettis (canvas-confetti) au clic.
- **Curseurs de bonne humeur** : illustrations annotées à la main (style griffonné) sur les titres de section.
- **Stickers** rotatifs (« Easy peasy ! », « À tomber », « Le truc de Ludo ») placés en absolute sur les cartes featured.
- **Transitions de page** douces (fade + slide) pour rester fluide → favorise le temps passé (UX retention).
- Pas de pop-up agressive, pas de bannière intrusive → conforme aux règles d'expérience AdSense.

## 6. Conformité AdSense (préparation)

- Pages obligatoires créées : À propos, Contact (formulaire mailto suffisant), Mentions légales, Politique de confidentialité (avec mention cookies pub).
- Bandeau cookies discret (consentement) avec accept/reject — nécessaire dès qu'AdSense sera branché.
- Emplacements `<ins class="adsbygoogle">` **réservés mais désactivés** (commentés) dans :
  - liste recettes (1 slot tous les 6 items),
  - page recette (1 entre ingrédients et étapes, 1 en bas),
  - sidebar catégorie.
- `robots.txt` + `sitemap.xml` générés statiquement.
- Contenu original (vos recettes), navigation claire, vitesse correcte, mobile-first → tous les pré-requis sont couverts par le design.

## 7. Intégration des images fournies

- `user-uploads://7113.jpg` → portrait principal (hero + page À propos).
- `user-uploads://17430.jpg` → photo « en action » (page À propos, section « Le chef »).
- Copiées dans `src/assets/`, importées comme modules ES6 (optimisation Vite).

## 8. Intégration des recettes Facebook

Vous avez choisi « Vous me donnez les recettes ». À l'étape build, **je créerai d'abord la structure et 2-3 recettes squelettes** (avec photos placeholder type Unsplash food) pour valider le rendu, puis vous me copierez/collerez le contenu des recettes Facebook (titre, ingrédients, étapes, idéalement la photo) — un seul message suffit, je les insère en base.

## 9. Détails techniques

- **Stack** : déjà en place — TanStack Start, Supabase, Tailwind v4, framer-motion, React Query.
- **Like anonyme** : nouvelle fonction RPC `increment_recipe_likes(_slug text)` (SECURITY DEFINER), policy publique. Côté client : `localStorage[liked:slug]` empêche le double-clic.
- **Recherche** : requête `ilike` sur `title` + `tags` côté Supabase (suffisant pour la volumétrie). Pas d'index full-text pour démarrer ; à upgrader si besoin.
- **Upload images** : bucket `recipe-images` existe déjà (public). Composant d'upload dans l'admin.
- **Confettis** : `canvas-confetti` (1 dépendance légère, sans dépendance native, OK runtime Worker).
- **Auth** : email/mot de passe uniquement (pas de Google côté admin — il n'y a qu'un seul compte, c'est inutile). Page de login intégrée à `/ludo-admin`.
- **SEO recette** : JSON-LD `Recipe` (image, prepTime, cookTime, recipeIngredient, recipeInstructions, aggregateRating si likes>0).

## 10. Ordre d'implémentation

1. Migration BDD : RPC `increment_recipe_likes` + policy.
2. Copier les 2 images dans `src/assets/`.
3. Améliorer la hero (`/`) avec photo Ludo, search inline, count-up, citations.
4. Page `/recettes` (liste + filtres + recherche URL-based).
5. Page recette `/recettes/$slug` (landing complète + JSON-LD + like + confettis).
6. Pages secondaires : `/categories/$slug`, `/a-propos`, `/mentions-legales`, `/politique-confidentialite`, bandeau cookies.
7. Dashboard `/ludo-admin/*` (login intégré + CRUD recettes + CRUD catégories + upload).
8. Seed : 3 recettes squelettes pour démo.
9. Retrait définitif de tout bouton/lien « Connexion » des composants publics (header, footer, mobile menu).
10. Sitemap + robots + métadonnées finales.

Une fois ce plan validé, j'implémente d'un trait. Vous m'enverrez le contenu des recettes Facebook quand vous voulez — je peux démarrer sans.
