export type Course = {
  id: number;
  certificateId?: number | null;
  title: string;
  content?: string | null;
  whatYouWillLearn?: string | null;
};

export type Certificate = {
  id: number;
  title: string;
  description?: string | null;
  courses?: Course[];
};
