export interface SseMessage {
    event: string;
    data: string;
}

export class SseParser {
    private buffer = '';
    private started = false;
    private eventName = '';
    private dataLines: string[] = [];

    push(chunk: string): SseMessage[] {
        if (!this.started && chunk.length > 0) {
            this.started = true;
            if (chunk.charCodeAt(0) === 0xfeff) {
                chunk = chunk.slice(1);
            }
        }
        this.buffer += chunk;
        return this.drain(false);
    }

    end(): SseMessage[] {
        const messages = this.drain(true);
        this.buffer = '';
        this.eventName = '';
        this.dataLines = [];
        return messages;
    }

    private drain(atEnd: boolean): SseMessage[] {
        const messages: SseMessage[] = [];
        let lineStart = 0;
        for (let i = 0; i < this.buffer.length; i++) {
            const ch = this.buffer[i];
            if (ch !== '\n' && ch !== '\r') {
                continue;
            }
            if (ch === '\r' && i === this.buffer.length - 1 && !atEnd) {
                break;
            }
            const line = this.buffer.slice(lineStart, i);
            if (ch === '\r' && this.buffer[i + 1] === '\n') {
                i++;
            }
            lineStart = i + 1;
            const message = this.processLine(line);
            if (message) {
                messages.push(message);
            }
        }
        this.buffer = this.buffer.slice(lineStart);
        return messages;
    }

    private processLine(line: string): SseMessage | null {
        if (line === '') {
            if (this.dataLines.length === 0) {
                this.eventName = '';
                return null;
            }
            const message = { event: this.eventName || 'message', data: this.dataLines.join('\n') };
            this.eventName = '';
            this.dataLines = [];
            return message;
        }
        if (line.startsWith(':')) {
            return null;
        }
        const colon = line.indexOf(':');
        const field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? '' : line.slice(colon + 1);
        if (value.startsWith(' ')) {
            value = value.slice(1);
        }
        if (field === 'event') {
            this.eventName = value;
        } else if (field === 'data') {
            this.dataLines.push(value);
        }
        return null;
    }
}
