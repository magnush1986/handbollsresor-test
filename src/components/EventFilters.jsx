import { useMemo, useState, useRef, useEffect } from 'react';
import { getCurrentSeason } from '../utils/dateUtils';

export default function EventFilters({
  allEvents,
  selectedSeason,
  setSelectedSeason,
  selectedTypes,
  setSelectedTypes,
  selectedPlace,
  setSelectedPlace,
  selectedSchool,
  setSelectedSchool
}) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const typeMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target)) {
        setTypeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const seasons = useMemo(() => {
    return [...new Set(allEvents.map(e => e['Säsong']))].sort().reverse();
  }, [allEvents]);

  const availableTypes = useMemo(() => {
    const filtered = allEvents.filter(e =>
      (!selectedSeason || e['Säsong'] === selectedSeason) &&
      (!selectedSchool || e['Ledig från skolan?']?.toLowerCase() === selectedSchool)
    );
    return [...new Set(filtered.map(e => e['Typ av händelse']).filter(Boolean))].sort();
  }, [allEvents, selectedSeason, selectedSchool]);

  const availablePlaces = useMemo(() => {
    const filtered = allEvents.filter(e =>
      (!selectedSeason || e['Säsong'] === selectedSeason) &&
      (selectedTypes.size === 0 || selectedTypes.has(e['Typ av händelse'])) &&
      (!selectedSchool || e['Ledig från skolan?']?.toLowerCase() === selectedSchool)
    );
    return [...new Set(filtered.map(e => e['Plats']).filter(Boolean))].sort();
  }, [allEvents, selectedSeason, selectedTypes, selectedSchool]);

  const handleTypeToggle = (type) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
    setSelectedPlace('');
  };

  const clearTypes = () => {
    setSelectedTypes(new Set());
    setSelectedPlace('');
  };

  const typeButtonText = useMemo(() => {
    if (selectedTypes.size === 0) return 'Typ (alla)';
    if (selectedTypes.size === 1) return `Typ (${Array.from(selectedTypes)[0]})`;
    return `Typ (${selectedTypes.size} val)`;
  }, [selectedTypes]);

  return (
    <div className="mb-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtrera händelser
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="season-filter" className="font-semibold text-gray-700">
            Säsong:
          </label>
          <select
            id="season-filter"
            value={selectedSeason}
            onChange={(e) => {
              setSelectedSeason(e.target.value);
              setSelectedTypes(new Set());
              setSelectedPlace('');
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-w-[200px]"
          >
            <option value="">Alla säsonger</option>
            {seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 relative" ref={typeMenuRef}>
          <label className="font-semibold text-gray-700">
            Typ:
          </label>
          <div className="relative">
            <button
              onClick={() => setTypeMenuOpen(!typeMenuOpen)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-w-[200px] text-left flex items-center justify-between"
            >
              <span className="truncate">{typeButtonText}</span>
              <svg className="w-5 h-5 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {typeMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                <div className="p-2 space-y-1">
                  {availableTypes.map(type => (
                    <label
                      key={type}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
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
                <div className="border-t border-gray-200 p-2">
                  <button
                    onClick={clearTypes}
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Rensa val
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="place-filter" className="font-semibold text-gray-700">
            Plats:
          </label>
          <select
            id="place-filter"
            value={selectedPlace}
            onChange={(e) => setSelectedPlace(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-w-[200px]"
          >
            <option value="">Alla platser</option>
            {availablePlaces.map(place => (
              <option key={place} value={place}>{place}</option>
            ))}
          </select>
        </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 xl:col-span-4">
        <label htmlFor="school-filter" className="font-semibold text-gray-700">
          Ledig från skolan:
        </label>
        <select
          id="school-filter"
          value={selectedSchool}
          onChange={(e) => {
            setSelectedSchool(e.target.value);
            setSelectedTypes(new Set());
            setSelectedPlace('');
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:max-w-xs"
        >
          <option value="">Alla</option>
          <option value="ja">Ja</option>
          <option value="nej">Nej</option>
        </select>
          </div>
        </div>
      </div>
    </div>
  );
}
