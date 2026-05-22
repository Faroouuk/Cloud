"use client";

import {
  confirmSignUp,
  resendSignUpCode,
  signUp,
} from "aws-amplify/auth";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmationCode, setConfirmationCode] =
    useState("");

  const [needsConfirmation, setNeedsConfirmation] =
    useState(false);

  const handleRegister = async () => {
    try {
      const result = await signUp({
        username: email,

        password,

        options: {
          userAttributes: {
            email,

            name,
          },
        },
      });

      console.log(result);

      if (
        result.nextStep.signUpStep ===
        "CONFIRM_SIGN_UP"
      ) {
        setNeedsConfirmation(true);
        alert(
          "Check your email for the confirmation code."
        );
        return;
      }

      alert("User registered successfully!");
    } catch (error: unknown) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Registration failed"
      );
    }
  };

  const handleConfirmSignUp = async () => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });

      setNeedsConfirmation(false);
      alert(
        "Account confirmed. You can now log in."
      );
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
        Register
      </h1>

      <input
        className="border p-2"
        placeholder="Full Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

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
        onClick={handleRegister}
      >
        Register
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
            onClick={handleConfirmSignUp}
          >
            Confirm account
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
