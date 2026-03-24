import { useState } from "react";
import { Link } from "react-router-dom";

const CrashProbe = ({ crash }: { crash: boolean }) => {
  if (crash) {
    throw new Error("Crash React intentionnel pour tester ErrorBoundary");
  }
  return (
    <p className="text-sand/80 text-sm">
      Cliquez sur le bouton pour declencher un crash React capture par
      ErrorBoundary.
    </p>
  );
};

export const BoundaryDemo = () => {
  const [crash, setCrash] = useState(false);

  return (
    <div className="min-h-screen p-4 sm:p-8 text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-xs text-sand/70">Route demo</p>
          <h1 className="text-2xl font-semibold">Demo ErrorBoundary</h1>
          <div className="mt-4 flex gap-3">
            <Link to="/" className="text-sm text-teal hover:underline">
              Retour application
            </Link>
            <Link to="/demo" className="text-sm text-teal hover:underline">
              Hub demos
            </Link>
          </div>
        </header>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <CrashProbe crash={crash} />
          <button
            type="button"
            onClick={() => setCrash(true)}
            className="border border-red/40 text-red px-4 py-2 rounded-lg hover:bg-red/10"
          >
            Declencher crash React
          </button>
        </section>
      </div>
    </div>
  );
};
