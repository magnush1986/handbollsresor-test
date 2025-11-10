import { useState, useEffect, useMemo } from 'react';
import { useGoogleSheet } from '../hooks/useGoogleSheet';
import { getCurrentSeason, parseKostnad } from '../utils/dateUtils';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQwy0b0RMcUXo3xguOtukMryHNlYnebQdskaIWHXr3POx7fg9NfUHsMTGjOlDnkOJZybrWZ7r36NfB1/pub?output=csv';

export default function Budget() {
  const { data, loading } = useGoogleSheet(SHEET_URL);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    if (data.length > 0 && !selectedSeason) {
      const currentSeason = getCurrentSeason();
      const seasons = [...new Set(data.map(e => e['Säsong']))];
      if (seasons.includes(currentSeason)) {
        setSelectedSeason(currentSeason);
      }
    }
  }, [data, selectedSeason]);

  const seasons = useMemo(() => {
    return [...new Set(data.map(e => e['Säsong']))].sort().reverse();
  }, [data]);

  const availableTypes = useMemo(() => {
    const filtered = data.filter(e => !selectedSeason || e['Säsong'] === selectedSeason);
    return [...new Set(filtered.map(e => e['Typ av händelse']))].sort();
  }, [data, selectedSeason]);

  const { groupedData, total } = useMemo(() => {
    const filtered = data.filter(e =>
      e['Säsong'] === selectedSeason &&
      (!selectedType || e['Typ av händelse'] === selectedType)
    );

    const grouped = {};
    let totalCost = 0;

    filtered.forEach(e => {
      const year = e['År'];
      const month = e['Månadsnummer']?.padStart(2, '0');
      const monthName = e['Månadsnamn'];
      const key = `${year}-${month}`;
      const kostnad = parseKostnad(e['Kostnad per spelare']);

      if (!grouped[key]) {
        grouped[key] = {
          year,
          month,
          monthName,
          total: 0,
          events: []
        };
      }

      grouped[key].total += kostnad;
      grouped[key].events.push({
        namn: e['Namn på händelse'],
        datum: e['Datum från'],
        plats: e['Plats'],
        sistaBetalningsdag: e['Sista betalningsdag'],
        betalningsmottagare: e['Betalningsmottagare'],
        kostnad
      });

      totalCost += kostnad;
    });

    return { groupedData: grouped, total: totalCost };
  }, [data, selectedSeason, selectedType]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Budget</h1>

      <div className="mb-8 flex flex-wrap gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="season-filter" className="font-semibold text-gray-700">
            Säsong:
          </label>
          <select
            id="season-filter"
            value={selectedSeason}
            onChange={(e) => {
              setSelectedSeason(e.target.value);
              setSelectedType('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-w-[200px]"
          >
            {seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="type-filter" className="font-semibold text-gray-700">
            Typ:
          </label>
          <select
            id="type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-w-[200px]"
          >
            <option value="">Alla typer</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(groupedData).sort().map(key => {
          const g = groupedData[key];
          return (
            <details key={key} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <span className="text-lg font-bold text-gray-900">
                      {g.year} – {g.monthName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600">{g.events.length} händelse{g.events.length > 1 ? 'r' : ''}</span>
                    <span className="ml-4 text-lg font-bold text-primary">{g.total.toLocaleString('sv-SE')} kr</span>
                  </div>
                </div>
              </summary>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-t border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Händelse</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Datum</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">Plats</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">Sista betalningsdag</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 hidden xl:table-cell">Betalningsmottagare</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Kostnad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {g.events.map((ev, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{ev.namn}</div>
                            <div className="md:hidden text-sm text-gray-600 mt-1">
                              <div>📅 {ev.datum}</div>
                              <div className="lg:hidden">📍 {ev.plats}</div>
                              {ev.sistaBetalningsdag && <div className="lg:hidden">⏳ {ev.sistaBetalningsdag}</div>}
                              {ev.betalningsmottagare && <div className="xl:hidden">🏦 {ev.betalningsmottagare}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 hidden md:table-cell">📅 {ev.datum}</td>
                        <td className="px-6 py-4 text-gray-700 hidden lg:table-cell">📍 {ev.plats}</td>
                        <td className="px-6 py-4 text-gray-700 hidden lg:table-cell">
                          {ev.sistaBetalningsdag ? `⏳ ${ev.sistaBetalningsdag}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-700 hidden xl:table-cell">
                          {ev.betalningsmottagare ? `🏦 ${ev.betalningsmottagare}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          💰 {ev.kostnad.toLocaleString('sv-SE')} kr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })}
      </div>

      {selectedSeason && (
        <div className="mt-8 bg-primary text-white rounded-lg shadow-lg px-8 py-6">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Total kostnad för säsongen</div>
            <div className="text-4xl font-bold">{total.toLocaleString('sv-SE')} kr</div>
          </div>
        </div>
      )}
    </div>
  );
}
