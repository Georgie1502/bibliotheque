import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "../App";
import { Author, Book, User } from "../types";

const mocks = vi.hoisted(() => {
  return {
    fetchCurrentUserMock: vi.fn(),
    fetchAuthorsMock: vi.fn(),
    fetchBooksMock: vi.fn(),
    createBookMock: vi.fn(),
    deleteBookMock: vi.fn(),
    createAuthorMock: vi.fn(),
    updateBookMock: vi.fn(),
    setAuthTokenMock: vi.fn()
  };
});

vi.mock("../api/client", () => ({
  __esModule: true,
  fetchCurrentUser: mocks.fetchCurrentUserMock,
  fetchAuthors: mocks.fetchAuthorsMock,
  fetchBooks: mocks.fetchBooksMock,
  createBook: mocks.createBookMock,
  deleteBook: mocks.deleteBookMock,
  createAuthor: mocks.createAuthorMock,
  updateBook: mocks.updateBookMock,
  setAuthToken: mocks.setAuthTokenMock
}));

const user: User = {
  id: 99,
  email: "demo@bibliotheque.test",
  created_at: "",
  updated_at: ""
};

const authors: Author[] = [
  { id: 1, name: "Frank Herbert", biography: "", created_at: "" }
];

const books: Book[] = [
  {
    id: 1,
    title: "Dune",
    description: "Sci-fi saga",
    isbn: "9780441172719",
    published_year: 1965,
    owner_id: 99,
    created_at: "",
    updated_at: new Date().toISOString(),
    authors
  }
];

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows the authentication form when no token is present", () => {
    render(<App />);
    expect(screen.getByText(/Connexion/)).toBeInTheDocument();
  });

  it("boots with stored token and renders data", async () => {
    localStorage.setItem("bibliotheque_token", "token-123");
    mocks.fetchCurrentUserMock.mockResolvedValue(user);
    mocks.fetchAuthorsMock.mockResolvedValue(authors);
    mocks.fetchBooksMock.mockResolvedValue(books);

    render(<App />);

    await waitFor(() => expect(screen.getByText(/Bonjour/)).toBeInTheDocument());
    expect(screen.getByText("Bonjour demo@bibliotheque.test")).toBeInTheDocument();
    expect(screen.getAllByText("Dune")[0]).toBeInTheDocument();
    expect(mocks.setAuthTokenMock).toHaveBeenCalledWith("token-123");
    expect(mocks.fetchBooksMock).toHaveBeenCalledTimes(1);
  });
});
