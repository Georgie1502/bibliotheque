import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../hooks/useToast";

export const ClientErrorsDemo = () => {
  const toast = useToast();
  const [name, setName] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.addToast("Le nom est obligatoire.", "warning", 3000);
      return;
    }
    toast.addToast("Validation locale OK", "success", 2500);
    setName("");
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-xs text-sand/70">Route demo</p>
          <h1 className="text-2xl font-semibold">Gestion des Erreurs Client</h1>
          <p className="text-sand/80 mt-2 text-sm">
            Valide la gestion d&apos;erreur formulaire sans appel API (section
            2A de DEMOS.md).
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

        <form
          onSubmit={submit}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <label className="block text-sm text-sand/80">
            Nom auteur
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder="Laisser vide pour tester l'erreur"
            />
          </label>

          <button
            type="submit"
            className="bg-white text-ink font-semibold px-4 py-2 rounded-lg"
          >
            Ajouter l&apos;auteur
          </button>
        </form>
      </div>
    </div>
  );
};
