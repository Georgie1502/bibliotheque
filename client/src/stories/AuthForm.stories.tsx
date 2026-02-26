import type { Story } from "@ladle/react";
import AuthForm from "../components/AuthForm";
import { User } from "../types";

const demoUser: User = {
  id: 1,
  email: "demo@example.com",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const Default: Story = () => (
  <div className="max-w-lg">
    <AuthForm onAuthenticated={(token, user) => console.log("authenticated", token, user)} />
  </div>
);

export const CustomCallback: Story = () => (
  <AuthForm
    onAuthenticated={(token) => {
      // In a real app, you would persist the token and route the user.
      console.log("token ready", token, demoUser);
    }}
  />
);
