'use client';

import { GeneratedQuote } from '@/types';
import { deleteQuote } from '@/lib/storage';
import { Clock, Trash2, Eye } from 'lucide-react';

export default function QuoteHistory({
  quotes,
  onSelect,
  onRefresh,
}: {
  quotes: GeneratedQuote[];
  onSelect: (quote: GeneratedQuote) => void;
  onRefresh: () => void;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handleDelete = (id: string) => {
    deleteQuote(id);
    onRefresh();
  };

  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500">Nessun preventivo</h3>
        <p className="text-sm text-gray-400 mt-1">I preventivi generati appariranno qui</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Storico Preventivi</h2>
            <p className="text-sm text-gray-500">{quotes.length} preventiv{quotes.length === 1 ? 'o' : 'i'} generat{quotes.length === 1 ? 'o' : 'i'}</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {quotes.map(quote => (
          <div key={quote.id} className="p-5 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{quote.subject}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {quote.clientName}
                  {quote.clientCompany && ` - ${quote.clientCompany}`}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>{new Date(quote.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="font-semibold text-gray-700 text-sm">{formatCurrency(quote.total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSelect(quote)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Visualizza"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(quote.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Elimina"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
