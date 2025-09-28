import React from 'react';
import { Upload } from '@progress/kendo-react-upload';
import { Grid, GridColumn } from '@progress/kendo-react-grid';

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(l => l.length > 0);
  if (lines.length === 0) return { headers: [], data: [] };
  // Detect delimiter by header line
  const headerCandidates = [',', ';', '\t'];
  const delim = headerCandidates.reduce((best, d) => (lines[0].split(d).length > (lines[0].split(best).length) ? d : best), ',');

  const parseLine = (line: string): string[] => {
    const arr: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === delim && !inQuotes) {
        arr.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    arr.push(cur);
    return arr.map(s => s.trim());
  };

  const headers = parseLine(lines[0]).map(h => h.replace(/^\uFEFF/, ''));
  const data = lines.slice(1).map(line => {
    const values = parseLine(line);
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => (obj[h] = values[i] ?? ''));
    return obj;
  });
  return { headers, data };
}

export function DataImport() {
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [data, setData] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const onAdd = async (e: any) => {
    const raw = e.affectedFiles?.[0]?.getRawFile?.();
    if (!raw) return;
    const name: string = raw.name || '';
    const ext = name.toLowerCase().split('.').pop();

    if (ext === 'xlsx' || ext === 'xls') {
      setError('Excel files are not supported in this build. Please export your sheet as CSV (UTF-8) and upload the CSV.');
      return;
    }
    // default to CSV/TSV/TXT
    const text = await raw.text();
    const parsed = parseCsv(text);

    setHeaders(parsed.headers);
    setData(parsed.data);
    setError(parsed.headers.length === 0 ? 'No headers detected. Ensure the first row contains column names.' : parsed.data.length === 0 ? 'No data rows detected under the header row.' : null);
    try {
      const payload = { headers: parsed.headers, data: parsed.data };
      localStorage.setItem('dashboard_dataset', JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('dashboard:dataset', { detail: payload }));
    } catch {}
  };

  const loadSample = () => {
    const sample = {
      headers: ['Month', 'Sales', 'Profit', 'Users'],
      data: [
        { Month: 'Jan', Sales: 120, Profit: 45, Users: 1000 },
        { Month: 'Feb', Sales: 95, Profit: 30, Users: 1200 },
        { Month: 'Mar', Sales: 140, Profit: 60, Users: 1500 },
        { Month: 'Apr', Sales: 110, Profit: 40, Users: 1300 },
      ]
    };
    setHeaders(sample.headers);
    setData(sample.data);
    setError(null);
    try {
      localStorage.setItem('dashboard_dataset', JSON.stringify(sample));
      window.dispatchEvent(new CustomEvent('dashboard:dataset', { detail: sample }));
    } catch {}
  };

  return (
    <div className="space-y-3">
      <Upload
        multiple={false}
        autoUpload={false}
        saveUrl="/"
        onAdd={onAdd}
        restrictions={{ allowedExtensions: ['.csv', '.tsv', '.txt'] }}
      />
      <div className="flex items-center gap-2 text-xs opacity-75">
        <span>Supported: CSV/TSV/TXT (first row = headers). For Excel, export to CSV.</span>
        <button className="px-2 py-1 glass" onClick={loadSample}>Load sample dataset</button>
      </div>
      {error && (
        <div className="glass p-2 text-xs" role="alert">
          {error}
        </div>
      )}
      {data.length > 0 && (
        <div className="glass p-2">
          <Grid data={data} style={{ maxHeight: 280 }}>
            {headers.map(h => (
              <GridColumn key={h} field={h} title={h} />
            ))}
          </Grid>
        </div>
      )}
    </div>
  );
}
