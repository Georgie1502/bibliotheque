import { useEffect, useMemo, useState } from "react";
import {
  createBook,
  deleteBook,
  fetchAuthors,
  fetchBooks,
  fetchCurrentUser,
  createAuthor,
  setAuthToken,
  updateBook,
} from "./api/client";
import AuthForm from "./components/AuthForm";
import AuthorForm from "./components/AuthorForm";
import BookDetail from "./components/BookDetail";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import { Confetti } from "./components/Confetti";
import { useKonamiCode } from "./hooks/useKonamiCode";
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
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      setAuthToken(null);
    }
  }, [token]);

  const bootstrap = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
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
    } catch (err: unknown) {
      setError(
        "Impossible de récupérer les données. Vérifie le token ou que l'API tourne (localhost:8000).",
      );
    } finally {
      setLoading(false);
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
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
  };

  const handleCreate = async (payload: BookPayload) => {
    await createBook(payload);
    const refreshed = await fetchBooks();
    setBooks(refreshed);
    setSelectedId(refreshed[0]?.id ?? null);
  };

  const handleAuthorCreate = async (payload: AuthorPayload) => {
    await createAuthor(payload);
    const refreshedAuthors = await fetchAuthors();
    setAuthors(refreshedAuthors);
  };

  const handleUpdate = async (id: number, payload: BookUpdatePayload) => {
    await updateBook(id, payload);
    const refreshed = await fetchBooks();
    setBooks(refreshed);
  };

  const handleDelete = async (id: number) => {
    await deleteBook(id);
    const refreshed = await fetchBooks();
    setBooks(refreshed);
    setSelectedId(refreshed[0]?.id ?? null);
  };

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedId) || null,
    [books, selectedId],
  );

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <AuthForm onAuthenticated={handleAuth} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6">
      <Confetti trigger={konamiTriggerCount} />
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 shadow-soft">
          <div>
            <p className="text-xs text-sand/60">Connecté</p>
            <h1 className="text-2xl font-semibold">Bonjour {user.email}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={bootstrap}
              className="text-sm px-3 py-1 rounded-lg border border-white/20 hover:border-white/40"
            >
              Rafraîchir
            </button>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1 rounded-lg border border-amber/40 text-amber hover:bg-amber/10"
            >
              Déconnexion
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-amber/10 border border-amber/30 text-amber px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <BookForm authors={authors} onCreate={handleCreate} />
            <AuthorForm onCreate={handleAuthorCreate} />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <BookList
                books={books}
                filter={filter}
                onFilterChange={setFilter}
                onSelect={setSelectedId}
                selectedId={selectedId}
              />
            </div>
            <div className="col-span-2">
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
