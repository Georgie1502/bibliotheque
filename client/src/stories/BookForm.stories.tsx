import type { Story } from "@ladle/react";
import BookForm from "../components/BookForm";
import { Author } from "../types";

const authors: Author[] = [
  { id: 1, name: "Mary Shelley", biography: "Frankenstein.", created_at: "" },
  { id: 2, name: "Isaac Asimov", biography: "Fondation, Robot.", created_at: "" }
];

const simulateNetwork = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const Default: Story = () => (
  <BookForm
    authors={authors}
    onCreate={async (payload) => {
      await simulateNetwork();
      console.log("create book", payload);
    }}
  />
);

export const NoAuthors: Story = () => (
  <BookForm
    authors={[]}
    onCreate={async (payload) => {
      await simulateNetwork();
      console.log("create book", payload);
    }}
  />
);
