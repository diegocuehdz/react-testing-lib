import { screen } from "@testing-library/react";

import { navigateTo } from "./utils";
import { db } from "./mocks/db";

describe("Router test cases", () => {
  it("should render the home page for /", () => {
    navigateTo("/");

    expect(screen.getByRole("heading", { name: /home/i })).toBeInTheDocument();
  });

  it("should render the products page for /products", () => {
    navigateTo("/products");

    expect(
      screen.getByRole("heading", { name: /products/i })
    ).toBeInTheDocument();
  });

  it("should render the product detail page with a given id at /products/id", async () => {
    const product = db.product.create();

    navigateTo("/products/" + product.id);

    expect(
      await screen.findByRole("heading", { name: product.name })
    ).toBeInTheDocument();

    db.product.delete({ where: { id: { equals: product.id } } });
  });

  it("should render the not found page if navigated to an invalid route", () => {
    navigateTo("/not-found-page");

    expect(screen.getByRole("heading", { name: /oops/i })).toBeInTheDocument();
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it("should render admin home page for /admin", () => {
    navigateTo("/admin");

    expect(screen.getByRole("heading", { name: /admin/i })).toBeInTheDocument();
  });
});
