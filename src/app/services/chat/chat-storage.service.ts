import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { parseStoredChat, StoredChat } from './chat-protocol';

const KEY_PREFIX = 'shabzak.chat.';
const MAX_STORED_MESSAGES = 200;
const MAX_STORED_CHARS = 500_000;

@Injectable({
  providedIn: 'root'
})
export class ChatStorageService {
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  load(userId: number): StoredChat | null {
    const storage = this.storage();
    if (!storage) {
      return null;
    }
    try {
      return parseStoredChat(storage.getItem(KEY_PREFIX + userId));
    } catch {
      return null;
    }
  }

  save(userId: number, chat: StoredChat): void {
    const storage = this.storage();
    if (!storage) {
      return;
    }
    let messages = chat.messages.slice(-MAX_STORED_MESSAGES);
    let json = JSON.stringify({ threadId: chat.threadId, messages });
    while (json.length > MAX_STORED_CHARS && messages.length > 1) {
      messages = messages.slice(Math.ceil(messages.length / 4));
      json = JSON.stringify({ threadId: chat.threadId, messages });
    }
    try {
      storage.setItem(KEY_PREFIX + userId, json);
    } catch {
      this.clear(userId);
    }
  }

  clear(userId: number): void {
    try {
      this.storage()?.removeItem(KEY_PREFIX + userId);
    } catch {
      return;
    }
  }

  private storage(): Storage | null {
    if (!this.isBrowser || typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage;
  }
}
