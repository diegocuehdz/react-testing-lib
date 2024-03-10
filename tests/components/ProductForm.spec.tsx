import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";
import ProductForm from "../../src/components/ProductForm";
import { Category, Product } from "../../src/entities";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";

let category: Category;
describe("ProductForm", () => {
  beforeAll(() => {
    category = db.category.create();
  });

  afterAll(() => {
    db.category.delete({ where: { id: { equals: category.id } } });
  });

  it("should render form fields", async () => {
    const { waitForFormToLoad } = renderComponent();
    const { nameInput, priceInput, categoryInput } = await waitForFormToLoad();

    expect(nameInput).toBeInTheDocument();
    expect(priceInput).toBeInTheDocument();
    expect(categoryInput).toBeInTheDocument();
  });

  it("should populate form fields when editing a product", async () => {
    const product: Product = {
      id: 1,
      name: "Test",
      price: 1,
      categoryId: category.id,
    };

    const { waitForFormToLoad } = renderComponent(product);

    const { nameInput, priceInput, categoryInput } = await waitForFormToLoad();

    //await screen.findByRole("form");
    //await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

    expect(nameInput).toHaveValue(product.name);
    expect(priceInput).toHaveValue(product.price.toString());
    expect(categoryInput).toHaveTextContent(category.name);
  });

  it("should put focus on the name field", async () => {
    const { waitForFormToLoad } = renderComponent();

    const { nameInput } = await waitForFormToLoad();

    expect(nameInput).toHaveFocus();
  });

  it.each([
    {
      scenario: "missing",
      errorMessage: /required/i,
    },
    {
      scenario: "longer than 255 chars",
      name: "a".repeat(256),
      errorMessage: /255/i,
    },
  ])(
    "should display an error if name is $scenario",
    async ({ name, errorMessage }) => {
      const { expectErrorToBeInTheDocument, waitForFormToLoad } =
        renderComponent();

      const form = await waitForFormToLoad();

      await form.fill({
        ...form.validData,
        name,
      });

      expectErrorToBeInTheDocument(errorMessage);
    }
  );
  it.each([
    {
      scenario: "missing",
      errorMessage: /required/i,
    },
    {
      scenario: "bigger than 1000",
      value: 1001,
      errorMessage: /1000/i,
    },
    {
      scenario: "zero",
      value: 0,
      errorMessage: /1/i,
    },
    {
      scenario: "negative",
      value: -1,
      errorMessage: /1/i,
    },
    {
      scenario: "an invalid string value",
      value: "number",
      errorMessage: /required/i,
    },
  ])(
    "should display an error if price is $scenario",
    async ({ value, errorMessage }) => {
      const { expectErrorToBeInTheDocument, waitForFormToLoad } =
        renderComponent();

      const form = await waitForFormToLoad();

      await form.fill({
        ...form.validData,
        name: "Test",
        price: value,
      });

      expectErrorToBeInTheDocument(errorMessage);
    }
  );

  it("should call onSubmit with the correct data", async () => {
    const { onSubmit, waitForFormToLoad } = renderComponent();

    const form = await waitForFormToLoad();

    await form.fill(form.validData);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
    const { id, ...formData } = form.validData;

    expect(onSubmit).toBeCalledWith(formData);
  });

  it("should display a toast if submission fails", async () => {
    const { onSubmit, waitForFormToLoad } = renderComponent();
    onSubmit.mockRejectedValue({});

    const form = await waitForFormToLoad();

    await form.fill(form.validData);
    const toast = await screen.findByRole("status");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent(/error/i);
  });

  it("should disable the submit button after submitting", async () => {
    const { onSubmit, waitForFormToLoad } = renderComponent();
    onSubmit.mockReturnValue(new Promise(() => {}));

    const form = await waitForFormToLoad();

    await form.fill(form.validData);
    expect(form.submitButton).toBeDisabled();
  });

  it("should re-enable the submit button after submissions succeeds", async () => {
    const { onSubmit, waitForFormToLoad } = renderComponent();
    onSubmit.mockResolvedValue({});

    const form = await waitForFormToLoad();

    await form.fill(form.validData);
    expect(form.submitButton).not.toBeDisabled();
  });

  it("should re-enable the submit button after submission fails", async () => {
    const { onSubmit, waitForFormToLoad } = renderComponent();
    onSubmit.mockRejectedValue({});

    const form = await waitForFormToLoad();

    await form.fill(form.validData);
    expect(form.submitButton).not.toBeDisabled();
  });
});

const renderComponent = (product?: Product) => {
  const onSubmit = vi.fn();

  render(
    <>
      <ProductForm product={product} onSubmit={onSubmit} />
      <Toaster />
    </>,
    {
      wrapper: AllProviders,
    }
  );

  return {
    onSubmit,
    expectErrorToBeInTheDocument: (errorMessage: RegExp) => {
      const error = screen.getByRole("alert");
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent(errorMessage);
    },
    waitForFormToLoad: async () => {
      await screen.findByRole("form");

      const nameInput = screen.getByPlaceholderText(/name/i);
      const priceInput = screen.getByPlaceholderText(/price/i);
      const categoryInput = screen.getByRole("combobox", {
        name: /category/i,
      });
      const submitButton = screen.getByRole("button");

      type FormData = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [K in keyof Product]: any;
      };

      const validData: FormData = {
        id: 1,
        name: "a",
        price: 1,
        categoryId: category.id,
      };

      const fill = async (product: FormData) => {
        const user = userEvent.setup();

        if (product.name !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          await user.type(nameInput, product.name);
        }
        if (product.price !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          await user.type(priceInput, product.price.toString());
        }

        await user.tab(); // Radix UI error ignore
        await user.click(categoryInput);
        const options = screen.getAllByRole("option");
        await user.click(options[0]);
        await user.click(submitButton);
      };

      return {
        nameInput,
        priceInput,
        categoryInput,
        submitButton,
        fill,
        validData,
      };
    },
  };
};
