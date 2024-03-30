import { render, screen } from "@testing-library/react";
import { CartProvider } from "../../src/providers/CartProvider";
import QuantitySelector from "../../src/components/QuantitySelector";
import { Product } from "../../src/entities";
import userEvent from "@testing-library/user-event";

describe("Quantity Selector test cases", () => {
  const renderComponent = () => {
    const product: Product = {
      id: 1,
      name: "Milk",
      price: 5,
      categoryId: 1,
    };
    render(
      <CartProvider>
        <QuantitySelector product={product} />
      </CartProvider>
    );

    const getAddToCartButton = () =>
      screen.getByRole("button", { name: /add to cart/i });
    const getQuantityControls = () => ({
      decrementButton: screen.queryByRole("button", { name: "-" }),
      incrementButton: screen.queryByRole("button", { name: "+" }),
      quantity: screen.queryByRole("status"),
    });

    const user = userEvent.setup();

    const addToCart = async () => {
      const button = getAddToCartButton();
      await user.click(button);
    };

    const incrementQuantity = async () => {
      const { incrementButton } = getQuantityControls();
      await user.click(incrementButton!);
    };

    const decrementQuantity = async () => {
      const { decrementButton } = getQuantityControls();
      await user.click(decrementButton!);
    };

    return {
      getAddToCartButton,
      getQuantityControls,
      addToCart,
      incrementQuantity,
      decrementQuantity,
    };
  };

  it("should render the Add to Cart button", () => {
    const { getAddToCartButton } = renderComponent();
    expect(getAddToCartButton()).toBeInTheDocument();
  });

  it("should add the product to the cart", async () => {
    const { getAddToCartButton, getQuantityControls, addToCart } =
      renderComponent();
    const addToCartButton = getAddToCartButton();

    await addToCart();

    const { quantity, decrementButton, incrementButton } =
      getQuantityControls();

    expect(quantity).toHaveTextContent("1");
    expect(decrementButton).toBeInTheDocument();
    expect(incrementButton).toBeInTheDocument();
    expect(addToCartButton).not.toBeInTheDocument();
  });

  it("should increment the quantity of a product", async () => {
    const { addToCart, incrementQuantity, getQuantityControls } =
      renderComponent();

    await addToCart();
    await incrementQuantity();

    const { quantity } = getQuantityControls();
    expect(quantity).toHaveTextContent("2");
  });

  it("should decrement the quantity of a product", async () => {
    const {
      addToCart,
      incrementQuantity,
      decrementQuantity,
      getQuantityControls,
    } = renderComponent();

    await addToCart();
    await incrementQuantity();
    await decrementQuantity();

    const { quantity } = getQuantityControls();
    expect(quantity).toHaveTextContent("1");
  });

  it("should remove the product from the cart", async () => {
    const {
      addToCart,
      getAddToCartButton,
      decrementQuantity,
      getQuantityControls,
    } = renderComponent();

    await addToCart();
    await decrementQuantity();

    const { quantity, incrementButton, decrementButton } =
      getQuantityControls();
    expect(quantity).not.toBeInTheDocument();
    expect(decrementButton).not.toBeInTheDocument();
    expect(incrementButton).not.toBeInTheDocument();
    expect(getAddToCartButton()).toBeInTheDocument();
  });
});
