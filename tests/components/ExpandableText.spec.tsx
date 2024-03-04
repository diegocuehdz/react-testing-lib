import { render, screen } from "@testing-library/react";
import ExpandableText from "../../src/components/ExpandableText";
import userEvent from "@testing-library/user-event";

describe("ExpandableText", () => {
  const limit = 255;
  const txt = "a".repeat(limit + 1);
  const truncTxt = txt.substring(0, limit) + "...";

  it("should render the full text if less than the characters", () => {
    const txt = "Short Text";
    render(<ExpandableText text={txt} />);
    expect(screen.getByText(txt)).toBeInTheDocument();
  });

  it("should truncate text if longer than allowed chars", () => {
    render(<ExpandableText text={txt} />);
    expect(screen.getByText(truncTxt)).toBeInTheDocument();

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent(/more/i);
  });

  it("should expand text when show more is clicked", async () => {
    render(<ExpandableText text={txt} />);

    const button = screen.getByRole("button");
    const user = userEvent.setup();
    await user.click(button);

    expect(screen.getByText(txt)).toBeInTheDocument();
    expect(button).toHaveTextContent(/less/i);
  });

  it("should expand text when show more is clicked", async () => {
    render(<ExpandableText text={txt} />);
    const btnShowMore = screen.getByRole("button", { name: /more/i });
    const user = userEvent.setup();
    await user.click(btnShowMore);

    const btnShowLess = screen.getByRole("button", { name: /less/i });
    await user.click(btnShowLess);

    expect(screen.getByText(truncTxt)).toBeInTheDocument();
    expect(btnShowMore).toHaveTextContent(/more/i);
  });
});
