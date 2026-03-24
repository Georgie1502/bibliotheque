import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NotFound } from "./pages/NotFound";
import { DemoRoutesHome } from "./pages/DemoRoutesHome";
import { ApiErrorsDemo } from "./pages/ApiErrorsDemo";
import { ClientErrorsDemo } from "./pages/ClientErrorsDemo";
import { BoundaryDemo } from "./pages/BoundaryDemo";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            }
          />
          <Route path="/demo" element={<DemoRoutesHome />} />
          <Route path="/demo/errors/api" element={<ApiErrorsDemo />} />
          <Route path="/demo/errors/client" element={<ClientErrorsDemo />} />
          <Route
            path="/demo/errors/boundary"
            element={
              <ErrorBoundary>
                <BoundaryDemo />
              </ErrorBoundary>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ToastProvider>
  </React.StrictMode>,
);
