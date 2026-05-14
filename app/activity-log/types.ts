export type ActivityCategory = 'DIALOGUE' | 'KNOWLEDGE' | 'PROJECT' | 'COMMUNITY';

export interface Activity {
  id: string;
  date: string;
  category: ActivityCategory;
  title: string;
  summary: string;
  content: string;
  hasDetail: boolean;
  tags?: string[];
}
