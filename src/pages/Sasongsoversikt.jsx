import { useState, useEffect, useMemo } from 'react';
import { useGoogleSheet } from '../hooks/useGoogleSheet';
import { getCurrentSeason } from '../utils/dateUtils';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRjWqqqO7FHa-re2G6iIemdPD12hUJK15z2InQoSUIhZ08Szlg_tO8muapx6cAGVYF6egrltGC60tuE/pub?output=csv';

export default function Sasongsoversikt() {
  const { data: allEvents, loading } = useGoogleSheet(SHEET_URL);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());
  const [viewMode, setViewMode] = useState('Month');

  useEffect(() => {
    if (allEvents.length > 0 && !selectedSeason) {
      const currentSeason = getCurrentSeason();
      const seasons = [...new Set(allEvents.map(e => e['Säsong']))];
      if (seasons.includes(currentSeason)) {
        setSelectedSeason(currentSeason);
      }
    }
  }, [allEvents, selectedSeason]);

  const seasons = useMemo(() => {
    return [...new Set(allEvents.map(e => e['Säsong']))].sort().reverse();
  }, [allEvents]);

  const availableTypes = useMemo(() => {
    const filtered = allEvents.filter(e => !selectedSeason || e['Säsong'] === selectedSeason);
    return [...new Set(filtered.map(e => e['Typ av händelse']).filter(Boolean))].sort();
  }, [allEvents, selectedSeason]);

  const availablePlaces = useMemo(() => {
    const filtered = allEvents.filter(e => !selectedSeason || e['Säsong'] === selectedSeason);
    return [...new Set(filtered.map(e => e['Plats']).filter(Boolean))].sort();
  }, [allEvents, selectedSeason]);

  const tasks = useMemo(() => {
    return allEvents
      .filter(e =>
        e['Säsong'] === selectedSeason &&
        (selectedTypes.size === 0 || selectedTypes.has(e['Typ av händelse'])) &&
        (selectedPlaces.size === 0 || selectedPlaces.has(e['Plats']))
      )
      .map(e => ({
        id: e['Namn på händelse'],
        name: e['Namn på händelse'],
        start: e['Datum från'],
        end: e['Datum till'] || e['Datum från'],
        type: e['Typ av händelse'],
        place: e['Plats']
      }))
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [allEvents, selectedSeason, selectedTypes, selectedPlaces]);

  const handleTypeToggle = (type) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  const handlePlaceToggle = (place) => {
    const newPlaces = new Set(selectedPlaces);
    if (newPlaces.has(place)) {
      newPlaces.delete(place);
    } else {
      newPlaces.add(place);
    }
    setSelectedPlaces(newPlaces);
  };

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
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Säsongsöversikt</h1>

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="season-select" className="font-semibold text-gray-700">
              Säsong:
            </label>
            <select
              id="season-select"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-w-[200px]"
            >
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <details className="bg-white rounded-lg border border-gray-200 p-4">
            <summary className="font-semibold text-gray-700 cursor-pointer">
              Filtrera efter typ ({selectedTypes.size > 0 ? `${selectedTypes.size} valda` : 'alla'})
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableTypes.map(type => (
                <label
                  key={type}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.has(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="bg-white rounded-lg border border-gray-200 p-4">
            <summary className="font-semibold text-gray-700 cursor-pointer">
              Filtrera efter plats ({selectedPlaces.size > 0 ? `${selectedPlaces.size} valda` : 'alla'})
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {availablePlaces.map(place => (
                <label
                  key={place}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlaces.has(place)}
                    onChange={() => handlePlaceToggle(place)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-gray-700">{place}</span>
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Händelser i tidsordning</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Inga händelser matchar filtreringen</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-32 text-sm text-gray-600">
                  <div>{task.start}</div>
                  {task.end !== task.start && <div>— {task.end}</div>}
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-gray-900">{task.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <span>🏷️</span>
                      {task.type}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span>📍</span>
                      {task.place}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
