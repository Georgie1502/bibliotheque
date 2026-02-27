import type { Story } from "@ladle/react";
import BookDetail from "../components/BookDetail";
import { Author, Book } from "../types";

const authors: Author[] = [
  { id: 1, name: "Octavia E. Butler", biography: "Science-fiction spéculative.", created_at: "" },
  { id: 2, name: "Frank Herbert", biography: "Saga Dune.", created_at: "" }
];

const book: Book = {
  id: 42,
  title: "Parable of the Sower",
  description: "Un futur dystopique et la survie par l'empathie.",
  isbn: "9780446675505",
  published_year: 1993,
  owner_id: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  authors
};

const simulateNetwork = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const SelectedBook: Story = () => (
  <BookDetail
    book={book}
    authors={authors}
    onUpdate={async (id, payload) => {
      await simulateNetwork();
      console.log("update book", id, payload);
    }}
    onDelete={async (id) => {
      await simulateNetwork();
      console.log("delete book", id);
    }}
  />
);

export const NoSelection: Story = () => (
  <BookDetail
    book={null}
    authors={authors}
    onUpdate={async () => {}}
    onDelete={async () => {}}
  />
);
