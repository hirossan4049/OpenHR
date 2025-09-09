"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthFormProps {
  onToggleMode: () => void;
}

export function RegisterForm({ onToggleMode }: AuthFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setGeneralError("");

    try {
      const validatedData = registerSchema.parse(formData);
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      // Auto-login after successful registration
      const result = await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (result?.error) {
        setGeneralError("Registration successful but login failed. Please try logging in manually.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(error instanceof Error ? error.message : "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-purple-500"
          placeholder="Enter your name"
          required
        />
        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-purple-500"
          placeholder="Enter your email"
          required
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-purple-500"
          placeholder="Enter your password"
          required
        />
        {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-purple-500"
          placeholder="Confirm your password"
          required
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
      </div>

      {generalError && (
        <div className="rounded-md bg-red-900 p-3">
          <p className="text-sm text-red-200">{generalError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );
}