export type CourseMode = 'ONLINE' | 'IN_PERSON' | 'HYBRID';

export type Course = {
  id: number;
  certificateId?: number | null;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  mode?: CourseMode;
  teacherName?: string | null;
  teacherBio?: string | null;
  durationText?: string | null;
  phoneContact?: string | null;
  isPublished?: boolean;
};

export type Certificate = {
  id: number;
  title: string;
  description?: string | null;
  isPublished?: boolean;
  courses?: Course[];
};
