import * as XLSX from "xlsx";

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
        // Escape commas and quotes
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

// ── Excel/CSV Import ────────────────────────────────────────────────────────

export function importFromExcel<T>(
  file: File,
  headerMap: { label: string; key: string; transform?: (val: string) => unknown }[]
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

        // Build a lookup: lowercase label -> header config
        const lookup = new Map(
          headerMap.map((h) => [h.label.toLowerCase().trim(), h])
        );

        const results = jsonRows.map((row) => {
          const obj: Record<string, unknown> = {};
          for (const [excelKey, value] of Object.entries(row)) {
            const mapping = lookup.get(excelKey.toLowerCase().trim());
            if (mapping) {
              obj[mapping.key] = mapping.transform
                ? mapping.transform(String(value))
                : String(value);
            }
          }
          return obj as T;
        });

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────

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
