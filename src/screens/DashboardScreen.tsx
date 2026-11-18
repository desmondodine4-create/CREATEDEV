import { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import {
  DISCIPLINE_OPTIONS,
  PROJECT_COVER_PRESETS,
  type CreatorAccount,
  type DisciplineCategory,
  type Project,
  type VouchInvite,
  type VouchType,
} from '../data/mockData';
import { sanitizeText, sanitizeUrl } from '../utils/sanitize';
import { InviteForm } from '../components/InviteForm';
import { EmptyStateIllustration } from '../components/EmptyStateIllustration';

interface DashboardScreenProps {
  user: CreatorAccount | null;
  onUpdateProfile: (
    headline: string,
    bio: string,
    location: string,
    availability: string,
    discipline: DisciplineCategory,
    avatarUrl?: string
  ) => void;
  onAddProject: (project: {
    title: string;
    role: string;
    tools: string[];
    story: string;
    link: string;
    coverImage?: string;
  }) => void;
  onEditProject: (
    projectId: string,
    updated: {
      title: string;
      role: string;
      tools: string[];
      story: string;
      link: string;
      coverImage?: string;
    }
  ) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateInvite: (projectId: string, inviteeName: string, type: VouchType) => VouchInvite;
  onRevokeInvite: (inviteId: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function DashboardScreen({
  user,
  onUpdateProfile,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onCreateInvite,
  onRevokeInvite,
}: DashboardScreenProps) {
  const prefersReducedMotion = useReducedMotion();

  const [headline, setHeadline] = useState(user?.headline ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [availability, setAvailability] = useState(user?.availability ?? '');
  const [discipline, setDiscipline] = useState<DisciplineCategory>(
    user?.discipline ?? 'Design'
  );
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl ?? '');
  const [avatarError, setAvatarError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [toolsText, setToolsText] = useState('');
  const [story, setStory] = useState('');
  const [link, setLink] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [projectErrors, setProjectErrors] = useState<Record<string, string>>({});
  const [projectAddedNote, setProjectAddedNote] = useState(false);

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editToolsText, setEditToolsText] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [copiedPortfolio, setCopiedPortfolio] = useState(false);

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <EmptyStateIllustration variant="portfolio" />
        <h1 className="font-display text-3xl font-bold text-[var(--text-main)]">
          Sign in to open your dashboard
        </h1>
        <p className="mx-auto mt-3 text-base text-[var(--text-muted)]">
          Create a portfolio account or log in to add projects and send vouch invites.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href="#/auth?mode=signup"
            className="inline-flex min-h-[46px] items-center rounded-xl bg-[var(--btn-cobalt)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] transition-colors"
          >
            Create your portfolio
          </a>
          <a
            href="#/auth?mode=login"
            className="inline-flex min-h-[46px] items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)]"
          >
            Log in
          </a>
        </div>
      </section>
    );
  }

  const confirmedCount = user.invites.filter((i) => i.status === 'confirmed').length;
  const pendingCount = user.invites.filter((i) => i.status === 'pending').length;

  const milestones = [
    {
      id: 'profile',
      label: 'Headline & short bio saved',
      done: Boolean(user.headline.trim().length >= 3 && user.bio.trim().length >= 10),
    },
    {
      id: 'project',
      label: 'First shipped project added',
      done: user.projects.length > 0,
    },
    {
      id: 'vouch',
      label: 'First vouch confirmed',
      done: confirmedCount > 0,
    },
  ];
  const completedMilestones = milestones.filter((m) => m.done).length;
  const progressRatio = completedMilestones / milestones.length;

  function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Select a PNG, JPG, or WebP portrait image.');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setAvatarError('Choose an image smaller than 1.5 MB so your portfolio loads quickly.');
      return;
    }
    setAvatarError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    const cleanHeadline = sanitizeText(headline, 120);
    const cleanBio = sanitizeText(bio, 600);
    const cleanLocation = sanitizeText(location, 80);
    const cleanAvailability = sanitizeText(availability, 80);

    if (cleanHeadline.length < 3) {
      setProfileError(
        'Add a short headline describing what you do, like "UI designer and frontend developer".'
      );
      return;
    }

    setProfileError('');
    onUpdateProfile(
      cleanHeadline,
      cleanBio,
      cleanLocation,
      cleanAvailability,
      discipline,
      avatarUrl || undefined
    );
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2500);
  }

  function handleAddProjectSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    const cleanTitle = sanitizeText(title, 120);
    const cleanRole = sanitizeText(role, 100);
    const cleanStory = sanitizeText(story, 600);
    const parsedTools = toolsText
      .split(',')
      .map((item) => sanitizeText(item, 40))
      .filter(Boolean);

    if (cleanTitle.length < 2) {
      nextErrors.title = 'Give your project a clear title, like "Fintech landing page".';
    }
    if (cleanRole.length < 2) {
      nextErrors.role = 'State your role on the project, like "Lead video editor".';
    }
    if (cleanStory.length < 10) {
      nextErrors.story = 'Write at least one sentence about what you built or delivered.';
    }

    let cleanLink = '';
    if (link.trim()) {
      cleanLink = sanitizeUrl(link);
      if (!cleanLink) {
        nextErrors.link =
          'Enter a valid web link starting with https://, or leave this field blank.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setProjectErrors(nextErrors);
      return;
    }

    setProjectErrors({});
    onAddProject({
      title: cleanTitle,
      role: cleanRole,
      tools: parsedTools,
      story: cleanStory,
      link: cleanLink,
      coverImage: coverImage || undefined,
    });

    setTitle('');
    setRole('');
    setToolsText('');
    setStory('');
    setLink('');
    setCoverImage('');
    setProjectAddedNote(true);
    window.setTimeout(() => setProjectAddedNote(false), 3000);
  }

  function startEditingProject(project: Project) {
    setEditingProjectId(project.id);
    setEditTitle(project.title);
    setEditRole(project.role);
    setEditToolsText(project.tools.join(', '));
    setEditStory(project.story);
    setEditLink(project.link);
    setEditCoverImage(project.coverImage ?? '');
    setEditErrors({});
  }

  function handleEditProjectSubmit(e: FormEvent, projectId: string) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    const cleanTitle = sanitizeText(editTitle, 120);
    const cleanRole = sanitizeText(editRole, 100);
    const cleanStory = sanitizeText(editStory, 600);
    const parsedTools = editToolsText
      .split(',')
      .map((item) => sanitizeText(item, 40))
      .filter(Boolean);

    if (cleanTitle.length < 2) {
      nextErrors.title = 'Give your project a clear title before saving.';
    }
    if (cleanRole.length < 2) {
      nextErrors.role = 'State your role on this project.';
    }
    if (cleanStory.length < 10) {
      nextErrors.story = 'Write at least one sentence describing the work delivered.';
    }

    let cleanLink = '';
    if (editLink.trim()) {
      cleanLink = sanitizeUrl(editLink);
      if (!cleanLink) {
        nextErrors.link = 'Enter a valid web link starting with https://, or leave it blank.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setEditErrors(nextErrors);
      return;
    }

    setEditErrors({});
    onEditProject(projectId, {
      title: cleanTitle,
      role: cleanRole,
      tools: parsedTools,
      story: cleanStory,
      link: cleanLink,
      coverImage: editCoverImage || undefined,
    });
    setEditingProjectId(null);
  }

  async function copyPortfolioUrl() {
    if (!user) return;
    const base = window.location.href.split('#')[0];
    const url = `${base}#/u/${user.username}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard fallback ignored cleanly
    }
    setCopiedPortfolio(true);
    window.setTimeout(() => setCopiedPortfolio(false), 2000);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Studio header */}
      <div className="flex flex-col gap-5 border-b border-[var(--border-line)] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--accent-cobalt)]">
            CREATDEV studio dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[var(--text-main)] sm:text-4xl">
            {sanitizeText(user.fullName, 80)}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-muted)] tabular-nums">
            <span>Public link: #/u/{user.username}</span>
            <span aria-hidden="true">·</span>
            <span>
              {user.projects.length} {user.projects.length === 1 ? 'project' : 'projects'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {confirmedCount} confirmed {confirmedCount === 1 ? 'vouch' : 'vouches'}
            </span>
            {pendingCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{pendingCount} pending</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={copyPortfolioUrl}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)] hover:text-[var(--accent-cobalt)] transition-colors whitespace-nowrap cursor-pointer"
          >
            {copiedPortfolio ? (
              <>
                <Check className="h-4 w-4 text-[var(--accent-cobalt)]" aria-hidden="true" />
                <span>Link copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Copy portfolio link</span>
              </>
            )}
          </button>

          <a
            href={`#/u/${user.username}/cv`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)] hover:text-[var(--accent-cobalt)] transition-colors whitespace-nowrap"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>View CV</span>
          </a>

          <a
            href={`#/u/${user.username}`}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[var(--btn-ink)] px-4 py-2 text-sm font-semibold text-[var(--btn-ink-text)] hover:bg-[var(--btn-cobalt)] hover:text-white transition-colors whitespace-nowrap"
          >
            <span>Open public portfolio</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Progressive onboarding momentum bar */}
      <div className="mt-6 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-bold text-[var(--text-main)]">
              Studio readiness: {completedMilestones} of {milestones.length} complete
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {completedMilestones === milestones.length
                ? 'Your portfolio is live with verified proof and ready to share with clients.'
                : 'Complete all three steps to launch a client-ready portfolio and print CV.'}
            </p>
          </div>
          <span className="text-sm font-bold text-[var(--accent-cobalt)] tabular-nums">
            {Math.round(progressRatio * 100)}%
          </span>
        </div>

        <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
          <motion.div
            initial={prefersReducedMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: progressRatio }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
            className={`h-full w-full ${
              completedMilestones === milestones.length ? 'bg-[#7fd0a5]' : 'bg-[#2f3bd9]'
            }`}
          />
        </div>

        <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {milestones.map((step) => (
            <li
              key={step.id}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                step.done
                  ? 'border-[#7fd0a5] bg-[#c9f2dc] text-[#14163a]'
                  : 'border-[var(--border-line)] bg-[var(--bg-subtle)] text-[var(--text-muted)]'
              }`}
            >
              <CheckCircle2
                className={`h-4 w-4 shrink-0 ${
                  step.done ? 'text-[#14163a]' : 'text-[var(--text-muted)]/40'
                }`}
                aria-hidden="true"
              />
              <span>{step.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main workspace grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left column */}
        <div className="space-y-8 lg:col-span-5">
          {/* Profile form */}
          <form
            onSubmit={handleSaveProfile}
            className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 sm:p-6"
            noValidate
          >
            <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
              Your profile
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Shown on your public portfolio, directory listing, and printed CV.
            </p>

            {/* Portrait upload */}
            <div className="mt-5 flex items-center gap-4 rounded-xl border border-[var(--border-line)] bg-[var(--bg-subtle)] p-3.5">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${sanitizeText(user.fullName, 80)} portrait`}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 shrink-0 rounded-xl object-cover border border-[var(--border-line)]"
                />
              ) : (
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#2f3bd9] font-display text-lg font-bold text-white"
                  aria-hidden="true"
                >
                  {getInitials(user.fullName)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--text-main)]">Studio portrait</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <label className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)] cursor-pointer">
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{avatarUrl ? 'Replace photo' : 'Upload photo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarUpload}
                      className="sr-only"
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl('');
                        setAvatarError('');
                      }}
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--danger)] cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                {avatarError && (
                  <p role="alert" className="mt-1 text-xs font-medium text-[var(--danger)]">
                    {avatarError}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="profile-headline"
                  className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                >
                  Headline
                </label>
                <input
                  id="profile-headline"
                  type="text"
                  value={headline}
                  onChange={(e) => {
                    setHeadline(e.target.value);
                    if (profileError) setProfileError('');
                  }}
                  placeholder="e.g. Brand designer and web developer"
                  className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                />
                {profileError && (
                  <p role="alert" className="mt-1.5 text-sm font-medium text-[var(--danger)]">
                    {profileError}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-location"
                    className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                  >
                    City / country
                  </label>
                  <input
                    id="profile-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lagos, Nigeria"
                    className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-discipline"
                    className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                  >
                    Primary craft
                  </label>
                  <select
                    id="profile-discipline"
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value as DisciplineCategory)}
                    className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                  >
                    {DISCIPLINE_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-availability"
                  className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                >
                  Availability note (optional)
                </label>
                <input
                  id="profile-availability"
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Open for remote & local projects"
                  className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-bio"
                  className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                >
                  Short bio
                </label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell local and international clients what you specialize in."
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="submit"
                  className="min-h-[44px] rounded-xl bg-[var(--btn-ink)] px-5 py-2 text-sm font-semibold text-[var(--btn-ink-text)] hover:bg-[var(--btn-cobalt)] hover:text-white active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save profile
                </button>
                {profileSaved && (
                  <span className="text-sm font-semibold text-[#14163a] bg-[#c9f2dc] px-3 py-1 rounded-lg">
                    Profile saved
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* Add a project form */}
          <form
            onSubmit={handleAddProjectSubmit}
            className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 sm:p-6"
            noValidate
          >
            <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
              Add a project
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              After adding a project, invite teammates or clients to vouch for it.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="project-title"
                  className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                >
                  Project title
                </label>
                <input
                  id="project-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (projectErrors.title) setProjectErrors((p) => ({ ...p, title: '' }));
                  }}
                  placeholder="e.g. Bakery rebrand and online store"
                  className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                />
                {projectErrors.title && (
                  <p role="alert" className="mt-1 text-sm font-medium text-[var(--danger)]">
                    {projectErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="project-role"
                  className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                >
                  Your role
                </label>
                <input
                  id="project-role"
                  type="text"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (projectErrors.role) setProjectErrors((p) => ({ ...p, role: '' }));
                  }}
                  placeholder="e.g. Lead designer and developer"
                  className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                />
                {projectErrors.role && (
                  <p role="alert" className="mt-1 text-sm font-medium text-[var(--danger)]">
                    {projectErrors.role}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="project-tools"
                  className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                >
                  Tools used (comma separated)
                </label>
                <input
                  id="project-tools"
                  type="text"
                  value={toolsText}
                  onChange={(e) => setToolsText(e.target.value)}
                  placeholder="e.g. Figma, PHP, MySQL"
                  className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="project-cover"
                  className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                >
                  Cover visual style
                </label>
                <select
                  id="project-cover"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                >
                  {PROJECT_COVER_PRESETS.map((preset) => (
                    <option key={preset.label} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-story"
                  className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                >
                  Project story
                </label>
                <textarea
                  id="project-story"
                  rows={3}
                  value={story}
                  onChange={(e) => {
                    setStory(e.target.value);
                    if (projectErrors.story) setProjectErrors((p) => ({ ...p, story: '' }));
                  }}
                  placeholder="What did you make, who was it for, and what improved?"
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                />
                {projectErrors.story && (
                  <p role="alert" className="mt-1 text-sm font-medium text-[var(--danger)]">
                    {projectErrors.story}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="project-link"
                  className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                >
                  Live link (optional)
                </label>
                <input
                  id="project-link"
                  type="url"
                  value={link}
                  onChange={(e) => {
                    setLink(e.target.value);
                    if (projectErrors.link) setProjectErrors((p) => ({ ...p, link: '' }));
                  }}
                  placeholder="https://yourproject.com"
                  className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
                />
                {projectErrors.link && (
                  <p role="alert" className="mt-1 text-sm font-medium text-[var(--danger)]">
                    {projectErrors.link}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="submit"
                  className="min-h-[46px] rounded-xl bg-[var(--btn-cobalt)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Add project
                </button>
                {projectAddedNote && (
                  <span className="text-sm font-semibold text-[#14163a] bg-[#c9f2dc] px-3 py-1 rounded-lg">
                    Project added
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right column */}
        <div className="lg:col-span-7">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-[var(--text-main)]">
              Your projects &amp; vouch invites
            </h2>
            <span className="text-sm text-[var(--text-muted)] tabular-nums">
              {user.projects.length} total
            </span>
          </div>

          {user.projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center sm:p-12">
              <EmptyStateIllustration variant="projects" />
              <h3 className="font-display text-xl font-bold text-[var(--text-main)]">
                No projects added yet
              </h3>
              <p className="mx-auto mt-2 text-sm text-[var(--text-muted)]">
                Use the “Add a project” form to post your first design, build, video, or article.
                Once it’s here, you can generate confirm links for collaborators and clients.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {user.projects.map((project, idx) => {
                const projectInvites = user.invites.filter((inv) => inv.projectId === project.id);
                const safeLink = sanitizeUrl(project.link);
                const isEditing = editingProjectId === project.id;

                return (
                  <motion.article
                    key={project.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.28,
                      delay: prefersReducedMotion ? 0 : idx * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 sm:p-6"
                  >
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleEditProjectSubmit(e, project.id)}
                        className="space-y-4"
                        noValidate
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-[var(--border-line)] pb-3">
                          <h3 className="font-display text-lg font-bold text-[var(--text-main)]">
                            Edit project details
                          </h3>
                          <button
                            type="button"
                            onClick={() => setEditingProjectId(null)}
                            className="inline-flex min-h-[34px] items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                            <span>Cancel</span>
                          </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor={`edit-title-${project.id}`}
                              className="block text-xs font-semibold text-[var(--text-main)] mb-1"
                            >
                              Project title
                            </label>
                            <input
                              id={`edit-title-${project.id}`}
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="min-h-[42px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] focus:border-[var(--accent-cobalt)] focus:outline-none"
                            />
                            {editErrors.title && (
                              <p role="alert" className="mt-1 text-xs font-medium text-[var(--danger)]">
                                {editErrors.title}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-role-${project.id}`}
                              className="block text-xs font-semibold text-[var(--text-main)] mb-1"
                            >
                              Your role
                            </label>
                            <input
                              id={`edit-role-${project.id}`}
                              type="text"
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="min-h-[42px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] focus:border-[var(--accent-cobalt)] focus:outline-none"
                            />
                            {editErrors.role && (
                              <p role="alert" className="mt-1 text-xs font-medium text-[var(--danger)]">
                                {editErrors.role}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor={`edit-tools-${project.id}`}
                              className="block text-xs font-semibold text-[var(--text-main)] mb-1"
                            >
                              Tools used
                            </label>
                            <input
                              id={`edit-tools-${project.id}`}
                              type="text"
                              value={editToolsText}
                              onChange={(e) => setEditToolsText(e.target.value)}
                              className="min-h-[42px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] focus:border-[var(--accent-cobalt)] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-cover-${project.id}`}
                              className="block text-xs font-semibold text-[var(--text-main)] mb-1"
                            >
                              Cover visual style
                            </label>
                            <select
                              id={`edit-cover-${project.id}`}
                              value={editCoverImage}
                              onChange={(e) => setEditCoverImage(e.target.value)}
                              className="min-h-[42px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-[var(--accent-cobalt)] focus:outline-none"
                            >
                              {PROJECT_COVER_PRESETS.map((preset) => (
                                <option key={preset.label} value={preset.value}>
                                  {preset.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-story-${project.id}`}
                            className="block text-xs font-semibold text-[var(--text-main)] mb-1"
                          >
                            Project story
                          </label>
                          <textarea
                            id={`edit-story-${project.id}`}
                            rows={3}
                            value={editStory}
                            onChange={(e) => setEditStory(e.target.value)}
                            className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] focus:border-[var(--accent-cobalt)] focus:outline-none"
                          />
                          {editErrors.story && (
                            <p role="alert" className="mt-1 text-xs font-medium text-[var(--danger)]">
                              {editErrors.story}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-link-${project.id}`}
                            className="block text-xs font-semibold text-[var(--text-main)] mb-1"
                          >
                            Live link (optional)
                          </label>
                          <input
                            id={`edit-link-${project.id}`}
                            type="url"
                            value={editLink}
                            onChange={(e) => setEditLink(e.target.value)}
                            className="min-h-[42px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm text-[var(--text-main)] focus:border-[var(--accent-cobalt)] focus:outline-none"
                          />
                          {editErrors.link && (
                            <p role="alert" className="mt-1 text-xs font-medium text-[var(--danger)]">
                              {editErrors.link}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="submit"
                            className="min-h-[42px] rounded-xl bg-[var(--btn-cobalt)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] cursor-pointer"
                          >
                            Save changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProjectId(null)}
                            className="min-h-[42px] rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-[var(--accent-cobalt)]">
                              <span>{sanitizeText(project.role, 100)}</span>
                              {project.tools.length > 0 && (
                                <>
                                  <span aria-hidden="true" className="opacity-40">
                                    /
                                  </span>
                                  <span className="text-[var(--text-muted)]">
                                    {project.tools.map((t) => sanitizeText(t, 40)).join(' · ')}
                                  </span>
                                </>
                              )}
                            </div>
                            <h3 className="mt-1 font-display text-xl font-bold text-[var(--text-main)]">
                              {sanitizeText(project.title, 120)}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditingProject(project)}
                              aria-label={`Edit ${sanitizeText(project.title, 80)}`}
                              title="Edit project"
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--accent-cobalt)] hover:text-[var(--accent-cobalt)] transition-colors cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteProject(project.id)}
                              aria-label={`Remove ${sanitizeText(project.title, 80)}`}
                              title="Delete project"
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--danger)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-muted)]">
                          {sanitizeText(project.story, 600)}
                        </p>

                        {safeLink && (
                          <a
                            href={safeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-cobalt)] hover:underline"
                          >
                            <span>{safeLink}</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </>
                    )}

                    <InviteForm
                      projectId={project.id}
                      projectTitle={project.title}
                      invites={projectInvites}
                      onCreateInvite={onCreateInvite}
                      onRevokeInvite={onRevokeInvite}
                    />
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
