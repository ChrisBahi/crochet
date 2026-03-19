import Anthropic from "@anthropic-ai/sdk"
import type { DocSection } from "@/components/official-doc"

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

export interface NdaParty {
  name: string
  firm?: string | null
  role?: string | null
  country?: string | null
  email?: string | null
}

/** Clause options selected by the user before generation */
export interface NdaOptions {
  /** Durée de confidentialité en années: 1 | 2 | 3 */
  duree: 1 | 2 | 3
  /** Périmètre des informations couvertes */
  perimetre: "financier" | "complet" | "etendu"
  /** Exclusivité d'accès aux informations */
  exclusivite: "non" | "30j" | "60j" | "90j"
  /** Droit de partage avec des tiers (conseils, avocats) */
  partage_tiers: "accord" | "libre" | "interdit"
}

export const NDA_OPTIONS_DEFAULT: NdaOptions = {
  duree: 2,
  perimetre: "complet",
  exclusivite: "non",
  partage_tiers: "accord",
}

export interface NdaInput {
  opportunityId: string
  opportunityTitle: string
  dealType?: string | null
  sector?: string | null
  divulgateur: NdaParty   // émetteur / cédant
  recepteur: NdaParty     // investisseur / acquéreur potentiel
  options?: NdaOptions
}

export interface NdaResult {
  reference: string
  date: string
  sections: DocSection[]
  options: NdaOptions
}

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

function partyLine(p: NdaParty): string {
  const parts = [p.name]
  if (p.firm) parts.push(p.firm)
  if (p.role) parts.push(p.role)
  if (p.country) parts.push(p.country)
  if (p.email) parts.push(p.email)
  return parts.join(", ")
}

function optionsToFrench(opts: NdaOptions): string {
  const perimetre = {
    financier: "les données financières uniquement (comptes, valorisation, projections)",
    complet:   "l'ensemble des informations commerciales, financières, techniques et stratégiques",
    etendu:    "toutes les informations, y compris les données commerciales, clients, RH, techniques, financières et stratégiques",
  }[opts.perimetre]

  const exclusivite = opts.exclusivite === "non"
    ? "Aucune exclusivité n'est stipulée. La Partie Divulgatrice reste libre de partager les informations avec d'autres contreparties."
    : `La Partie Réceptrice bénéficie d'une période d'exclusivité de ${opts.exclusivite} à compter de la signature, pendant laquelle la Partie Divulgatrice s'engage à ne pas entrer en discussion avec d'autres contreparties sur le même dossier.`

  const partage = {
    accord:   "La Partie Réceptrice peut communiquer les Informations Confidentielles à ses conseils (avocats, experts-comptables, conseils financiers) sous réserve d'un accord préalable écrit de la Partie Divulgatrice et à condition que ces tiers soient eux-mêmes soumis à une obligation de confidentialité équivalente.",
    libre:    "La Partie Réceptrice est autorisée à communiquer les Informations Confidentielles à ses conseils directs (avocats, experts-comptables, conseils financiers), sans accord préalable, à condition que ces tiers soient eux-mêmes soumis à une obligation de confidentialité au moins équivalente.",
    interdit: "La Partie Réceptrice s'interdit strictement de communiquer les Informations Confidentielles à tout tiers, y compris à ses propres conseils, sans accord écrit préalable exprès de la Partie Divulgatrice.",
  }[opts.partage_tiers]

  return `PARAMÈTRES DE CET ACCORD :
- Périmètre des informations couvertes : ${perimetre}
- Durée de confidentialité : ${opts.duree} an${opts.duree > 1 ? "s" : ""} à compter de la signature
- Exclusivité : ${exclusivite}
- Partage avec tiers : ${partage}`
}

function buildNdaPrompt(input: NdaInput, date: string): string {
  const ref = `CROCHET-${input.opportunityId.slice(0, 8).toUpperCase()}`
  const opts = input.options ?? NDA_OPTIONS_DEFAULT

  return `Tu es le moteur juridique CROCHET. Génère un Accord de Confidentialité (NDA) bilatéral complet, rédigé en droit français.

OPPORTUNITÉ RÉFÉRENCÉE :
- Titre : ${input.opportunityTitle}
- Type d'opération : ${input.dealType ?? "—"}
- Secteur : ${input.sector ?? "—"}
- Référence plateforme : ${ref}
- Date : ${date}

PARTIE DIVULGATRICE (émetteur / cédant) :
${partyLine(input.divulgateur)}

PARTIE RÉCEPTRICE (investisseur / acquéreur potentiel) :
${partyLine(input.recepteur)}

${optionsToFrench(opts)}

Génère une réponse JSON avec exactement ce format :
{
  "sections": [
    { "number": "01", "title": "PARTIES", "content": "..." },
    { "number": "02", "title": "OBJET", "content": "..." },
    { "number": "03", "title": "DÉFINITION DES INFORMATIONS CONFIDENTIELLES", "content": "..." },
    { "number": "04", "title": "OBLIGATIONS DES PARTIES", "content": "..." },
    { "number": "05", "title": "EXCEPTIONS", "content": "..." },
    { "number": "06", "title": "DURÉE ET EXCLUSIVITÉ", "content": "..." },
    { "number": "07", "title": "COMMUNICATION AUX TIERS", "content": "..." },
    { "number": "08", "title": "SANCTIONS ET RESPONSABILITÉ", "content": "..." },
    { "number": "09", "title": "DROIT APPLICABLE ET JURIDICTION", "content": "..." }
  ]
}

Règles :
- Rédige chaque article en français juridique précis et complet.
- Intègre les noms des deux Parties dans les articles (surtout 01, 02, 04).
- Dans l'article 03, liste les types d'informations confidentielles correspondant au périmètre choisi.
- Dans l'article 06, intègre exactement la durée et les clauses d'exclusivité définies dans les paramètres.
- Dans l'article 07, intègre exactement la règle de partage avec tiers définie dans les paramètres.
- Dans l'article 09, précise la juridiction de Paris.
- Utilise des retours à la ligne (\\n) pour séparer les sous-paragraphes au sein d'un même article.
- Réponds UNIQUEMENT avec le JSON, sans markdown.`
}

function buildDeterministicSections(input: NdaInput): DocSection[] {
  const opts = input.options ?? NDA_OPTIONS_DEFAULT
  const divulgateur = partyLine(input.divulgateur)
  const recepteur = partyLine(input.recepteur)
  const perimetreLabel = {
    financier: "les données financières, comptables, de valorisation et de projections",
    complet: "les informations commerciales, financières, techniques et stratégiques relatives au dossier",
    etendu: "toutes les informations commerciales, clients, RH, techniques, financières et stratégiques relatives au dossier",
  }[opts.perimetre]
  const exclusiviteLabel = opts.exclusivite === "non"
    ? "Aucune exclusivité n'est consentie au titre du présent Accord."
    : `La Partie Divulgatrice accorde à la Partie Réceptrice une exclusivité de ${opts.exclusivite} à compter de la signature du présent Accord.`
  const partageLabel = {
    accord: "La communication aux conseils de la Partie Réceptrice reste soumise à l'accord écrit préalable de la Partie Divulgatrice et à une obligation de confidentialité équivalente.",
    libre: "La Partie Réceptrice peut partager les Informations Confidentielles avec ses conseils directs, sous réserve qu'ils soient eux-mêmes tenus à une obligation de confidentialité équivalente.",
    interdit: "Aucune communication à un tiers n'est autorisée sans l'accord écrit préalable de la Partie Divulgatrice.",
  }[opts.partage_tiers]

  return [
    {
      number: "01",
      title: "PARTIES",
      content: `Le présent accord de confidentialité (l'« Accord ») est conclu entre ${divulgateur}, ci-après la « Partie Divulgatrice », et ${recepteur}, ci-après la « Partie Réceptrice ».\n\nLes Parties déclarent intervenir dans le cadre de l'étude confidentielle de l'opportunité « ${input.opportunityTitle} » et disposer de la capacité nécessaire pour s'engager au titre du présent Accord.`,
    },
    {
      number: "02",
      title: "OBJET",
      content: `Le présent Accord a pour objet d'encadrer la communication d'informations confidentielles relatives à l'opportunité « ${input.opportunityTitle} », de type ${input.dealType ?? "non précisé"}, dans le secteur ${input.sector ?? "non précisé"}.\n\nLa Partie Réceptrice s'engage à n'utiliser les Informations Confidentielles qu'aux seules fins d'évaluer une éventuelle opération avec la Partie Divulgatrice.`,
    },
    {
      number: "03",
      title: "DÉFINITION DES INFORMATIONS CONFIDENTIELLES",
      content: `Sont considérées comme Informations Confidentielles ${perimetreLabel}, ainsi que tout document, échange oral, fichier, accès plateforme, donnée ou renseignement communiqué directement ou indirectement par la Partie Divulgatrice.\n\nLes Informations Confidentielles couvrent également l'existence même des discussions, l'identité des Parties, les conditions envisagées de l'opération et tout document consulté dans la Secure Room Crochet.`,
    },
    {
      number: "04",
      title: "OBLIGATIONS DES PARTIES",
      content: `La Partie Réceptrice s'engage à protéger strictement les Informations Confidentielles, à ne pas les divulguer, copier, reproduire ou exploiter en dehors de l'objet du présent Accord.\n\nElle mettra en oeuvre toutes les mesures raisonnables de sécurité, au moins équivalentes à celles utilisées pour ses propres informations sensibles, et limitera l'accès aux seules personnes ayant besoin d'en connaître.`,
    },
    {
      number: "05",
      title: "EXCEPTIONS",
      content: `Ne constituent pas des Informations Confidentielles les informations qui étaient déjà légalement connues de la Partie Réceptrice, qui sont tombées dans le domaine public sans faute de sa part, ou qui lui ont été communiquées licitement par un tiers non tenu à confidentialité.\n\nLa charge de la preuve de l'une de ces exceptions incombe à la Partie Réceptrice.`,
    },
    {
      number: "06",
      title: "DURÉE ET EXCLUSIVITÉ",
      content: `Les obligations de confidentialité s'appliquent pendant ${opts.duree} an${opts.duree > 1 ? "s" : ""} à compter de la signature du présent Accord.\n\n${exclusiviteLabel}`,
    },
    {
      number: "07",
      title: "COMMUNICATION AUX TIERS",
      content: `${partageLabel}\n\nLa Partie Réceptrice demeure pleinement responsable de tout manquement commis par les tiers auxquels elle aurait valablement communiqué les Informations Confidentielles.`,
    },
    {
      number: "08",
      title: "SANCTIONS ET RESPONSABILITÉ",
      content: `Toute violation du présent Accord pourra entraîner, sans préjudice de tous dommages et intérêts, la suspension immédiate des accès, la restitution ou destruction des informations transmises et toute mesure utile pour faire cesser le trouble.\n\nLes Parties reconnaissent que toute divulgation non autorisée pourrait causer un préjudice irréparable à la Partie Divulgatrice.`,
    },
    {
      number: "09",
      title: "DROIT APPLICABLE ET JURIDICTION",
      content: `Le présent Accord est régi par le droit français.\n\nTout litige relatif à sa validité, son interprétation, son exécution ou sa cessation relèvera de la compétence exclusive des tribunaux de Paris, nonobstant pluralité de défendeurs ou appel en garantie.`,
    },
  ]
}

export async function generateNda(input: NdaInput): Promise<NdaResult> {
  const date = formatDate(new Date())
  const ref = `NDA-CROCHET-${input.opportunityId.slice(0, 8).toUpperCase()}`
  const opts = input.options ?? NDA_OPTIONS_DEFAULT

  if (!client) {
    return {
      reference: ref,
      date,
      sections: buildDeterministicSections(input),
      options: opts,
    }
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: buildNdaPrompt(input, date) }],
    })

    const rawText = (message.content[0] as { type: string; text: string }).text.trim()
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON object found in NDA response")
    const parsed = JSON.parse(jsonMatch[0]) as { sections?: DocSection[] }
    const sections = (parsed.sections ?? []).filter((section) => section?.title && section?.content)

    if (sections.length === 0) throw new Error("No sections returned in NDA response")

    return {
      reference: ref,
      date,
      sections,
      options: opts,
    }
  } catch (error) {
    console.error("[nda/generate:fallback]", error)
    return {
      reference: ref,
      date,
      sections: buildDeterministicSections(input),
      options: opts,
    }
  }
}
