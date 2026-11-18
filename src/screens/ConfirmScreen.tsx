import { useState } from 'react';
import { ArrowRight, CheckCircle2, Star, XCircle } from 'lucide-react';
import type { CreatorAccount, Project, VouchInvite } from '../data/mockData';
import { sanitizeText, sanitizeUrl } from '../utils/sanitize';
import { CelebrationBurst } from '../components/CelebrationBurst';
import { VouchBadge } from '../components/VouchBadge';

interface ConfirmScreenProps {
  invite: VouchInvite | null;
  creator: CreatorAccount | null;
  project: Project | null;
  onRespond: (
    inviteId: string,
    decision: 'confirmed' | 'declined',
    rating?: number,
    testimonial?: string
  ) => void;
}

export function ConfirmScreen({ invite, creator, project, onRespond }: ConfirmScreenProps) {
  const [rating, setRating] = useState<number>(invite?.rating ?? 0);
  const [testimonial, setTestimonial] = useState<string>(invite?.testimonial ?? '');
  const [error, setError] = useState('');
  const [justConfirmed, setJustConfirmed] = useState(false);

  if (!invite || !creator || !project) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold text-[var(--text-main)]">
          Confirm link not found
        </h1>
        <p className="mx-auto mt-3 text-base text-[var(--text-muted)]">
          This vouch invite may have been removed or the link was typed incorrectly. Ask the
          creator to send a fresh confirm link from their dashboard.
        </p>
        <div className="mt-7">
          <a
            href="#/home"
            className="inline-flex min-h-[46px] items-center rounded-xl bg-[var(--btn-cobalt)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] transition-colors"
          >
            Back to CREATDEV home
          </a>
        </div>
      </section>
    );
  }

  const safeCreatorName = sanitizeText(creator.fullName, 80);
  const safeInviteeName = sanitizeText(invite.inviteeName, 80);
  const safeProjectTitle = sanitizeText(project.title, 120);
  const safeProjectRole = sanitizeText(project.role, 100);
  const safeProjectStory = sanitizeText(project.story, 600);
  const safeProjectLink = sanitizeUrl(project.link);
  const isClient = invite.type === 'client';

  function handleConfirmYes() {
    if (isClient && (rating < 1 || rating > 5)) {
      setError('Select a rating from 1 to 5 stars before confirming this project.');
      return;
    }

    setError('');
    const cleanQuote = isClient ? sanitizeText(testimonial, 240) : undefined;
    onRespond(invite!.id, 'confirmed', isClient ? rating : undefined, cleanQuote);
    setJustConfirmed(true);
  }

  function handleDecline() {
    setError('');
    onRespond(invite!.id, 'declined');
    setJustConfirmed(false);
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <CelebrationBurst active={justConfirmed} />

      <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-6 sm:p-9">
        <p className="text-sm font-semibold text-[var(--accent-cobalt)]">
          Project vouch request · No account needed
        </p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[var(--text-main)] sm:text-4xl">
          Hi {safeInviteeName}, did you work with {safeCreatorName} on this project?
        </h1>
        <p className="mt-3 text-base text-[var(--text-muted)]">
          {safeCreatorName} listed you as a{' '}
          <strong className="font-semibold text-[var(--text-main)]">
            {isClient ? 'client' : 'collaborator'}
          </strong>
          . Confirming adds a verified vouch badge to their public portfolio and CV.
        </p>

        {/* Project summary box */}
        <div className="mt-6 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-subtle)] p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-[var(--accent-cobalt)]">
            <span>{safeProjectRole}</span>
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

          <h2 className="mt-1.5 font-display text-2xl font-bold text-[var(--text-main)]">
            {safeProjectTitle}
          </h2>

          {safeProjectStory && (
            <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-muted)]">
              {safeProjectStory}
            </p>
          )}

          {safeProjectLink && (
            <a
              href={safeProjectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs font-semibold text-[var(--accent-cobalt)] underline underline-offset-4"
            >
              {safeProjectLink}
            </a>
          )}
        </div>

        {/* Decision state */}
        {invite.status === 'confirmed' ? (
          <div className="mt-7 space-y-5">
            <div className="flex items-center gap-2.5 text-base font-bold text-[var(--text-main)]">
              <CheckCircle2 className="h-5 w-5 text-[var(--accent-cobalt)]" aria-hidden="true" />
              <span>Vouch confirmed. Here is how it appears on {safeCreatorName}’s portfolio:</span>
            </div>

            <VouchBadge vouch={invite} />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`#/u/${creator.username}`}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[var(--btn-cobalt)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] transition-colors"
              >
                <span>See {safeCreatorName}’s portfolio</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#/dashboard"
                className="inline-flex min-h-[46px] items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)] transition-colors"
              >
                Back to dashboard
              </a>
            </div>
          </div>
        ) : invite.status === 'declined' ? (
          <div className="mt-7 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-[var(--danger-border)] bg-[var(--bg-subtle)] p-4">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" aria-hidden="true" />
              <div>
                <p className="font-semibold text-[var(--text-main)]">Marked as not accurate</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Thank you for checking. No vouch badge was added to {safeCreatorName}’s public
                  portfolio.
                </p>
              </div>
            </div>

            <a
              href="#/dashboard"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)]"
            >
              Back to dashboard
            </a>
          </div>
        ) : (
          <div className="mt-7 space-y-6">
            {isClient && (
              <div className="space-y-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-subtle)] p-5">
                <div>
                  <span className="block text-sm font-semibold text-[var(--text-main)]">
                    How would you rate working with {safeCreatorName}? (1 to 5)
                  </span>
                  <div
                    role="radiogroup"
                    aria-label="Client rating out of 5"
                    className="mt-2.5 flex flex-wrap items-center gap-2"
                  >
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = value <= rating;
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={rating === value}
                          aria-label={`${value} out of 5 stars`}
                          onClick={() => {
                            setRating(value);
                            if (error) setError('');
                          }}
                          className={`inline-flex h-11 min-w-[48px] items-center justify-center gap-1 rounded-xl border px-3 text-sm font-semibold tabular-nums transition-all cursor-pointer ${
                            rating === value
                              ? 'border-[var(--btn-ink)] bg-[var(--btn-ink)] text-[var(--btn-ink-text)]'
                              : active
                              ? 'border-[#ff9f43] bg-[#ff9f43]/25 text-[var(--text-main)]'
                              : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:border-[var(--accent-cobalt)]'
                          }`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              active
                                ? 'fill-[#ff9f43] text-[#ff9f43]'
                                : 'text-[var(--text-muted)]'
                            }`}
                            aria-hidden="true"
                          />
                          <span>{value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="client-testimonial"
                    className="block text-sm font-semibold text-[var(--text-main)] mb-1.5"
                  >
                    Short testimonial (shown on their badge)
                  </label>
                  <textarea
                    id="client-testimonial"
                    rows={2}
                    value={testimonial}
                    onChange={(e) => setTestimonial(e.target.value)}
                    placeholder="e.g. Delivered on time and the shop looks great."
                    className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm font-medium text-[var(--danger)]">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleConfirmYes}
                className="min-h-[48px] flex-1 rounded-xl bg-[var(--btn-cobalt)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] active:scale-[0.98] transition-all cursor-pointer"
              >
                Yes, this is accurate
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="min-h-[48px] rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-6 py-3 text-base font-semibold text-[var(--text-main)] hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] transition-all cursor-pointer"
              >
                No, not accurate
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
