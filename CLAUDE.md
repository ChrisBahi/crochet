# CLAUDE.md — Contexte projet Crochett.ai

> Ce fichier est lu automatiquement par Claude Code à chaque session.
> Il contient le contexte business et technique complet pour ne jamais repartir de zéro.

---

## Le produit

**Crochett.ai** — plateforme de mise en relation M&A sécurisée par IA.
- URL : crochett.ai
- **Repo GitHub : `github.com/ChrisBahi/crochet-app`** (⚠ PAS `crochet`, toujours `crochet-app`)
- Modèle : marketplace bilatérale (cédants ↔ repreneurs/investisseurs) avec IA de matching
- Stack : Next.js 15, Supabase, Claude API (Opus 4.6), Resend, Stripe

---

## Le modèle "Dispatch IA" (vision cible)

Le vrai différenciateur : **3 tunnels séparés**, les utilisateurs ne se voient jamais entre eux.

```
         ┌─────────────────────────────────┐
         │         CROCHETT.AI              │
         │      (front unique)              │
         └──────────────┬──────────────────┘
                        │ IA qualifie au signup
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     CÉDANTS        REPRENEURS      FONDS
     (tunnel A)     (tunnel B)    (tunnel C)

     ✗ Ne se voient JAMAIS entre eux
     ✓ Pricing différent
     ✓ Contenu différent
     ✓ Promesses différentes
```

**Questions de qualification IA au signup :**
1. "Vous souhaitez..." → vendre / acheter / investir
2. Taille d'entreprise visée
3. Horizon de temps

Référence marché : Doctolib (patients vs médecins), ManoMano (pro vs particulier).

---

## Pricing & ICPs

### Niveau A — Fonds & Family Office
- Cible : fonds d'investissement, family offices
- Prix : 5 000–10 000 €/mois/client
- Objectif : 10 clients = 600 000 €/an
- Valeur : deal flow qualifié par IA, NDA automatique, pipeline sécurisé

### Niveau B — Experts-comptables (apporteurs d'affaires)
- Modèle : rev share 20% sur chaque client amené
- Logique : l'expert-comptable connaît tous les cédants de son portefeuille
- Ils ne vendent pas, ils recommandent → zéro friction pour eux

---

## Stratégie acquisition — 50 → 150 membres → viral

### La logique
50 membres bien qualifiés = masse critique → effet réseau → croissance organique.
**Ne pas viser les cédants en direct au début** — cycle 6-18 mois, méfiants, trop long.

### Les 4 priorités dans l'ordre
```
Priorité 1 : Acquisition (avant d'automatiser la rétention)
Priorité 2 : Match engine cron + weekly digest (rétention passive)
Priorité 3 : Onboarding drip (conversion essai → payant)
Priorité 4 : Le reste (churn prevention, etc.)
```
> Ne construis pas la churn prevention avant d'avoir des users à churner.

### Stack outreach décidée (solo founder)
| Besoin | Outil | Coût |
|--------|-------|------|
| Domaine email | Google Workspace | ~6€/mois |
| Cold outreach | Instantly.ai ou Lemlist | ~30-50€/mois |
| Support client | Crisp (gratuit) ou Intercom | 0-50€/mois |

### Structure emails décidée
```
contact@crochett.ai  → cold outreach + commercial (garder)
support@crochett.ai  → créer pour clients onboardés
hello@crochett.ai    → optionnel, campagnes marketing
```
**Règle clé :** ne jamais faire du cold depuis `support@` — finit en spam.

### Plan 90 jours → 1M€ an 1
```
J1-J30  → 3 meetings Sowefund + pitch partenariat
         → Onboard 5 experts-comptables en beta gratuite
         → Kelly Massol : 1 post LinkedIn co-signé

J30-J60 → Premier fonds client (5k€/mois)
         → Landing page dispatch IA en ligne
         → contact@ reste support commercial
         → support@ pour onboarding clients

J60-J90 → 5 fonds clients = 25k€/mois récurrent
         → Pipeline 50 repreneurs qualifiés
         → Lever ou pas selon traction
```

---

## Go-to-market — 2 connexions = vraie Priorité 1

### ICP 1 — Sowefund (canal de distribution)
- Contexte : ami DG de Sowefund — pas juste un contact, c'est un canal de distribution
- Sowefund a des entrepreneurs qui lèvent des fonds → ils connaissent repreneurs + cédants potentiels
- Angle : Sowefund ne fait PAS le M&A PME (cessions 500k-5M€) → gap qu'on comble
- Proposition : partenariat co-branded, convention apporteur d'affaires, trial 14j offert
- Potentiel : **50-100 leads qualifiés dès la semaine 1**

**Script pour la réunion Sowefund :**
> "On a une plateforme qui fait exactement ce que vous ne faites pas — le M&A PME, les cessions de boîtes entre 500k et 5M€. Vos investisseurs qui cherchent du deal flow hors levée de fonds, on peut les accueillir. Partenariat simple : vous recommandez, on partage le revenu."

**Ce qui est déjà construit :**
- Landing page `/partenaires/sowefund` dédiée
- Tracking `?ref=sowefund` dans la DB
- `?ref=sowefund&role=investisseur` → bypass qualification, direct formulaire investisseur
- Trial 14j dans Stripe

### ICP 2 — Kelly Massol (audience + crédibilité)
- Qui : entrepreneur, fondatrice Les Secrets de Lulu
- Sa communauté d'entrepreneurs = cédants potentiels + repreneurs potentiels
- Angle : podcast / interview / co-création de contenu
- Alignement : affiliation ou equity symbolique
- Question ouverte : cédante vitrine (dossier flagship) ou ambassadrice réseau ?

---

## État technique actuel

### Ce qui fonctionne
- ✅ Admission (formulaire → score IA → email custom Resend)
- ✅ Soumission dossier (PDF → analyse IA → MÉMO + D-Score)
- ✅ Match engine (Structured Score + P-Score IA Claude Opus + M-Score final)
- ✅ Secure Rooms (chat + NDA automatique + validation bilatérale)
- ✅ Billing Stripe (Starter 290€ / Pro 590€ / Scale 1490€ + webhook + trial 14j)
- ✅ Pages bilingues FR/EN
- ✅ Admin panel avec déclencheur match engine

### Ce qui est fait (sessions précédentes)
- ✅ Dispatch IA au signup (3 questions → tunnel cedant/repreneur/fonds)
- ✅ Migration SQL champs `tunnel` + `intent_size` + `intent_horizon`
- ✅ Landing page `/partenaires/sowefund` avec tracking UTM
- ✅ Dashboard admin stats (onglet Stats : tunnels, sources UTM, conversion, MRR, timeline 7j)
- ✅ Email bienvenue différencié par tunnel (3 sujets/textes/CTAs distincts)
- ✅ Cron job hebdomadaire match engine (lundi 08h UTC, `vercel.json`)
- ✅ Weekly digest email (lundi 09h UTC, résumé matches/semaine par membre)
- ✅ Onboarding drip J1→J3→J7 (9 templates par tunnel, cron quotidien 10h UTC, tracking `drip_j*_sent_at`)
- ✅ Landing page `/partenaires/experts-comptables` — programme apporteur d'affaires 20% rev share
- ✅ Suivi UTM complet dans l'admin : entonnoir par source (lead→approuvé→rejeté + taux) + matrice source×tunnel
- ✅ Tunnels d'onboarding différenciés post-signup (pages /welcome/cedant, /welcome/repreneur, /welcome/fonds — dispatch automatique selon tunnel)
- ✅ One-pager Sowefund optimisé print/PDF (`/onepager/sowefund`) — pour la réunion partenariat
- ✅ One-pager Experts-Comptables print/PDF (`/onepager/experts-comptables`) — programme rev share 20%
- ✅ Index one-pagers (`/onepager`) — hub interne PDF imprimables

### Ce qui manque (prochaines priorités)

**Moyen terme :**
1. Churn prevention (après avoir des users à churner)

**Infrastructure (fait) :**
- ✅ `CRON_SECRET` dans les variables env Vercel
- ✅ Migration `20260316000003_drip_columns.sql` appliquée en prod

---

## Architecture technique

```
src/app/
├── app/              # Zone authentifiée
│   ├── admin/        # Panel admin
│   ├── billing/      # Stripe / plans
│   ├── matches/      # Vue des matches IA
│   ├── opportunities/# Soumission et liste dossiers
│   ├── profile/      # Profil utilisateur
│   └── rooms/        # Secure Rooms NDA
└── api/
    ├── analyze/      # Analyse IA des dossiers (Claude)
    ├── match/        # Match engine
    ├── qualify/      # Qualification admission
    ├── stripe/       # Checkout + webhook
    └── translate/    # Traduction
```

**DB :** Supabase (PostgreSQL + RLS)
**IA :** Claude Opus 4.6 via Anthropic SDK
**Emails :** Resend
**Paiements :** Stripe (API version 2025-02-24.acacia)
**Auth :** Supabase Auth

---

## Conventions de développement

- Branche active : `claude/setup-go-implementation-WX6hO`
- Toujours pusher sur la branche désignée : `git push -u origin <branch>`
- Les branches Claude commencent par `claude/` et finissent par l'ID de session
- Commits en français ou anglais, préfixe conventionnel (`feat:`, `fix:`, `chore:`)
- Ne jamais pusher sur `main` directement

## Mode de travail — RÈGLE PERMANENTE (toujours respecter)

> Cette règle s'applique à toutes les sessions, tous les Claude.

1. **Suivre le plan sans demander où on en est** — le plan est dans ce fichier, Claude le lit et continue.
2. **Annoncer clairement ce qu'on fait** avant de le faire :
   ```
   🔨 [1/4] Dashboard admin stats — création du composant StatsCard
   ✅ [1/4] Dashboard admin stats — DONE, pushé
   🔨 [2/4] ...
   ```
3. **Ne pas demander de validation** entre chaque étape — avancer, commiter, pusher, passer à la suite.
4. **En fin de session** : mettre à jour `### Ce qui est fait` et `### Ce qui manque` dans ce fichier.
5. **Si blocage réel** (erreur build, manque de clé API, choix business) → poser UNE question précise, pas plusieurs.

---

## Fichiers clés

- `CROCHET_V1.md` — spécifications complètes V1 (pipelines, schémas DB, règles métier)
- `CLAUDE.md` — ce fichier (contexte session)
- `.env.local` — variables d'environnement (Supabase, Anthropic, Stripe, Resend)
