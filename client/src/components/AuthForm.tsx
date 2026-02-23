import { FormEvent, useState } from "react";
import { login, register } from "../api/client";
import { User } from "../types";

type AuthFormProps = {
  onAuthenticated: (token: string, user: User) => void;
};

const AuthForm = ({ onAuthenticated }: AuthFormProps) => {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, password);
      }
      const auth = await login(email, password);
      onAuthenticated(auth.access_token, auth.user);
    } catch (err: unknown) {
      setError("Impossible de se connecter. Vérifie l'email/mot de passe ou que l'API tourne.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-sand/80">Bibliotheque</p>
          <h1 className="text-2xl font-semibold text-white">{mode === "login" ? "Connexion" : "Inscription"}</h1>
        </div>
        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-teal hover:text-white transition-colors text-sm"
          type="button"
        >
          {mode === "login" ? "Créer un compte" : "J'ai déjà un compte"}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-sand/90">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="mt-2 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder:text-sand/50 focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </label>
        <label className="block text-sm text-sand/90">
          Mot de passe
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="mt-2 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder:text-sand/50 focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </label>
        {error && <p className="text-amber text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal text-ink font-semibold py-2 rounded-lg shadow-soft hover:translate-y-[-1px] transition-transform disabled:opacity-70"
        >
          {loading ? "Connexion..." : mode === "login" ? "Se connecter" : "Créer + connecter"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
