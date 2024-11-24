import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { SessionProvider } from "./context/sessionProvider.jsx";
import { Toaster } from "@/components/ui/toaster"


createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <SessionProvider>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </SessionProvider>

  // </StrictMode>
);
