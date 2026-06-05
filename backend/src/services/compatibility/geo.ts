/**
 * City → state → region lookup, used by the location & relocation scorers.
 * Covers the cities used in the seed pools (and common Indian metros).
 * Unknown cities fall back to region "OTHER".
 */

const CITY_TO_STATE: Record<string, string> = {
  Mumbai: 'Maharashtra',
  Pune: 'Maharashtra',
  Nagpur: 'Maharashtra',
  Nashik: 'Maharashtra',
  Delhi: 'Delhi',
  'New Delhi': 'Delhi',
  Gurgaon: 'Haryana',
  Gurugram: 'Haryana',
  Noida: 'Uttar Pradesh',
  Lucknow: 'Uttar Pradesh',
  Bangalore: 'Karnataka',
  Bengaluru: 'Karnataka',
  Mysore: 'Karnataka',
  Hyderabad: 'Telangana',
  Chennai: 'Tamil Nadu',
  Coimbatore: 'Tamil Nadu',
  Kolkata: 'West Bengal',
  Ahmedabad: 'Gujarat',
  Surat: 'Gujarat',
  Vadodara: 'Gujarat',
  Jaipur: 'Rajasthan',
  Udaipur: 'Rajasthan',
  Chandigarh: 'Chandigarh',
  Amritsar: 'Punjab',
  Ludhiana: 'Punjab',
  Indore: 'Madhya Pradesh',
  Bhopal: 'Madhya Pradesh',
  Kochi: 'Kerala',
  Thiruvananthapuram: 'Kerala',
  Bhubaneswar: 'Odisha',
  Guwahati: 'Assam',
  Patna: 'Bihar',
  Dehradun: 'Uttarakhand',
};

const STATE_TO_REGION: Record<string, string> = {
  Maharashtra: 'WEST',
  Gujarat: 'WEST',
  Rajasthan: 'WEST',
  Delhi: 'NORTH',
  Haryana: 'NORTH',
  'Uttar Pradesh': 'NORTH',
  Punjab: 'NORTH',
  Chandigarh: 'NORTH',
  Uttarakhand: 'NORTH',
  'Madhya Pradesh': 'CENTRAL',
  Karnataka: 'SOUTH',
  Telangana: 'SOUTH',
  'Tamil Nadu': 'SOUTH',
  Kerala: 'SOUTH',
  'West Bengal': 'EAST',
  Odisha: 'EAST',
  Bihar: 'EAST',
  Assam: 'EAST',
};

export function stateOf(city: string): string | null {
  return CITY_TO_STATE[city.trim()] ?? null;
}

export function regionOf(city: string): string {
  const state = stateOf(city);
  if (!state) return 'OTHER';
  return STATE_TO_REGION[state] ?? 'OTHER';
}

export function sameState(a: string, b: string): boolean {
  const sa = stateOf(a);
  const sb = stateOf(b);
  return sa !== null && sa === sb;
}

export function sameRegion(a: string, b: string): boolean {
  const ra = regionOf(a);
  const rb = regionOf(b);
  return ra !== 'OTHER' && ra === rb;
}
