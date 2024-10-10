export function formatTime(seconds: number): string {
	if (isNaN(seconds)) {
		return '0:00';
	}
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
	return `${minutes}:${Math.floor(remainingSeconds) < 10 ? '0' : ''}${Math.floor(remainingSeconds)}`;
}