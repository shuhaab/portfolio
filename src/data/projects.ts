export interface ProjectLink {
  label: 'Code' | 'Live demo';
  href: string;
}

export interface Project {
  id: string;
  title: string;
  dateLabel: string;
  /** Who built it and in what setting, e.g. "Solo project". */
  context: string;
  summary: string;
  contributions: string[];
  technologies: string[];
  links: ProjectLink[];
  /** Shown instead of links when there is nothing public to link to. */
  note?: string;
}

// Newest first.
export const projects: Project[] = [
  {
    id: 'filehush',
    title: 'FileHush',
    dateLabel: 'October 2026',
    context: 'Solo open-source project (MIT)',
    summary: 'Browser-based converter for images, PDFs, documents, and structured data. Files are converted on the user’s device, with no account or upload.',
    contributions: [
      'Six tools: JPG/PNG/WebP conversion, images to PDF, PDF to images, CSV ↔ JSON, DOCX to PDF through browser printing, and simple PDF to DOCX.',
      'Privacy by design: no upload or server-side conversion endpoint, no stored file history, and conversion libraries, workers, and fonts bundled with the site.',
      'Explicit input and output limits, with unsupported content rejected instead of producing partial output.',
    ],
    technologies: ['JavaScript', 'PDF.js', 'pdf-lib', 'docx', 'Papa Parse', 'esbuild'],
    links: [
      { label: 'Code', href: 'https://github.com/shuhaab/filehush' },
      { label: 'Live demo', href: 'https://filehush-wine.vercel.app' },
    ],
  },
  {
    id: 'apu-careerhub',
    title: 'APU CareerHub',
    dateLabel: 'June–September 2026',
    context: 'Solo project',
    summary: 'Full-stack campus employment portal for students, university departments, and administrators.',
    contributions: [
      'Role-based dashboards, job posting and approval, applications, documents, and application-status tracking.',
      'Firebase Authentication, Firestore, and Cloud Storage with server-side authorization, ownership checks, and administrative audit logging.',
      '213 functional test cases and user acceptance testing across roles. Developed using Agile/Scrum.',
    ],
    technologies: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'Firebase'],
    links: [{ label: 'Code', href: 'https://github.com/shuhaab/APU-CareerHub' }],
  },
  {
    id: 'disaster-relief',
    title: 'Disaster Relief Logistics Management System',
    dateLabel: 'June 2025',
    context: 'Solo project',
    summary: 'C++ console application for supply dispatch, volunteer deployment, emergency request prioritisation, and vehicle scheduling.',
    contributions: [
      'Stack and queue structures manage supplies, volunteers, and vehicle rotation.',
      'A priority queue orders urgent requests while preserving arrival order for equal priorities.',
      'Input validation, capacity checks, and tabular summaries support reliable use.',
    ],
    technologies: ['C++'],
    links: [],
    note: 'Source code is not public.',
  },
  {
    id: 'food-ordering',
    title: 'Food Ordering and Delivery Management System',
    dateLabel: 'April 2025',
    context: 'Solo university assignment',
    summary: 'Desktop food ordering application with separate workflows for customers, vendors, delivery runners, administrators, and managers.',
    contributions: [
      'Menu browsing, cart, orders, order history, and reviews.',
      'User management, credit top-up approvals, delivery tasks, revenue reports, and complaints.',
      'Controllers and shared data classes with JSON file persistence.',
    ],
    technologies: ['Java', 'JavaFX', 'FXML', 'CSS', 'Maven', 'JSON'],
    links: [{ label: 'Code', href: 'https://github.com/shuhaab/food-delivery-app' }],
  },
  {
    id: 'scenequest',
    title: 'SceneQuest',
    dateLabel: 'December 2024',
    context: 'Solo personal project',
    summary: 'Movie and TV recommendation platform with personalised suggestions and a three-title shortlist.',
    contributions: [
      'TMDB integration and filters for genre, provider, rating, release year, language, runtime, and media type.',
      'Browser storage for watchlists, viewing history, and preferences without authentication.',
    ],
    technologies: ['Python', 'Flask', 'JavaScript', 'TMDB REST API'],
    links: [
      { label: 'Code', href: 'https://github.com/shuhaab/SceneQuest-Movie-and-TV-Recommendation-Platform' },
      { label: 'Live demo', href: 'https://scene-quest.vercel.app' },
    ],
  },
];
