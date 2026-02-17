"use client";

import { useState } from 'react';
import { syncEmbeddingsAction } from '@/app/admin/ai-actions';
import { RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AISyncManager() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setStatus('loading');
    setMessage('Initialisation de la synchronisation...');
    
    try {
      const result = await syncEmbeddingsAction();
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Une erreur est survenue lors de la synchronisation.');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 ${status === 'loading' ? 'animate-spin text-primary' : 'text-zinc-400'}`} />
            Gestion des Index IA (Vector Search)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Mettre à jour les vecteurs de recherche pour tous les produits.
          </p>
        </div>
        
        <button
          onClick={handleSync}
          disabled={status === 'loading'}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Synchronisation...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Lancer la MIZA (Batch 50)
            </>
          )}
        </button>
      </div>

      {status !== 'idle' && (
        <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
          status === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
          status === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
          'bg-blue-50 text-blue-700 border border-blue-100'
        }`}>
          {status === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
          {status === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          {status === 'loading' && <Loader2 className="w-5 h-5 shrink-0 mt-0.5 animate-spin" />}
          
          <div>
            <p className="text-sm font-medium">{message}</p>
            {status === 'success' && (
              <p className="text-xs mt-1 opacity-80">
                Les 50 premiers produits sans vecteurs ont été traités. Relancez si nécessaire.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700">
          <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Modèle</p>
          <p className="text-xs font-semibold">text-embedding-3-small</p>
        </div>
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700">
          <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Dimensions</p>
          <p className="text-xs font-semibold">1536 (Standard)</p>
        </div>
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700">
          <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Fournisseur</p>
          <p className="text-xs font-semibold">OpenAI API Edge</p>
        </div>
      </div>
    </div>
  );
}
