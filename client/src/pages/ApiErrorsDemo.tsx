import { Link } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import api from "../api/client";
import { handleApiError } from "../utils/errorHandler";

type DemoCase = {
  label: string;
  description: string;
  run: () => Promise<void>;
};

export const ApiErrorsDemo = () => {
  const toast = useToast();

  const runDemo = async (path: string) => {
    try {
      await api.get(path);
      toast.addToast("Aucune erreur retournee", "info", 2500);
    } catch (error: unknown) {
      handleApiError(error, toast, "Echec de la demo API");
    }
  };

  const demos: DemoCase[] = [
    {
      label: "400/422 Validation",
      description:
        "Appelle /api/demos/errors/validation, affiche warning et log serveur.",
      run: () => runDemo("/api/demos/errors/validation"),
    },
    {
      label: "401 Authentication",
      description:
        "Appelle /api/demos/errors/auth, affiche erreur rouge et log serveur.",
      run: () => runDemo("/api/demos/errors/auth"),
    },
    {
      label: "404 Not Found",
      description:
        "Appelle /api/demos/errors/not-found, affiche warning et log serveur.",
      run: () => runDemo("/api/demos/errors/not-found"),
    },
    {
      label: "409 Conflict",
      description:
        "Appelle /api/demos/errors/conflict, affiche warning et log serveur.",
      run: () => runDemo("/api/demos/errors/conflict"),
    },
    {
      label: "500 Server",
      description:
        "Appelle /api/demos/errors/internal, affiche erreur rouge et log serveur.",
      run: () => runDemo("/api/demos/errors/internal"),
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-xs text-sand/70">Route demo</p>
          <h1 className="text-2xl font-semibold">Gestion des Erreurs API</h1>
          <p className="text-sand/80 mt-2 text-sm">
            Chaque bouton appelle l&apos;API backend pour declencher une erreur
            reelle, afficher le toast correspondant et produire des logs serveur
            simultanement.
          </p>
          <div className="mt-4 flex gap-3">
            <Link to="/" className="text-sm text-teal hover:underline">
              Retour application
            </Link>
            <Link to="/demo" className="text-sm text-teal hover:underline">
              Hub demos
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {demos.map((demo) => (
            <button
              key={demo.label}
              type="button"
              onClick={demo.run}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:border-teal/60"
            >
              <h2 className="font-semibold">{demo.label}</h2>
              <p className="text-sand/70 text-sm mt-2">{demo.description}</p>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
};
