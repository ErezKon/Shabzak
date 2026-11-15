import { escapeHtml, renderChatMarkdown } from './markdown';

describe('renderChatMarkdown', () => {
  it('renders the markdown the assistant uses: emphasis, lists, line breaks and RTL tables', () => {
    const html = renderChatMarkdown('**מחר** בשמירה:\n- אבי\n- דנה\n\n| משמרת | חיילים |\n|---|---|\n| 08:00–12:00 | 2/2 |');
    expect(html).toContain('<strong>מחר</strong>');
    expect(html).toContain('<li>אבי</li>');
    expect(html).toContain('<table>');
    expect(html).toContain('<th>משמרת</th>');
    expect(html).toContain('<td>08:00–12:00</td>');
    expect(renderChatMarkdown('שורה 1\nשורה 2')).toContain('<br>');
  });

  it('shows raw HTML as text instead of rendering it', () => {
    const html = renderChatMarkdown('<img src=x onerror="alert(1)"> <b>bold</b>\n\n<div onclick="x()">block</div>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>');
    expect(html).not.toContain('<div');
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  });

  it('never renders images or links, so a reply cannot make the browser fetch or open a URL', () => {
    const html = renderChatMarkdown('![מפה](https://example.com/x.png?d=secret) [לחץ כאן](https://evil.example/a) https://evil.example/b <https://evil.example/c>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<a');
    expect(html).not.toContain('href');
    expect(html).toContain('מפה');
    expect(html).toContain('לחץ כאן');
    expect(html).toContain('https://evil.example/b');
  });

  it('renders task-list checkboxes as characters instead of inputs', () => {
    const html = renderChatMarkdown('- [x] בוצע\n- [ ] פתוח');
    expect(html).not.toContain('<input');
    expect(html).toContain('☑');
    expect(html).toContain('☐');
  });

  it('escapes the five HTML special characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});
