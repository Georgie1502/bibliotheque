import { useState } from "react";
import type { Story } from "@ladle/react";
import BookList from "../components/BookList";
import { Book } from "../types";

const sampleBooks: Book[] = [
  {
    id: 1,
    title: "Clean Code",
    description: "Guide de pratique pour écrire du code lisible.",
    isbn: "9780132350884",
    published_year: 2008,
    owner_id: 1,
    created_at: "",
    updated_at: "",
    authors: [{ id: 1, name: "Robert C. Martin", biography: null, created_at: "" }]
  },
  {
    id: 2,
    title: "Domain-Driven Design",
    description: "Conception logicielle guidée par le domaine.",
    isbn: "9780321125217",
    published_year: 2003,
    owner_id: 1,
    created_at: "",
    updated_at: "",
    authors: [{ id: 2, name: "Eric Evans", biography: null, created_at: "" }]
  }
];

export const Default: Story = () => {
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <BookList
      books={sampleBooks}
      filter={filter}
      onFilterChange={setFilter}
      onSelect={setSelectedId}
      selectedId={selectedId}
    />
  );
};

export const EmptyState: Story = () => (
  <BookList books={[]} filter="" onFilterChange={() => {}} onSelect={() => {}} selectedId={null} />
);
