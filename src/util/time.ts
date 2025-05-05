export function pause(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (isNaN(minutes) || isNaN(remainingSeconds)) return `00:00`;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds.toFixed(0)).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}
