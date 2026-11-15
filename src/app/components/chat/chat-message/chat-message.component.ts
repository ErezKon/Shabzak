import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../models/chat/chat.model';
import { ChatMarkdownPipe } from '../chat-markdown.pipe';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [ChatMarkdownPipe],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: ChatMessage;
}
