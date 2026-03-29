import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { BusinessProfile, QuoteRequest } from '@/types';

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY non configurata sul server' },
      { status: 500 }
    );
  }

  const { profile, quoteRequest } = (await request.json()) as {
    profile: BusinessProfile;
    quoteRequest: QuoteRequest;
  };

  const client = new Anthropic({ apiKey });

  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

  const systemPrompt = `Sei un assistente specializzato nella creazione di preventivi professionali.

PROFILO AZIENDA:
- Azienda: ${profile.companyName}
- Titolare: ${profile.ownerName}
- Ruolo: ${profile.role}
- Descrizione attività: ${profile.description}
- Email: ${profile.email}
- Telefono: ${profile.phone}
- Indirizzo: ${profile.address}
- Sito web: ${profile.website}
- P.IVA: ${profile.vatNumber}
- Coordinate bancarie: ${profile.bankDetails}

ISTRUZIONI PERSONALIZZATE:
${profile.customInstructions}

REGOLE:
1. Crea preventivi professionali e dettagliati
2. Adatta il tono come richiesto: ${quoteRequest.tone}
3. Lingua: ${quoteRequest.language || 'italiano'}
4. Includi sempre voci dettagliate con quantità e prezzi
5. Calcola subtotale, IVA e totale
6. Aggiungi termini e condizioni appropriati
7. Formatta il contenuto in HTML ricco con styling inline per una resa visuale professionale`;

  const userPrompt = `Crea un preventivo per:

CLIENTE:
- Nome: ${quoteRequest.clientName}
- Email: ${quoteRequest.clientEmail}
- Azienda: ${quoteRequest.clientCompany}

RICHIESTA:
${quoteRequest.requestDescription}

FORMATO OUTPUT: ${quoteRequest.outputFormat}

Rispondi ESCLUSIVAMENTE con un JSON valido (senza markdown code blocks) con questa struttura:
{
  "subject": "Oggetto del preventivo",
  "introduction": "Testo introduttivo personalizzato",
  "items": [
    {
      "description": "Descrizione voce",
      "quantity": 1,
      "unitPrice": 100.00,
      "total": 100.00
    }
  ],
  "subtotal": 100.00,
  "vatRate": 22,
  "vatAmount": 22.00,
  "total": 122.00,
  "terms": "Termini e condizioni",
  "validity": "Validità del preventivo (es. 30 giorni)",
  "notes": "Note aggiuntive",
  "emailBody": "Testo email professionale con formattazione HTML ricca (usa <strong>, <em>, <ul>, <li>, <p>, <h3>, <br>, stili inline per colori e spaziatura). Il testo deve essere completo e presentare il preventivo in modo elegante.",
  "htmlContent": "HTML completo e formattato del preventivo con styling inline CSS professionale. Usa tabelle HTML con bordi, colori aziendali (#2563eb come primario), spaziatura, font professionali. Deve essere un documento completo pronto per la stampa/PDF."
}`;

  try {
    const message = await client.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'Nessuna risposta generata' }, { status: 500 });
    }

    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const quoteData = JSON.parse(jsonText);

    return NextResponse.json({
      ...quoteData,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
      model,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Errore sconosciuto';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
