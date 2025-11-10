import { useState, useEffect, useMemo } from 'react';
import { useGoogleSheet } from '../hooks/useGoogleSheet';
import { getCurrentSeason } from '../utils/dateUtils';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRjWqqqO7FHa-re2G6iIemdPD12hUJK15z2InQoSUIhZ08Szlg_tO8muapx6cAGVYF6egrltGC60tuE/pub?output=csv';

export default function Sasongsoversikt() {
  const { data: allEvents, loading } = useGoogleSheet(SHEET_URL);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());
  const [viewMode, setViewMode] = useState('month');

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

  const eventTypeColors = useMemo(() => {
    const types = [...new Set(tasks.map(t => t.type))];
    const colors = [
      { bg: 'bg-emerald-500', hover: 'group-hover:bg-emerald-600' },
      { bg: 'bg-blue-500', hover: 'group-hover:bg-blue-600' },
      { bg: 'bg-purple-500', hover: 'group-hover:bg-purple-600' },
      { bg: 'bg-amber-500', hover: 'group-hover:bg-amber-600' },
      { bg: 'bg-rose-500', hover: 'group-hover:bg-rose-600' },
      { bg: 'bg-cyan-500', hover: 'group-hover:bg-cyan-600' },
      { bg: 'bg-pink-500', hover: 'group-hover:bg-pink-600' },
      { bg: 'bg-teal-500', hover: 'group-hover:bg-teal-600' },
    ];
    const mapping = {};
    types.forEach((type, idx) => {
      mapping[type] = colors[idx % colors.length];
    });
    return mapping;
  }, [tasks]);

  const ganttData = useMemo(() => {
    if (tasks.length === 0) return { months: [], tasks: [] };

    const startDates = tasks.map(t => new Date(t.start));
    const endDates = tasks.map(t => new Date(t.end));
    const minDate = new Date(Math.min(...startDates));
    const maxDate = new Date(Math.max(...endDates));

    const months = [];
    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

    while (current <= end) {
      months.push({
        year: current.getFullYear(),
        month: current.getMonth(),
        monthName: current.toLocaleDateString('sv-SE', { month: 'short' }),
        days: new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()
      });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

    return {
      months,
      tasks: tasks.map(task => {
        const start = new Date(task.start);
        const end = new Date(task.end);
        const startOffset = Math.ceil((start - minDate) / (1000 * 60 * 60 * 24));
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return {
          ...task,
          startOffset,
          duration,
          widthPercent: (duration / totalDays) * 100,
          leftPercent: (startOffset / totalDays) * 100,
          color: eventTypeColors[task.type]
        };
      }),
      totalDays,
      minDate,
      maxDate
    };
  }, [tasks, eventTypeColors]);

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
          <div className="text-sm text-gray-600">
            {ganttData.tasks.length} händelse{ganttData.tasks.length !== 1 ? 'r' : ''}
          </div>
        </div>
        {tasks.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Inga händelser matchar filtreringen</p>
        ) : (
          <>
            {/* Desktop Gantt View */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="min-w-[800px]">
              <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex text-xs font-semibold text-gray-700">
                <div className="w-48 flex-shrink-0">Händelse</div>
                <div className="flex-1 flex">
                  {ganttData.months.map((month, idx) => (
                    <div
                      key={idx}
                      className="text-center border-l border-gray-300 px-2"
                      style={{ width: `${(month.days / ganttData.totalDays) * 100}%` }}
                    >
                      {month.monthName} {month.year}
                    </div>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {ganttData.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center px-4 py-3 hover:bg-gray-50 group">
                    <div className="w-48 flex-shrink-0 pr-4">
                      <div className="font-semibold text-sm text-gray-900 truncate" title={task.name}>
                        {task.name}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {task.start} – {task.end}
                      </div>
                    </div>
                    <div className="flex-1 relative h-8">
                      <div
                        className={`absolute h-6 ${task.color.bg} ${task.color.hover} rounded flex items-center px-2 text-white text-xs font-medium shadow-md transition-all`}
                        style={{
                          left: `${task.leftPercent}%`,
                          width: `${task.widthPercent}%`,
                          minWidth: '60px'
                        }}
                        title={`${task.name}: ${task.start} - ${task.end}`}
                      >
                        <span className="truncate">{task.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>

            {/* Mobile Timeline View - Grouped by Month */}
            <div className="lg:hidden space-y-6">
              {(() => {
                const grouped = {};
                ganttData.tasks.forEach(task => {
                  const date = new Date(task.start);
                  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  const monthName = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' });
                  if (!grouped[key]) {
                    grouped[key] = { monthName, tasks: [] };
                  }
                  grouped[key].tasks.push(task);
                });

                return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([key, group]) => (
                  <div key={key} className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-3 rounded-t-lg">
                      <h3 className="text-base font-bold capitalize">{group.monthName}</h3>
                      <p className="text-xs opacity-90 mt-0.5">{group.tasks.length} händelse{group.tasks.length !== 1 ? 'r' : ''}</p>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {group.tasks.map((task, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                              {task.name}
                            </h4>
                            <div className={`${task.color.bg} text-white px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0`}>
                              {task.type}
                            </div>
                          </div>
                          <div className="space-y-1.5 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <span>📍</span>
                              <span className="truncate">{task.place}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>📅</span>
                              <span>{task.start} – {task.end} ({task.duration} dag{task.duration !== 1 ? 'ar' : ''})</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
