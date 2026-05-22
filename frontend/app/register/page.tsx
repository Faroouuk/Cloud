"use client";

import {
  confirmSignUp,
  resendSignUpCode,
  signUp,
} from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
export default function RegisterPage() {
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
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [role, setRole] = useState("Employee");

  const [teamId, setTeamId] = useState("");

  const [confirmationCode, setConfirmationCode] =
    useState("");

  const [needsConfirmation, setNeedsConfirmation] =
    useState(false);

  const handleRegister = async () => {
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const result = await signUp({
        username: email,

        password,

        options: {
          userAttributes: {
            email,

            name,

            nickname: name,

            "custom:role": role,

            "custom:teamId": teamId,
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
      "Account confirmed. Redirecting to login..."
    );

    window.location.href = "/login";
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
        Register
      </h1>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter your full name"
          className="border p-3 rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter your email"
          className="border p-3 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          className="border p-3 rounded-lg"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>

        <input
          type="text"
          placeholder="Enter Team ID"
          className="border p-3 rounded-lg"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter your password"
          className="border p-3 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm your password"
          className="border p-3 rounded-lg"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
        />

        <button
          onClick={handleRegister}
          className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg transition-colors"
        >
          Register
        </button>
<p className="text-center text-sm text-gray-600">
  Got an account?{" "}
  <a
    href="/login"
    className="text-cyan-600 hover:text-cyan-700 font-medium"
  >
    Login
  </a>
</p>
        {needsConfirmation && (
          <div className="border-t pt-4 mt-2">
            <input
              className="border p-3 rounded-lg w-full mb-3"
              placeholder="Confirmation Code"
              value={confirmationCode}
              onChange={(e) =>
                setConfirmationCode(e.target.value)
              }
            />

            <button
              onClick={handleConfirmSignUp}
              className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg w-full mb-2 transition-colors"
            >
              Confirm Account
            </button>

            <button
              onClick={handleResendCode}
              className="border py-3 rounded-lg w-full hover:bg-gray-50 transition-colors"
            >
              Resend Code
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
