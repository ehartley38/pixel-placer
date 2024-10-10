import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { SessionProvider } from "./context/sessionProvider.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <SessionProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SessionProvider>

  // </StrictMode>
);
