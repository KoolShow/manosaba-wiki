
export const normalizer = (content: string): string[] => {
  const rawLines = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'))

  const lines: string[] = [];
  let buffer = '';

  for (const line of rawLines) {
    if (buffer)
      buffer += line;
    else
      buffer = line;

    if (buffer.endsWith('\\')) {
      buffer = buffer.slice(0, -1);
      continue;
    }

    lines.push(buffer);
    buffer = '';
  }

  if (buffer) lines.push(buffer);
  return lines;
};
