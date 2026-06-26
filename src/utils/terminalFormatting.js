export function formatSuccess(text) {
  return `<span class="text-success">${text}</span>`;
}

export function formatError(text) {
  return `<span class="text-error">${text}</span>`;
}

export function formatInfo(text) {
  return `<span class="text-info">${text}</span>`;
}

export function formatWarning(text) {
  return `<span class="text-warning">${text}</span>`;
}

export function formatSection(title) {
  const line = "===========================================================";
  return [
    `<strong>${title}</strong>`,
    line
  ];
}

export function formatCode(code) {
  return `<code class="terminal-code">${code}</code>`;
}

export function formatLink(text, url) {
  return `<a href="${url}" target="_blank" class="terminal-link" data-url="${url}">[${text}]</a>`;
}

/**
 * Formats a set of headers and rows into an ASCII table with box-drawing characters
 * @param {string[]} headers
 * @param {string[][]} rows
 * @returns {string[]} Array of lines representing the table
 */
export function formatTable(headers, rows) {
  // Strip HTML tags for width calculations
  const stripHtml = (str) => {
    if (typeof str !== 'string') return String(str);
    return str.replace(/<[^>]*>/g, '');
  };

  // Find max length of each column
  const colWidths = headers.map((header, colIdx) => {
    const headerLen = stripHtml(header).length;
    const maxRowLen = rows.reduce((max, row) => {
      const cellVal = stripHtml(row[colIdx] || '');
      return cellVal.length > max ? cellVal.length : max;
    }, 0);
    return Math.max(headerLen, maxRowLen);
  });

  const lines = [];

  // Top border: ┌───┬───┐
  const topBorder = "┌" + colWidths.map(w => "─".repeat(w + 2)).join("┬") + "┐";
  lines.push(topBorder);

  // Header row: │ col1 │ col2 │
  const headerCells = headers.map((header, idx) => {
    const rawLen = stripHtml(header).length;
    const paddingNeeded = colWidths[idx] - rawLen;
    return ` ${header}${" ".repeat(paddingNeeded)} `;
  });
  lines.push("│" + headerCells.join("│") + "│");

  // Middle divider: ├───┼───┤
  const midDivider = "├" + colWidths.map(w => "─".repeat(w + 2)).join("┼") + "┤";
  lines.push(midDivider);

  // Rows: │ val1 │ val2 │
  rows.forEach(row => {
    const rowCells = headers.map((_, colIdx) => {
      const val = row[colIdx] || "";
      const rawLen = stripHtml(val).length;
      const paddingNeeded = colWidths[colIdx] - rawLen;
      return ` ${val}${" ".repeat(paddingNeeded)} `;
    });
    lines.push("│" + rowCells.join("│") + "│");
  });

  // Bottom border: └───┴───┘
  const bottomBorder = "└" + colWidths.map(w => "─".repeat(w + 2)).join("┴") + "┘";
  lines.push(bottomBorder);

  return lines;
}
