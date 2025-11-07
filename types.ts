export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface FillInTheBlankQuestion {
  question: string; // e.g., "The powerhouse of the cell is the ____."
  answer: string;   // e.g., "mitochondria"
}

export interface StudyContent {
  notes: string[];
  questions: Question[];
  fillInTheBlankQuestions: FillInTheBlankQuestion[];
}

export interface GameResult {
  score: number;
  date: string;
}
