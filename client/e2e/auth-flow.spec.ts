import { test, expect } from "@playwright/test";

const user = {
  id: 1,
  email: "demo@bibliotheque.test",
  created_at: "",
  updated_at: ""
};

const authors = [{ id: 1, name: "Frank Herbert", biography: "", created_at: "" }];

const books = [
  {
    id: 1,
    title: "Dune",
    description: "Sci-fi saga",
    isbn: "9780441172719",
    published_year: 1965,
    owner_id: 1,
    created_at: "",
    updated_at: new Date().toISOString(),
    authors
  }
];

test("user can login and see their books", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 200, body: "" });
      return;
    }
    await route.fallback();
  });

  await page.route("**/api/users/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ access_token: "token-123", token_type: "bearer", user })
    });
  });

  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(user) });
  });

  await page.route("**/api/authors/", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(authors) });
  });

  await page.route("**/api/books/", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(books) });
      return;
    }
    await route.continue();
  });

  await page.goto("/");

  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Mot de passe").fill("password123");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByText("Bonjour demo@bibliotheque.test")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dune", level: 2 })).toBeVisible();
});
