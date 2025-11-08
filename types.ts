
export enum Sender {
  User = 'user',
  Gemini = 'gemini',
}

export interface Message {
  id: number;
  text: string;
  sender: Sender;
  isLoading?: boolean;
}
