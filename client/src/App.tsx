import { useEffect, useMemo, useState } from "react";
import {
  createBook,
  deleteBook,
  fetchAuthors,
  fetchBooks,
  fetchCurrentUser,
  fetchPreferences,
  upsertPreferences,
  createAuthor,
  setAuthToken,
  updateBook,
} from "./api/client";
import AuthForm from "./components/AuthForm";
import AuthorForm from "./components/AuthorForm";
import BookDetail from "./components/BookDetail";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import PreferencesPanel from "./components/PreferencesPanel";
import { usePreferences } from "./hooks/usePreferences";
import { Confetti } from "./components/Confetti";
import { useKonamiCode } from "./hooks/useKonamiCode";
import { useToast } from "./hooks/useToast";
import { handleApiError } from "./utils/errorHandler";
import {
  Author,
  Book,
  BookPayload,
  BookUpdatePayload,
  User,
  AuthorPayload,
} from "./types";

const STORAGE_KEY = "bibliotheque_token";

const App = () => {
  const { prefs, update: _updatePrefs, load: loadPrefs } = usePreferences();
  const toast = useToast();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [konamiTriggerCount, setKonamiTriggerCount] = useState(0);

  // Konami code easter egg
  useKonamiCode(() => {
    setKonamiTriggerCount((prev) => prev + 1);
  });

  // Sync when token changes (including first load from localStorage)
  useEffect(() => {
    if (token) {
      setAuthToken(token);
      bootstrap();
    } else {
      setUser(null);
      setBooks([]);
      setAuthors([]);
      setSelectedId(null);
      setAuthToken(null);
    }
  }, [token]);

  const bootstrap = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [me, fetchedAuthors, fetchedBooks] = await Promise.all([
        fetchCurrentUser(),
        fetchAuthors(),
        fetchBooks(),
      ]);
      setUser(me);
      setAuthors(fetchedAuthors);
      setBooks(fetchedBooks);
      if (fetchedBooks.length && !selectedId) {
        setSelectedId(fetchedBooks[0].id);
      }
      // Hydrate display preferences from server (best-effort)
      try {
        const serverPrefs = await fetchPreferences();
        loadPrefs({
          theme: serverPrefs.theme,
          fontScale: serverPrefs.font_scale,
        });
      } catch (_) {
        // Keep localStorage prefs if the API call fails
      }
    } catch (err: unknown) {
      handleApiError(
        err,
        toast,
        "Impossible de récupérer les données. Vérifie le token ou que l'API tourne (localhost:8000).",
      );
    } finally {
      setLoading(false);
    }
  };

  const updatePrefs = async (partial: Parameters<typeof _updatePrefs>[0]) => {
    _updatePrefs(partial);
    try {
      await upsertPreferences({
        theme: partial.theme,
        font_scale: partial.fontScale,
      });
    } catch (_) {
      // Persist locally even if the API is unreachable
    }
  };

  const handleAuth = (newToken: string, newUser: User) => {
    setToken(newToken);
    localStorage.setItem(STORAGE_KEY, newToken);
    setAuthToken(newToken);
    setUser(newUser);
    bootstrap();
  };

  const handleLogout = () => {
    toast.addToast("À bientôt!", "info", 2000);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
  };

  const handleCreate = async (payload: BookPayload) => {
    try {
      await createBook(payload);
      const refreshed = await fetchBooks();
      setBooks(refreshed);
      setSelectedId(refreshed[0]?.id ?? null);
      toast.addToast("Livre ajouté avec succès", "success", 3000);
    } catch (err: unknown) {
      handleApiError(err, toast, "Impossible d'ajouter le livre");
    }
  };

  const handleAuthorCreate = async (payload: AuthorPayload) => {
    try {
      await createAuthor(payload);
      const refreshedAuthors = await fetchAuthors();
      setAuthors(refreshedAuthors);
      toast.addToast("Auteur ajouté avec succès", "success", 3000);
    } catch (err: unknown) {
      handleApiError(err, toast, "Impossible d'ajouter l'auteur");
    }
  };

  const handleUpdate = async (id: number, payload: BookUpdatePayload) => {
    try {
      await updateBook(id, payload);
      const refreshed = await fetchBooks();
      setBooks(refreshed);
      toast.addToast("Livre mis à jour avec succès", "success", 3000);
    } catch (err: unknown) {
      handleApiError(err, toast, "Impossible de mettre à jour le livre");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBook(id);
      const refreshed = await fetchBooks();
      setBooks(refreshed);
      setSelectedId(refreshed[0]?.id ?? null);
      toast.addToast("Livre supprimé avec succès", "success", 3000);
    } catch (err: unknown) {
      handleApiError(err, toast, "Impossible de supprimer le livre");
    }
  };

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedId) || null,
    [books, selectedId],
  );

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <AuthForm onAuthenticated={handleAuth} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-3 sm:p-6">
      <Confetti trigger={konamiTriggerCount} />
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 shadow-soft">
          <div>
            <p className="text-xs text-sand/60">Connecté</p>
            <h1 className="text-xl sm:text-2xl font-semibold truncate">
              Bonjour {user.email}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <PreferencesPanel prefs={prefs} onUpdate={updatePrefs} />
            <button
              onClick={bootstrap}
              className="text-sm px-3 py-1 rounded-lg border border-white/20 hover:border-white/40"
            >
              Rafraîchir
            </button>
            <a
              href="/demo"
              className="text-sm px-3 py-1 rounded-lg border border-teal/40 text-teal hover:bg-teal/10"
            >
              Demos
            </a>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1 rounded-lg border border-amber/40 text-amber hover:bg-amber/10"
            >
              Déconnexion
            </button>
          </div>
        </header>

        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BookForm authors={authors} onCreate={handleCreate} />
            <AuthorForm onCreate={handleAuthorCreate} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="md:col-span-1">
              <BookList
                books={books}
                filter={filter}
                onFilterChange={setFilter}
                onSelect={setSelectedId}
                selectedId={selectedId}
              />
            </div>
            <div className="md:col-span-2">
              <BookDetail
                book={selectedBook}
                authors={authors}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center text-sand/70 text-sm">
            Chargement des données...
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
