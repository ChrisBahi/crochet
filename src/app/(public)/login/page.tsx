import LoginButton from "./login-button";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-semibold">Crochet.</h1>
        <p className="mt-2 text-sm text-white/70">Accès réservé. Connexion via GitHub.</p>

        <div className="mt-6">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
