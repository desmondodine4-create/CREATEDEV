import { useEffect, useMemo, useState } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useReducedMotion,
} from 'motion/react';
import {
  FEATURED_CREATOR_USERNAME,
  INITIAL_ACCOUNTS,
  type CreatorAccount,
  type DisciplineCategory,
  type VouchInvite,
  type VouchType,
} from './data/mockData';
import { pageTransitionVariants } from './utils/motion';
import { Navbar } from './components/Navbar';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { LandingScreen } from './screens/LandingScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { AuthScreen, type SignupPayload } from './screens/AuthScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ConfirmScreen } from './screens/ConfirmScreen';
import { PortfolioScreen } from './screens/PortfolioScreen';
import { CvScreen } from './screens/CvScreen';

const STORAGE_ACCOUNTS_KEY = 'creatdev_accounts_v2';
const STORAGE_SESSION_KEY = 'creatdev_session_v1';
const STORAGE_THEME_KEY = 'creatdev_theme_v2';

function loadInitialTheme(): 'light' | 'dark' {
  try {
    const saved = window.localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  } catch {
    return 'dark';
  }
}

function loadInitialAccounts(): CreatorAccount[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (!raw) return INITIAL_ACCOUNTS;
    const parsed = JSON.parse(raw) as CreatorAccount[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ACCOUNTS;
  } catch {
    return INITIAL_ACCOUNTS;
  }
}

function loadInitialSession(): string | null {
  try {
    return (
      window.sessionStorage.getItem(STORAGE_SESSION_KEY) ??
      window.localStorage.getItem(STORAGE_SESSION_KEY)
    );
  } catch {
    return null;
  }
}

function parseHashRoute(hash: string): { path: string; query: URLSearchParams } {
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
  const [rawPath, rawQuery = ''] = cleaned.split('?');
  const normalizedPath = rawPath ? (rawPath.startsWith('/') ? rawPath : `/${rawPath}`) : '/';
  return {
    path: normalizedPath,
    query: new URLSearchParams(rawQuery),
  };
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const [theme, setTheme] = useState<'light' | 'dark'>(loadInitialTheme);
  const [accounts, setAccounts] = useState<CreatorAccount[]>(loadInitialAccounts);
  const [currentUserId, setCurrentUserId] = useState<string | null>(loadInitialSession);
  const [rememberSession, setRememberSession] = useState<boolean>(() => {
    try {
      return Boolean(window.localStorage.getItem(STORAGE_SESSION_KEY));
    } catch {
      return true;
    }
  });
  const [hash, setHash] = useState<string>(() => window.location.hash || '#/');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // Ignore storage errors
    }
  }, [accounts]);

  useEffect(() => {
    try {
      if (!currentUserId) {
        window.localStorage.removeItem(STORAGE_SESSION_KEY);
        window.sessionStorage.removeItem(STORAGE_SESSION_KEY);
        return;
      }
      if (rememberSession) {
        window.localStorage.setItem(STORAGE_SESSION_KEY, currentUserId);
        window.sessionStorage.removeItem(STORAGE_SESSION_KEY);
      } else {
        window.sessionStorage.setItem(STORAGE_SESSION_KEY, currentUserId);
        window.localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [currentUserId, rememberSession]);

  const currentUser = useMemo(
    () => accounts.find((acc) => acc.id === currentUserId) ?? null,
    [accounts, currentUserId]
  );

  const featuredCreator = useMemo(
    () => accounts.find((acc) => acc.username === FEATURED_CREATOR_USERNAME) ?? accounts[0],
    [accounts]
  );

  const { path, query } = useMemo(() => parseHashRoute(hash), [hash]);

  function navigateTo(nextHash: string) {
    window.location.hash = nextHash;
  }

  function handleToggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function handleSignup(payload: SignupPayload) {
    const newAccount: CreatorAccount = {
      id: generateId('creator'),
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email,
      password: payload.password,
      headline: '',
      bio: '',
      location: payload.location,
      availability: '',
      discipline: payload.discipline,
      projects: [],
      invites: [],
    };
    setAccounts((prev) => [...prev, newAccount]);
    setRememberSession(payload.rememberMe);
    setCurrentUserId(newAccount.id);
    navigateTo('#/dashboard');
  }

  function handleLogin(
    identifier: string,
    password: string,
    rememberMe: boolean
  ): string | null {
    const lower = identifier.toLowerCase();
    const match = accounts.find(
      (acc) => acc.email.toLowerCase() === lower || acc.username.toLowerCase() === lower
    );
    if (!match) {
      return 'No account matches that email or username. Check for typos or switch to Create account.';
    }
    if (match.password !== password) {
      return 'That password is incorrect. Try again or use Reset password above.';
    }
    setRememberSession(rememberMe);
    setCurrentUserId(match.id);
    navigateTo('#/dashboard');
    return null;
  }

  function handleResetPassword(email: string, newPassword: string): string | null {
    const match = accounts.find((acc) => acc.email.toLowerCase() === email.toLowerCase());
    if (!match) {
      return 'No CREATDEV account uses that email address. Double-check or create a new account.';
    }
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === match.id ? { ...acc, password: newPassword } : acc))
    );
    return null;
  }

  function handleLogout() {
    setCurrentUserId(null);
    navigateTo('#/auth?mode=login');
  }

  function handleUpdateProfile(
    headline: string,
    bio: string,
    location: string,
    availability: string,
    discipline: DisciplineCategory,
    avatarUrl?: string
  ) {
    if (!currentUserId) return;
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentUserId
          ? { ...acc, headline, bio, location, availability, discipline, avatarUrl }
          : acc
      )
    );
  }

  function handleAddProject(projectInput: {
    title: string;
    role: string;
    tools: string[];
    story: string;
    link: string;
    coverImage?: string;
  }) {
    if (!currentUserId) return;
    const newProject = {
      id: generateId('proj'),
      ...projectInput,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentUserId
          ? { ...acc, projects: [newProject, ...acc.projects] }
          : acc
      )
    );
  }

  function handleEditProject(
    projectId: string,
    updated: {
      title: string;
      role: string;
      tools: string[];
      story: string;
      link: string;
      coverImage?: string;
    }
  ) {
    if (!currentUserId) return;
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentUserId
          ? {
              ...acc,
              projects: acc.projects.map((p) =>
                p.id === projectId ? { ...p, ...updated } : p
              ),
            }
          : acc
      )
    );
  }

  function handleDeleteProject(projectId: string) {
    if (!currentUserId) return;
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentUserId
          ? {
              ...acc,
              projects: acc.projects.filter((p) => p.id !== projectId),
              invites: acc.invites.filter((i) => i.projectId !== projectId),
            }
          : acc
      )
    );
  }

  function handleCreateInvite(
    projectId: string,
    inviteeName: string,
    type: VouchType
  ): VouchInvite {
    const invite: VouchInvite = {
      id: generateId('vouch'),
      projectId,
      creatorUsername: currentUser?.username ?? '',
      inviteeName,
      type,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    if (currentUserId) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === currentUserId
            ? { ...acc, invites: [invite, ...acc.invites] }
            : acc
        )
      );
    }

    return invite;
  }

  function handleRevokeInvite(inviteId: string) {
    if (!currentUserId) return;
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentUserId
          ? {
              ...acc,
              invites: acc.invites.filter((inv) => inv.id !== inviteId),
            }
          : acc
      )
    );
  }

  function handleRespondToInvite(
    inviteId: string,
    decision: 'confirmed' | 'declined',
    rating?: number,
    testimonial?: string
  ) {
    const today = new Date().toISOString().slice(0, 10);
    setAccounts((prev) =>
      prev.map((acc) => {
        const hasInvite = acc.invites.some((inv) => inv.id === inviteId);
        if (!hasInvite) return acc;

        return {
          ...acc,
          invites: acc.invites.map((inv) =>
            inv.id === inviteId
              ? {
                  ...inv,
                  status: decision,
                  rating: decision === 'confirmed' ? rating : undefined,
                  testimonial: decision === 'confirmed' ? testimonial : undefined,
                  respondedAt: today,
                }
              : inv
          ),
        };
      })
    );
  }

  const confirmMatch = path.match(/^\/confirm\/([^/]+)$/);
  const cvMatch = path.match(/^\/u\/([^/]+)\/cv$/);
  const portfolioMatch = path.match(/^\/u\/([^/]+)$/);

  let screenNode: React.ReactNode;
  let routeKey = path;

  if (path === '/home' || (path === '/' && !currentUser)) {
    routeKey = '/home';
    screenNode = <LandingScreen featuredCreator={featuredCreator} currentUser={currentUser} />;
  } else if (path === '/explore') {
    screenNode = <ExploreScreen accounts={accounts} />;
  } else if (path === '/auth') {
    const rawMode = query.get('mode');
    const mode =
      rawMode === 'login' ? 'login' : rawMode === 'reset' ? 'reset' : 'signup';
    routeKey = '/auth';
    screenNode = (
      <AuthScreen
        initialMode={mode}
        featuredCreator={featuredCreator}
        existingUsernames={accounts.map((a) => a.username.toLowerCase())}
        existingEmails={accounts.map((a) => a.email.toLowerCase())}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSignup={handleSignup}
        onLogin={handleLogin}
        onResetPassword={handleResetPassword}
      />
    );
  } else if (path === '/dashboard' || (path === '/' && currentUser)) {
    routeKey = '/dashboard';
    screenNode = (
      <DashboardScreen
        key={currentUser?.id ?? 'guest'}
        user={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onAddProject={handleAddProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onCreateInvite={handleCreateInvite}
        onRevokeInvite={handleRevokeInvite}
      />
    );
  } else if (confirmMatch) {
    const inviteId = decodeURIComponent(confirmMatch[1]);
    let foundInvite: VouchInvite | null = null;
    let foundCreator: CreatorAccount | null = null;
    let foundProject = null;

    for (const acc of accounts) {
      const inv = acc.invites.find((i) => i.id === inviteId);
      if (inv) {
        foundInvite = inv;
        foundCreator = acc;
        foundProject = acc.projects.find((p) => p.id === inv.projectId) ?? null;
        break;
      }
    }

    screenNode = (
      <ConfirmScreen
        invite={foundInvite}
        creator={foundCreator}
        project={foundProject}
        onRespond={handleRespondToInvite}
      />
    );
  } else if (cvMatch) {
    const username = decodeURIComponent(cvMatch[1]).toLowerCase();
    const creator = accounts.find((a) => a.username.toLowerCase() === username) ?? null;
    screenNode = <CvScreen creator={creator} />;
  } else if (portfolioMatch) {
    const username = decodeURIComponent(portfolioMatch[1]).toLowerCase();
    const creator = accounts.find((a) => a.username.toLowerCase() === username) ?? null;
    const isOwner = Boolean(currentUser && creator && currentUser.id === creator.id);
    screenNode = <PortfolioScreen creator={creator} isOwner={isOwner} />;
  } else {
    routeKey = '/home';
    screenNode = <LandingScreen featuredCreator={featuredCreator} currentUser={currentUser} />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="creatdev-root">
        <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-main)] transition-colors duration-200">
          <Navbar
            currentUser={currentUser}
            currentRoute={path}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onLogout={handleLogout}
          />

          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={routeKey}
                variants={prefersReducedMotion ? undefined : pageTransitionVariants}
                initial={prefersReducedMotion ? false : 'initial'}
                animate="animate"
                exit={prefersReducedMotion ? undefined : 'exit'}
              >
                {screenNode}
              </motion.div>
            </AnimatePresence>
          </main>
          <PWAInstallPrompt />
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
