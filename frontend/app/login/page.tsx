"use client";

import {
  confirmSignUp,
  resendSignUpCode,
  signIn,
} from "aws-amplify/auth";

import { useState } from "react";
import { authGet } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmationCode, setConfirmationCode] =
    useState("");

  const [needsConfirmation, setNeedsConfirmation] =
    useState(false);

  const callProtectedRoute = async () => {
    const response =
      await authGet("/protected");

    console.log(
      "Backend Response:",
      response.data
    );

    alert("Logged in successfully!");
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
    <div className="p-10 flex flex-col gap-4 max-w-sm">
      <h1 className="text-2xl font-bold">
        Login
      </h1>

      <input
        className="border p-2"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        className="border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button
        className="border p-2"
        onClick={handleLogin}
      >
        Login
      </button>

      {needsConfirmation && (
        <>
          <input
            className="border p-2"
            placeholder="Confirmation code"
            value={confirmationCode}
            onChange={(e) =>
              setConfirmationCode(e.target.value)
            }
          />

          <button
            className="border p-2"
            onClick={handleConfirmAndLogin}
          >
            Confirm and login
          </button>

          <button
            className="border p-2"
            onClick={handleResendCode}
          >
            Resend code
          </button>
        </>
      )}
    </div>
  );
}
