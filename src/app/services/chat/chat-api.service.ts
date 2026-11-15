import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, InjectionToken, NgZone, PLATFORM_ID } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatDecision, ChatRequestError, ChatStreamEvent } from '../../models/chat/chat.model';
import { SseMessage, SseParser } from '../../utils/sse-parser';
import { UserService } from '../user.service';
import { chatErrorCode, parseChatEvent } from './chat-protocol';

export type ChatFetch = (url: string, init: RequestInit) => Promise<Response>;

export const CHAT_FETCH = new InjectionToken<ChatFetch>('CHAT_FETCH', {
  providedIn: 'root',
  factory: () => (url: string, init: RequestInit) => fetch(url, init)
});

interface EventSink {
  next(event: ChatStreamEvent): void;
  error(error: ChatRequestError): void;
  complete(): void;
}

const networkError = (): ChatRequestError => ({ status: 0, code: 'network', message: '' });

async function toRequestError(response: Response): Promise<ChatRequestError> {
  let body: { code?: unknown; message?: unknown } | undefined;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  const retryAfter = Number(response.headers.get('Retry-After'));
  return {
    status: response.status,
    code: chatErrorCode(body?.code, response.ok ? 0 : response.status),
    message: typeof body?.message === 'string' ? body.message : '',
    retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private readonly baseUrl = `${environment.agentURL}/chat`;
  private readonly isBrowser: boolean;

  constructor(
    private userService: UserService,
    private zone: NgZone,
    @Inject(CHAT_FETCH) private fetchFn: ChatFetch,
    @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  stream(threadId: string | null, message: string): Observable<ChatStreamEvent> {
    return this.events('stream', threadId ? { threadId, message } : { message });
  }

  resume(threadId: string, decisions: ChatDecision[]): Observable<ChatStreamEvent> {
    return this.events('resume', { threadId, decisions });
  }

  reset(threadId: string): Observable<void> {
    if (!this.isBrowser) {
      return EMPTY;
    }
    return new Observable<void>(subscriber => {
      const controller = new AbortController();
      this.fetchFn(`${this.baseUrl}/reset`, this.requestInit({ threadId }, controller.signal))
        .then(async response => {
          if (response.ok) {
            subscriber.complete();
          } else {
            subscriber.error(await toRequestError(response));
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            subscriber.error(networkError());
          }
        });
      return () => controller.abort();
    });
  }

  private events(path: 'stream' | 'resume', body: object): Observable<ChatStreamEvent> {
    if (!this.isBrowser) {
      return EMPTY;
    }
    return new Observable<ChatStreamEvent>(subscriber => {
      const controller = new AbortController();
      const sink: EventSink = {
        next: event => this.zone.run(() => subscriber.next(event)),
        error: error => this.zone.run(() => subscriber.error(error)),
        complete: () => this.zone.run(() => subscriber.complete())
      };
      this.zone.runOutsideAngular(() => {
        void this.read(`${this.baseUrl}/${path}`, body, controller.signal, sink);
      });
      return () => controller.abort();
    });
  }

  private async read(url: string, body: object, signal: AbortSignal, sink: EventSink): Promise<void> {
    let response: Response;
    try {
      response = await this.fetchFn(url, this.requestInit(body, signal));
    } catch {
      if (!signal.aborted) {
        sink.error(networkError());
      }
      return;
    }
    const contentType = response.headers.get('Content-Type') ?? '';
    if (!response.ok || !response.body || !contentType.includes('text/event-stream')) {
      sink.error(await toRequestError(response));
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const parser = new SseParser();
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        this.emit(parser.push(decoder.decode(value, { stream: true })), sink);
      }
      this.emit(parser.push(decoder.decode()), sink);
      this.emit(parser.end(), sink);
      sink.complete();
    } catch {
      if (!signal.aborted) {
        sink.error(networkError());
      }
    }
  }

  private emit(messages: SseMessage[], sink: EventSink): void {
    for (const message of messages) {
      const event = parseChatEvent(message);
      if (event) {
        sink.next(event);
      }
    }
  }

  private requestInit(body: object, signal: AbortSignal): RequestInit {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.userService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return { method: 'POST', headers, body: JSON.stringify(body), signal };
  }
}
