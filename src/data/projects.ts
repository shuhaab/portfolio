export interface Project {
  id: string;
  title: string;
  dateLabel: string;
  summary: string;
  contributions: string[];
  technologies: string[];
}

export const projects: Project[] = [
  {
    id: 'apu-careerhub',
    title: 'APU CareerHub',
    dateLabel: 'June–September 2026',
    summary: 'Full-stack campus employment portal for students, university departments, and administrators.',
    contributions: [
      'Role-based dashboards, job posting and approval, applications, documents, and application-status tracking.',
      'Firebase Authentication, Firestore, and Cloud Storage with server-side authorization, ownership checks, and administrative audit logging.',
      '213 functional test cases and user acceptance testing across roles. Developed using Agile/Scrum.',
    ],
    technologies: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'Firebase'],
  },
  {
    id: 'disaster-relief',
    title: 'Disaster Relief Logistics Management System',
    dateLabel: 'June 2025',
    summary: 'C++ console application for supply dispatch, volunteer deployment, emergency request prioritisation, and vehicle scheduling.',
    contributions: [
      'Stack and queue structures manage supplies, volunteers, and vehicle rotation.',
      'A priority queue orders urgent requests while preserving arrival order for equal priorities.',
      'Input validation, capacity checks, and tabular summaries support reliable use.',
    ],
    technologies: ['C++', 'Object-oriented programming', 'Linked lists', 'Stacks', 'Queues'],
  },
  {
    id: 'food-ordering',
    title: 'Food Ordering and Delivery Management System',
    dateLabel: 'April 2025',
    summary: 'Desktop food ordering application with separate workflows for customers, vendors, delivery runners, administrators, and managers.',
    contributions: [
      'Menu browsing, cart, orders, order history, and reviews.',
      'User management, credit top-up approvals, delivery tasks, revenue reports, and complaints.',
      'Controllers and shared data classes with JSON file persistence.',
    ],
    technologies: ['Java', 'JavaFX', 'FXML', 'CSS', 'Maven', 'JSON'],
  },
  {
    id: 'scenequest',
    title: 'SceneQuest',
    dateLabel: 'December 2024',
    summary: 'Movie and TV recommendation platform with personalised suggestions and a three-title shortlist.',
    contributions: [
      'TMDB integration and filters for genre, provider, rating, release year, language, runtime, and media type.',
      'Browser storage for watchlists, viewing history, and preferences without authentication.',
    ],
    technologies: ['Python', 'Flask', 'JavaScript', 'TMDB REST API'],
  },
];
