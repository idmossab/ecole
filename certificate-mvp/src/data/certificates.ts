export type Certificate = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: 'Open to everyone' | 'Closed';
  courses: Array<{ id: string; title: string; videos: string[] }>;
};

export const certificates: Certificate[] = [
  {
    id: 'software-development',
    title: 'Software Development',
    subtitle: 'Build modern applications with clean architecture.',
    description:
      'Learn core programming concepts, modern frameworks, and best practices for delivering production-ready software.',
    status: 'Open to everyone',
    courses: []
  },
  {
    id: 'networking',
    title: 'Networking',
    subtitle: 'Design and secure reliable network systems.',
    description:
      'Explore routing, switching, network security, and infrastructure fundamentals used across the industry.',
    status: 'Open to everyone',
    courses: []
  },
  {
    id: 'english-language',
    title: 'English Language',
    subtitle: 'Boost your academic and professional English.',
    description:
      'Strengthen grammar, vocabulary, and communication skills for global careers and higher education.',
    status: 'Open to everyone',
    courses: []
  }
];
