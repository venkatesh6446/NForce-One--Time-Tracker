import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

import { Input } from "../components/ui/Input";

import bg from "../assets/register-bg.png";
import logo from "../assets/logo.png";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setShow(true);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await registerUser(form);

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-opacity duration-700 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: `linear-gradient(rgba(15,15,15,0.85), rgba(15,15,15,0.85)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary/60 via-bg-primary/50 to-accent/20"></div>

      {/* Animated glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-25 -left-25 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div
        className={`relative w-full max-w-md z-10 transform transition-all duration-700 ${
          show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-3 text-text-primary drop-shadow-[0_0_30px_rgba(255,45,45,0.3)] animate-[fadeIn_0.8s_ease]">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-accent shadow-[0_0_15px_rgba(255,45,45,0.7)]">
              <img src={logo} alt="NForce Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-3xl font-bold tracking-wide text-text-primary">
              NForce Pulse
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary/80 backdrop-blur-xl border border-accent/30 rounded-2xl shadow-[0_0_80px_rgba(255,45,45,0.35)] p-8 transition-all duration-500 hover:shadow-[0_0_100px_rgba(255,45,45,0.5)]">

          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-text-primary">
              Create Account
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Register as Employee or Manager
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-400 px-4 py-2 rounded-lg text-sm animate-pulse">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-400/30 text-green-400 px-4 py-2 rounded-lg text-sm animate-pulse">
                {success}
              </div>
            )}

            <Input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="bg-bg-tertiary/50 border-border-subtle text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300 focus:scale-[1.02]"
            />

            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-bg-tertiary/50 border-border-subtle text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300 focus:scale-[1.02]"
            />

            <Input
              name="password"
              type="password"
              placeholder="Password (Ex: Test@123)"
              value={form.password}
              onChange={handleChange}
              required
              className="bg-bg-tertiary/50 border-border-subtle text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300 focus:scale-[1.02]"
            />

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-bg-tertiary/50 border border-border-subtle text-text-primary p-2 rounded-md focus:ring-2 focus:ring-accent transition-all duration-300 focus:scale-[1.02]"
            >
              <option value="EMPLOYEE" className="bg-bg-secondary">
                Employee
              </option>
              <option value="MANAGER" className="bg-bg-secondary">
                Manager
              </option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-white
              bg-gradient-to-r from-accent via-accent to-accent-hover
              hover:scale-[1.05] active:scale-[0.98]
              hover:shadow-[0_0_30px_rgba(255,45,45,0.5)]
              transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
