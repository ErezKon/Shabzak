export const CHAT_MAX_MESSAGE_CHARS = 2000;
export const CHAT_MAX_REJECT_REASON_CHARS = 500;

export type ChatRefreshHint = 'missions' | 'soldiers' | 'users' | 'vacations' | 'candidates';

export type ChatRisk = 'low' | 'medium' | 'high';

export type ChatErrorCode =
    | 'unauthorized'
    | 'forbidden'
    | 'approval_pending'
    | 'thread_busy'
    | 'thread_not_found'
    | 'rate_limited'
    | 'bad_request'
    | 'not_found'
    | 'upstream_error'
    | 'internal'
    | 'network';

export interface ChatApprovalAction {
    index: number;
    tool: string;
    title: string;
    details: string[];
    warnings: string[];
    risk: ChatRisk;
}

export type ChatDecision = { type: 'approve' } | { type: 'reject'; message?: string };

export type ChatStreamEvent =
    | { type: 'thread'; threadId: string }
    | { type: 'status'; phase: 'thinking' | 'tool_start' | 'tool_end'; tool?: string; label: string }
    | { type: 'token'; text: string }
    | { type: 'approval_required'; actions: ChatApprovalAction[] }
    | { type: 'final'; message: string; refresh: ChatRefreshHint[] }
    | { type: 'error'; code: ChatErrorCode; message: string }
    | { type: 'done' };

export interface ChatRequestError {
    status: number;
    code: ChatErrorCode;
    message: string;
    retryAfterSeconds?: number;
}

export interface ChatApproval {
    actions: ChatApprovalAction[];
    status: 'pending' | 'submitted' | 'expired';
    decisions?: ChatDecision[];
}

export type ChatMessageRole = 'user' | 'assistant' | 'note' | 'approval';

export interface ChatMessage {
    id: string;
    role: ChatMessageRole;
    text: string;
    createdAt: number;
    streaming?: boolean;
    interrupted?: boolean;
    failed?: boolean;
    approval?: ChatApproval;
}

export type ChatErrorAction = 'retry' | 'new_chat';

export interface ChatError {
    code: ChatErrorCode;
    message: string;
    detail?: string;
    action?: ChatErrorAction;
}

export interface ChatPendingApproval {
    messageId: string;
    actions: ChatApprovalAction[];
}

export interface ChatState {
    open: boolean;
    threadId: string | null;
    messages: ChatMessage[];
    streaming: boolean;
    statusLabel: string | null;
    pendingApproval: ChatPendingApproval | null;
    error: ChatError | null;
    unread: boolean;
    highlightApproval: boolean;
}

export const INITIAL_CHAT_STATE: ChatState = {
    open: false,
    threadId: null,
    messages: [],
    streaming: false,
    statusLabel: null,
    pendingApproval: null,
    error: null,
    unread: false,
    highlightApproval: false,
};
