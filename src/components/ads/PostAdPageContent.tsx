import AdPostForm from "@/components/ads/AdPostForm";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export function PostAdPageContent() {
  return (
    <div className="min-h-screen bg-base-200/40 dark:bg-zinc-950 relative overflow-hidden pb-24">
      {/* Hero */}
      <div className="hero py-12">
        <div className="hero-content text-center">
          <div>
            <div className="badge badge-outline gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black tracking-widest">Vendez sur Jootiya</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Donnez une seconde <span className="text-primary">vie à vos objets</span>
            </h1>
            <p className="mt-2 text-zinc-500 max-w-xl mx-auto">
              Rejoignez des milliers de vendeurs et touchez des acheteurs partout au Maroc.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="badge badge-success gap-1"><ShieldCheck className="w-3 h-3" /> Sécurisé</div>
              <div className="badge badge-warning gap-1"><Zap className="w-3 h-3" /> Rapide</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Form Card using FlyonUI */}
        <div className="card bg-base-100 shadow-xl rounded-3xl">
          <div className="card-body">
            <AdPostForm />
          </div>
        </div>

        {/* FAQ Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow rounded-2xl">
            <div className="card-body">
              <h4 className="card-title">Est-ce gratuit ?</h4>
              <p className="text-sm text-zinc-500">Oui, la publication d&apos;annonces standard est entièrement gratuite pour tous les utilisateurs.</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow rounded-2xl">
            <div className="card-body">
              <h4 className="card-title">Temps de validation</h4>
              <p className="text-sm text-zinc-500">Nos modérateurs vérifient chaque annonce en moins de 2 heures pour garantir la qualité.</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow rounded-2xl">
            <div className="card-body">
              <h4 className="card-title">Conseils photo</h4>
              <p className="text-sm text-zinc-500">Utilisez une lumière naturelle et montrez l&apos;objet sous plusieurs angles pour vendre 2x plus vite.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
