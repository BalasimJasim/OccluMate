import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/context/authContext";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import Button from "../common/Button";
import Input from "../common/Input";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("[Login] Attempting login with:", formData.email);
      const result = await login(formData);
      console.log("[Login] Login result:", result);

      if (result.success) {
        console.log("[Login] Login successful, navigating to dashboard");
        // Force a small delay to ensure context is updated
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      } else {
        console.log("[Login] Login failed:", result.error);
        setError(result.error);
      }
    } catch (err) {
      console.error("[Login] Error during login:", err);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-400 p-6 md:p-12 text-white flex-col justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">OccluMate</h1>
          <p className="text-lg md:text-xl text-blue-100">
            Dental Management System
          </p>
        </div>
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Welcome Back!</h2>
          <p className="text-base md:text-lg text-blue-100">
            Log in to access your dental practice management dashboard and
            provide excellent care for your patients.
          </p>
          <div className="flex flex-col md:flex-row gap-4 md:space-x-4">
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-lg flex-1">
              <h3 className="font-semibold mb-1">Streamlined Workflow</h3>
              <p className="text-sm text-blue-100">
                Manage appointments, patient records, and treatments efficiently
              </p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-lg flex-1">
              <h3 className="font-semibold mb-1">Patient Care</h3>
              <p className="text-sm text-blue-100">
                Access comprehensive patient histories and treatment plans
              </p>
            </div>
          </div>
        </div>
        <div className="text-sm text-blue-100">
          © {new Date().getFullYear()} OccluMate. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6 md:space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Sign in
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Welcome back! Please enter your details.
            </p>
          </div>

          {error && (
            <div className="p-3 md:p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                </div>
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10 text-sm md:text-base"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                </div>
                <Input
                  label="Password"
                  id="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10 text-sm md:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full flex items-center justify-center text-sm md:text-base py-2 md:py-2.5"
              disabled={loading}
            >
              <FaSignInAlt className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up for free
              </Link>
            </p>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  fillRule="evenodd"
                  d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm0 7.2c3.537 0 6.786 1.287 9.286 3.414l-9.286 9.286-9.286-9.286C17.214 12.487 20.463 11.2 24 11.2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-2">Google</span>
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              <span className="ml-2">Twitter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
