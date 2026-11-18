/**
 * Strips angle brackets and unsafe control characters from user-entered text
 * before storing or rendering. React also escapes text nodes by default.
 */
export function sanitizeText(value: string, maxLength = 800): string {
  return value
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and normalizes external URLs to allow only http: or https: schemes.
 */
export function sanitizeUrl(raw: string): string {
  const cleaned = sanitizeText(raw, 300);
  if (!cleaned) return '';

  const lower = cleaned.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return '';
  }

  const withProtocol =
    lower.startsWith('http://') || lower.startsWith('https://')
      ? cleaned
      : `https://${cleaned}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
}

export function slugifyUsername(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

export function validateEmail(email: string): string | null {
  const clean = email.trim();
  if (!clean) {
    return 'Enter your email address so you can sign back in later.';
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(clean)) {
    return 'That email does not look right. Include an @ and a domain, like ada@studio.ng.';
  }
  return null;
}

export function validateUsername(username: string): string | null {
  const slug = slugifyUsername(username);
  if (slug.length < 3) {
    return 'Choose a username with at least 3 letters or numbers — this becomes your public link.';
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Use only lowercase letters, numbers, and single hyphens between words.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Create a password with at least 6 characters to protect your account.';
  }
  if (password.length < 6) {
    return 'Your password needs at least 6 characters. Add a few more letters or numbers.';
  }
  return null;
}
