export type Author = {
  id: number;
  name: string;
  biography?: string | null;
  created_at: string;
};

export type AuthorPayload = {
  name: string;
  biography?: string | null;
};

export type Book = {
  id: number;
  title: string;
  description?: string | null;
  isbn?: string | null;
  published_year?: number | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
  authors: Author[];
};

export type User = {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
};

export type BookPayload = {
  title: string;
  description?: string | null;
  isbn?: string | null;
  published_year?: number | null;
  author_ids?: number[] | null;
};

export type BookUpdatePayload = Partial<BookPayload>;

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type Preference = {
  id: number;
  user_id: number;
  theme: "dark" | "sepia" | "ardoise" | "foret";
  font_scale: "normal" | "large" | "xlarge";
  created_at: string;
  updated_at: string;
};

export type PreferencePayload = Partial<Pick<Preference, "theme" | "font_scale">>;
