import { ChangeEvent, useMemo } from "react";
import { Book } from "../types";

type BookListProps = {
  books: Book[];
  filter: string;
  onFilterChange: (value: string) => void;
  onSelect: (bookId: number) => void;
  selectedId: number | null;
};

const BookList = ({ books, filter, onFilterChange, onSelect, selectedId }: BookListProps) => {
  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return books;
    return books.filter((book) => {
      const inTitle = book.title.toLowerCase().includes(query);
      const inAuthors = book.authors.some((a) => a.name.toLowerCase().includes(query));
      const inIsbn = (book.isbn || "").toLowerCase().includes(query);
      return inTitle || inAuthors || inIsbn;
    });
  }, [books, filter]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Livres</h2>
          <span className="text-xs text-sand/60">{filtered.length} items</span>
        </div>
        <div className="relative">
          <input
            value={filter}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange(e.target.value)}
            placeholder="Filtrer par titre, auteur, ISBN"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder:text-sand/50 focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
        {filtered.map((book) => {
          const isActive = selectedId === book.id;
          return (
            <button
              key={book.id}
              onClick={() => onSelect(book.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isActive
                  ? "border-teal bg-teal/10 shadow-soft"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-white font-semibold">{book.title}</h3>
                  <p className="text-sand/80 text-sm line-clamp-1">
                    {(book.authors || []).map((a) => a.name).join(", ") || "Sans auteur"}
                  </p>
                </div>
                {book.published_year && (
                  <span className="text-xs px-2 py-1 rounded bg-white/10 text-sand/80">{book.published_year}</span>
                )}
              </div>
              {book.description && (
                <p className="text-sand/70 text-sm mt-2 line-clamp-2">{book.description}</p>
              )}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-sand/60 text-sm border border-dashed border-white/10 rounded-lg p-4 text-center">
            Aucun livre ne correspond au filtre.
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;
