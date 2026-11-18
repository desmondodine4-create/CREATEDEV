import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, CheckCircle2, Clock, Copy, ExternalLink, Trash2, XCircle } from 'lucide-react';
import type { VouchInvite, VouchType } from '../data/mockData';
import { sanitizeText } from '../utils/sanitize';
import { EmptyStateIllustration } from './EmptyStateIllustration';

interface InviteFormProps {
  projectId: string;
  projectTitle: string;
  invites: VouchInvite[];
  onCreateInvite: (projectId: string, inviteeName: string, type: VouchType) => VouchInvite;
  onRevokeInvite: (inviteId: string) => void;
}

export function InviteForm({
  projectId,
  projectTitle,
  invites,
  onCreateInvite,
  onRevokeInvite,
}: InviteFormProps) {
  const prefersReducedMotion = useReducedMotion();
  const [inviteeName, setInviteeName] = useState('');
  const [type, setType] = useState<VouchType>('collaborator');
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [latestCreatedId, setLatestCreatedId] = useState<string | null>(null);

  const nameInputId = `invite-name-${projectId}`;

  function getShareUrl(inviteId: string) {
    const base = window.location.href.split('#')[0];
    return `${base}#/confirm/${inviteId}`;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = sanitizeText(inviteeName, 80);
    if (cleaned.length < 2) {
      setError('Enter the name of the teammate or client who can confirm your work.');
      return;
    }

    setError('');
    const created = onCreateInvite(projectId, cleaned, type);
    setInviteeName('');
    setLatestCreatedId(created.id);
  }

  async function handleCopy(inviteId: string) {
    const url = getShareUrl(inviteId);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback visual confirmation
    }
    setCopiedId(inviteId);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === inviteId ? null : prev));
    }, 2000);
  }

  return (
    <div className="mt-6 border-t border-[var(--border-line)] pt-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h4 className="font-display text-base font-bold text-[var(--text-main)]">
          Request a vouch for “{sanitizeText(projectTitle, 80)}”
        </h4>
        <span className="text-xs text-[var(--text-muted)] tabular-nums">
          {invites.length} {invites.length === 1 ? 'request' : 'requests'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 grid gap-3 sm:grid-cols-12 sm:items-end" noValidate>
        <div className="sm:col-span-5">
          <label
            htmlFor={nameInputId}
            className="block text-sm font-medium text-[var(--text-main)] mb-1.5"
          >
            Teammate or client name
          </label>
          <input
            id={nameInputId}
            type="text"
            value={inviteeName}
            onChange={(e) => {
              setInviteeName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Tunde Balogun or Kora Foods"
            className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:bg-[var(--bg-surface)] focus:outline-none transition-colors"
          />
        </div>

        <div className="sm:col-span-4">
          <span className="block text-sm font-medium text-[var(--text-main)] mb-1.5">
            Relationship
          </span>
          <div
            role="group"
            aria-label="Invite type"
            className="relative grid grid-cols-2 gap-1 rounded-xl border border-[var(--border-line)] bg-[var(--bg-subtle)] p-1"
          >
            {(['collaborator', 'client'] as const).map((option) => {
              const active = type === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  className={`relative z-10 min-h-[36px] rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'text-[var(--btn-ink-text)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={`invite-type-pill-${projectId}`}
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-lg bg-[var(--btn-ink)]"
                    />
                  )}
                  {option === 'collaborator' ? 'Collaborator' : 'Client'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-3">
          <button
            type="submit"
            className="min-h-[44px] w-full rounded-xl bg-[var(--btn-cobalt)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
          >
            Generate link
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      )}

      {invites.length === 0 ? (
        <div className="mt-4 rounded-xl bg-[var(--bg-subtle)] p-5 text-center">
          <EmptyStateIllustration variant="vouches" />
          <p className="text-sm font-medium text-[var(--text-main)]">No vouch requests yet</p>
          <p className="mx-auto mt-1 text-xs text-[var(--text-muted)]">
            Add a collaborator or client above to generate a verification link they can sign off without an account.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--border-line)] rounded-xl border border-[var(--border-line)] bg-[var(--bg-subtle)] overflow-hidden">
          <AnimatePresence initial={false}>
            {invites.map((invite) => {
              const safeInvitee = sanitizeText(invite.inviteeName, 80);
              const confirmHash = `#/confirm/${invite.id}`;
              const isNewest = latestCreatedId === invite.id;

              return (
                <motion.li
                  key={invite.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-sm text-[var(--text-main)]">
                        {safeInvitee}
                      </span>
                      <span aria-hidden="true" className="text-[var(--text-muted)]/50">
                        ·
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {invite.type === 'client' ? 'Client' : 'Collaborator'}
                      </span>
                      <span aria-hidden="true" className="text-[var(--text-muted)]/50">
                        ·
                      </span>

                      {invite.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#c9f2dc] px-2 py-0.5 text-xs font-semibold text-[#14163a]">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Confirmed
                          {typeof invite.rating === 'number' ? ` (${invite.rating}/5)` : ''}
                        </span>
                      )}
                      {invite.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-main)]">
                          <Clock className="h-3.5 w-3.5 text-[var(--accent-cobalt)]" aria-hidden="true" />
                          Pending response
                        </span>
                      )}
                      {invite.status === 'declined' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--danger)]">
                          <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Declined
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                      Verification URL:{' '}
                      <span className="font-medium text-[var(--text-main)]">{confirmHash}</span>
                      {isNewest && (
                        <span className="ml-2 font-semibold text-[var(--accent-cobalt)]">
                          Ready to send
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(invite.id)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)] hover:text-[var(--accent-cobalt)] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {copiedId === invite.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[var(--accent-cobalt)]" aria-hidden="true" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={confirmHash}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[var(--btn-ink)] px-3 py-1.5 text-xs font-semibold text-[var(--btn-ink-text)] hover:bg-[var(--btn-cobalt)] hover:text-white transition-colors whitespace-nowrap"
                    >
                      <span>Open link</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>

                    {invite.status !== 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => onRevokeInvite(invite.id)}
                        aria-label={`Revoke invite for ${safeInvitee}`}
                        title="Revoke invite"
                        className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--danger)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
