const API = import.meta.env.VITE_API_URL || "";

if (!API) {
  // Avoid a blank white screen in production if env var is missing.
  // Downstream API calls will fail with a clear message instead.
  console.error("Missing VITE_API_URL. Set it in Vercel/your frontend env variables.");
}

export default API;

