/** JS mirror of the Tailwind design tokens, for SVG fills/gradients. */
export const colors = {
  background: '#FBF7F4',
  surface: '#FFFFFF',
  ink: '#3B2A30',
  inkSoft: '#6B5860',
  inkMuted: '#9A8A90',
  rose: '#C2848B',
  roseSoft: '#E7D2D5',
  roseDeep: '#A86A72',
  gold: '#B68A3E',
  goldSoft: '#E8D8B8',
  goldDeep: '#9A7330',
  sage: '#8FA68E',
  sageSoft: '#DDE6DC',
  sageDeep: '#6E8A6D',
  line: '#EFE6E0',
} as const;

/** Score band → color, used by MatchScoreRing and chips. */
export function scoreColor(score: number): string {
  if (score >= 85) return colors.sage;
  if (score >= 70) return colors.gold;
  return colors.rose;
}

export function scoreBand(score: number): 'excellent' | 'strong' | 'moderate' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'strong';
  return 'moderate';
}

/** Score band → gradient stroke [from, to] for the match ring. */
export function scoreGradient(score: number): [string, string] {
  if (score >= 85) return [colors.sage, colors.sageDeep];
  if (score >= 70) return [colors.gold, colors.goldDeep];
  return [colors.rose, colors.roseDeep];
}
