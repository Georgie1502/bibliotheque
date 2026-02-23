import { Author } from "../types";

type AuthorListProps = {
  authors: Author[];
};

const AuthorList = ({ authors }: AuthorListProps) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Auteurs</h2>
        <span className="text-xs text-sand/60">{authors.length} items</span>
      </div>
      <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
        {authors.map((author) => (
          <div
            key={author.id}
            className="p-3 rounded-lg border border-white/10 bg-white/5"
          >
            <p className="text-white font-medium">{author.name}</p>
            {author.biography && (
              <p className="text-sand/70 text-sm line-clamp-2 mt-1">{author.biography}</p>
            )}
          </div>
        ))}
        {authors.length === 0 && (
          <div className="text-sand/60 text-sm border border-dashed border-white/10 rounded-lg p-4 text-center">
            Aucun auteur pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorList;
