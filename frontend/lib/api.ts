"use client";

import axios from "axios";

import { fetchAuthSession } from "aws-amplify/auth";

export const api = axios.create({
  baseURL: "http://127.0.0.1:5050",
});

export const getAuthHeaders =
  async () => {
    const session =
      await fetchAuthSession();

    // IMPORTANT:
    // Use ID TOKEN
    const token =
      session.tokens?.idToken?.toString();

    console.log("ID TOKEN:", token);

    if (!token) {
      throw new Error(
        "No ID token found"
      );
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

export const authGet = async (
  url: string
) =>
  api.get(url, {
    headers:
      await getAuthHeaders(),
  });