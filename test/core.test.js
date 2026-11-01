import test from 'node:test';
import assert from 'node:assert/strict';
import { encodePath, encodeQuery, encodeFragment, encodeComponent } from '../src/index.js';

test('encodePath leaves unreserved and path-safe characters alone', () => {
  assert.equal(encodePath('/foo/bar-baz_qux~1'), '/foo/bar-baz_qux~1');
});

test('encodePath encodes spaces and reserved characters it does not allow', () => {
  assert.equal(encodePath('a b?c#d'), 'a%20b%3Fc%23d');
});

test('encodePath keeps sub-delims and colon and at-sign', () => {
  assert.equal(encodePath("a!$&'()*+,;=:@"), "a!$&'()*+,;=:@");
});

test('encodeQuery encodes ampersand and equals to protect key=value pairs', () => {
  assert.equal(encodeQuery('a&b=c'), 'a%26b%3Dc');
});

test('encodeQuery keeps slash and question mark', () => {
  assert.equal(encodeQuery('/path?x'), '/path?x');
});

test('encodeQuery encodes plus because it is a sub-delim but not a query separator we want to keep', () => {
  assert.equal(encodeQuery('a+b'), 'a+b');
});

test('encodeFragment behaves like encodeQuery for ampersand and equals', () => {
  assert.equal(encodeFragment('a&b=c'), 'a%26b%3Dc');
});

test('encodeComponent encodes everything except unreserved', () => {
  assert.equal(encodeComponent('a/b?c=d&e'), 'a%2Fb%3Fc%3Dd%26e');
});

test('encodes non-ASCII as UTF-8 percent-encoded bytes', () => {
  assert.equal(encodeComponent('é'), '%C3%A9');
  assert.equal(encodePath('é'), '%C3%A9');
  assert.equal(encodeQuery('é'), '%C3%A9');
  assert.equal(encodeFragment('é'), '%C3%A9');
});

test('encodes a lone surrogate as replacement character bytes', () => {
  assert.equal(encodeComponent('\uD800'), '%EF%BF%BD');
});

test('rejects non-string input', () => {
  assert.throws(() => encodePath(123), TypeError);
  assert.throws(() => encodeQuery(null), TypeError);
  assert.throws(() => encodeFragment(undefined), TypeError);
  assert.throws(() => encodeComponent({}), TypeError);
});

test('handles empty string', () => {
  assert.equal(encodePath(''), '');
  assert.equal(encodeQuery(''), '');
  assert.equal(encodeFragment(''), '');
  assert.equal(encodeComponent(''), '');
});
