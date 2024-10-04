export function calculateScore(ratings: number[]): string {
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  const avg = sum / ratings.length;
	if (isNaN(avg)) {
		return 'No ratings yet';
	}
  return `${avg} ⭐`;
}
