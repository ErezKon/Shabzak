import { SseMessage, SseParser } from './sse-parser';

function parseAll(chunks: string[]): SseMessage[] {
  const parser = new SseParser();
  const messages = chunks.flatMap(chunk => parser.push(chunk));
  return [...messages, ...parser.end()];
}

const STREAM =
  'event: thread\ndata: {"threadId":"t-1"}\n\n' +
  ': ping\n\n' +
  'event: status\ndata: {"phase":"thinking","label":"חושב…"}\n\n' +
  'event: token\ndata: {"text":"שלום "}\n\n' +
  'event: token\ndata: {"text":"עולם"}\n\n' +
  'event: final\ndata: {"message":"שלום עולם","refresh":[]}\n\n' +
  'event: done\ndata: {}\n\n';

const EXPECTED: SseMessage[] = [
  { event: 'thread', data: '{"threadId":"t-1"}' },
  { event: 'status', data: '{"phase":"thinking","label":"חושב…"}' },
  { event: 'token', data: '{"text":"שלום "}' },
  { event: 'token', data: '{"text":"עולם"}' },
  { event: 'final', data: '{"message":"שלום עולם","refresh":[]}' },
  { event: 'done', data: '{}' }
];

describe('SseParser', () => {
  it('parses complete events and ignores comments (pings)', () => {
    expect(parseAll([STREAM])).toEqual(EXPECTED);
  });

  it('gives the same events however the stream is split into chunks', () => {
    for (let split = 1; split < STREAM.length; split++) {
      expect(parseAll([STREAM.slice(0, split), STREAM.slice(split)])).withContext(`split at ${split}`).toEqual(EXPECTED);
    }
    expect(parseAll(STREAM.split(''))).toEqual(EXPECTED);
  });

  it('accepts CRLF and CR line endings, also when a CRLF is split across chunks', () => {
    const crlf = STREAM.replace(/\n/g, '\r\n');
    const cr = STREAM.replace(/\n/g, '\r');
    expect(parseAll([crlf])).toEqual(EXPECTED);
    expect(parseAll([cr])).toEqual(EXPECTED);
    for (let split = 1; split < crlf.length; split++) {
      expect(parseAll([crlf.slice(0, split), crlf.slice(split)])).withContext(`split at ${split}`).toEqual(EXPECTED);
    }
  });

  it('joins multi-line data with newlines and strips only one leading space', () => {
    expect(parseAll(['event: token\ndata: line 1\ndata:  line 2\ndata:line3\n\n'])).toEqual([
      { event: 'token', data: 'line 1\n line 2\nline3' }
    ]);
  });

  it('uses "message" as the default event name and resets the name after each event', () => {
    expect(parseAll(['data: a\n\nevent: x\ndata: b\n\ndata: c\n\n'])).toEqual([
      { event: 'message', data: 'a' },
      { event: 'x', data: 'b' },
      { event: 'message', data: 'c' }
    ]);
  });

  it('dispatches an event with empty data but not an event without data lines', () => {
    expect(parseAll(['event: a\n\nevent: b\ndata\n\n'])).toEqual([{ event: 'b', data: '' }]);
  });

  it('ignores unknown fields, id and retry, and a leading byte order mark', () => {
    expect(parseAll(['\uFEFFid: 7\nretry: 1000\nfoo: bar\nevent: done\ndata: {}\n\n'])).toEqual([{ event: 'done', data: '{}' }]);
  });

  it('discards an event that is not terminated by an empty line when the stream ends', () => {
    const parser = new SseParser();
    expect(parser.push('event: done\ndata: {}\n')).toEqual([]);
    expect(parser.end()).toEqual([]);
    expect(parseAll(['event: done\ndata: {}\r\r'])).toEqual([{ event: 'done', data: '{}' }]);
  });
});
