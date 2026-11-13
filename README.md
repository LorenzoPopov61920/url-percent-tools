# url-percent-tools

Percent-encode URI components with character sets tailored to path, query, and fragment segments.

```js
import { encodePath, encodeQuery, encodeFragment, encodeComponent } from 'url-percent-tools';

encodePath('/users/john doe');        // '/users/john%20doe'
encodeQuery('q=hello world&lang=en'); // 'q%3Dhello%20world%26lang%3Den'
encodeFragment('section 1');          // 'section%201'
encodeComponent('a/b');               // 'a%2Fb'
```

## Why this exists

JavaScript's built-in `encodeURIComponent` encodes too much for a path (it escapes `/` and `:`) and too little for a query value (it leaves `&` and `=` alone, which corrupts `key=value` pairs). The `URL` and `URLSearchParams` APIs handle full URLs but not individual segments. This library provides four small functions that encode a string for a specific URI component, leaving exactly the characters that are safe in that context.

The trade-off: `encodeQuery` and `encodeFragment` encode `&` and `=` even though RFC 3986 allows them as sub-delimiters. This is deliberate — when you are building a query string by hand, an unescaped `&` or `=` inside a value is a bug. If you need the raw RFC behaviour, use `encodePath` and then encode the separators yourself.

## Edge case

A lone surrogate (e.g. `'\uD800'`) is not valid UTF-8. `TextEncoder` replaces it with U+FFFD, so `encodeComponent('\uD800')` returns `'%EF%BF%BD'`. This is the same behaviour as the platform's `encodeURIComponent`.

## API

- `encodePath(input: string): string` — leaves unreserved, sub-delims, `:`, `@`, and `/`.
- `encodeQuery(input: string): string` — leaves unreserved, sub-delims except `&` and `=`, `:`, `@`, `/`, and `?`.
- `encodeFragment(input: string): string` — same as `encodeQuery`.
- `encodeComponent(input: string): string` — leaves only unreserved characters.

All functions throw `TypeError` if `input` is not a string.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

