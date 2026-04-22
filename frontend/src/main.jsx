import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UiFeedbackProvider } from "./context/UiFeedbackContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UiFeedbackProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </UiFeedbackProvider>
  </React.StrictMode>,
);

