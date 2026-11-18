import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  DISCIPLINE_OPTIONS,
  type CreatorAccount,
  type DisciplineCategory,
} from '../data/mockData';
import {
  sanitizeText,
  slugifyUsername,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../utils/sanitize';
import { EASE_STUDIO, SPRING_SNAPPY, staggerContainer, staggerItem } from '../utils/motion';

export interface SignupPayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
  location: string;
  discipline: DisciplineCategory;
  rememberMe: boolean;
}

interface AuthScreenProps {
  initialMode: 'signup' | 'login' | 'reset';
  featuredCreator: CreatorAccount;
  existingUsernames: string[];
  existingEmails: string[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignup: (payload: SignupPayload) => void;
  onLogin: (identifier: string, password: string, rememberMe: boolean) => string | null;
  onResetPassword: (email: string, newPassword: string) => string | null;
}

function getPasswordStrength(password: string): {
  level: 0 | 1 | 2 | 3;
  label: string;
} {
  if (!password) return { level: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10 || (/[A-Z]/.test(password) && /[0-9]/.test(password))) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || (password.length >= 12 && /[0-9]/.test(password))) {
    score += 1;
  }
  if (score <= 1) return { level: 1, label: 'Weak — add numbers or make it 10+ characters' };
  if (score === 2) {
    return { level: 2, label: 'Fair — add a symbol or extra words for stronger protection' };
  }
  return { level: 3, label: 'Strong password' };
}

export function AuthScreen({
  initialMode,
  featuredCreator,
  existingUsernames,
  existingEmails,
  onSignup,
  onLogin,
  onResetPassword,
}: AuthScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState<'signup' | 'login' | 'reset'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
    setErrors({});
    setResetBanner('');
  }, [initialMode]);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [discipline, setDiscipline] = useState<DisciplineCategory>('Design');
  const [pledged, setPledged] = useState(true);

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetBanner, setResetBanner] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeCount, setShakeCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedSlug = slugifyUsername(username);
  const isUsernameAvailable =
    normalizedSlug.length >= 3 && !existingUsernames.includes(normalizedSlug);
  const strength = getPasswordStrength(password);

  function triggerValidationShake() {
    setShakeCount((c) => c + 1);
  }

  function handleFullNameChange(val: string) {
    setFullName(val);
    if (!usernameTouched) {
      setUsername(slugifyUsername(val));
    }
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: '' }));
    }
  }

  function handleSignupSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    const cleanName = sanitizeText(fullName, 80);
    if (cleanName.length < 2) {
      nextErrors.fullName = 'Enter your full name as you want it shown on your portfolio and CV.';
    }

    const userErr = validateUsername(username);
    if (userErr) {
      nextErrors.username = userErr;
    } else if (existingUsernames.includes(normalizedSlug)) {
      nextErrors.username = `The link "/u/${normalizedSlug}" is already taken. Try "${normalizedSlug}-studio".`;
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      nextErrors.email = emailErr;
    } else if (existingEmails.includes(email.trim().toLowerCase())) {
      nextErrors.email =
        'An account with this email already exists. Switch to Log in above to sign in.';
    }

    const passErr = validatePassword(password);
    if (passErr) {
      nextErrors.password = passErr;
    }

    if (!pledged) {
      nextErrors.pledged =
        'Confirm the authenticity pledge so clients know projects on CREATDEV represent real work.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      triggerValidationShake();
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    window.setTimeout(
      () => {
        setIsSubmitting(false);
        onSignup({
          fullName: cleanName,
          username: normalizedSlug,
          email: email.trim().toLowerCase(),
          password,
          location: sanitizeText(location, 80),
          discipline,
          rememberMe,
        });
      },
      prefersReducedMotion ? 0 : 220
    );
  }

  function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!loginIdentifier.trim()) {
      nextErrors.loginIdentifier = 'Enter your email address or username to find your account.';
    }
    if (!password) {
      nextErrors.password = 'Enter your password to continue.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      triggerValidationShake();
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(
      () => {
        const authError = onLogin(loginIdentifier.trim(), password, rememberMe);
        setIsSubmitting(false);
        if (authError) {
          setErrors({ form: authError });
          triggerValidationShake();
        }
      },
      prefersReducedMotion ? 0 : 220
    );
  }

  function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    const emailErr = validateEmail(resetEmail);
    if (emailErr) nextErrors.resetEmail = emailErr;

    const passErr = validatePassword(resetPasswordVal);
    if (passErr) nextErrors.resetPasswordVal = passErr;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      triggerValidationShake();
      return;
    }

    const err = onResetPassword(resetEmail.trim().toLowerCase(), resetPasswordVal);
    if (err) {
      setErrors({ form: err });
      triggerValidationShake();
      return;
    }

    setErrors({});
    setLoginIdentifier(resetEmail.trim().toLowerCase());
    setPassword('');
    setResetPasswordVal('');
    setResetBanner('Password updated. Sign in with your new password below.');
    setMode('login');
  }

  return (
    <section className="studio-grid-bg relative min-h-[calc(100vh-68px)] overflow-hidden py-10 sm:py-14">
      {/* Centered ambient cobalt studio glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-[#3b48e8]/18 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        {/* Centered Studio Welcome Header — zero images */}
        <motion.div
          variants={staggerContainer(0.06, 0.02)}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          className="mx-auto max-w-xl text-center"
        >
          <motion.div variants={staggerItem} className="flex items-center justify-center">
            <a
              href="#/home"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-cobalt)] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to welcome</span>
            </a>
          </motion.div>

          <motion.h1
            variants={staggerItem}
            className="mt-4 font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-[var(--text-main)] sm:text-4xl lg:text-[2.75rem]"
          >
            {mode === 'signup'
              ? 'Get started with CREATDEV'
              : mode === 'login'
              ? 'Sign in to CREATDEV'
              : 'Reset your studio password'}
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="mx-auto mt-3 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base"
          >
            {mode === 'signup'
              ? 'Create your verified portfolio workspace, invite clients to vouch, and export your CV.'
              : mode === 'login'
              ? 'Open your studio dashboard to add projects and manage vouch requests.'
              : 'Enter your account email and choose a new password.'}
          </motion.p>
        </motion.div>

        {/* Centered Studio Auth Panel */}
        <div className="mx-auto mt-8 max-w-xl">
          <motion.div
            key={shakeCount}
            initial={
              prefersReducedMotion
                ? false
                : shakeCount > 0
                ? { x: 0 }
                : { opacity: 0, y: 14 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : shakeCount > 0
                ? { x: [0, -5, 5, -3, 3, 0], opacity: 1, y: 0 }
                : { opacity: 1, y: 0 }
            }
            transition={
              shakeCount > 0
                ? { duration: 0.24, ease: 'easeOut' }
                : { duration: 0.34, ease: EASE_STUDIO }
            }
            className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-[0_30px_70px_-24px_rgba(4,6,20,0.6)]"
          >
            {mode !== 'reset' ? (
              <div
                role="tablist"
                aria-label="Authentication mode"
                className="relative grid grid-cols-2 gap-1 rounded-xl border border-[var(--border-line)] bg-[var(--bg-canvas)] p-1"
              >
                {(['signup', 'login'] as const).map((tab) => {
                  const active = mode === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setMode(tab);
                        setErrors({});
                        setResetBanner('');
                      }}
                      className={`relative z-10 min-h-[42px] rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'text-[var(--btn-ink-text)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="auth-mode-indicator"
                          transition={SPRING_SNAPPY}
                          className="absolute inset-0 -z-10 rounded-lg bg-[var(--btn-ink)]"
                        />
                      )}
                      {tab === 'signup' ? 'Create account' : 'Log in'}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-between border-b border-[var(--border-line)] pb-4">
                <div className="flex items-center gap-2 font-display text-lg font-bold text-[var(--text-main)]">
                  <KeyRound className="h-5 w-5 text-[var(--accent-cobalt)]" aria-hidden="true" />
                  <span>Reset password</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrors({});
                  }}
                  className="text-sm font-semibold text-[var(--accent-cobalt)] hover:underline cursor-pointer"
                >
                  Back to log in
                </button>
              </div>
            )}

            {resetBanner && (
              <div
                role="status"
                className="mt-5 flex items-center gap-2 rounded-xl border border-[#7fd0a5] bg-[#c9f2dc] p-3.5 text-sm font-semibold text-[#14163a]"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{resetBanner}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.form
                  key="auth-signup"
                  variants={staggerContainer(0.04, 0.02)}
                  initial={prefersReducedMotion ? false : 'hidden'}
                  animate="visible"
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                  onSubmit={handleSignupSubmit}
                  className="mt-6 space-y-4"
                  noValidate
                >
                  <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="signup-fullname"
                        className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                      >
                        Full name
                      </label>
                      <input
                        id="signup-fullname"
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => handleFullNameChange(e.target.value)}
                        placeholder="e.g. Amaka Obi"
                        aria-invalid={Boolean(errors.fullName)}
                        className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
                      />
                      {errors.fullName && (
                        <p role="alert" className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="signup-location"
                        className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                      >
                        City &amp; country
                      </label>
                      <input
                        id="signup-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Lagos, Nigeria"
                        className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <label
                      htmlFor="signup-username"
                      className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                    >
                      Username (becomes your public link)
                    </label>
                    <input
                      id="signup-username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setUsernameTouched(true);
                        setUsername(e.target.value);
                        if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
                      }}
                      placeholder="e.g. amaka-obi"
                      aria-invalid={Boolean(errors.username)}
                      className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
                    />
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[var(--text-muted)]">
                        Link:{' '}
                        <span className="font-semibold text-[var(--accent-cobalt)]">
                          #/u/{normalizedSlug || 'your-name'}
                        </span>
                      </span>
                      {normalizedSlug.length >= 3 && (
                        <span
                          className={`font-semibold ${
                            isUsernameAvailable
                              ? 'text-[#14163a] bg-[#c9f2dc] px-2 py-0.5 rounded'
                              : 'text-[var(--danger)]'
                          }`}
                        >
                          {isUsernameAvailable ? 'Username available' : 'Already taken'}
                        </span>
                      )}
                    </div>
                    {errors.username && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                        {errors.username}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="signup-email"
                        className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                      >
                        Email address
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        placeholder="amaka@studio.ng"
                        aria-invalid={Boolean(errors.email)}
                        className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
                      />
                      {errors.email && (
                        <p role="alert" className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="signup-discipline"
                        className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                      >
                        Primary craft
                      </label>
                      <select
                        id="signup-discipline"
                        value={discipline}
                        onChange={(e) => setDiscipline(e.target.value as DisciplineCategory)}
                        className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-main)] focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
                      >
                        {DISCIPLINE_OPTIONS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <label
                      htmlFor="signup-password"
                      className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        placeholder="At least 6 characters"
                        aria-invalid={Boolean(errors.password)}
                        className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5 pr-12 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {strength.level > 0 && (
                      <div className="mt-2">
                        <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
                          {[1, 2, 3].map((step) => (
                            <span
                              key={step}
                              className={`h-1.5 rounded-full transition-colors ${
                                strength.level >= step
                                  ? strength.level === 3
                                    ? 'bg-[#7fd0a5]'
                                    : strength.level === 2
                                    ? 'bg-[#ff9f43]'
                                    : 'bg-[#b42318]'
                                  : 'bg-[var(--border-line)]'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{strength.label}</p>
                      </div>
                    )}

                    {errors.password && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                        {errors.password}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={staggerItem} className="space-y-2.5 pt-1">
                    <label className="flex items-start gap-2.5 text-sm text-[var(--text-main)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pledged}
                        onChange={(e) => {
                          setPledged(e.target.checked);
                          if (errors.pledged) setErrors((prev) => ({ ...prev, pledged: '' }));
                        }}
                        className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] accent-[#3b48e8]"
                      />
                      <span>
                        I confirm that projects I publish on CREATDEV are real work I contributed
                        to.
                      </span>
                    </label>
                    {errors.pledged && (
                      <p role="alert" className="text-xs font-medium text-[var(--danger)]">
                        {errors.pledged}
                      </p>
                    )}

                    <label className="flex items-center gap-2.5 text-sm text-[var(--text-muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--border-strong)] accent-[#3b48e8]"
                      />
                      <span>Keep me signed in on this browser</span>
                    </label>
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.01 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                      transition={SPRING_SNAPPY}
                      className="group relative inline-flex min-h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--btn-cobalt)] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_28px_-10px_rgba(59,72,232,0.7)] hover:bg-[var(--btn-cobalt-hover)] disabled:opacity-70 transition-colors cursor-pointer"
                    >
                      {!prefersReducedMotion && (
                        <motion.span
                          aria-hidden="true"
                          initial={{ x: '-130%' }}
                          animate={{ x: '230%' }}
                          transition={{
                            repeat: Infinity,
                            repeatDelay: 3.5,
                            duration: 1.2,
                            ease: EASE_STUDIO,
                          }}
                          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                      )}
                      <span className="relative z-10">
                        {isSubmitting ? 'Creating workspace...' : 'Create portfolio account'}
                      </span>
                      <ArrowRight
                        className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}

              {mode === 'login' && (
                <motion.form
                  key="auth-login"
                  variants={staggerContainer(0.05, 0.02)}
                  initial={prefersReducedMotion ? false : 'hidden'}
                  animate="visible"
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                  onSubmit={handleLoginSubmit}
                  className="mt-6 space-y-5"
                  noValidate
                >
                  {errors.form && (
                    <div
                      role="alert"
                      className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3.5 text-sm font-medium text-[var(--danger)]"
                    >
                      {errors.form}
                    </div>
                  )}

                  <motion.div variants={staggerItem}>
                    <label
                      htmlFor="login-identifier"
                      className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                    >
                      Email or username
                    </label>
                    <input
                      id="login-identifier"
                      type="text"
                      autoComplete="username"
                      value={loginIdentifier}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        if (errors.loginIdentifier || errors.form) {
                          setErrors((prev) => ({ ...prev, loginIdentifier: '', form: '' }));
                        }
                      }}
                      placeholder="you@studio.com or username"
                      aria-invalid={Boolean(errors.loginIdentifier)}
                      className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
                    />
                    {errors.loginIdentifier && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                        {errors.loginIdentifier}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="login-password"
                        className="block text-sm font-semibold text-[var(--text-main)]"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset');
                          setErrors({});
                          setResetBanner('');
                        }}
                        className="text-xs font-semibold text-[var(--accent-cobalt)] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password || errors.form) {
                            setErrors((prev) => ({ ...prev, password: '', form: '' }));
                          }
                        }}
                        placeholder="Enter your password"
                        aria-invalid={Boolean(errors.password)}
                        className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5 pr-12 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                        {errors.password}
                      </p>
                    )}
                  </motion.div>

                  <motion.label
                    variants={staggerItem}
                    className="flex items-center gap-2.5 text-sm text-[var(--text-muted)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-[var(--border-strong)] accent-[#3b48e8]"
                    />
                    <span>Keep me signed in on this browser</span>
                  </motion.label>

                  <motion.div variants={staggerItem}>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.01 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                      transition={SPRING_SNAPPY}
                      className="group relative inline-flex min-h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--btn-cobalt)] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_28px_-10px_rgba(59,72,232,0.7)] hover:bg-[var(--btn-cobalt-hover)] disabled:opacity-70 transition-colors cursor-pointer"
                    >
                      {!prefersReducedMotion && (
                        <motion.span
                          aria-hidden="true"
                          initial={{ x: '-130%' }}
                          animate={{ x: '230%' }}
                          transition={{
                            repeat: Infinity,
                            repeatDelay: 3.5,
                            duration: 1.2,
                            ease: EASE_STUDIO,
                          }}
                          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                      )}
                      <span className="relative z-10">
                        {isSubmitting ? 'Entering studio...' : 'Log in to studio'}
                      </span>
                      <ArrowRight
                        className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}

              {mode === 'reset' && (
                <motion.form
                  key="auth-reset"
                  variants={staggerContainer(0.05, 0.02)}
                  initial={prefersReducedMotion ? false : 'hidden'}
                  animate="visible"
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                  onSubmit={handleResetSubmit}
                  className="mt-6 space-y-5"
                  noValidate
                >
                  {errors.form && (
                    <div
                      role="alert"
                      className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3.5 text-sm font-medium text-[var(--danger)]"
                    >
                      {errors.form}
                    </div>
                  )}

                  <motion.div variants={staggerItem}>
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                    >
                      Account email address
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (errors.resetEmail || errors.form) {
                          setErrors((p) => ({ ...p, resetEmail: '', form: '' }));
                        }
                      }}
                      placeholder="you@studio.com"
                      className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
                    />
                    {errors.resetEmail && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                        {errors.resetEmail}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <label
                      htmlFor="reset-new-password"
                      className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                    >
                      New password
                    </label>
                    <input
                      id="reset-new-password"
                      type="password"
                      value={resetPasswordVal}
                      onChange={(e) => {
                        setResetPasswordVal(e.target.value);
                        if (errors.resetPasswordVal) {
                          setErrors((p) => ({ ...p, resetPasswordVal: '' }));
                        }
                      }}
                      placeholder="At least 6 characters"
                      className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-canvas)] focus:outline-none transition-colors"
                    />
                    {errors.resetPasswordVal && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                        {errors.resetPasswordVal}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <button
                      type="submit"
                      className="min-h-[48px] w-full rounded-xl bg-[var(--btn-cobalt)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      Save new password
                    </button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Modular Studio Capability Blocks below centered Auth Card (AI-Studio-inspired clean blocks) */}
        <motion.div
          variants={staggerContainer(0.07, 0.12)}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          <motion.a
            variants={staggerItem}
            href="#/explore"
            className="group rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--accent-cobalt)]"
          >
            <Layers className="h-5 w-5 text-[var(--accent-cobalt)]" aria-hidden="true" />
            <h2 className="mt-3 font-display text-base font-bold text-[var(--text-main)]">
              Verified portfolios
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
              Browse real creative and software projects backed by collaborator confirmations.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-cobalt)]">
              <span>Explore directory</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </motion.a>

          <motion.a
            variants={staggerItem}
            href="#/confirm/vouch-sweetcrumbs-2"
            className="group rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--accent-cobalt)]"
          >
            <ShieldCheck className="h-5 w-5 text-[#7fd0a5]" aria-hidden="true" />
            <h2 className="mt-3 font-display text-base font-bold text-[var(--text-main)]">
              One-click vouch link
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
              Clients verify your work and leave a 1–5 star rating in seconds without signing up.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-cobalt)]">
              <span>Preview vouch flow</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </motion.a>

          <motion.a
            variants={staggerItem}
            href={`#/u/${featuredCreator.username}/cv`}
            className="group rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--accent-cobalt)]"
          >
            <FileText className="h-5 w-5 text-[#ff9f43]" aria-hidden="true" />
            <h2 className="mt-3 font-display text-base font-bold text-[var(--text-main)]">
              Print-ready PDF CV
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
              Export a structured A4 resume combining your tools, project stories, and proof.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-cobalt)]">
              <span>View featured CV</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
