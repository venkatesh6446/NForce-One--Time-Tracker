import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

import bg from "../assets/register-bg.png";
import logo from "../assets/logo.png";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ token, password });

      setMessage("Password updated successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(15,15,15,0.85), rgba(15,15,15,0.85)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary/70 via-bg-primary/60 to-accent/20"></div>

      {/* Light Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[200%] h-[200%] bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-[beamMove_6s_linear_infinite] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative w-full max-w-md z-10 animate-[fadeIn_0.8s_ease]">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3 text-text-primary">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-accent logo-glow">
              <img src={logo} alt="logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-3xl font-bold text-text-primary">NForce Pulse</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary/80 backdrop-blur-xl border border-accent/20 rounded-2xl shadow-[0_0_30px_rgba(255,45,45,0.2)] p-8 transition-transform duration-300 hover:scale-[1.02]">

          <div className="text-center mb-6">
            <h2 className="text-2xl text-text-primary animate-[slideDown_0.6s_ease]">
              Reset Password
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg animate-[shake_0.3s]">{error}</div>}
            {message && <div className="bg-green-500/20 border border-green-400/30 text-green-400 px-4 py-2 rounded-lg animate-[fadeIn_0.5s]">{message}</div>}

            <div className="animate-[fadeUp_0.6s_ease_forwards]">
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-bg-tertiary/50 border-border-subtle text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="animate-[fadeUp_0.6s_ease_forwards] delay-200">
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-bg-tertiary/50 border-border-subtle text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-white
              bg-gradient-to-r from-accent via-accent to-accent-hover
              hover:scale-[1.03] active:scale-[0.98]
              hover:shadow-[0_0_20px_rgba(255,45,45,0.5)]
              transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
