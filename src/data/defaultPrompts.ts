import type { AiPrompt } from '../types';

export const defaultAiPrompts: AiPrompt[] = [
  {
    id: 'prompt-profit-pulse-sales',
    promptName: 'Profit Pulse Ally Sales Offer Prompt',
    projectId: 'profit-pulse-ally',
    useCase: 'Sales Script',
    outputFormat: 'Bullet Points',
    qualityRating: 'Good',
    notes: '',
    promptText: `Act as a B2B sales strategist. Help me create a clear offer for [type of business].
Their main problem is [problem].
My service helps them by [service].
Create:
1. A one-sentence offer
2. Three package options
3. A short sales pitch
4. Five outreach messages
5. Three follow-up messages
Use a professional and direct tone.`,
  },
  {
    id: 'prompt-investment-digest',
    promptName: 'Investment News Digest Prompt',
    projectId: 'investment-news-channel',
    useCase: 'Market Analysis',
    outputFormat: 'Script',
    qualityRating: 'Good',
    notes: '',
    promptText: `Act as a market news analyst. Based on the following news/events: [paste news].
Analyze:
1. What happened
2. Why it matters
3. Which markets or sectors may be affected
4. Possible short-term market reaction
5. Possible long-term implication
6. Key risks
7. A simple explanation for beginners
8. A 60-second video script
Important: Do not give personalized financial advice. Keep the tone educational.`,
  },
  {
    id: 'prompt-mama-supreme-content',
    promptName: 'Mama Supreme Content Prompt',
    projectId: 'mama-supreme',
    useCase: 'Songwriting',
    outputFormat: 'Script',
    qualityRating: 'Good',
    notes: '',
    promptText: `Act as a supportive parenting content creator. Create content for single parents who feel tired and stressed.
Topic: [topic]
Create:
1. One warm social media post
2. One short video script
3. One children song idea
4. One parent reflection question
Tone: gentle, supportive, non-judgmental.`,
  },
  {
    id: 'prompt-eternal-moments-sponsor',
    promptName: 'Eternal Moments Sponsor Prompt',
    projectId: 'eternal-moments',
    useCase: 'Event Planning',
    outputFormat: 'Email',
    qualityRating: 'Good',
    notes: '',
    promptText: `Act as a charity sponsorship strategist. Help me create a sponsor proposal for Eternal Moments.
Mission: Let elderly people and people with lifelong disabilities become the main character for one day through makeup, styling, photography, and a fashion show.
Create:
1. Sponsor proposal outline
2. Three sponsorship tiers
3. Benefits for corporate sponsors
4. Emotional mission statement
5. Short email to potential sponsors
Tone: dignified, emotional, and professional.`,
  },
  {
    id: 'prompt-hksi-study',
    promptName: 'HKSI Study Prompt',
    projectId: 'hksi-papers',
    useCase: 'Study',
    outputFormat: 'Checklist',
    qualityRating: 'Good',
    notes: '',
    promptText: `Act as an exam study coach. I am preparing for HKSI Paper [number].
Help me create:
1. A 4-week study plan
2. Daily study tasks
3. Mock exam schedule
4. Wrong-answer review method
5. Motivation system
I can study [number] minutes per day.`,
  },
];
