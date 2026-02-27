import { FormEvent, useState } from "react";
import { AuthorPayload } from "../types";

type AuthorFormProps = {
  onCreate: (payload: AuthorPayload) => Promise<void>;
};

const emptyAuthor: AuthorPayload = { name: "", biography: "" };

const AuthorForm = ({ onCreate }: AuthorFormProps) => {
  const [form, setForm] = useState<AuthorPayload>(emptyAuthor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }
    setLoading(true);
    try {
      await onCreate({
        name: form.name.trim(),
        biography: form.biography?.trim() || undefined
      });
      setForm(emptyAuthor);
    } catch (err: unknown) {
      setError("Création impossible (nom déjà utilisé ?).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Nouvel auteur</h2>
        {loading && <span className="text-xs text-sand/70">Envoi...</span>}
      </div>
      <form onSubmit={submit} className="space-y-3">
        <label className="text-sm text-sand/80 block">
          Nom
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </label>
        <label className="text-sm text-sand/80 block">
          Biographie (optionnel)
          <textarea
            value={form.biography || ""}
            onChange={(e) => setForm({ ...form, biography: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </label>
        {error && <p className="text-amber text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-ink font-semibold py-2 rounded-lg shadow-soft hover:-translate-y-[1px] transition-transform disabled:opacity-70"
        >
          Ajouter l'auteur
        </button>
      </form>
    </div>
  );
};

export default AuthorForm;
