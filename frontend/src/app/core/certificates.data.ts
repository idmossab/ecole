export type Course = {
  id: string;
  title: string;
  durationMinutes: number;
  videoCount: number;
};

export type Certificate = {
  id: string;
  title: string;
  description: string;
  courses: Course[];
};

export const certificates: Certificate[] = [
  {
    id: 'software-development',
    title: 'Software Development',
    description:
      'Build modern applications with clean architecture, testing, and best practices for professional delivery.',
    courses: [
      {
        id: 'software-engineering-fundamentals',
        title: 'Software Engineering Fundamentals',
        durationMinutes: 0,
        videoCount: 0
      },
      {
        id: 'web-development-basics',
        title: 'Web Development Basics',
        durationMinutes: 0,
        videoCount: 0
      }
    ]
  },
  {
    id: 'networking',
    title: 'Networking',
    description:
      'Learn routing, switching, and network security foundations used across modern infrastructure.',
    courses: [
      {
        id: 'networking-basics',
        title: 'Networking Basics',
        durationMinutes: 0,
        videoCount: 0
      }
    ]
  },
  {
    id: 'english-language',
    title: 'English Language',
    description:
      'Strengthen grammar, vocabulary, and communication for academic and professional settings.',
    courses: [
      {
        id: 'english-a1',
        title: 'English A1',
        durationMinutes: 0,
        videoCount: 0
      },
      {
        id: 'english-a2',
        title: 'English A2',
        durationMinutes: 0,
        videoCount: 0
      },
      {
        id: 'english-b1',
        title: 'English B1',
        durationMinutes: 0,
        videoCount: 0
      },
      {
        id: 'english-b2',
        title: 'English B2',
        durationMinutes: 0,
        videoCount: 0
      }
    ]
  }
];
