import { render, screen } from "@testing-library/react";
import Greet from "../../src/components/Greet";
import "@testing-library/jest-dom/vitest";

describe("Greet", () => {
  it("should render Hello with the name when the name is provided", () => {
    render(<Greet name="Diego" />);

    const comp = screen.getByRole("heading");
    expect(comp).toBeInTheDocument();
    expect(comp).toHaveTextContent(/diego/i);
  });

  it("should render login button when name is no provided", () => {
    render(<Greet />);

    const comp = screen.getByRole("button");
    expect(comp).toBeInTheDocument();
    expect(comp).toHaveTextContent(/login/i);
  });
});
