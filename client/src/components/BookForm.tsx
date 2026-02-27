import { FormEvent, useState } from "react";
import { Author, BookPayload } from "../types";

type BookFormProps = {
  authors: Author[];
  onCreate: (payload: BookPayload) => Promise<void>;
};

const emptyPayload: BookPayload = {
  title: "",
  description: "",
  isbn: "",
  published_year: undefined,
  author_ids: []
};

const BookForm = ({ authors, onCreate }: BookFormProps) => {
  const [form, setForm] = useState<BookPayload>(emptyPayload);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAuthor = (id: number) => {
    setForm((prev) => {
      const ids = new Set(prev.author_ids || []);
      if (ids.has(id)) {
        ids.delete(id);
      } else {
        ids.add(id);
      }
      return { ...prev, author_ids: Array.from(ids) };
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    setLoading(true);
    try {
      await onCreate({
        ...form,
        published_year: form.published_year || undefined,
        author_ids: form.author_ids && form.author_ids.length ? form.author_ids : undefined
      });
      setForm(emptyPayload);
    } catch (err: unknown) {
      setError("Création impossible. Vérifie l'ISBN ou l'état du serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Nouveau livre</h2>
        {loading && <span className="text-xs text-sand/70">Envoi...</span>}
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm text-sand/80 col-span-2">
            Titre
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal"
              required
            />
          </label>
          <label className="text-sm text-sand/80">
            ISBN
            <input
              value={form.isbn || ""}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </label>
          <label className="text-sm text-sand/80">
            Année
            <input
              value={form.published_year || ""}
              onChange={(e) => setForm({ ...form, published_year: Number(e.target.value) || undefined })}
              type="number"
              className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </label>
        </div>
        <label className="text-sm text-sand/80 block">
          Description
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </label>
        <div className="text-sm text-sand/80">
          Auteurs
          <div className="mt-2 flex flex-wrap gap-2">
            {authors.map((a) => {
              const active = (form.author_ids || []).includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAuthor(a.id)}
                  className={`px-3 py-1 rounded-full border text-sm transition ${
                    active
                      ? "bg-teal/20 border-teal text-white"
                      : "bg-white/5 border-white/15 text-sand/80 hover:border-white/25"
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
            {authors.length === 0 && <span className="text-sand/60">Aucun auteur (vous pouvez en créer via l'API)</span>}
          </div>
        </div>
        {error && <p className="text-amber text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-ink font-semibold py-2 rounded-lg shadow-soft hover:-translate-y-[1px] transition-transform disabled:opacity-70"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
};

export default BookForm;
