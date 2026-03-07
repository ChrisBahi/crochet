#!/usr/bin/env ts-node
/**
 * CROCHET Guardian — Agent IA de monitoring et auto-réparation
 *
 * Lance en arrière-plan :  npx ts-node scripts/guardian.ts
 * Vérification unique :    npx ts-node scripts/guardian.ts --once
 */

import Anthropic from "@anthropic-ai/sdk"
import { execSync, spawnSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

// ── Config ────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..")
const LOG_FILE = path.join(ROOT, "logs", "guardian.log")
const CHECK_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const APP_URL = process.env.GUARDIAN_URL ?? "http://localhost:3000"
const ONCE = process.argv.includes("--once")

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Logging ───────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })

function log(level: "INFO" | "WARN" | "ERROR" | "FIX", msg: string) {
  const line = `[${new Date().toISOString()}] [${level}] ${msg}`
  console.log(line)
  fs.appendFileSync(LOG_FILE, line + "\n")
}

// ── Checks ────────────────────────────────────────────────────────
type CheckResult = { name: string; ok: boolean; output: string }

function runCheck(name: string, fn: () => string): CheckResult {
  try {
    const output = fn()
    return { name, ok: true, output }
  } catch (e: unknown) {
    const output = e instanceof Error ? e.message : String(e)
    return { name, ok: false, output }
  }
}

function checkTypeScript(): CheckResult {
  return runCheck("TypeScript", () => {
    const r = spawnSync("npx", ["tsc", "--noEmit"], { cwd: ROOT, encoding: "utf8" })
    if (r.status !== 0) throw new Error(r.stdout + r.stderr)
    return "OK"
  })
}

function checkTests(): CheckResult {
  return runCheck("Tests (vitest)", () => {
    const r = spawnSync("npx", ["vitest", "run", "--reporter=verbose"], {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, CI: "true" },
    })
    if (r.status !== 0) throw new Error(r.stdout + r.stderr)
    return r.stdout.split("\n").slice(-5).join("\n")
  })
}

async function checkHealth(): Promise<CheckResult> {
  return runCheck("Health endpoint", () => {
    try {
      const r = spawnSync("curl", ["-sf", "--max-time", "5", `${APP_URL}/api/health`], {
        encoding: "utf8",
      })
      if (r.status !== 0) throw new Error(`HTTP error — serveur inaccessible (${APP_URL})`)
      const body = JSON.parse(r.stdout)
      if (body.status !== "healthy") throw new Error(`Status: ${body.status}\n${JSON.stringify(body.checks, null, 2)}`)
      return `OK — latency: ${body.checks.supabase?.latency_ms ?? "?"}ms`
    } catch (e) {
      throw e
    }
  })
}

// ── AI repair agent ───────────────────────────────────────────────
const TOOLS: Anthropic.Tool[] = [
  {
    name: "read_file",
    description: "Lire le contenu d'un fichier du projet",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Chemin relatif depuis la racine du projet" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Écrire ou modifier un fichier du projet pour corriger une erreur",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Chemin relatif depuis la racine du projet" },
        content: { type: "string", description: "Nouveau contenu complet du fichier" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "run_command",
    description: "Exécuter une commande shell dans le répertoire projet (lecture seule — npm run build, tsc, vitest, etc.)",
    input_schema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Commande à exécuter" },
      },
      required: ["command"],
    },
  },
]

function executeTool(name: string, input: Record<string, string>): string {
  if (name === "read_file") {
    const abs = path.resolve(ROOT, input.path)
    if (!abs.startsWith(ROOT)) return "ERREUR: accès hors du projet refusé"
    try { return fs.readFileSync(abs, "utf8") }
    catch (e) { return `ERREUR lecture: ${e}` }
  }

  if (name === "write_file") {
    const abs = path.resolve(ROOT, input.path)
    if (!abs.startsWith(ROOT)) return "ERREUR: accès hors du projet refusé"
    // Blocage des fichiers sensibles
    const PROTECTED = [".env", ".env.local", "supabase/migrations"]
    if (PROTECTED.some(p => input.path.includes(p))) return "ERREUR: fichier protégé"
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, input.content, "utf8")
    log("FIX", `Fichier modifié : ${input.path}`)
    return "OK"
  }

  if (name === "run_command") {
    // Blocage des commandes dangereuses
    const BLOCKED = ["rm ", "del ", "drop ", "curl ", "wget ", "git push", "git reset --hard"]
    if (BLOCKED.some(b => input.command.includes(b))) return "ERREUR: commande bloquée"
    try {
      return execSync(input.command, { cwd: ROOT, encoding: "utf8", timeout: 60_000 })
    } catch (e: unknown) {
      return e instanceof Error ? e.message : String(e)
    }
  }

  return "ERREUR: outil inconnu"
}

async function runRepairAgent(failures: CheckResult[]): Promise<boolean> {
  const errorSummary = failures
    .map(f => `### ${f.name}\n\`\`\`\n${f.output.slice(0, 2000)}\n\`\`\``)
    .join("\n\n")

  log("WARN", `Démarrage de l'agent de réparation — ${failures.length} échec(s)`)

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Tu es le Guardian de CROCHET, un agent d'auto-réparation pour une application Next.js / TypeScript.

Des vérifications automatiques ont échoué. Diagnostique et corrige les erreurs.

## Erreurs détectées
${errorSummary}

## Instructions
1. Lis les fichiers concernés pour comprendre le problème
2. Propose une correction minimale et ciblée
3. Applique la correction avec write_file
4. Vérifie que la correction fonctionne avec run_command (tsc --noEmit ou vitest run)
5. Ne modifie jamais les fichiers de migration SQL ni les fichiers .env
6. Si le problème est trop complexe pour être corrigé automatiquement, explique clairement ce qu'il faut faire manuellement

Commence l'analyse.`,
    },
  ]

  let fixed = false
  let iterations = 0
  const MAX_ITERATIONS = 10

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      tools: TOOLS,
      messages,
    })

    // Ajouter la réponse à l'historique
    messages.push({ role: "assistant", content: response.content })

    if (response.stop_reason === "end_turn") {
      // Extraire le texte final
      const finalText = response.content
        .filter(b => b.type === "text")
        .map(b => (b as Anthropic.TextBlock).text)
        .join("\n")
      log("INFO", `Agent: ${finalText.slice(0, 500)}`)

      // Considérer comme résolu si l'agent n'a plus de corrections à faire
      fixed = finalText.toLowerCase().includes("corrig") || finalText.toLowerCase().includes("résolu")
      break
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type !== "tool_use") continue

        const input = block.input as Record<string, string>
        log("INFO", `Agent → ${block.name}(${JSON.stringify(input).slice(0, 120)})`)
        const result = executeTool(block.name, input)
        log("INFO", `  Résultat: ${result.slice(0, 200)}`)

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        })
      }

      messages.push({ role: "user", content: toolResults })
    }
  }

  return fixed
}

// ── Main loop ─────────────────────────────────────────────────────
async function runChecks(): Promise<CheckResult[]> {
  log("INFO", "Lancement des vérifications...")
  const [ts, tests, health] = await Promise.all([
    Promise.resolve(checkTypeScript()),
    Promise.resolve(checkTests()),
    checkHealth(),
  ])
  return [ts, tests, health]
}

async function cycle() {
  const results = await runChecks()

  const failures = results.filter(r => !r.ok)
  const successes = results.filter(r => r.ok)

  for (const s of successes) log("INFO", `[OK] ${s.name}`)
  for (const f of failures) log("ERROR", `[FAIL] ${f.name}: ${f.output.slice(0, 200)}`)

  if (failures.length > 0) {
    const fixed = await runRepairAgent(failures)
    if (fixed) {
      log("FIX", "Réparation appliquée — nouvelle vérification dans 60s")
    } else {
      log("WARN", "Intervention manuelle requise — voir logs/guardian.log")
    }
  } else {
    log("INFO", "Toutes les vérifications sont passées.")
  }
}

async function main() {
  log("INFO", `Guardian démarré — mode: ${ONCE ? "unique" : `boucle toutes les ${CHECK_INTERVAL_MS / 60000}min`}`)

  await cycle()

  if (ONCE) {
    process.exit(0)
  }

  setInterval(cycle, CHECK_INTERVAL_MS)
}

main().catch(e => {
  log("ERROR", `Guardian crash: ${e}`)
  process.exit(1)
})
