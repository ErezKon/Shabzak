import { Pipe, PipeTransform } from '@angular/core';
import { renderChatMarkdown } from '../../utils/markdown';

@Pipe({
  name: 'chatMarkdown',
  standalone: true
})
export class ChatMarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? renderChatMarkdown(value) : '';
  }
}
