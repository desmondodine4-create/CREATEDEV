export type VouchType = 'collaborator' | 'client';
export type VouchStatus = 'pending' | 'confirmed' | 'declined';
export type DisciplineCategory = 'Brand & Commerce' | 'Design' | 'Engineering' | 'Motion & Content';

export const DISCIPLINE_OPTIONS: DisciplineCategory[] = [
  'Brand & Commerce',
  'Design',
  'Engineering',
  'Motion & Content',
];

export interface VouchInvite {
  id: string;
  projectId: string;
  creatorUsername: string;
  inviteeName: string;
  type: VouchType;
  status: VouchStatus;
  rating?: number;
  testimonial?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  role: string;
  tools: string[];
  story: string;
  link: string;
  coverImage?: string;
  createdAt: string;
}

export interface CreatorAccount {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  headline: string;
  bio: string;
  location: string;
  availability?: string;
  discipline?: DisciplineCategory;
  avatarUrl?: string;
  projects: Project[];
  invites: VouchInvite[];
}

export const FEATURED_CREATOR_USERNAME = 'chidi-okeke';

export const HERO_STUDIO_IMAGE = '/src/assets/images/creatdev_hero_studio_1795000151920.jpg';

export const PROJECT_COVER_PRESETS = [
  {
    label: 'Geometric studio plate',
    value: '',
  },
  {
    label: 'Brand packaging & commerce studio',
    value: '/src/assets/images/project_bakery_rebrand_1795000152931.jpg',
  },
  {
    label: 'Design system & mobile UI desk',
    value: '/src/assets/images/project_design_system_1795000153690.jpg',
  },
  {
    label: 'Creative & engineering collaboration',
    value: '/src/assets/images/creatdev_hero_studio_1795000151920.jpg',
  },
];

export const INITIAL_ACCOUNTS: CreatorAccount[] = [
  {
    id: 'creator-chidi-1',
    fullName: 'Chidi Okeke',
    username: 'chidi-okeke',
    email: 'chidi@creatdev.ng',
    password: 'password123',
    headline: 'Brand designer and web developer',
    bio: 'I design crisp brand systems and build fast online storefronts for food, retail, and fintech teams across Lagos, Accra, and remote teams abroad.',
    location: 'Lagos, Nigeria',
    availability: 'Available for Q4 projects',
    discipline: 'Brand & Commerce',
    avatarUrl: '/src/assets/images/creator_chidi_avatar_1795000152151.jpg',
    projects: [
      {
        id: 'proj-bakery-1',
        title: 'Bakery rebrand and online store',
        role: 'Lead designer and developer',
        tools: ['Figma', 'PHP', 'MySQL'],
        story:
          'Refreshed the visual identity, packaging labels, and built a mobile-first cake ordering storefront with Paystack checkout and daily bake-slot tracking.',
        link: 'https://sweetcrumbs.ng',
        coverImage: '/src/assets/images/project_bakery_rebrand_1795000152931.jpg',
        createdAt: '2026-09-14',
      },
    ],
    invites: [
      {
        id: 'vouch-ngozi-1',
        projectId: 'proj-bakery-1',
        creatorUsername: 'chidi-okeke',
        inviteeName: 'Ngozi A.',
        type: 'collaborator',
        status: 'confirmed',
        createdAt: '2026-09-18',
        respondedAt: '2026-09-19',
      },
      {
        id: 'vouch-sweetcrumbs-2',
        projectId: 'proj-bakery-1',
        creatorUsername: 'chidi-okeke',
        inviteeName: 'Sweet Crumbs Ltd',
        type: 'client',
        status: 'confirmed',
        rating: 5,
        testimonial: 'Delivered on time and the shop looks great.',
        createdAt: '2026-09-20',
        respondedAt: '2026-09-21',
      },
    ],
  },
  {
    id: 'creator-tomiwa-2',
    fullName: 'Tomiwa Adeyemi',
    username: 'tomiwa-adeyemi',
    email: 'tomiwa@creatdev.ng',
    password: 'password123',
    headline: 'Product designer and frontend engineer',
    bio: 'Building accessible banking interfaces, multi-brand design systems, and crisp React web apps for African fintech and SaaS startups.',
    location: 'Abuja, Nigeria',
    availability: 'Open for remote roles',
    discipline: 'Design',
    projects: [
      {
        id: 'proj-aura-system-1',
        title: 'Aura mobile banking design system',
        role: 'Design systems lead',
        tools: ['Figma', 'React', 'TypeScript'],
        story:
          'Unified 42 mobile screens and web merchant tools into one documented token system, cutting engineering handoff revisions in half.',
        link: 'https://aurafinance.example.ng',
        coverImage: '/src/assets/images/project_design_system_1795000153690.jpg',
        createdAt: '2026-08-22',
      },
    ],
    invites: [
      {
        id: 'vouch-damilola-1',
        projectId: 'proj-aura-system-1',
        creatorUsername: 'tomiwa-adeyemi',
        inviteeName: 'Damilola K.',
        type: 'collaborator',
        status: 'confirmed',
        createdAt: '2026-08-28',
        respondedAt: '2026-08-29',
      },
      {
        id: 'vouch-paybridge-2',
        projectId: 'proj-aura-system-1',
        creatorUsername: 'tomiwa-adeyemi',
        inviteeName: 'PayBridge Africa',
        type: 'client',
        status: 'confirmed',
        rating: 5,
        testimonial: 'Clean component library that cut our engineering handoff time in half.',
        createdAt: '2026-09-02',
        respondedAt: '2026-09-03',
      },
    ],
  },
  {
    id: 'creator-kwame-3',
    fullName: 'Kwame Boateng',
    username: 'kwame-boateng',
    email: 'kwame@creatdev.africa',
    password: 'password123',
    headline: 'Full-stack TypeScript engineer',
    bio: 'Architecting payment APIs, offline-first merchant dashboards, and high-throughput checkout experiences for West African commerce.',
    location: 'Accra, Ghana',
    availability: 'Open for advisory & builds',
    discipline: 'Engineering',
    projects: [
      {
        id: 'proj-cedipay-1',
        title: 'CediPay merchant settlement portal',
        role: 'Lead backend & frontend engineer',
        tools: ['TypeScript', 'Node.js', 'PostgreSQL'],
        story:
          'Engineered real-time payout reconciliation and automated invoice exports serving 380 retail merchants across Accra and Kumasi.',
        link: 'https://cedipay.example.gh',
        createdAt: '2026-07-11',
      },
    ],
    invites: [
      {
        id: 'vouch-efua-1',
        projectId: 'proj-cedipay-1',
        creatorUsername: 'kwame-boateng',
        inviteeName: 'Efua M.',
        type: 'collaborator',
        status: 'confirmed',
        createdAt: '2026-07-15',
        respondedAt: '2026-07-16',
      },
      {
        id: 'vouch-kofi-retail-2',
        projectId: 'proj-cedipay-1',
        creatorUsername: 'kwame-boateng',
        inviteeName: 'Accra Fresh Market',
        type: 'client',
        status: 'confirmed',
        rating: 5,
        testimonial: 'Zero downtime during peak weekend orders and crystal-clear reporting.',
        createdAt: '2026-07-19',
        respondedAt: '2026-07-20',
      },
    ],
  },
];
