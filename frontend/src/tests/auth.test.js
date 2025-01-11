import { render, screen, act } from "@testing-library/react";
import { AuthProvider, AuthContext } from "../components/context/authContext";
import { BrowserRouter } from "react-router-dom";
import Home from "../pages/Home";

describe("Authentication Flow", () => {
  test("redirects to login when not authenticated", async () => {
    const mockNavigate = jest.fn();
    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useNavigate: () => mockNavigate,
    }));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("loads user data when authenticated", async () => {
    const mockUser = { id: 1, name: "Test User", role: "Doctor" };
    localStorage.setItem("token", "test-token");

    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
    );

    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => <div data-testid="user-data">{value.user?.name}</div>}
          </AuthContext.Consumer>
        </AuthProvider>
      </BrowserRouter>
    );

    const userData = await screen.findByTestId("user-data");
    expect(userData.textContent).toBe(mockUser.name);
  });
});
