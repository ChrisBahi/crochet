# CROCHET — Présentation Officielle V1

> *"Le signal, pas le bruit."*
> Plateforme privée de matching M&A par intelligence artificielle.

---

## 1. QU'EST-CE QUE CROCHET ?

CROCHET est une plateforme **B2B privée** qui connecte les acteurs du marché M&A non-coté (capital-transmission, private equity, dette, immobilier) grâce à un moteur de matching IA propriétaire.

**Positionnement** : Entre le carnet d'adresses et le mandat exclusif. CROCHET crée des mises en relation qualifiées, confidentielles et structurées, sans bruit ni intermédiaire inutile.

**Accès sur admission** : Chaque membre est sélectionné manuellement. Aucun accès libre.

---

## 2. POUR QUI ?

| Profil | Usage |
|--------|-------|
| **Cédants / Dirigeants** | Mettre en marché leur entreprise (cession, LBO, succession) |
| **Investisseurs PE/VC** | Trouver des cibles qualifiées dans leur secteur et ticket |
| **Family Offices** | Sourcer des dossiers equity ou dette en dehors des circuits classiques |
| **Boutiques M&A** | Gérer et exposer leur pipeline confidentiel |
| **Fonds de dette** | Identifier des emprunteurs compatibles (LBO, croissance) |
| **Promoteurs immobiliers** | Lever des capitaux sur leurs projets |

---

## 3. LES PIPELINES DE LA PLATEFORME

### Pipeline 1 — Admission (Pré-accès)

```
[Formulaire public /register]
        │
        ▼
[Table admission_requests]
   status: pending
        │
        ▼
[Admin — Analyse IA automatique]
   Claude Haiku → ai_score (0–100)
   Critères : rôle, ticket, LinkedIn, SIRET, message
        │
   ┌────┴────┐
   ▼         ▼
[Approuvé]  [Refusé]
   │             │
   ▼             ▼
[Login possible] [/register/status — refusé]
```

### Pipeline 2 — Soumission d'un Dossier

```
[/app/opportunities/new]
        │
        ├─ Upload PDF (optionnel)
        │   └─ /api/analyze (Claude Sonnet 4.6)
        │       Extrait : CA, EBITDA, valorisation, secteur, géo, deal type
        │       → Auto-remplit le formulaire
        │
        ├─ Formulaire structuré
        │   Identification + Financiers + Questionnaire adaptatif
        │   (equity / cession / dette / revenue-share / succession / immobilier)
        │
        ▼
[Table opportunities — status: draft]
        │
        ▼
[/api/qualify → runQualification()]
   Claude Sonnet 4.6 → MÉMO 6 sections (400–600 mots)
   D-Score (0–100) + Tags (4–6 mots-clés)
        │
        ▼
[Table opportunity_decks — status: done]
   Pipeline affiché : DRAFT → ANALYZING → QUALIFIED
```

### Pipeline 3 — Matching IA

```
[Admin déclenche /api/match/run]
   (ou cron job automatisé)
        │
        ▼
[Scan de TOUTES les opportunities actives]
   N opportunités → N×(N-1)/2 paires à évaluer
        │
        ▼ Pour chaque paire (A, B) :
[Étape 1 — Complémentarité deal type]
   areComplementary(A.deal_type, B.deal_type) ?
   → Non → SKIP (skipped_complement++)
        │
        ▼
[Étape 2 — Pré-score structuré (sans IA)]
   structuredScore(A, B) =
     sectorCompatibility  (0–30)
   + geoCompatibility     (0–20)
   + amountCompatibility  (0–25)
   + stageCompatibility   (0–15)
   = max 90 pts
   → Score < 30 → SKIP (skipped_structured++)
        │
        ▼
[Étape 3 — P-Score IA (Claude Opus 4.6)]
   Évaluation contextuelle : 0–100
   Raisons en français (2–3 phrases)
        │
        ▼
[Calcul M-Score final]
   M-Score = P-Score × 0.5
           + Structured × 0.3
           + D-Score_avg × 0.2
   → M-Score < 55 → SKIP (skipped_mscore++)
        │
        ▼
[Création de 2 matches dans opportunity_matches]
   Un match par côté (A voit B, B voit A)
   + Notification envoyée aux deux utilisateurs
        │
        ▼
[Pipeline affiché : MATCHED]
```

### Pipeline 4 — Match → Introduction → Room

```
[/app/matches — vue split-screen]
   Gauche : liste des matches triée par M-Score
   Droite : détail + scores + raisons IA
        │
        ├─ Status: pending / ready / review
        │   → Bouton "Demander l'intro"
        │   → status: intro_requested
        │   → Notification à la contrepartie
        │
        ├─ Status: intro_requested
        │   → Bouton "Ouvrir la Room"
        │   → Création de la Room (NDA automatique)
        │   → status: room_active
        │
        └─ Status: room_active / closing
            → Accès direct à la Room
```

### Pipeline 5 — Secure Room (Négociation NDA)

```
[/app/rooms — liste des rooms actives]
        │
        ▼
[/app/rooms/[id] — espace sécurisé]
   NDA-CROCHET-V1 · Droit français · Paris
        │
   ┌────┴──────────────────┐
   │                       │
[Chat sécurisé]    [Validation bilatérale]
[Messages horodatés] room_validations
                    (les 2 parties confirment)
        │
        ▼
   status: closing → Deal fermé / Archivé
```

### Pipeline 6 — Facturation (Stripe)

```
[/app/billing — choix du plan]
   Starter €290 / Pro €590 / Scale €1490 /mois
        │
        ▼
[/api/stripe/checkout]
   Stripe Checkout Session
   14 jours d'essai sans CB
        │
        ▼
[Stripe Webhook /api/stripe/webhook]
   checkout.session.completed
   → Upsert table subscriptions
   plan + status + trial_ends_at
        │
        ▼
[Accès débloqué selon plan]
   Starter : 1 workspace, 50 dossiers, 1 Room
   Pro     : 3 workspaces, illimités, 5 Rooms, MEMOs
   Scale   : tout illimité, NDA auto, support dédié
```

---

## 4. MODE D'EMPLOI — PARCOURS UTILISATEUR

### Étape 1 — Candidature
1. Aller sur `crochett.ai/register`
2. Remplir le formulaire (nom, email, rôle, ticket, LinkedIn, SIRET, message)
3. Attendre la validation par l'équipe CROCHET (score IA + revue manuelle)
4. Email de confirmation si approuvé

### Étape 2 — Connexion & Onboarding
1. Se connecter via OAuth (GitHub/Google)
2. Page de bienvenue → accéder à l'espace
3. Compléter son profil investisseur : secteurs, géographies, ticket min/max
4. Le workspace est créé automatiquement

### Étape 3 — Soumettre un Dossier
1. Cliquer sur **+ Soumettre** (header ou /app/opportunities/new)
2. (Optionnel) Uploader un PDF/teaser → l'IA extrait les données et pré-remplit le formulaire
3. Remplir les champs : titre, deal type, secteur, géographie, stade, montants
4. Répondre au questionnaire adaptatif (5–7 questions selon le type)
5. Soumettre → le moteur génère le **MÉMO** et le **D-Score** automatiquement

### Étape 4 — Consulter les Matches
1. Aller dans **Matches** (`/app/matches`)
2. La liste gauche affiche tous les matches triés par M-Score
3. Cliquer sur un match pour voir : titre, secteur, géo, scores détaillés, raisons IA
4. Statuts : Pending → Ready → Review → Intro demandée → Room active → Closing

### Étape 5 — Activer une Introduction
1. Sur un match en statut **Ready** : cliquer "Demander l'intro"
2. La contrepartie reçoit une notification
3. Statut passe à **Intro demandée**
4. Une fois les deux parties prêtes : cliquer "Ouvrir la Room"

### Étape 6 — Négocier en Secure Room
1. La Room est couverte par le NDA-CROCHET-V1 (automatique)
2. Chat sécurisé, messages horodatés
3. Les deux parties valident pour confirmer l'engagement
4. Fermeture : deal conclu ou archivé

---

## 5. FORMULES DE SCORING — DÉTAIL TECHNIQUE

### D-Score (Document Score) — 0 à 100
Généré par **Claude Sonnet 4.6** lors de la qualification.

| Plage | Interprétation |
|-------|---------------|
| 0–30  | Dossier insuffisant (données manquantes, peu structuré) |
| 31–60 | Dossier correct (informations de base présentes) |
| 61–80 | Dossier solide (financiers détaillés, questionnaire complet) |
| 81–100 | Dossier exceptionnel (deck complet, données vérifiables) |

**Pénalités** : Chaque information manquante abaisse le score. Un dossier sans CA, sans valorisation et sans description perd 30–40 points.

---

### Structured Score (Pré-score sans IA) — 0 à 90

| Dimension | Calcul | Max |
|-----------|--------|-----|
| **Compatibilité sectorielle** | Même secteur = 30 · Groupe proche = 20 · Absent = 10 · Incompatible = 0 | 30 |
| **Compatibilité géographique** | Même géo = 20 · Compatible (ex. France↔Europe) = 14 · Absent = 10 · Incompatible = 0 | 20 |
| **Compatibilité ticket/montant** | Ratio ≤2 = 25 · Ratio ≤5 = 15 · Ratio ≤10 = 5 · Ratio >10 = 0 · Absent = 10 | 25 |
| **Compatibilité stade** | Même stade = 15 · Groupe compatible = 10 · Absent = 8 · Incompatible = 4 | 15 |
| **Total max** | | **90** |

**Groupes sectoriels** : tech/SaaS · industrie/manufacturing · santé/pharma · énergie/cleantech · finance/fintech · immobilier · consumer/retail · éducation

**Groupes géographiques** : France↔Europe bidirectionnel · Global compatible avec tout · USA/MENA/Asie silos

**Groupes de stade** : Early (pre-seed, seed) · Growth (series-A, series-B) · Mature (rentable, mature) · Transmission (mature, transmission)

---

### P-Score (IA Score) — 0 à 100
Généré par **Claude Opus 4.6** — évaluation contextuelle de la paire.

**Grille** :
- 0–39 : Aucune complémentarité → match non créé
- 40–59 : Complémentarité faible
- 60–74 : Bonne complémentarité — mise en relation recommandée
- 75–100 : Excellente complémentarité — deal très concret

**Retourne également** : 2–3 raisons factuelles en français spécifiques aux deux dossiers.

---

### M-Score (Match Score) — 0 à ~97

```
M-Score = P-Score × 0.50
        + Structured-Score × 0.30
        + D-Score-avg × 0.20
```

**Seuils de création** :
- Structured-Score ≥ 30 (sinon Claude n'est pas appelé)
- M-Score final ≥ 55 (sinon le match n'est pas créé)

**Interprétation du M-Score** :
- < 55 : Match non créé
- 55–69 : Match pertinent (affiché en orange)
- 70–100 : Match fort (affiché en vert)

---

### Compatibilité des types de deal (COMPLEMENTARY_PAIRS)

| Deal A | Deal B compatible |
|--------|-------------------|
| cession | equity, debt, cession |
| equity | equity, debt, revenue-share |
| succession | equity, cession |
| immobilier | equity, debt |
| revenue-share | equity |

---

## 6. ARCHITECTURE TECHNIQUE

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│   Next.js 16 · React 19 · Tailwind CSS 4        │
│   Playfair Display + DM Sans + JetBrains Mono   │
└─────────────┬───────────────────────────────────┘
              │ Server Components + Server Actions
┌─────────────▼───────────────────────────────────┐
│                  API ROUTES                      │
│  /api/analyze      → PDF → signal IA            │
│  /api/qualify      → MÉMO + D-Score             │
│  /api/match/run    → Moteur de matching          │
│  /api/stripe/*     → Checkout + Webhook          │
│  /api/health       → Probe de disponibilité     │
└──────┬────────────────────┬────────────────────-┘
       │                    │
┌──────▼──────┐    ┌────────▼────────┐
│  SUPABASE   │    │   ANTHROPIC AI   │
│  PostgreSQL │    │  Opus 4.6 (match)│
│  Auth       │    │  Sonnet 4.6 (doc)│
│  RLS        │    │  Haiku 4.5 (adm) │
│  Realtime   │    └─────────────────┘
└──────┬──────┘
       │
┌──────▼──────┐
│   STRIPE    │
│  Checkout   │
│  Webhooks   │
│  Plans      │
└─────────────┘
```

**Déploiement** : Vercel (Pro) · Hébergement EU · RGPD

---

## 7. SCHÉMA DE LA BASE DE DONNÉES

```
auth.users (Supabase Auth)
    │
    ├──► workspaces (workspace_id)
    │        └──► workspace_members (role: owner/member, p_score)
    │
    ├──► user_settings (active_workspace_id)
    │
    ├──► investor_profiles (ticket_min/max, sectors[], geos[])
    │
    ├──► admission_requests (status: pending/approved/rejected, ai_score)
    │
    ├──► opportunities (workspace_id, sector, geo, deal_type, stage, amount)
    │        ├──► opportunity_decks (summary/MÉMO, d_score, tags, status)
    │        ├──► opportunity_matches (fit_score/M-Score, breakdown, why[], status)
    │        │        └──► rooms (status)
    │        │                 ├──► messages (content, sender_id)
    │        │                 └──► room_validations (user_id, signed_at)
    │        └──► nda_signatures (nda_reference, signed_at)
    │
    ├──► notifications (type, title, body, read)
    │
    └──► subscriptions (plan, status, trial_ends_at, stripe_*)
```

---

## 8. SÉCURITÉ & CONFIDENTIALITÉ

- **Admission sur invitation** : aucun accès sans approbation admin
- **Middleware de garde** (`middleware.ts`) : `/app/*` vérifie session + statut admission
- **RLS Supabase** : chaque table protégée par des policies Row Level Security
- **NDA automatique** : NDA-CROCHET-V1 (droit français, tribunal de Paris) signé avant toute Room
- **Pas de partage de deck** : le MÉMO d'une opportunité n'est jamais accessible à la contrepartie sans Room active
- **Admin service-role isolé** : client Supabase admin séparé pour les opérations back-office

---

## 9. PLANS & TARIFICATION

| Plan | Prix/mois | Workspaces | Dossiers | Rooms | Extras |
|------|-----------|-----------|---------|-------|--------|
| **Starter** | 290 € | 1 | 50/mois | 1 active | Matching IA |
| **Pro** | 590 € | 3 | Illimités | 5 actives | MEMOs confidentiels |
| **Scale** | 1 490 € | Illimités | Illimités | Illimitées | NDA auto · Support dédié |

**14 jours d'essai gratuit — sans CB requise**

---

## 10. STATUTS & CYCLE DE VIE D'UN DOSSIER

```
DRAFT
  → ANALYZING (qualification en cours)
    → ERROR (si la qualification échoue)
    → QUALIFIED (D-Score généré, MÉMO disponible)
      → MATCHED (au moins 1 match M-Score ≥ 55)
        → INTRO (introduction demandée)
          → ROOM OPEN (Room active, NDA signé)
            → CLOSING (deal en cours de finalisation)
              → ARCHIVÉ
```

---

## 11. STATUTS D'UN MATCH

| Statut | Description | Action disponible |
|--------|-------------|-------------------|
| `pending` | Match créé, pas encore consulté | Demander l'intro |
| `ready` | Match qualifié, prêt à activer | Demander l'intro |
| `review` | En cours d'évaluation | Demander l'intro |
| `intro_requested` | Introduction demandée | Ouvrir la Room |
| `room_active` | Room ouverte, négociation en cours | Accéder à la Room |
| `closing` | Deal en phase finale | Accéder à la Room |

---

## 12. CHECKLIST V1 — FONCTIONNALITÉS EN LIGNE

- [x] Admission publique + analyse IA (Haiku)
- [x] Middleware de garde d'accès
- [x] Workspace auto à l'inscription
- [x] Upload PDF + extraction IA (Sonnet)
- [x] Questionnaire adaptatif par type de deal
- [x] Qualification MÉMO + D-Score (Sonnet)
- [x] Moteur de matching multi-étapes (Opus)
- [x] Vue Matches split-screen + M-Score
- [x] Pipeline Opportunities avec statuts en temps réel
- [x] Bouton Intro + OpenRoom
- [x] Secure Rooms avec NDA automatique
- [x] Chat en Room
- [x] Notifications in-app
- [x] Admin panel (candidatures + KYC + moteur)
- [x] Billing Stripe (3 plans + trial 14j)
- [x] Profil investisseur éditable
- [x] Support FR/EN (cookie)
- [x] Déploiement Vercel Production

---

*CROCHET — Réseau privé M&A par intelligence artificielle*
*Version 1.0 · Mars 2026 · crochett.ai*
