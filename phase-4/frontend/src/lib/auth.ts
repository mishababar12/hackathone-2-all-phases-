// Frontend Auth Utilities
import { jwtDecode } from "jwt-decode";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface JWTPayload {
  sub: string;  // user_id
  email: string;
  exp: number;
}

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token) as JWTPayload;
      const currentTime = Date.now() / 1000;

      // Add 5 minute buffer for timezone differences between client and server
      const bufferSeconds = 300;
      if (decoded.exp + bufferSeconds < currentTime) {
        console.warn("Token expired");
        removeToken();
        return null;
      }
      return token;
    } catch {
      removeToken();
      return null;
    }
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const getUser = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token) as JWTPayload;
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.email.split('@')[0] || 'User', // Extract name from email
    };
  } catch {
    return null;
  }
};
