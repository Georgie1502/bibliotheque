import type { Story } from "@ladle/react";
import AuthorList from "../components/AuthorList";
import { Author } from "../types";

const authors: Author[] = [
  { id: 1, name: "Virginia Woolf", biography: "Auteure britannique moderniste.", created_at: "" },
  { id: 2, name: "Toni Morrison", biography: "Prix Nobel de littérature.", created_at: "" },
  { id: 3, name: "Haruki Murakami", biography: "Romans oniriques et musique jazz.", created_at: "" }
];

export const Default: Story = () => <AuthorList authors={authors} />;

export const Empty: Story = () => <AuthorList authors={[]} />;
