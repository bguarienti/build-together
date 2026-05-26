export function exportToJSON(state) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const filename = `timeblocking-export-${dateStr}.json`;

  const dataToExport = {
    exportedAt: now.toISOString(),
    version: '1.0',
    data: state,
  };

  const jsonString = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}
