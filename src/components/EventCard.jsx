import { useState } from 'react';
import { formatDateRange } from '../utils/dateUtils';

export default function EventCard({ event, defaultOpen = false, showInlineDate = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const renderEventSection = (title, content) => {
    if (!content) return null;
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
        <h3 className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full"></span>
          {title}
        </h3>
        <div className="pl-4">
          {content}
        </div>
      </div>
    );
  };

  const renderLine = (icon, label, value, isLongText = false) => {
    if (!value?.trim()) return null;
    return (
      <div className={`flex gap-2 ${isLongText ? 'items-start' : 'items-center'} text-sm`}>
        <span className="text-base flex-shrink-0">{icon}</span>
        <div className="flex flex-wrap gap-x-1 min-w-0">
          <span className="font-semibold text-gray-700 whitespace-nowrap">{label}:</span>
          <span className="text-gray-900 break-words">{value}</span>
        </div>
      </div>
    );
  };

  const renderLink = (url, text, icon = '🔗') => {
    if (!url?.trim() || !url.startsWith('http')) return null;
    return (
      <div className="flex gap-2 items-center text-sm">
        <span className="text-base flex-shrink-0">{icon}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-dark hover:underline transition-colors font-medium break-all min-w-0"
        >
          {text}
        </a>
      </div>
    );
  };

  const dateStr = event['Datum från'] && event['Datum till']
    ? formatDateRange(event['Datum från'], event['Datum till'])
    : event['Datum från'] || event['Datum till'] || '';

  const grundInfo = (
    <>
      {renderLine('🏷️', 'Typ', event['Typ av händelse'])}
      {renderLine('📍', 'Plats', event['Plats'])}
      {dateStr && renderLine('🗓️', 'Period', dateStr)}
      {event['Övrig information']?.trim() && (
        <div className="flex gap-2 items-start text-sm">
          <span className="text-base flex-shrink-0">🗒️</span>
          <span className="text-gray-900 break-words min-w-0">{event['Övrig information']}</span>
        </div>
      )}
    </>
  );

  const ledighetInfo = (
    <>
      {event['Ledig från skolan?']?.trim().toLowerCase() === 'ja' && renderLine('✅', 'Ledig från skolan', 'Ja')}
      {event['Ledig från skolan?']?.trim().toLowerCase() === 'nej' && renderLine('❌', 'Ledig från skolan', 'Nej')}
      {event['Ledighet']?.trim() && (
        <div className="flex gap-2 items-start text-sm">
          <span className="text-base flex-shrink-0">📝</span>
          <span className="text-gray-900 break-words min-w-0">{event['Ledighet']}</span>
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
        <div className="flex gap-2 items-start text-sm">
          <span className="text-base flex-shrink-0">🗺️</span>
          <span className="text-gray-900 break-words min-w-0">{event['Resväg']}</span>
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
        <div className="space-y-2 text-sm">
          <div className="flex gap-2 items-start">
            <span className="text-base flex-shrink-0">📬</span>
            <div className="flex flex-wrap gap-x-1 min-w-0">
              <span className="font-semibold text-gray-700 whitespace-nowrap">Adress till boende:</span>
              <span className="text-gray-900 break-words">{event['Adress till boende']}</span>
            </div>
          </div>
          <div className="ml-7 space-y-1">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event['Adress till boende'])}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark hover:underline transition-colors text-xs inline-block"
            >
              Visa på Google Maps
            </a>
            <br />
            <a
              href={`https://maps.apple.com/?q=${encodeURIComponent(event['Adress till boende'])}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark hover:underline transition-colors text-xs inline-block"
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 md:px-6 md:py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-lg group"
      >
        <div className="flex-grow min-w-0">
          <div className="flex items-start gap-2 md:gap-3">
            {dateStr && (
              <span className="text-xs md:text-sm font-semibold text-primary bg-primary/10 px-2 py-1 md:px-3 rounded-md whitespace-nowrap mt-0.5 flex-shrink-0">
                {dateStr}
              </span>
            )}
            <h2 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">
              {event['Namn på händelse']}
            </h2>
          </div>
        </div>
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-primary ml-3 md:ml-4 transition-transform duration-200 flex-shrink-0"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 md:px-6 md:pb-6 pt-4 space-y-3 border-t border-gray-100 bg-gray-50/50">
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
