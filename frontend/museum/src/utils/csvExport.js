/**
 * Convert an array of objects to CSV and trigger a browser download.
 * @param {Object[]} data  — rows to export
 * @param {string}   filename — e.g. "recent-activity.csv"
 * @param {string[]} [columns] — explicit column order; defaults to keys of first row
 */
export function downloadCSV(data, filename = 'export.csv', columns) {
  if (!data?.length) return;

  const cols = columns || Object.keys(data[0]);

  const escape = (val) => {
    const str = val == null ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const header = cols.map(escape).join(',');
  const rows   = data.map(row => cols.map(c => escape(row[c])).join(','));
  const csv    = [header, ...rows].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
