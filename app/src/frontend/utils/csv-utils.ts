// ── CSV Export ──────────────────────────────────────────────────────────────

export function exportToCSV<T>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  filename: string
) {
  const headerRow = headers.map((h) => h.label).join(",");
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h.key] as unknown;
        const str = val === null || val === undefined ? "" : String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );

  const csv = [headerRow, ...rows].join("\n");
  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

// ── Demo Template Download ──────────────────────────────────────────────────

export function downloadTemplate(
  headers: { key: string; label: string }[],
  filename: string,
  sampleRow?: Record<string, unknown>
) {
  const headerRow = headers.map((h) => h.label).join(",");
  const lines = [headerRow];

  if (sampleRow) {
    const row = headers
      .map((h) => {
        const val = sampleRow[h.key];
        const str = val === null || val === undefined ? "" : String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",");
    lines.push(row);
  }

  const csv = lines.join("\n");
  downloadFile(csv, `${filename}-template.csv`, "text/csv;charset=utf-8;");
}

// ── CSV Import (replaces xlsx dependency) ──────────────────────────────────

export function importFromCSV<T>(
  file: File,
  headerMap: { label: string; key: string; transform?: (val: string) => unknown }[]
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) {
          resolve([]);
          return;
        }

        const headerLine = lines[0];
        const csvHeaders = parseCSVRow(headerLine);

        // Build lookup: lowercase header -> index
        const headerIndexMap = new Map<string, number>();
        csvHeaders.forEach((h, i) => headerIndexMap.set(h.toLowerCase().trim(), i));

        // Build mapping: column index -> header config
        const columnMappings: { index: number; config: (typeof headerMap)[0] }[] = [];
        for (const config of headerMap) {
          const idx = headerIndexMap.get(config.label.toLowerCase().trim());
          if (idx !== undefined) {
            columnMappings.push({ index: idx, config });
          }
        }

        const results: T[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVRow(lines[i]);
          const obj: Record<string, unknown> = {};
          for (const { index, config } of columnMappings) {
            const value = values[index] || "";
            obj[config.key] = config.transform ? config.transform(value) : value;
          }
          results.push(obj as T);
        }

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// Legacy alias for backward compatibility
export const importFromExcel = importFromCSV;

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
