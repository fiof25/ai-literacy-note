export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Sticky {
  id: string;
  authorName: string;
  profession: string;
  industry: string;
  region: string;
  useCase: string;
  experience: string;
  aiType: 'generative' | 'predictive' | 'automation' | 'conversational' | 'unsure';
  aiRealness: 'using' | 'possible' | 'imagined';
  sentiment: -2 | -1 | 0 | 1 | 2;
  painPoints: string;
  extraThoughts: string;
  color: string;
  rotation: number;
  comments: Comment[];
  createdAt: string;
}

export interface DB {
  stickies: Sticky[];
}

export type SentimentValue = -2 | -1 | 0 | 1 | 2;
