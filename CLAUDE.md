# CLAUDE.md — Contexte projet Crochett.ai

> Ce fichier est lu automatiquement par Claude Code à chaque session.
> Il contient le contexte business et technique complet pour ne jamais repartir de zéro.

---

## Le produit

**Crochett.ai** — plateforme de mise en relation M&A sécurisée par IA.
- URL : crochett.ai
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

## Go-to-market — 2 ICPs en parallèle

### ICP 1 — Sowefund (côté investisseurs)
- Contexte : ami travaille chez Sowefund, rencontre en cours
- Angle : Sowefund a des investisseurs non-servis sur le M&A PME
- Proposition : partenariat apporteur d'affaires, convention simple, trial 14j offert
- Action : valider la convention, onboarder leurs investisseurs sur Crochet

**Script pour la réunion Sowefund :**
> "On a une plateforme qui fait exactement ce que vous ne faites pas — le M&A PME, les cessions de boîtes entre 500k et 5M€. Vos investisseurs qui cherchent du deal flow hors levée de fonds, on peut les accueillir. Partenariat simple : vous recommandez, on partage le revenu."

### ICP 2 — Kelly Massol
- Qui : entrepreneur, fondatrice Les Secrets de Lulu
- Question ouverte : cédante potentielle (dossier vitrine) ou ambassadrice/apporteuse de cédants ?
  - Si **cédante** → 1 dossier flagship très visible, effet vitrine pour attirer d'autres cédants
  - Si **réseau** → elle devient ambassadrice, apporte son réseau d'entrepreneurs

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

### Ce qui manque (prochaines priorités)

**Pour supporter le go-to-market :**
1. Email de bienvenue différencié selon le rôle (investisseur vs cédant vs repreneur)
2. Landing page partenaire (ex: `crochett.ai/partenaires/sowefund`) avec tracking UTM
3. Dashboard admin avec stats temps réel (inscriptions, matches, rooms actives, d'où viennent les users)

**Pour le modèle Dispatch IA :**
4. Questions de qualification au signup (3 questions → tunnel A/B/C)
5. Tunnels d'onboarding différenciés post-signup

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

- Branche active : `claude/go-setup-waEVi`
- Toujours pusher sur la branche désignée : `git push -u origin <branch>`
- Les branches Claude commencent par `claude/` et finissent par l'ID de session
- Commits en français ou anglais, préfixe conventionnel (`feat:`, `fix:`, `chore:`)
- Ne jamais pusher sur `main` directement

---

## Fichiers clés

- `CROCHET_V1.md` — spécifications complètes V1 (pipelines, schémas DB, règles métier)
- `CLAUDE.md` — ce fichier (contexte session)
- `.env.local` — variables d'environnement (Supabase, Anthropic, Stripe, Resend)
