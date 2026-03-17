#!/usr/bin/env ts-node
/**
 * CROCHET Guardian — Agent IA de monitoring et auto-réparation
 *
 * Lance en boucle :        npm run guardian
 * Vérification unique :    npm run guardian:once
 */

import Anthropic from "@anthropic-ai/sdk"
import { execSync, spawnSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

// ── Charger .env.local avant tout ────────────────────────────────
const ROOT = path.resolve(__dirname, "..")
const envFile = path.join(ROOT, ".env.local")
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}

// ── Config ────────────────────────────────────────────────────────
const LOG_FILE = path.join(ROOT, "logs", "guardian.log")
const CHECK_INTERVAL_MS = 5 * 60 * 1000
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
// fixable = erreur de code corrigeable par l'IA
// infra   = serveur non lancé, etc. — intervention manuelle
type CheckResult = { name: string; ok: boolean; output: string; fixable: boolean }

function runCheck(name: string, fixable: boolean, fn: () => string): CheckResult {
  try {
    return { name, ok: true, output: fn(), fixable }
  } catch (e: unknown) {
    return { name, ok: false, output: e instanceof Error ? e.message : String(e), fixable }
  }
}

function checkTypeScript(): CheckResult {
  return runCheck("TypeScript", true, () => {
    const r = spawnSync("npx", ["tsc", "--noEmit"], { cwd: ROOT, encoding: "utf8" })
    if (r.status !== 0) throw new Error(r.stdout + r.stderr)
    return "OK"
  })
}

function checkTests(): CheckResult {
  return runCheck("Tests (vitest)", true, () => {
    const r = spawnSync("npx", ["vitest", "run", "--reporter=verbose"], {
      cwd: ROOT, encoding: "utf8", env: { ...process.env, CI: "true" },
    })
    if (r.status !== 0) throw new Error(r.stdout + r.stderr)
    return r.stdout.split("\n").slice(-5).join("\n")
  })
}

function checkHealth(): CheckResult {
  return runCheck("Health endpoint", false, () => {
    const r = spawnSync("curl", ["-sf", "--max-time", "5", `${APP_URL}/api/health`], { encoding: "utf8" })
    if (r.status !== 0) throw new Error(`Serveur inaccessible (${APP_URL}) — lancez "npm run dev"`)
    const body = JSON.parse(r.stdout)
    if (body.status !== "healthy") throw new Error(`Status: ${body.status}\n${JSON.stringify(body.checks, null, 2)}`)
    return `OK — latency: ${body.checks.supabase?.latency_ms ?? "?"}ms`
  })
}

// ── AI repair agent ───────────────────────────────────────────────
const TOOLS: Anthropic.Tool[] = [
  {
    name: "read_file",
    description: "Lire le contenu d'un fichier du projet",
    input_schema: {
      type: "object",
      properties: { path: { type: "string", description: "Chemin relatif depuis la racine du projet" } },
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
    description: "Exécuter une commande shell dans le répertoire projet (tsc, vitest, etc.)",
    input_schema: {
      type: "object",
      properties: { command: { type: "string", description: "Commande à exécuter" } },
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
    const PROTECTED = [".env", ".env.local", "supabase/migrations"]
    if (PROTECTED.some(p => input.path.includes(p))) return "ERREUR: fichier protégé"
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, input.content, "utf8")
    log("FIX", `Fichier modifié : ${input.path}`)
    return "OK"
  }
  if (name === "run_command") {
    const BLOCKED = ["rm ", "del ", "drop ", "curl ", "wget ", "git push", "git reset --hard"]
    if (BLOCKED.some(b => input.command.includes(b))) return "ERREUR: commande bloquée"
    try { return execSync(input.command, { cwd: ROOT, encoding: "utf8", timeout: 60_000 }) }
    catch (e: unknown) { return e instanceof Error ? e.message : String(e) }
  }
  return "ERREUR: outil inconnu"
}

async function runRepairAgent(failures: CheckResult[]): Promise<boolean> {
  const errorSummary = failures
    .map(f => `### ${f.name}\n\`\`\`\n${f.output.slice(0, 2000)}\n\`\`\``)
    .join("\n\n")

  log("WARN", `Agent de réparation — ${failures.length} échec(s) analysable(s)`)

  const messages: Anthropic.MessageParam[] = [{
    role: "user",
    content: `Tu es le Guardian de CROCHET, agent d'auto-réparation pour une application Next.js / TypeScript.

Des erreurs de code ont été détectées. Diagnostique et corrige-les.

## Erreurs détectées
${errorSummary}

## Instructions
1. Lis les fichiers concernés pour comprendre le problème
2. Applique une correction minimale et ciblée avec write_file
3. Vérifie avec run_command (tsc --noEmit ou vitest run)
4. Ne modifie jamais les fichiers .env ni les migrations SQL
5. Si trop complexe, explique clairement ce qu'il faut faire manuellement

Commence l'analyse.`,
  }]

  let fixed = false
  let iterations = 0

  while (iterations < 10) {
    iterations++
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      tools: TOOLS,
      messages,
    })

    messages.push({ role: "assistant", content: response.content })

    if (response.stop_reason === "end_turn") {
      const finalText = response.content
        .filter(b => b.type === "text")
        .map(b => (b as Anthropic.TextBlock).text)
        .join("\n")
      log("INFO", `Agent: ${finalText.slice(0, 500)}`)
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
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result })
      }
      messages.push({ role: "user", content: toolResults })
    }
  }

  return fixed
}

// ── Main loop ─────────────────────────────────────────────────────
async function cycle() {
  log("INFO", "Lancement des vérifications...")
  const results = [checkTypeScript(), checkTests(), checkHealth()]

  for (const r of results) {
    if (r.ok) log("INFO", `[OK] ${r.name}`)
    else log("ERROR", `[FAIL] ${r.name}: ${r.output.slice(0, 200)}`)
  }

  const fixable = results.filter(r => !r.ok && r.fixable)
  const infra   = results.filter(r => !r.ok && !r.fixable)

  for (const f of infra) log("WARN", `[INFRA] ${f.name} — ${f.output}`)

  if (fixable.length > 0) {
    const fixed = await runRepairAgent(fixable)
    log(fixed ? "FIX" : "WARN", fixed ? "Réparation appliquée." : "Intervention manuelle requise — voir logs/guardian.log")
  } else if (infra.length === 0) {
    log("INFO", "Toutes les vérifications sont passées.")
  }
}

async function main() {
  log("INFO", `Guardian démarré — mode: ${ONCE ? "unique" : `boucle toutes les ${CHECK_INTERVAL_MS / 60000}min`}`)
  await cycle()
  if (ONCE) process.exit(0)
  setInterval(cycle, CHECK_INTERVAL_MS)
}

main().catch(e => {
  log("ERROR", `Guardian crash: ${e}`)
  process.exit(1)
})
