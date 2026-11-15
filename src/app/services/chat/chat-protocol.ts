import {
    ChatApproval,
    ChatApprovalAction,
    ChatDecision,
    ChatErrorCode,
    ChatMessage,
    ChatMessageRole,
    ChatRefreshHint,
    ChatRisk,
    ChatStreamEvent,
} from '../../models/chat/chat.model';
import { SseMessage } from '../../utils/sse-parser';

type Json = Record<string, unknown>;

const ERROR_CODES: ReadonlySet<string> = new Set<ChatErrorCode>([
    'unauthorized',
    'forbidden',
    'approval_pending',
    'thread_busy',
    'thread_not_found',
    'rate_limited',
    'bad_request',
    'not_found',
    'upstream_error',
    'internal',
    'network',
]);
const REFRESH_HINTS: ReadonlySet<string> = new Set<ChatRefreshHint>(['missions', 'soldiers', 'users', 'vacations', 'candidates']);
const RISKS: ReadonlySet<string> = new Set<ChatRisk>(['low', 'medium', 'high']);
const PHASES: ReadonlySet<string> = new Set(['thinking', 'tool_start', 'tool_end']);
const ROLES: ReadonlySet<string> = new Set<ChatMessageRole>(['user', 'assistant', 'note', 'approval']);
const APPROVAL_STATUSES: ReadonlySet<string> = new Set<ChatApproval['status']>(['pending', 'submitted', 'expired']);

const asObject = (value: unknown): Json => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : {});
const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const asStrings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

export function isRefreshHint(value: string): value is ChatRefreshHint {
    return REFRESH_HINTS.has(value);
}

export function chatErrorCode(code: unknown, status: number): ChatErrorCode {
    if (typeof code === 'string' && ERROR_CODES.has(code)) {
        return code as ChatErrorCode;
    }
    switch (status) {
        case 400:
        case 413:
            return 'bad_request';
        case 401:
            return 'unauthorized';
        case 403:
            return 'forbidden';
        case 404:
            return 'not_found';
        case 409:
            return 'thread_busy';
        case 429:
            return 'rate_limited';
        case 502:
        case 503:
        case 504:
            return 'upstream_error';
        default:
            return 'internal';
    }
}

export function toApprovalAction(value: unknown, position: number): ChatApprovalAction {
    const raw = asObject(value);
    const tool = asString(raw['tool']);
    const risk = asString(raw['risk']);
    return {
        index: typeof raw['index'] === 'number' ? raw['index'] : position,
        tool,
        title: asString(raw['title']) || tool || 'פעולה במערכת',
        details: asStrings(raw['details']),
        warnings: asStrings(raw['warnings']),
        risk: RISKS.has(risk) ? (risk as ChatRisk) : 'medium',
    };
}

export function parseChatEvent(message: SseMessage): ChatStreamEvent | null {
    let data: Json;
    try {
        data = asObject(message.data ? JSON.parse(message.data) : {});
    } catch {
        return null;
    }
    switch (message.event) {
        case 'thread': {
            const threadId = asString(data['threadId']);
            return threadId ? { type: 'thread', threadId } : null;
        }
        case 'status': {
            const phase = asString(data['phase']);
            return {
                type: 'status',
                phase: PHASES.has(phase) ? (phase as 'thinking' | 'tool_start' | 'tool_end') : 'thinking',
                tool: asString(data['tool']) || undefined,
                label: asString(data['label']),
            };
        }
        case 'token': {
            const text = asString(data['text']);
            return text ? { type: 'token', text } : null;
        }
        case 'approval_required': {
            const actions = Array.isArray(data['actions']) ? data['actions'] : [];
            return { type: 'approval_required', actions: actions.map(toApprovalAction) };
        }
        case 'final':
            return { type: 'final', message: asString(data['message']), refresh: asStrings(data['refresh']).filter(isRefreshHint) };
        case 'error':
            return { type: 'error', code: chatErrorCode(data['code'], 0), message: asString(data['message']) };
        case 'done':
            return { type: 'done' };
        default:
            return null;
    }
}

export interface StoredChat {
    threadId: string | null;
    messages: ChatMessage[];
}

function toDecisions(value: unknown): ChatDecision[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }
    return value.map(item => {
        const raw = asObject(item);
        if (raw['type'] === 'approve') {
            return { type: 'approve' };
        }
        const message = asString(raw['message']);
        return message ? { type: 'reject', message } : { type: 'reject' };
    });
}

function toStoredMessage(value: unknown): ChatMessage | null {
    const raw = asObject(value);
    const id = asString(raw['id']);
    const role = asString(raw['role']);
    if (!id || !ROLES.has(role)) {
        return null;
    }
    const message: ChatMessage = {
        id,
        role: role as ChatMessageRole,
        text: asString(raw['text']),
        createdAt: typeof raw['createdAt'] === 'number' ? raw['createdAt'] : 0,
    };
    if (raw['streaming'] === true) {
        message.streaming = true;
    }
    if (raw['interrupted'] === true) {
        message.interrupted = true;
    }
    if (raw['failed'] === true) {
        message.failed = true;
    }
    if (message.role === 'approval') {
        const approval = asObject(raw['approval']);
        const actions = Array.isArray(approval['actions']) ? approval['actions'].map(toApprovalAction) : [];
        if (actions.length === 0) {
            return null;
        }
        const status = asString(approval['status']);
        message.approval = {
            actions,
            status: APPROVAL_STATUSES.has(status) ? (status as ChatApproval['status']) : 'expired',
        };
        const decisions = toDecisions(approval['decisions']);
        if (decisions) {
            message.approval.decisions = decisions;
        }
    }
    return message;
}

export function parseStoredChat(json: string | null): StoredChat | null {
    if (!json) {
        return null;
    }
    try {
        const raw = asObject(JSON.parse(json));
        const messages = (Array.isArray(raw['messages']) ? raw['messages'] : [])
            .map(toStoredMessage)
            .filter((message): message is ChatMessage => message !== null);
        const threadId = asString(raw['threadId']) || null;
        return threadId || messages.length ? { threadId, messages } : null;
    } catch {
        return null;
    }
}
