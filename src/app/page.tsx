'use client';

import { useState, useEffect, useCallback } from 'react';
import { GeneratedQuote } from '@/types';
import { getQuotes } from '@/lib/storage';
import ProfileForm from '@/components/ProfileForm';
import QuoteGenerator from '@/components/QuoteGenerator';
import QuotePreview from '@/components/QuotePreview';
import QuoteHistory from '@/components/QuoteHistory';
import ApiKeyInput from '@/components/ApiKeyInput';
import { FileText, Settings, Sparkles, Clock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Tab = 'generate' | 'history' | 'settings';

export default function Home() {
  const [tab, setTab] = useState<Tab>('generate');
  const [apiKey, setApiKey] = useState('');
  const [quotes, setQuotes] = useState<GeneratedQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<GeneratedQuote | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const refreshQuotes = useCallback(() => {
    setQuotes(getQuotes());
  }, []);

  useEffect(() => {
    refreshQuotes();
  }, [refreshQuotes]);

  const handleGenerated = (quote: GeneratedQuote) => {
    setSelectedQuote(quote);
    refreshQuotes();
  };

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  if (selectedQuote) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <QuotePreview
            quote={selectedQuote}
            onBack={() => setSelectedQuote(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Crea Preventivo</h1>
                <p className="text-xs text-gray-500 -mt-0.5">Powered by Claude AI</p>
              </div>
            </div>

            <nav className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mr-2">
              <TabButton
                active={tab === 'generate'}
                onClick={() => setTab('generate')}
                icon={<Sparkles className="w-4 h-4" />}
                label="Genera"
              />
              <TabButton
                active={tab === 'history'}
                onClick={() => setTab('history')}
                icon={<Clock className="w-4 h-4" />}
                label="Storico"
                badge={quotes.length > 0 ? quotes.length : undefined}
              />
              <TabButton
                active={tab === 'settings'}
                onClick={() => setTab('settings')}
                icon={<Settings className="w-4 h-4" />}
                label="Impostazioni"
              />
            </nav>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Esci"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {tab === 'generate' && (
          <>
            <ApiKeyInput onKeyChange={handleApiKeyChange} />
            <QuoteGenerator apiKey={apiKey} onGenerated={handleGenerated} />
          </>
        )}

        {tab === 'history' && (
          <QuoteHistory
            quotes={quotes}
            onSelect={setSelectedQuote}
            onRefresh={refreshQuotes}
          />
        )}

        {tab === 'settings' && <ProfileForm />}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && (
        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
