import { useState, useEffect, useMemo } from 'react';
import { useGoogleSheet } from '../hooks/useGoogleSheet';
import { getCurrentSeason, getEffectiveToday } from '../utils/dateUtils';
import EventCard from '../components/EventCard';
import EventFilters from '../components/EventFilters';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRjWqqqO7FHa-re2G6iIemdPD12hUJK15z2InQoSUIhZ08Szlg_tO8muapx6cAGVYF6egrltGC60tuE/pub?output=csv';

export default function Handelser() {
  const { data: allEvents, loading } = useGoogleSheet(SHEET_URL);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [selectedPlace, setSelectedPlace] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');

  useEffect(() => {
    if (allEvents.length > 0 && !selectedSeason) {
      const currentSeason = getCurrentSeason();
      const seasons = [...new Set(allEvents.map(e => e['Säsong']))];
      if (seasons.includes(currentSeason)) {
        setSelectedSeason(currentSeason);
      }
    }
  }, [allEvents, selectedSeason]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(e => {
      const matchSeason = !selectedSeason || e['Säsong'] === selectedSeason;
      const matchType = selectedTypes.size === 0 || selectedTypes.has(e['Typ av händelse']);
      const matchPlace = !selectedPlace || e['Plats'] === selectedPlace;
      const matchSchool = !selectedSchool || (e['Ledig från skolan?']?.toLowerCase() === selectedSchool);
      return matchSeason && matchType && matchPlace && matchSchool;
    });
  }, [allEvents, selectedSeason, selectedTypes, selectedPlace, selectedSchool]);

  const todayDate = getEffectiveToday().toISOString().split('T')[0];
  const currentSeason = getCurrentSeason();

  const { upcomingEvents, pastEvents } = useMemo(() => {
    if (selectedSeason !== currentSeason) {
      return { upcomingEvents: filteredEvents, pastEvents: [] };
    }

    const upcoming = [];
    const past = [];

    filteredEvents.forEach(e => {
      const end = (e['Datum till'] || e['Datum från'])?.substring(0, 10);
      if (end && end < todayDate) {
        past.push(e);
      } else {
        upcoming.push(e);
      }
    });

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [filteredEvents, selectedSeason, currentSeason, todayDate]);

  const groupedEvents = (events) => {
    const grouped = {};
    events.forEach(e => {
      const key = `${e['År']}-${e['Månadsnummer'].padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = {
          year: e['År'],
          name: e['Månadsnamn'],
          data: []
        };
      }
      grouped[key].data.push(e);
    });

    return Object.keys(grouped).sort().map(key => ({
      ...grouped[key],
      data: grouped[key].data.sort((a, b) => new Date(a['Datum från']) - new Date(b['Datum från']))
    }));
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
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Händelser</h1>

      <EventFilters
        allEvents={allEvents}
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        selectedPlace={selectedPlace}
        setSelectedPlace={setSelectedPlace}
        selectedSchool={selectedSchool}
        setSelectedSchool={setSelectedSchool}
      />

      <div className="space-y-12">
        {!selectedSeason ? (
          Object.entries(
            filteredEvents.reduce((acc, e) => {
              const season = e['Säsong'] || 'Okänd';
              if (!acc[season]) acc[season] = [];
              acc[season].push(e);
              return acc;
            }, {})
          )
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([season, events]) => (
              <div key={season}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  🗓️ {season}
                </h2>
                {groupedEvents(events).map((group, idx) => (
                  <div key={idx} className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                      🗓️ {group.year} – {group.name}
                    </h3>
                    <div className="space-y-4">
                      {group.data.map((event, i) => (
                        <EventCard key={i} event={event} defaultOpen={idx === 0 && i === 0} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
        ) : (
          <>
            {groupedEvents(upcomingEvents).map((group, idx) => (
              <div key={idx} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  🗓️ {group.year} – {group.name}
                </h3>
                <div className="space-y-4">
                  {group.data.map((event, i) => (
                    <EventCard key={i} event={event} defaultOpen={idx === 0 && i === 0} />
                  ))}
                </div>
              </div>
            ))}

            {pastEvents.length > 0 && (
              <details className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-6">
                <summary className="text-xl font-bold cursor-pointer text-gray-700 hover:text-primary transition-colors">
                  ⬇️ Tidigare händelser
                </summary>
                <div className="mt-6 space-y-8">
                  {groupedEvents(pastEvents).map((group, idx) => (
                    <div key={idx}>
                      <h3 className="text-xl font-semibold text-gray-700 mb-4">
                        🗓️ {group.year} – {group.name}
                      </h3>
                      <div className="space-y-4">
                        {group.data.map((event, i) => (
                          <EventCard key={i} event={event} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </div>
    </div>
  );
}
