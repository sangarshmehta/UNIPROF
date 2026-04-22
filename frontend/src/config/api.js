const API = import.meta.env.VITE_API_URL;

if (!API) {
  throw new Error("Missing VITE_API_URL. Set it in frontend environment variables.");
}

export default API;

