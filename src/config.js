const DEFAULT_API_URL = "https://pinpoint-srng.onrender.com";

export const API_URL = (
  import.meta.env.VITE_API_URL ||
  DEFAULT_API_URL
).replace(/\/+$/, "");
