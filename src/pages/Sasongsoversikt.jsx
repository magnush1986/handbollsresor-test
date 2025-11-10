import { useState, useEffect, useMemo, useRef } from 'react';
import { useGoogleSheet } from '../hooks/useGoogleSheet';
import { getCurrentSeason } from '../utils/dateUtils';
import Gantt from 'frappe-gantt';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRjWqqqO7FHa-re2G6iIemdPD12hUJK15z2InQoSUIhZ08Szlg_tO8muapx6cAGVYF6egrltGC60tuE/pub?output=csv';

export default function Sasongsoversikt() {
  const { data: allEvents, loading } = useGoogleSheet(SHEET_URL);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());
  const [viewMode, setViewMode] = useState('Month');
  const ganttRef = useRef(null);
  const ganttInstance = useRef(null);

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

  useEffect(() => {
    if (ganttRef.current && tasks.length > 0) {
      if (ganttInstance.current) {
        ganttInstance.current.clear();
      }

      const ganttTasks = tasks.map((task, idx) => ({
        id: `task-${idx}`,
        name: task.name,
        start: task.start,
        end: task.end,
        progress: 100,
        custom_class: 'gantt-task'
      }));

      ganttInstance.current = new Gantt(ganttRef.current, ganttTasks, {
        view_mode: viewMode,
        language: 'sv',
        bar_height: 30,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        date_format: 'YYYY-MM-DD',
        custom_popup_html: function(task) {
          const taskData = tasks.find(t => t.name === task.name);
          return `
            <div class="gantt-popup">
              <h3>${task.name}</h3>
              <p><strong>Typ:</strong> ${taskData?.type || ''}</p>
              <p><strong>Plats:</strong> ${taskData?.place || ''}</p>
              <p><strong>Period:</strong> ${task._start.toLocaleDateString('sv-SE')} - ${task._end.toLocaleDateString('sv-SE')}</p>
            </div>
          `;
        }
      });
    }
  }, [tasks, viewMode]);

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

      <div className="mb-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtrera översikt
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="season-select" className="font-semibold text-gray-700">
              Säsong:
            </label>
            <select
              id="season-select"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-w-[200px]"
            >
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>

          <details className="bg-gray-50 rounded-lg border border-gray-200 p-4">
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

          <details className="bg-gray-50 rounded-lg border border-gray-200 p-4">
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

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold text-gray-900">Gantt-schema</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('Day')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewMode === 'Day'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dag
            </button>
            <button
              onClick={() => setViewMode('Week')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewMode === 'Week'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vecka
            </button>
            <button
              onClick={() => setViewMode('Month')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewMode === 'Month'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Månad
            </button>
          </div>
        </div>
        {tasks.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Inga händelser matchar filtreringen</p>
        ) : (
          <div className="overflow-x-auto">
            <svg ref={ganttRef} className="w-full" style={{ minHeight: '400px' }}></svg>
          </div>
        )}
      </div>
    </div>
  );
}
