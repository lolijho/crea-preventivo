'use client';

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';

const STORAGE_KEY = 'crea-preventivo-api-key';

export default function ApiKeyInput({
  onKeyChange,
}: {
  onKeyChange: (key: string) => void;
}) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setKey(saved);
      onKeyChange(saved);
    }
  }, [onKeyChange]);

  const handleChange = (value: string) => {
    setKey(value);
    localStorage.setItem(STORAGE_KEY, value);
    onKeyChange(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
          <Key className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">API Key Claude</h3>
          <p className="text-xs text-gray-500">Inserisci la tua chiave API Anthropic</p>
        </div>
      </div>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={key}
          onChange={e => handleChange(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm font-mono"
        />
        <button
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
