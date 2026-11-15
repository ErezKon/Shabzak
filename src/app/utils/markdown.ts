import { Marked } from 'marked';

const HTML_ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

export function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]);
}

const chatMarkdown = new Marked({
    gfm: true,
    breaks: true,
    renderer: {
        html({ text }) {
            return escapeHtml(text);
        },
        link({ text, tokens }) {
            return tokens?.length ? this.parser.parseInline(tokens) : escapeHtml(text);
        },
        image({ text }) {
            return escapeHtml(text);
        },
        checkbox({ checked }) {
            return checked ? '☑ ' : '☐ ';
        },
    },
});

export function renderChatMarkdown(markdown: string): string {
    return chatMarkdown.parse(markdown, { async: false });
}
