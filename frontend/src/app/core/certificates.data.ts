export type Course = {
  id: number;
  title: string;
  content?: string | null;
};

export type Certificate = {
  id: number;
  title: string;
  description?: string | null;
  courses?: Course[];
};
