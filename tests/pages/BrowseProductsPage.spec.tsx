import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Category, Product } from "../../src/entities";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import AllProviders from "../AllProviders";
import { db, getProductsByCategoryId } from "../mocks/db";
import { simulateDelay, simulateError } from "../utils";

describe("BrowseProductsPage", () => {
  const categories: Category[] = [];
  const products: Product[] = [];

  beforeAll(() => {
    [1, 2].forEach((item) => {
      const category = db.category.create({ name: `Category - ${item}` });
      categories.push(category);
      [1, 2].forEach(() => {
        products.push(db.product.create({ categoryId: category.id }));
      });
    });
  });

  afterAll(() => {
    const categoryIds = categories.map((c) => c.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });

    const productIds = products.map((p) => p.id);
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

  // Loading States & Skelletonized divs
  it("should show a loading skeleton when fetching categories", () => {
    simulateDelay("/categories");

    renderComponent();
    expect(
      screen.queryByRole("progressbar", { name: /categories/i })
    ).toBeInTheDocument();
  });

  it("should hide the loading skeleton after categories are fetched", async () => {
    const { getCategoriesSkeleton } = renderComponent();
    await waitForElementToBeRemoved(getCategoriesSkeleton);
  });

  it("should show a loading skeleton when fetching products", () => {
    simulateDelay("/products");

    renderComponent();
    expect(
      screen.queryByRole("progressbar", { name: /products/i })
    ).toBeInTheDocument();
  });

  it("should hide the loading skeleton after products are fetched", async () => {
    const { getProductsSkeleton } = renderComponent();
    await waitForElementToBeRemoved(getProductsSkeleton);
  });

  //Error Handling
  it("should not render an error if no categories can be fetched", async () => {
    simulateError("/categories");

    const { getCategoriesSkeleton, getCategoriesCombobox } = renderComponent();
    await waitForElementToBeRemoved(getCategoriesSkeleton);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(getCategoriesCombobox()).not.toBeInTheDocument();
  });

  it("should render an error if no products can be fetched", async () => {
    simulateError("/products");
    renderComponent();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  //Data handling
  it("should render categories", async () => {
    const { getCategoriesCombobox, getCategoriesSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    const combo = getCategoriesCombobox();
    expect(combo).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(combo!);

    expect(screen.getByRole("option", { name: /all/i })).toBeInTheDocument();
    categories.forEach((category) => {
      expect(
        screen.getByRole("option", { name: category.name })
      ).toBeInTheDocument();
    });
  });

  it("should render products", async () => {
    const { getProductsSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);

    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  it("should filter products by category", async () => {
    const { expectProductsToBeInTheDocument, selectCategory } =
      renderComponent();

    const selectedCategory = categories[0];
    await selectCategory(selectedCategory.name);

    const productList = getProductsByCategoryId(selectedCategory.id);
    expectProductsToBeInTheDocument(productList);
  });

  it("should show all products if All category is selected", async () => {
    const { expectProductsToBeInTheDocument, selectCategory } =
      renderComponent();

    await selectCategory(/all/i);

    const productList = db.product.getAll();
    expectProductsToBeInTheDocument(productList);
  });
});

const renderComponent = () => {
  render(<BrowseProducts />, { wrapper: AllProviders });

  const getProductsSkeleton = () =>
    screen.queryByRole("progressbar", { name: /products/i });

  const getCategoriesSkeleton = () =>
    screen.queryByRole("progressbar", { name: /categories/i });

  const getCategoriesCombobox = () => screen.queryByRole("combobox");

  const selectCategory = async (name: RegExp | string) => {
    // Arrange
    await waitForElementToBeRemoved(getCategoriesSkeleton);
    const combobox = getCategoriesCombobox();
    const user = userEvent.setup();
    await user.click(combobox!);

    const option = screen.getByRole("option", {
      name,
    });
    await user.click(option);
  };

  const expectProductsToBeInTheDocument = (productList: Product[]) => {
    const rows = screen.getAllByRole("row");
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(productList.length);

    productList.forEach((p) => {
      expect(screen.getByText(p.name)).toBeInTheDocument();
    });
  };

  return {
    getCategoriesCombobox,
    getProductsSkeleton,
    getCategoriesSkeleton,
    selectCategory,
    expectProductsToBeInTheDocument,
  };
};
