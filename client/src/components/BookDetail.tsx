import { FormEvent, useEffect, useMemo, useState } from "react";
import { Author, Book, BookUpdatePayload } from "../types";

type BookDetailProps = {
  book: Book | null;
  authors: Author[];
  onUpdate: (id: number, payload: BookUpdatePayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

const BookDetail = ({ book, authors, onUpdate, onDelete }: BookDetailProps) => {
  const [form, setForm] = useState<BookUpdatePayload>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        description: book.description || "",
        isbn: book.isbn || "",
        published_year: book.published_year || undefined,
        author_ids: book.authors?.map((a) => a.id) || []
      });
    }
  }, [book]);

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
    if (!book) return;
    setSaving(true);
    setError(null);
    try {
      await onUpdate(book.id, {
        ...form,
        published_year: form.published_year || undefined,
        author_ids: form.author_ids
      });
    } catch (err: unknown) {
      setError("Échec de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const authorsById = useMemo(() => new Map(authors.map((a) => [a.id, a])), [authors]);

  if (!book) {
    return (
      <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center text-sand/70">
        Sélectionne un livre pour voir le détail.
      </div>
    );
  }

  return (
    <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{book.title}</h2>
          <p className="text-sand/70 text-sm">Dernière mise à jour: {new Date(book.updated_at).toLocaleString()}</p>
        </div>
        <button
          onClick={() => onDelete(book.id)}
          className="text-amber text-sm border border-amber/40 rounded-lg px-3 py-1 hover:bg-amber/10"
        >
          Supprimer
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm text-sand/80 col-span-2">
            Titre
            <input
              value={form.title || ""}
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
            rows={4}
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
                  title={a.biography || ""}
                >
                  {a.name}
                </button>
              );
            })}
            {authors.length === 0 && <span className="text-sand/60">Aucun auteur disponible.</span>}
          </div>
          {form.author_ids && form.author_ids.length > 0 && (
            <p className="text-xs text-sand/60 mt-1">
              Sélection: {form.author_ids.map((id) => authorsById.get(id)?.name).filter(Boolean).join(", ")}
            </p>
          )}
        </div>

        {error && <p className="text-amber text-sm">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-teal text-ink font-semibold px-4 py-2 rounded-lg shadow-soft hover:-translate-y-[1px] transition-transform disabled:opacity-70"
          >
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
          <span className="text-xs text-sand/60">Les modifications sont envoyées directement à l'API.</span>
        </div>
      </form>
    </div>
  );
};

export default BookDetail;
