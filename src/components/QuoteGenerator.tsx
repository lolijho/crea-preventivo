'use client';

import { useState } from 'react';
import { QuoteRequest, GeneratedQuote, BusinessProfile } from '@/types';
import { getProfile, saveQuote } from '@/lib/storage';
import { Sparkles, FileText, Mail, Loader2 } from 'lucide-react';

const defaultRequest: QuoteRequest = {
  clientName: '',
  clientEmail: '',
  clientCompany: '',
  requestDescription: '',
  outputFormat: 'both',
  language: 'italiano',
  tone: 'formale',
};

export default function QuoteGenerator({
  apiKey,
  onGenerated,
}: {
  apiKey: string;
  onGenerated: (quote: GeneratedQuote) => void;
}) {
  const [request, setRequest] = useState<QuoteRequest>(defaultRequest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof QuoteRequest, value: string) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const generate = async () => {
    const profile: BusinessProfile | null = getProfile();
    if (!profile || !profile.companyName) {
      setError('Configura prima il profilo aziendale nella sezione Impostazioni.');
      return;
    }
    if (!request.requestDescription.trim()) {
      setError('Descrivi la richiesta del cliente.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ profile, quoteRequest: request }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore nella generazione');
      }

      const data = await res.json();

      const quote: GeneratedQuote = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        clientName: request.clientName,
        clientCompany: request.clientCompany,
        ...data,
      };

      saveQuote(quote);
      onGenerated(quote);
      setRequest(defaultRequest);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Nuovo Preventivo</h2>
          <p className="text-sm text-gray-500">Descrivi la richiesta e l&apos;AI genererà il preventivo</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Cliente</label>
          <input
            type="text"
            value={request.clientName}
            onChange={e => update('clientName', e.target.value)}
            placeholder="Es. Luca Bianchi"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Cliente</label>
          <input
            type="email"
            value={request.clientEmail}
            onChange={e => update('clientEmail', e.target.value)}
            placeholder="cliente@esempio.it"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Azienda Cliente</label>
          <input
            type="text"
            value={request.clientCompany}
            onChange={e => update('clientCompany', e.target.value)}
            placeholder="Es. Tech Solutions S.r.l."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tono</label>
          <select
            value={request.tone}
            onChange={e => update('tone', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white"
          >
            <option value="formale">Formale</option>
            <option value="semi-formale">Semi-formale</option>
            <option value="informale">Informale</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrizione Richiesta</label>
          <textarea
            value={request.requestDescription}
            onChange={e => update('requestDescription', e.target.value)}
            placeholder="Descrivi in dettaglio cosa ha richiesto il cliente. L'AI creerà un preventivo su misura basandosi sul tuo profilo aziendale e questa descrizione. Es: 'Il cliente ha bisogno di un sito web e-commerce con 50 prodotti, integrazione pagamenti Stripe, area admin personalizzata...'"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 resize-none"
            rows={5}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">Formato Output</label>
          <div className="flex gap-3">
            <FormatButton
              active={request.outputFormat === 'pdf'}
              onClick={() => update('outputFormat', 'pdf')}
              icon={<FileText className="w-4 h-4" />}
              label="PDF"
            />
            <FormatButton
              active={request.outputFormat === 'email'}
              onClick={() => update('outputFormat', 'email')}
              icon={<Mail className="w-4 h-4" />}
              label="Email"
            />
            <FormatButton
              active={request.outputFormat === 'both'}
              onClick={() => update('outputFormat', 'both')}
              icon={<Sparkles className="w-4 h-4" />}
              label="Entrambi"
            />
          </div>
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="mt-6 flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generazione in corso...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Genera Preventivo
          </>
        )}
      </button>
    </div>
  );
}

function FormatButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all font-medium text-sm ${
        active
          ? 'border-purple-300 bg-purple-50 text-purple-700'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
