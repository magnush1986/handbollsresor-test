import { useState } from 'react';
import { formatDateRange } from '../utils/dateUtils';

export default function EventCard({ event, defaultOpen = false, showInlineDate = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const renderEventSection = (title, content) => {
    if (!content) return null;
    return (
      <div className="bg-primary-light/10 border-l-4 border-primary-light rounded-r-lg p-4 space-y-3">
        <h3 className="text-lg font-bold text-primary">{title}</h3>
        {content}
      </div>
    );
  };

  const renderLine = (icon, label, value, isLongText = false) => {
    if (!value?.trim()) return null;
    return (
      <div className={`flex gap-2 ${isLongText ? 'items-start' : 'items-center'}`}>
        <span className="text-lg flex-shrink-0">{icon}</span>
        <span className="font-semibold text-gray-700">{label}:</span>
        <span className="text-gray-900">{value}</span>
      </div>
    );
  };

  const renderLink = (url, text, icon = '🔗') => {
    if (!url?.trim() || !url.startsWith('http')) return null;
    return (
      <div className="flex gap-2 items-center">
        <span className="text-lg">{icon}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-dark hover:underline transition-colors font-medium"
        >
          {text}
        </a>
      </div>
    );
  };

  const grundInfo = (
    <>
      {renderLine('🏷️', 'Typ', event['Typ av händelse'])}
      {renderLine('📍', 'Plats', event['Plats'])}
      {renderLine('🗓️', 'Period', `${event['Datum från']} – ${event['Datum till']}`)}
      {event['Övrig information']?.trim() && (
        <div className="flex gap-2 items-start">
          <span className="text-lg flex-shrink-0">🗒️</span>
          <span className="text-gray-900">{event['Övrig information']}</span>
        </div>
      )}
    </>
  );

  const ledighetInfo = (
    <>
      {event['Ledig från skolan?']?.trim().toLowerCase() === 'ja' && renderLine('✅', 'Ledig från skolan', 'Ja')}
      {event['Ledig från skolan?']?.trim().toLowerCase() === 'nej' && renderLine('❌', 'Ledig från skolan', 'Nej')}
      {event['Ledighet']?.trim() && (
        <div className="flex gap-2 items-start">
          <span className="text-lg flex-shrink-0">📝</span>
          <span className="text-gray-900">{event['Ledighet']}</span>
        </div>
      )}
    </>
  );

  const hasLedighet = event['Ledig från skolan?']?.trim() || event['Ledighet']?.trim();

  const kostnaderInfo = (
    <>
      {renderLine('💰', 'Kostnad', event['Kostnad per spelare'])}
      {renderLine('⏳', 'Sista betalningsdag', event['Sista betalningsdag'])}
      {renderLine('🏦', 'Betalningsmottagare', event['Betalningsmottagare'])}
    </>
  );

  const hasKostnader = event['Kostnad per spelare']?.trim() || event['Sista betalningsdag']?.trim() || event['Betalningsmottagare']?.trim();

  const resanInfo = (
    <>
      {event['Samling Härnösand']?.trim() && renderLine('🚍', 'Samling Härnösand', event['Samling Härnösand'])}
      {event['Samling på plats']?.trim() && renderLine('⏱️', 'Samling på plats', event['Samling på plats'])}
      {event['Resväg']?.trim() && (
        <div className="flex gap-2 items-start">
          <span className="text-lg flex-shrink-0">🗺️</span>
          <span className="text-gray-900">{event['Resväg']}</span>
        </div>
      )}
      {renderLine('🚗', 'Färdsätt', event['Färdsätt'])}
    </>
  );

  const hasResan = event['Samling Härnösand']?.trim() || event['Samling på plats']?.trim() || event['Resväg']?.trim() || event['Färdsätt']?.trim();

  const boendeInfo = (
    <>
      {renderLine('🛏️', 'Typ av boende', event['Typ av boende'])}
      {renderLine('🪧', 'Namn på boende', event['Namn på boende'])}
      {renderLine('🔑', 'Tillgång till boende', event['Tillgång till boende'])}
      {event['Adress till boende']?.trim() && (
        <div className="space-y-2">
          <div className="flex gap-2 items-start">
            <span className="text-lg flex-shrink-0">📬</span>
            <span className="font-semibold text-gray-700">Adress till boende:</span>
            <span className="text-gray-900">{event['Adress till boende']}</span>
          </div>
          <div className="ml-7 space-y-1">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event['Adress till boende'])}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark hover:underline transition-colors text-sm inline-block"
            >
              Visa på Google Maps
            </a>
            <br />
            <a
              href={`https://maps.apple.com/?q=${encodeURIComponent(event['Adress till boende'])}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark hover:underline transition-colors text-sm inline-block"
            >
              Visa på Apple Kartor
            </a>
          </div>
        </div>
      )}
    </>
  );

  const hasBoende = event['Typ av boende']?.trim() || event['Namn på boende']?.trim() || event['Tillgång till boende']?.trim() || event['Adress till boende']?.trim();

  const lankarInfo = (
    <>
      {renderLink(event['Länk till hemsida'], new URL(event['Länk till hemsida'] || 'about:blank').hostname.replace('www.', ''), '🔗')}
      {renderLink(event['Länk till bilder'], 'Se bilder', '📷')}
      {renderLink(event['Länk till boendes hemsida'], 'Länk till boendets hemsida', '🌐')}
    </>
  );

  const hasLankar = event['Länk till hemsida']?.trim() || event['Länk till bilder']?.trim() || event['Länk till boendes hemsida']?.trim();

  return (
    <div className="bg-white rounded-lg shadow-md border-l-4 border-primary hover:shadow-lg transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-lg group"
      >
        <div className="flex-grow">
          <div className="flex items-start gap-3">
            {showInlineDate && (
              <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-md whitespace-nowrap mt-0.5">
                {formatDateRange(event['Datum från'], event['Datum till'])}
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
              {event['Namn på händelse']}
            </h2>
          </div>
        </div>
        <span className="text-primary text-xl ml-4 transition-transform duration-200 flex-shrink-0" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }}>
          ▶
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 space-y-4">
          {renderEventSection('Grundläggande info', grundInfo)}
          {hasLedighet && renderEventSection('Ledig från skolan', ledighetInfo)}
          {hasKostnader && renderEventSection('Kostnader', kostnaderInfo)}
          {hasResan && renderEventSection('Resan', resanInfo)}
          {hasBoende && renderEventSection('Boende', boendeInfo)}
          {hasLankar && renderEventSection('Länkar', lankarInfo)}
        </div>
      )}
    </div>
  );
}
