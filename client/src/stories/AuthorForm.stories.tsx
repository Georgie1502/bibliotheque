import type { Story } from "@ladle/react";
import AuthorForm from "../components/AuthorForm";

const simulateNetwork = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const Default: Story = () => (
  <AuthorForm
    onCreate={async (payload) => {
      await simulateNetwork();
      console.log("create author", payload);
    }}
  />
);

export const ErrorState: Story = () => (
  <AuthorForm
    onCreate={async () => {
      await simulateNetwork();
      throw new Error("Duplicate name");
    }}
  />
);
