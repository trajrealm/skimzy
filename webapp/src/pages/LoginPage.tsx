import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthOperations } from "../hooks";
import { isValidEmail, validatePassword, formatErrorMessage } from "../utils";

export default function AuthPage() {
  const { login, signup, isLoading, error: authError, clearError } = useAuthOperations();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  function validateForm(): boolean {
    const errors: string[] = [];
    
    if (!email) {
      errors.push("Email is required");
    } else if (!isValidEmail(email)) {
      errors.push("Please enter a valid email address");
    }
    
    if (!password) {
      errors.push("Password is required");
    }
    
    if (!isLogin) {
      if (!confirmPassword) {
        errors.push("Please confirm your password");
      } else if (password !== confirmPassword) {
        errors.push("Passwords do not match");
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setValidationErrors([]);

    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        navigate("/library");
      } else {
        await signup(email, password);
        // After successful signup, the user is automatically logged in
        navigate("/library");
      }
    } catch (err) {
      // Error is handled by the hook and displayed via authError
      console.error('Authentication error:', err);
    }
  }

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setValidationErrors([]);
    clearError();
  };

  const allErrors = [...validationErrors];
  if (authError) {
    allErrors.push(formatErrorMessage(authError));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-center text-gray-500">
          {isLogin
            ? "Please login to your account"
            : "Please enter your details to signup"}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="block mb-1 text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              className="block mb-1 text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-sm text-blue-500 hover:underline"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label
                className="block mb-1 text-sm font-medium text-gray-700"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Re-enter your password"
              />
            </div>
          )}

          {allErrors.length > 0 && (
            <div className="space-y-1">
              {allErrors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isLoading ? (isLogin ? "Logging in..." : "Signing up...") : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  clearForm();
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsLogin(true);
                  clearForm();
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
