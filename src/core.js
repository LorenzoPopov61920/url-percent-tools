const UNRESERVED = new Set([
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '-', '.', '_', '~',
]);

const SUB_DELIMS = new Set([
  '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=',
]);

const PCHAR_EXTRA = new Set([':', '@']);
const PATH_EXTRA = new Set(['/', ...PCHAR_EXTRA]);
const QUERY_EXTRA = new Set(['/', '?', ...PCHAR_EXTRA]);
const FRAGMENT_EXTRA = new Set(['/', '?', ...PCHAR_EXTRA]);

function encodeWithExtra(input, extra) {
  if (typeof input !== 'string') {
    throw new TypeError('input must be a string');
  }
  const bytes = new TextEncoder().encode(input);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const ch = String.fromCharCode(b);
    if (b < 0x80 && (UNRESERVED.has(ch) || SUB_DELIMS.has(ch) || extra.has(ch))) {
      out += ch;
    } else {
      out += '%' + b.toString(16).toUpperCase().padStart(2, '0');
    }
  }
  return out;
}

/**
 * Percent-encode a string for use as a path segment or path.
 *
 * The unreserved set, sub-delims, and `:`, `@`, `/` are left as-is.
 * This matches RFC 3986 pchar plus `/`, which is what a path allows.
 */
export function encodePath(input) {
  return encodeWithExtra(input, PATH_EXTRA);
}

/**
 * Percent-encode a string for use as a query component.
 *
 * Query strings are allowed to contain `/` and `?` in addition to pchar.
 * We deliberately do NOT leave `&` or `=` alone even though they are
 * sub-delims, because callers usually build `key=value` pairs and an
 * unescaped `&` or `=` inside a value would corrupt the query. This is a
 * documented trade-off: we encode `&` and `=` in query values.
 */
export function encodeQuery(input) {
  if (typeof input !== 'string') {
    throw new TypeError('input must be a string');
  }
  const bytes = new TextEncoder().encode(input);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const ch = String.fromCharCode(b);
    if (b < 0x80 && (UNRESERVED.has(ch) || (SUB_DELIMS.has(ch) && ch !== '&' && ch !== '=') || QUERY_EXTRA.has(ch))) {
      out += ch;
    } else {
      out += '%' + b.toString(16).toUpperCase().padStart(2, '0');
    }
  }
  return out;
}

/**
 * Percent-encode a string for use as a fragment component.
 *
 * Fragments allow the same characters as queries in practice, but they
 * are not subject to `&`/`=` pair semantics. We still encode `&` and `=`
 * for consistency with encodeQuery so the two functions do not surprise
 * callers who switch between them.
 */
export function encodeFragment(input) {
  return encodeQuery(input);
}

/**
 * Percent-encode a string as an opaque URI component.
 *
 * Only unreserved characters survive. Useful for encoding a single
 * segment, a parameter value, or anything that must not contain
 * reserved characters at all.
 */
export function encodeComponent(input) {
  if (typeof input !== 'string') {
    throw new TypeError('input must be a string');
  }
  const bytes = new TextEncoder().encode(input);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const ch = String.fromCharCode(b);
    if (b < 0x80 && UNRESERVED.has(ch)) {
      out += ch;
    } else {
      out += '%' + b.toString(16).toUpperCase().padStart(2, '0');
    }
  }
  return out;
}
