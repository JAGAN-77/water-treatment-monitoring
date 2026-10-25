/**
 * Exports an array of sensor reading objects to a downloadable CSV file.
 */
export const exportReadingsToCsv = (readings, filename = `water_treatment_report_${new Date().toISOString().substring(0, 10)}.csv`) => {
  if (!readings || readings.length === 0) {
    alert('No telemetry readings available to export.');
    return;
  }

  const headers = [
    'Timestamp',
    'pH Level',
    'Temperature (C)',
    'Turbidity (NTU)',
    'Water Level (%)',
    'Flow Rate (L/min)',
    'Status',
    'Abnormal Parameters'
  ];

  const rows = readings.map((r) => [
    `"${new Date(r.timestamp).toISOString()}"`,
    r.ph !== undefined ? Number(r.ph).toFixed(2) : '',
    r.temperature !== undefined ? Number(r.temperature).toFixed(2) : '',
    r.turbidity !== undefined ? Number(r.turbidity).toFixed(2) : '',
    r.waterLevel !== undefined ? Number(r.waterLevel).toFixed(2) : '',
    r.flowRate !== undefined ? Number(r.flowRate).toFixed(2) : '',
    `"${r.status || 'NORMAL'}"`,
    `"${(r.abnormalParameters || []).join('; ')}"`
  ]);

  const csvString = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
