import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AuthForm from "../components/AuthForm";
import { login, register } from "../api/client";

vi.mock("../api/client", () => ({
  __esModule: true,
  login: vi.fn(),
  register: vi.fn()
}));

const loginMock = vi.mocked(login);
const registerMock = vi.mocked(register);

const userFixture = {
  id: 1,
  email: "demo@bibliotheque.test",
  created_at: "",
  updated_at: ""
};

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in an existing user", async () => {
    const onAuthenticated = vi.fn();
    loginMock.mockResolvedValue({ access_token: "token-123", token_type: "bearer", user: userFixture });

    const ui = userEvent.setup();

    render(<AuthForm onAuthenticated={onAuthenticated} />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mot de passe");

    await ui.clear(emailInput);
    await ui.type(emailInput, "reader@example.com");
    await ui.clear(passwordInput);
    await ui.type(passwordInput, "secret123");

    await ui.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith("token-123", userFixture));
    expect(registerMock).not.toHaveBeenCalled();
    expect(loginMock).toHaveBeenCalledWith("reader@example.com", "secret123");
  });

  it("registers then logs in when switching mode", async () => {
    const onAuthenticated = vi.fn();
    registerMock.mockResolvedValue(userFixture);
    loginMock.mockResolvedValue({ access_token: "token-xyz", token_type: "bearer", user: userFixture });

    const ui = userEvent.setup();

    render(<AuthForm onAuthenticated={onAuthenticated} />);

    await ui.click(screen.getByRole("button", { name: "Créer un compte" }));
    await ui.click(screen.getByRole("button", { name: "Créer + connecter" }));

    await waitFor(() => expect(registerMock).toHaveBeenCalled());
    expect(loginMock).toHaveBeenCalled();
    expect(onAuthenticated).toHaveBeenCalledWith("token-xyz", userFixture);
  });

  it("shows an error when login fails", async () => {
    const onAuthenticated = vi.fn();
    loginMock.mockRejectedValue(new Error("Boom"));

    const ui = userEvent.setup();

    render(<AuthForm onAuthenticated={onAuthenticated} />);

    await ui.click(screen.getByRole("button", { name: /connecter/i }));

    expect(await screen.findByText(/Impossible de se connecter/)).toBeInTheDocument();
    expect(onAuthenticated).not.toHaveBeenCalled();
  });
});
