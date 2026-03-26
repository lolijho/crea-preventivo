'use client';

import { GeneratedQuote } from '@/types';
import { getProfile } from '@/lib/storage';
import { Download, Mail, Copy, Check, ArrowLeft, FileText } from 'lucide-react';
import { useState, useRef } from 'react';

export default function QuotePreview({
  quote,
  onBack,
}: {
  quote: GeneratedQuote;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const profile = getProfile();

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyEmailHtml = async () => {
    try {
      const blob = new Blob([quote.emailBody], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([quote.emailBody], { type: 'text/plain' }) }),
      ]);
      setCopied('email');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      await copyToClipboard(quote.emailBody, 'email');
    }
  };

  const downloadPdf = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = -(pdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `preventivo-${quote.clientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Indietro
        </button>
        <div className="flex-1" />
        <button
          onClick={downloadPdf}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Download className="w-4 h-4" />
          Scarica PDF
        </button>
        <button
          onClick={copyEmailHtml}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
        >
          {copied === 'email' ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          {copied === 'email' ? 'Copiato!' : 'Copia Email'}
        </button>
        <button
          onClick={() => copyToClipboard(quote.htmlContent, 'html')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
        >
          {copied === 'html' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied === 'html' ? 'Copiato!' : 'Copia HTML'}
        </button>
      </div>

      {/* Email Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Anteprima Email</h3>
            <p className="text-sm text-gray-500">Testo pronto da incollare nell&apos;email</p>
          </div>
        </div>
        <div className="border border-gray-100 rounded-xl p-6 bg-gray-50">
          <div className="mb-4 pb-4 border-b border-gray-200 space-y-1 text-sm text-gray-600">
            <p><strong>A:</strong> {quote.clientName} &lt;{profile?.email || ''}&gt;</p>
            <p><strong>Oggetto:</strong> {quote.subject}</p>
          </div>
          <div
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: quote.emailBody }}
          />
        </div>
      </div>

      {/* PDF Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Anteprima Preventivo</h3>
            <p className="text-sm text-gray-500">Documento pronto per il download PDF</p>
          </div>
        </div>

        <div ref={printRef} className="border border-gray-200 rounded-xl overflow-hidden">
          {quote.htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: quote.htmlContent }} />
          ) : (
            /* Fallback structured preview */
            <div className="p-10 bg-white">
              <div className="border-b-4 border-blue-600 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{profile?.companyName}</h1>
                <p className="text-gray-500 mt-1">{profile?.address} | {profile?.email} | {profile?.phone}</p>
                {profile?.vatNumber && <p className="text-gray-500 text-sm">P.IVA: {profile.vatNumber}</p>}
              </div>

              <div className="flex justify-between mb-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cliente</h3>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{quote.clientName}</p>
                  {quote.clientCompany && <p className="text-gray-600">{quote.clientCompany}</p>}
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Data</h3>
                  <p className="text-gray-900 mt-1">{new Date(quote.createdAt).toLocaleDateString('it-IT')}</p>
                  <p className="text-sm text-gray-500 mt-1">Validità: {quote.validity}</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">{quote.subject}</h2>
              <p className="text-gray-600 mb-8">{quote.introduction}</p>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500 uppercase">Descrizione</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500 uppercase">Qtà</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500 uppercase">Prezzo Unit.</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500 uppercase">Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">{item.description}</td>
                      <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotale</span>
                    <span>{formatCurrency(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>IVA ({quote.vatRate}%)</span>
                    <span>{formatCurrency(quote.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-900">
                    <span>Totale</span>
                    <span>{formatCurrency(quote.total)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-3 text-sm text-gray-600">
                <p><strong>Termini e condizioni:</strong> {quote.terms}</p>
                {quote.notes && <p><strong>Note:</strong> {quote.notes}</p>}
                {profile?.bankDetails && <p><strong>Coordinate bancarie:</strong> {profile.bankDetails}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
