import { render, screen } from "@testing-library/react";
import UserAccount from "../../src/components/UserAccount";
import { User } from "../../src/entities";

describe("UserAccount", () => {
  it("should display the users name in the screen", () => {
    const user: User = { id: 0, name: "Diego" };
    render(<UserAccount user={user} />);
    expect(screen.getByText(user.name)).toBeInTheDocument();
  });

  it("should display the admin button for a user", () => {
    render(<UserAccount user={{ id: 0, name: "Diego", isAdmin: true }} />);

    const comp = screen.getByRole("button");
    expect(comp).toBeInTheDocument();
    expect(comp).toHaveTextContent(/edit/i);
  });

  it("shouldnt display the admin button for a user", () => {
    render(<UserAccount user={{ id: 0, name: "Diego", isAdmin: false }} />);

    const comp = screen.queryByRole("button");
    expect(comp).not.toBeInTheDocument();
  });
});
