import axios from "axios";
import {
  Author,
  AuthResponse,
  Book,
  BookPayload,
  BookUpdatePayload,
  AuthorPayload,
  Preference,
  PreferencePayload,
  User,
} from "../types";
import { ApiError, parseAxiosError } from "./errors";

export {
  ApiError,
  NetworkError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  ServerError,
} from "./errors";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.coofb.homeserver-ericp.fr";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur global : toutes les erreurs HTTP sont converties en ApiError typées.
// Les stack traces brutes d'axios ne remontent jamais jusqu'aux composants.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return Promise.reject(parseAxiosError(error));
    }
    return Promise.reject(
      new ApiError("Erreur inattendue", "UNKNOWN_ERROR", 0),
    );
  },
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const register = async (
  email: string,
  password: string,
): Promise<User> => {
  const { data } = await api.post<User>("/api/users/register", {
    email,
    password,
  });
  return data;
};

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/api/users/login", {
    email,
    password,
  });
  return data;
};

export const fetchCurrentUser = async (): Promise<User> => {
  const { data } = await api.get<User>("/api/users/me");
  return data;
};

export const fetchAuthors = async (): Promise<Author[]> => {
  const { data } = await api.get<Author[]>("/api/authors/");
  return data;
};

export const createAuthor = async (payload: AuthorPayload): Promise<Author> => {
  const { data } = await api.post<Author>("/api/authors/", payload);
  return data;
};

export const fetchBooks = async (): Promise<Book[]> => {
  const { data } = await api.get<Book[]>("/api/books/");
  return data;
};

export const createBook = async (payload: BookPayload): Promise<Book> => {
  const { data } = await api.post<Book>("/api/books/", payload);
  return data;
};

export const updateBook = async (
  id: number,
  payload: BookUpdatePayload,
): Promise<Book> => {
  const { data } = await api.put<Book>(`/api/books/${id}`, payload);
  return data;
};

export const deleteBook = async (id: number): Promise<void> => {
  await api.delete(`/api/books/${id}`);
};

export const fetchPreferences = async (): Promise<Preference> => {
  const { data } = await api.get<Preference>("/api/preferences/me");
  return data;
};

export const upsertPreferences = async (
  payload: PreferencePayload,
): Promise<Preference> => {
  const { data } = await api.put<Preference>("/api/preferences/me", payload);
  return data;
};

export default api;
