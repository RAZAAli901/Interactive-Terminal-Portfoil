/**
 * Calculates the Levenshtein distance between two strings
 * @param {string} a
 * @param {string} b
 * @returns {number} Distance score (lower is closer)
 */
export function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Finds the top N closest matching commands from a list of registered commands
 * @param {string} input 
 * @param {string[]} availableCommands 
 * @param {number} limit 
 * @returns {string[]} Top closest command names
 */
export function getFuzzyMatches(input, availableCommands, limit = 3) {
  if (!input) return [];
  const cleanInput = input.trim().toLowerCase();
  
  const suggestions = availableCommands
    .map(cmd => {
      const distance = getLevenshteinDistance(cleanInput, cmd.toLowerCase());
      // Give bonus to prefix matching
      let score = distance;
      if (cmd.toLowerCase().startsWith(cleanInput)) {
        score -= 2;
      }
      return { cmd, score };
    })
    .sort((a, b) => a.score - b.score);

  return suggestions.slice(0, limit).map(item => item.cmd);
}
