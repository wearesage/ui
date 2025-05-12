interface LyricLine {
  time: number;    // Time in seconds
  text: string;    // Lyric text
}

/**
 * Parses synced lyrics in the format [MM:SS.ms] Text
 * @param syncedLyrics - Raw synced lyrics string
 * @returns Array of parsed lyric lines with timestamps in seconds
 */
export function parseSyncedLyrics(syncedLyrics: string): LyricLine[] {
  const lines: LyricLine[] = [];
  
  // Split the input by newlines
  const rawLines = syncedLyrics.split('\n').filter(line => line.trim() !== '');
  
  // Regular expression to match the timestamp pattern [MM:SS.ms]
  const timeRegex = /^\[(\d+):(\d+\.\d+)\]\s?(.*)$/;
  
  for (const line of rawLines) {
    const match = line.match(timeRegex);
    
    if (match) {
      // Extract minutes, seconds, and lyric text
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3];
      
      // Convert to total seconds
      const timeInSeconds = minutes * 60 + seconds;
      
      lines.push({
        time: timeInSeconds,
        text: text
      });
    }
  }
  
  // Sort lines by timestamp (in case they're not already in order)
  return lines.sort((a, b) => a.time - b.time);
}
