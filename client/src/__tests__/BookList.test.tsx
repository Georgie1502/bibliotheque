import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import BookList from "../components/BookList";
import { Book } from "../types";

const books: Book[] = [
  {
    id: 1,
    title: "Dune",
    description: "Sci-fi saga on Arrakis",
    isbn: "9780441172719",
    published_year: 1965,
    owner_id: 1,
    created_at: "",
    updated_at: "",
    authors: [{ id: 1, name: "Frank Herbert", biography: "", created_at: "" }]
  },
  {
    id: 2,
    title: "Foundation",
    description: "Galactic empire and psychohistory",
    isbn: "9780553293357",
    published_year: 1951,
    owner_id: 1,
    created_at: "",
    updated_at: "",
    authors: [{ id: 2, name: "Isaac Asimov", biography: "", created_at: "" }]
  }
];

type ControlledProps = {
  onSelect: (id: number) => void;
};

const ControlledBookList = ({ onSelect }: ControlledProps) => {
  const [filter, setFilter] = useState("");
  return (
    <BookList
      books={books}
      filter={filter}
      onFilterChange={setFilter}
      onSelect={onSelect}
      selectedId={null}
    />
  );
};

describe("BookList", () => {
  it("filters by title, author, and ISBN", async () => {
    render(
      <BookList
        books={books}
        filter="asimov"
        onFilterChange={() => undefined}
        onSelect={() => undefined}
        selectedId={null}
      />
    );

    expect(screen.getByText("Foundation")).toBeInTheDocument();
    expect(screen.queryByText("Dune")).not.toBeInTheDocument();
  });

  it("updates filter when typing and calls onSelect", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(<ControlledBookList onSelect={handleSelect} />);

    await user.type(
      screen.getByPlaceholderText("Filtrer par titre, auteur, ISBN"),
      "dune"
    );

    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.queryByText("Foundation")).not.toBeInTheDocument();

    await user.click(screen.getByText("Dune"));
    expect(handleSelect).toHaveBeenCalledWith(1);
  });
});
