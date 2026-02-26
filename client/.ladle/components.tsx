import { ReactNode } from "react";
import "../src/index.css";

// Apply app-level styles so Ladle stories render with the same look and feel.
const Providers = ({ children }: { children: ReactNode }) => {
  return <div className="min-h-screen bg-[#0f172a] p-6">{children}</div>;
};

export default Providers;
