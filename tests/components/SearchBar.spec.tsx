import { render, screen } from "@testing-library/react";
import SearchBox from "../../src/components/SearchBox";
import userEvent from "@testing-library/user-event";

describe("SearchBox", () => {
  const renderComponent = () => {
    const onChange = vi.fn();
    render(<SearchBox onChange={onChange} />);
    return {
      input: screen.getByPlaceholderText(/search/i),
      onChange,
      user: userEvent.setup(),
    };
  };

  it("should render an input field for searching", () => {
    const { input } = renderComponent();
    expect(input).toBeInTheDocument();
  });

  it("should call the on change when enter is pressed", async () => {
    const { user, input, onChange } = renderComponent();

    const searchTerm = "SearchTerm";
    await user.type(input, searchTerm + "{enter}");

    expect(onChange).toHaveBeenCalledWith(searchTerm);
  });

  it("should not be called if input is empty", async () => {
    const { user, input, onChange } = renderComponent();

    await user.type(input, "{enter}");

    expect(onChange).not.toHaveBeenCalled();
  });
});
