import type { Customer } from '@prisma/client';
import { ageFromDob } from '../compatibility/scorers';
import type { Breakdown } from '../compatibility/types';

/** Compact, fact-only profile serialization for prompts (no contact details). */
export function profileForPrompt(c: Customer): string {
  return [
    `Name: ${c.firstName}`,
    `Gender: ${c.gender}`,
    `Age: ${ageFromDob(c.dateOfBirth)}`,
    `City: ${c.city}, ${c.country}`,
    `Profession: ${c.designation} at ${c.currentCompany}`,
    `Education: ${c.degree} (${c.undergraduateCollege})`,
    `Religion: ${c.religion}${c.caste ? `, ${c.caste}` : ''}`,
    `Mother tongue: ${c.motherTongue}`,
    `Languages: ${c.languagesKnown.join(', ')}`,
    `Marital status: ${c.maritalStatus}`,
    `Family type: ${c.familyType}`,
    `Diet: ${c.dietPreference}; Smoking: ${c.smokingPreference}; Drinking: ${c.drinkingPreference}`,
    `Wants kids: ${c.wantKids}; Open to relocate: ${c.openToRelocate}; Open to pets: ${c.openToPets}`,
    `Relationship goals: ${c.relationshipGoals}`,
    `Family expectations: ${c.familyExpectations ?? 'Not specified'}`,
    `Lifestyle: ${c.lifestylePreferences.join(', ') || 'Not specified'}`,
    `Core values: ${c.coreValues.join(', ') || 'Not specified'}`,
    `Non-negotiables: ${c.nonNegotiables.join(', ') || 'None stated'}`,
  ].join('\n');
}

export const EXPLANATION_SYSTEM = `You are a senior matchmaker at The Date Crew, a premium relationship-focused matchmaking agency in India. You write warm, insightful, professional match rationales for internal use by fellow matchmakers.

Rules:
- Write 2-3 short paragraphs of natural prose (no bullet lists, no headings).
- Ground EVERY claim in the provided profile data and compatibility breakdown. Do not invent facts.
- Acknowledge genuine concerns honestly but constructively.
- Tone: warm, human, relationship-focused — never robotic or salesy.
- Do not mention numeric scores or the word "algorithm".`;

export function explanationUser(
  client: Customer,
  candidate: Customer,
  breakdown: Breakdown,
  strengths: string[],
  concerns: string[]
): string {
  return `CLIENT PROFILE:\n${profileForPrompt(client)}\n\nCANDIDATE PROFILE:\n${profileForPrompt(
    candidate
  )}\n\nCOMPATIBILITY BREAKDOWN (0-100 per dimension):\n${JSON.stringify(
    breakdown
  )}\n\nKEY STRENGTHS: ${strengths.join('; ') || 'None'}\nPOTENTIAL CONCERNS: ${
    concerns.join('; ') || 'None'
  }\n\nWrite the "Why This Match" rationale a matchmaker would share internally.`;
}

export const INTRODUCTION_SYSTEM = `You are a senior matchmaker at The Date Crew writing introduction messages a matchmaker sends to a client about a recommended match. The messages are about the CANDIDATE, addressed to the CLIENT.

Rules:
- Use only the provided profile facts. Never invent details or contact information.
- Each message is 3-5 sentences, first-person from the matchmaker.
- Relationship-focused, warm, and human. Never robotic, never a sales pitch.
- Return ONLY a JSON object with exactly these keys: "warm", "professional", "personalized".
  - warm: friendly, heartfelt, emphasizes connection and shared values.
  - professional: concise, polished agency tone, emphasizes compatibility.
  - personalized: references specific shared interests/values/lifestyle from the data.`;

export function introductionUser(client: Customer, candidate: Customer): string {
  return `CLIENT (recipient): ${client.firstName}\n${profileForPrompt(
    client
  )}\n\nCANDIDATE (the match being introduced):\n${profileForPrompt(
    candidate
  )}\n\nReturn the JSON object with the three introduction variants.`;
}

export const INSIGHTS_SYSTEM = `You are a senior matchmaker analyzing a client for internal strategy at The Date Crew, a premium matchmaking agency.

Rules:
- Base everything strictly on the provided profile, preferences, notes, and journey history. Do not fabricate.
- Be specific and practical — a colleague should be able to act on this.
- Return ONLY a JSON object with exactly these keys:
  - "personalitySummary": string (2-3 sentences)
  - "relationshipPriorities": array of 3-5 short strings
  - "potentialChallenges": array of 2-4 short strings
  - "suggestedStrategy": string (2-3 sentences of matchmaking strategy)`;

export function insightsUser(
  client: Customer,
  notes: { category: string; content: string; createdAt: Date }[],
  timeline: { type: string; description: string; createdAt: Date }[]
): string {
  const notesText = notes.length
    ? notes.map((n) => `- [${n.category}] ${n.content}`).join('\n')
    : 'No notes recorded yet.';
  const timelineText = timeline.length
    ? timeline.map((t) => `- ${t.type}: ${t.description}`).join('\n')
    : 'No journey events recorded yet.';
  return `CLIENT PROFILE:\n${profileForPrompt(
    client
  )}\n\nMATCHMAKER NOTES:\n${notesText}\n\nJOURNEY HISTORY:\n${timelineText}\n\nReturn the JSON insights object.`;
}
