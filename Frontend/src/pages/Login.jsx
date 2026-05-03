import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

import { Input } from "../components/ui/Input";

import bg from "../assets/now.png";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser({ email, password });

      const user = response?.user;
      const token = response?.token;

      if (!user || !token) {
        setError("Invalid response from server");
        return;
      }

      login(token, user);

      switch (user.role) {
        case "ADMIN":
          navigate("/");
          break;
        case "MANAGER":
          navigate("/approvals");
          break;
        default:
          navigate("/timesheet");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to log in. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-bg-primary"
      style={{
        backgroundImage: `linear-gradient(rgba(15,15,15,0.85), rgba(15,15,15,0.85)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Animated light beam */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[200%] h-[200%] bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-[beamMove_6s_linear_infinite] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary tracking-wide drop-shadow-[0_0_10px_rgba(255,45,45,0.6)]">
            NForce Pulse
          </h1>
          <p className="text-sm text-text-secondary mt-1 tracking-wide">
            Time tracking tool
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary/80 backdrop-blur-xl border border-border-accent rounded-2xl shadow-[0_0_30px_rgba(255,45,45,0.2)] p-8 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,45,45,0.3)]">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-text-primary">
              Welcome back
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm animate-[shake_0.3s]">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-sm text-text-secondary">Email</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-bg-tertiary/50 border-border-subtle focus:border-accent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-text-secondary">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-bg-tertiary/50 border-border-subtle focus:border-accent"
              />
            </div>

            {/* Forgot */}
            <div className="text-right">
              <span
                className="text-sm text-accent cursor-pointer hover:text-accent-hover transition-colors"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 px-4 rounded-md transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,45,45,0.5)] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            {/* Register */}
            <div className="text-center text-sm text-text-secondary">
              Don't have an account?{" "}
              <span
                className="text-accent cursor-pointer font-medium hover:text-accent-hover transition-colors"
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
