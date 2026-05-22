"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  confirmSignUp,
  resendSignUpCode,
  signIn,
} from "aws-amplify/auth";

import { authGet } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

useEffect(() => {
  const checkAuth = async () => {
    try {
      const session = await fetchAuthSession();

      if (session.tokens?.idToken) {
        router.replace("/dashboard");
      }
    } catch {
      // User is not logged in
    }
  };

  checkAuth();
}, [router]);
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmationCode, setConfirmationCode] =
    useState("");

  const [needsConfirmation, setNeedsConfirmation] =
    useState(false);

  const callProtectedRoute = async () => {
    const response = await authGet("/protected");
    console.log("Backend Response:", response.data);
    window.location.href = "/dashboard";
  };

  const handleLogin = async () => {
    try {
      // Sign in to Cognito
      const result = await signIn({
        username: email,
        password,
      });

      console.log("Login Result:", result);

      if (!result.isSignedIn) {
        if (
          result.nextStep.signInStep ===
          "CONFIRM_SIGN_UP"
        ) {
          setNeedsConfirmation(true);
          alert(
            "Check your email for the confirmation code."
          );
          return;
        }

        alert(
          `Login requires next step: ${result.nextStep.signInStep}`
        );
        return;
      }

      await callProtectedRoute();
    } catch (error: unknown) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    }
  };

  const handleConfirmAndLogin = async () => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });

      setNeedsConfirmation(false);

      const result = await signIn({
        username: email,
        password,
      });

      if (!result.isSignedIn) {
        alert(
          `Login requires next step: ${result.nextStep.signInStep}`
        );
        return;
      }

      await callProtectedRoute();
    } catch (error: unknown) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Confirmation failed"
      );
    }
  };

  const handleResendCode = async () => {
    try {
      await resendSignUpCode({
        username: email,
      });

      alert("Confirmation code sent.");
    } catch (error: unknown) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Could not resend code"
      );
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
      <h1 className="text-3xl font-bold text-center mb-6">
        Login
      </h1>

      <div className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="border p-3 rounded-lg"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Enter your password"
          className="border p-3 rounded-lg"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
        >
          Login
        </button>
        <p className="text-center text-sm text-gray-600">
  Don't have an account?{" "}
  <a
    href="/register"
    className="text-blue-600 hover:text-blue-700 font-medium"
  >
    Sign Up
  </a>
</p>

        {needsConfirmation && (
          <>
            <div className="border-t pt-4 mt-2">
              <input
                className="border p-3 rounded-lg w-full mb-3"
                placeholder="Confirmation Code"
                value={confirmationCode}
                onChange={(e) =>
                  setConfirmationCode(
                    e.target.value
                  )
                }
              />

              <button
                onClick={
                  handleConfirmAndLogin
                }
                className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg w-full mb-2 transition-colors"
              >
                Confirm & Login
              </button>

              <button
                onClick={handleResendCode}
                className="border py-3 rounded-lg w-full hover:bg-gray-50 transition-colors"
              >
                Resend Code
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);
}
