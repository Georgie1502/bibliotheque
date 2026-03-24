import { Link } from "react-router-dom";

const links = [
  {
    to: "/",
    title: "Application Principale",
    desc: "Flux complet auth + livres + auteurs + preferences.",
  },
  {
    to: "/demo/errors/api",
    title: "Demo Erreurs API",
    desc: "Declenche des erreurs HTTP mappées vers les toasts.",
  },
  {
    to: "/demo/errors/client",
    title: "Demo Erreurs Client",
    desc: "Valide les erreurs locales sans appel reseau.",
  },
  {
    to: "/demo/errors/boundary",
    title: "Demo ErrorBoundary",
    desc: "Force un crash React pour valider la page de fallback.",
  },
  {
    to: "/nonexistent",
    title: "Demo 404",
    desc: "Valide la route wildcard et la page 404 personnalisee.",
  },
];

export const DemoRoutesHome = () => {
  return (
    <div className="min-h-screen p-4 sm:p-8 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">Parcours Demos</h1>
          <p className="text-sand/80 mt-2">
            Cette page centralise les routes pour valider chaque scenario de
            gestion d&apos;erreur de DEMOS.md.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-teal/60 transition-colors"
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-sand/70 mt-2 text-sm">{item.desc}</p>
              <p className="text-teal text-xs mt-3">{item.to}</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
};
