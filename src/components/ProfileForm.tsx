'use client';

import { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types';
import { getProfile, saveProfile } from '@/lib/storage';
import { Save, Building2 } from 'lucide-react';

const defaultProfile: BusinessProfile = {
  companyName: '',
  ownerName: '',
  role: '',
  description: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  vatNumber: '',
  bankDetails: '',
  customInstructions: '',
};

export default function ProfileForm({ onSaved }: { onSaved?: () => void }) {
  const [profile, setProfile] = useState<BusinessProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getProfile();
    if (existing) setProfile(existing);
  }, []);

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved?.();
  };

  const update = (field: keyof BusinessProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Profilo Aziendale</h2>
          <p className="text-sm text-gray-500">Configura le informazioni della tua attività</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input label="Nome Azienda" value={profile.companyName} onChange={v => update('companyName', v)} placeholder="Es. Studio Rossi S.r.l." />
        <Input label="Titolare / Responsabile" value={profile.ownerName} onChange={v => update('ownerName', v)} placeholder="Es. Mario Rossi" />
        <Input label="Ruolo" value={profile.role} onChange={v => update('role', v)} placeholder="Es. CEO, Freelancer, Consulente" />
        <Input label="Email" value={profile.email} onChange={v => update('email', v)} placeholder="info@esempio.it" type="email" />
        <Input label="Telefono" value={profile.phone} onChange={v => update('phone', v)} placeholder="+39 02 1234567" />
        <Input label="Sito Web" value={profile.website} onChange={v => update('website', v)} placeholder="www.esempio.it" />
        <Input label="P.IVA" value={profile.vatNumber} onChange={v => update('vatNumber', v)} placeholder="IT12345678901" />
        <Input label="Indirizzo" value={profile.address} onChange={v => update('address', v)} placeholder="Via Roma 1, 20100 Milano" />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrizione Attività</label>
          <textarea
            value={profile.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Descrivi cosa fa la tua azienda, i servizi offerti, il settore in cui operi..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 resize-none"
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Coordinate Bancarie</label>
          <textarea
            value={profile.bankDetails}
            onChange={e => update('bankDetails', e.target.value)}
            placeholder="IBAN, intestatario conto, banca..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 resize-none"
            rows={2}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Istruzioni Personalizzate per l&apos;AI</label>
          <textarea
            value={profile.customInstructions}
            onChange={e => update('customInstructions', e.target.value)}
            placeholder="Istruzioni specifiche per l'agente AI: come vuoi che vengano creati i preventivi, stile di comunicazione, termini standard, sconti abituali, note ricorrenti..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 resize-none"
            rows={4}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
      >
        <Save className="w-4 h-4" />
        {saved ? 'Salvato!' : 'Salva Profilo'}
      </button>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
      />
    </div>
  );
}
