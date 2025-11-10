import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export function useGoogleSheet(sheetUrl) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sheetUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(sheetUrl)
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            setData(results.data);
            setLoading(false);
          },
          error: function(err) {
            setError(err);
            setLoading(false);
          }
        });
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [sheetUrl]);

  return { data, loading, error };
}
