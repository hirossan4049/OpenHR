"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export function AuthForms() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-gray-800/50 p-6 backdrop-blur-sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white">
          {isLoginMode ? "Sign In" : "Create Account"}
        </h2>
        <p className="mt-2 text-gray-400">
          {isLoginMode 
            ? "Welcome back! Please sign in to your account." 
            : "Join our community! Create your account to get started."
          }
        </p>
      </div>

      {isLoginMode ? (
        <LoginForm onToggleMode={toggleMode} />
      ) : (
        <RegisterForm onToggleMode={toggleMode} />
      )}
    </div>
  );
}