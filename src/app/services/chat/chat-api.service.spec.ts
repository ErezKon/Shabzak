import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { lastValueFrom, toArray } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatStreamEvent } from '../../models/chat/chat.model';
import { UserService } from '../user.service';
import { CHAT_FETCH, ChatApiService, ChatFetch } from './chat-api.service';

const SSE_HEADERS = { 'Content-Type': 'text/event-stream; charset=utf-8' };
const STREAM =
  'event: thread\ndata: {"threadId":"t-1"}\n\n' +
  ': ping\n\n' +
  'event: token\ndata: {"text":"מי בשמירה מחר?"}\n\n' +
  'event: final\ndata: {"message":"מי בשמירה מחר?","refresh":["missions"]}\n\n' +
  'event: done\ndata: {}\n\n';

function byteChunks(text: string, size: number): Uint8Array[] {
  const bytes = new TextEncoder().encode(text);
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < bytes.length; i += size) {
    chunks.push(bytes.slice(i, i + size));
  }
  return chunks;
}

function streamResponse(chunks: Uint8Array[], init: ResponseInit = { headers: SSE_HEADERS }): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(chunk));
      controller.close();
    }
  });
  return new Response(body, init);
}

describe('ChatApiService', () => {
  let fetchSpy: jasmine.Spy<ChatFetch>;
  let token: string | null;

  function setup(platform = 'browser'): ChatApiService {
    TestBed.configureTestingModule({
      providers: [
        { provide: CHAT_FETCH, useValue: fetchSpy },
        { provide: UserService, useValue: { getToken: () => token } },
        { provide: PLATFORM_ID, useValue: platform }
      ]
    });
    return TestBed.inject(ChatApiService);
  }

  beforeEach(() => {
    token = 'jwt-token';
    fetchSpy = jasmine.createSpy<ChatFetch>('fetch');
  });

  it('posts the message with the bearer token and emits the parsed events', async () => {
    fetchSpy.and.resolveTo(streamResponse(byteChunks(STREAM, 4096)));
    const api = setup();
    const events = await lastValueFrom(api.stream(null, 'מי בשמירה מחר?').pipe(toArray()));
    const [url, init] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe(`${environment.agentURL}/chat/stream`);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer jwt-token' });
    expect(JSON.parse(init.body as string)).toEqual({ message: 'מי בשמירה מחר?' });
    expect(events).toEqual([
      { type: 'thread', threadId: 't-1' },
      { type: 'token', text: 'מי בשמירה מחר?' },
      { type: 'final', message: 'מי בשמירה מחר?', refresh: ['missions'] },
      { type: 'done' }
    ] as ChatStreamEvent[]);
  });

  it('decodes Hebrew split in the middle of a character across chunks', async () => {
    for (const size of [1, 2, 3, 5, 7]) {
      fetchSpy.and.resolveTo(streamResponse(byteChunks(STREAM, size)));
      TestBed.resetTestingModule();
      const events = await lastValueFrom(setup().stream('t-1', 'x').pipe(toArray()));
      expect(events[1]).withContext(`chunk size ${size}`).toEqual({ type: 'token', text: 'מי בשמירה מחר?' });
    }
  });

  it('sends the thread and the decisions on resume, without a token header when logged out', async () => {
    token = null;
    fetchSpy.and.resolveTo(streamResponse(byteChunks('event: done\ndata: {}\n\n', 64)));
    const api = setup();
    await lastValueFrom(api.resume('t-1', [{ type: 'approve' }, { type: 'reject', message: 'לא' }]).pipe(toArray()));
    const [url, init] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe(`${environment.agentURL}/chat/resume`);
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body as string)).toEqual({ threadId: 't-1', decisions: [{ type: 'approve' }, { type: 'reject', message: 'לא' }] });
  });

  it('turns a JSON error before the stream into a request error with Retry-After', async () => {
    fetchSpy.and.resolveTo(new Response(JSON.stringify({ code: 'rate_limited', message: 'Too many requests.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '7' }
    }));
    await expectAsync(lastValueFrom(setup().stream(null, 'x'))).toBeRejectedWith({
      status: 429, code: 'rate_limited', message: 'Too many requests.', retryAfterSeconds: 7
    });
  });

  it('derives the code from the status when the body is not the agent JSON', async () => {
    fetchSpy.and.resolveTo(new Response('<html>Bad gateway</html>', { status: 502, headers: { 'Content-Type': 'text/html' } }));
    await expectAsync(lastValueFrom(setup().stream(null, 'x'))).toBeRejectedWith({
      status: 502, code: 'upstream_error', message: '', retryAfterSeconds: undefined
    });
  });

  it('treats a successful answer that is not an event stream as an internal error', async () => {
    fetchSpy.and.resolveTo(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    await expectAsync(lastValueFrom(setup().stream(null, 'x'))).toBeRejectedWith(jasmine.objectContaining({ status: 200, code: 'internal' }));
  });

  it('reports a network error when the agent cannot be reached or the stream breaks', async () => {
    fetchSpy.and.rejectWith(new TypeError('Failed to fetch'));
    await expectAsync(lastValueFrom(setup().stream(null, 'x'))).toBeRejectedWith({ status: 0, code: 'network', message: '' });

    let delivered = false;
    const broken = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (delivered) {
          controller.error(new TypeError('network error'));
        } else {
          delivered = true;
          controller.enqueue(new TextEncoder().encode('event: thread\ndata: {"threadId":"t"}\n\n'));
        }
      }
    });
    fetchSpy.and.resolveTo(new Response(broken, { headers: SSE_HEADERS }));
    const received: ChatStreamEvent[] = [];
    await expectAsync(new Promise((resolve, reject) => {
      TestBed.inject(ChatApiService).stream(null, 'x').subscribe({ next: e => received.push(e), error: reject, complete: () => resolve(undefined) });
    })).toBeRejectedWith({ status: 0, code: 'network', message: '' });
    expect(received).toEqual([{ type: 'thread', threadId: 't' }]);
  });

  it('aborts the request when the subscriber unsubscribes and emits nothing after that', async () => {
    let signal: AbortSignal | undefined;
    fetchSpy.and.callFake((_url, init) => {
      signal = init.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))));
    });
    const next = jasmine.createSpy('next');
    const error = jasmine.createSpy('error');
    const subscription = setup().stream(null, 'x').subscribe({ next, error });
    await Promise.resolve();
    subscription.unsubscribe();
    await new Promise(resolve => setTimeout(resolve));
    expect(signal?.aborted).toBeTrue();
    expect(next).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('posts reset and completes on 204', async () => {
    fetchSpy.and.resolveTo(new Response(null, { status: 204 }));
    await expectAsync(lastValueFrom(setup().reset('t-1'), { defaultValue: 'completed' })).toBeResolvedTo('completed');
    const [url, init] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe(`${environment.agentURL}/chat/reset`);
    expect(JSON.parse(init.body as string)).toEqual({ threadId: 't-1' });
  });

  it('does nothing on the server (SSR)', async () => {
    const api = setup('server');
    expect(await lastValueFrom(api.stream(null, 'x').pipe(toArray()))).toEqual([]);
    expect(await lastValueFrom(api.reset('t-1'), { defaultValue: 'none' })).toBe('none');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
