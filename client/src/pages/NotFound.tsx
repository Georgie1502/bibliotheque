import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center">
        <div className="text-6xl font-bold text-sand/40 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-4">Page non trouvée</h1>
        <p className="text-sand/80 mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-block bg-white text-ink font-semibold px-6 py-2 rounded-lg shadow-soft hover:-translate-y-[1px] transition-transform"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    </div>
  );
};
