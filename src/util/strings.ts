export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function lowercaseFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function replaceAllSubstrings(str: string, substring: string, newValue = '') {
  return str.split(substring).join(newValue);
}

export function replaceAllWords(str: string, substring: string, newValue = '') {
  const regex = new RegExp(`(?<!\\.)\\b${substring}\\b`, 'g');
  return str.replace(regex, newValue);
}

export function snakeToCamel(str: any) {
  return str.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
}

export function convertKeysToCamelCase(data: any) {
  if (Array.isArray(data)) {
    return data.map((item: any) => convertKeysToCamelCase(item));
  } else if (data !== null && typeof data === 'object') {
    return Object.entries(data).reduce((accumulator, [key, value]) => {
      const newKey = snakeToCamel(key);
      accumulator[newKey] = convertKeysToCamelCase(value);
      return accumulator;
    }, {});
  }
  return data;
}
