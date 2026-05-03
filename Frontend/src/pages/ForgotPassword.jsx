import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

import bg from "../assets/register-bg.png";
import logo from "../assets/logo.png";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setMessage("Something went wrong");
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
      <div className="absolute inset-0 bg-bg-primary/70"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-bg-primary/60 to-bg-primary/90"></div>

      <div className="relative w-full max-w-md animate-[fadeIn_0.8s_ease-in-out]">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border border-accent/50 shadow-[0_0_20px_rgba(255,45,45,0.7)] animate-[pulseGlow_2s_infinite]">
            <img src={logo} alt="logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-wide">
            NForce Pulse
          </h1>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary/70 backdrop-blur-xl border border-accent/20 rounded-2xl shadow-[0_0_25px_rgba(255,45,45,0.15)] relative overflow-hidden">
          {/* Animated border glow */}
          <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-transparent via-accent to-transparent animate-[borderGlow_4s_linear_infinite] opacity-40 -z-10"></div>

          <CardHeader>
            <CardTitle className="text-2xl text-center text-text-primary">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center text-text-secondary">
              Enter your email to receive a reset link
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Success Message */}
              {message && (
                <div className="bg-green-500/20 border border-green-400/30 text-green-400 px-4 py-2 rounded-lg text-sm animate-[successPop_0.5s_ease]">
                  {message}
                </div>
              )}

              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-bg-tertiary/50 border-border-subtle text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg font-semibold text-white
                bg-gradient-to-r from-accent via-accent to-accent-hover
                hover:scale-[1.03] active:scale-[0.98]
                hover:shadow-[0_0_15px_rgba(255,45,45,0.6)]
                transition-all duration-300"
              >
                Send Reset Link
              </button>

              <div className="text-center text-sm mt-2">
                <span
                  className="text-accent cursor-pointer hover:underline hover:text-accent-hover transition-colors"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </span>
              </div>

            </form>
          </CardContent>
        </div>
      </div>
    </div>
  );
};
