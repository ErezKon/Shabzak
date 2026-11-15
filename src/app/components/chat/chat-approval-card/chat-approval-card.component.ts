import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CHAT_MAX_REJECT_REASON_CHARS, ChatApproval, ChatDecision, ChatRisk } from '../../../models/chat/chat.model';
import { ApprovalChoice, ApprovalChoiceState, emptyChoices, setAllChoices, toChatDecisions } from '../../../services/chat/chat-decisions';

const RISK_LABELS: Record<ChatRisk, string> = {
  low: 'סיכון נמוך',
  medium: 'סיכון בינוני',
  high: 'סיכון גבוה'
};

@Component({
  selector: 'app-chat-approval-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatButtonToggleModule, MatIconModule],
  templateUrl: './chat-approval-card.component.html',
  styleUrl: './chat-approval-card.component.scss'
})
export class ChatApprovalCardComponent implements OnChanges {
  @Input({ required: true }) approval!: ChatApproval;
  @Input() highlight = false;
  @Input() busy = false;
  @Output() decide = new EventEmitter<ChatDecision[]>();

  readonly maxReason = CHAT_MAX_REJECT_REASON_CHARS;
  choices: ApprovalChoiceState[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['approval'];
    if (change && (change.firstChange || change.previousValue?.actions !== this.approval.actions)) {
      this.choices = emptyChoices(this.approval.actions.length);
    }
  }

  get pending(): boolean {
    return this.approval.status === 'pending';
  }

  get canSubmit(): boolean {
    return this.pending && !this.busy && toChatDecisions(this.choices) !== null;
  }

  get header(): string {
    switch (this.approval.status) {
      case 'pending':
        return this.approval.actions.length > 1
          ? `נדרש אישור ל-${this.approval.actions.length} פעולות לפני ביצוען`
          : 'נדרש אישור לפני ביצוע הפעולה';
      case 'submitted':
        return 'ההחלטות נשלחו';
      default:
        return 'הבקשה פגה והפעולות לא בוצעו';
    }
  }

  riskLabel(risk: ChatRisk): string {
    return RISK_LABELS[risk];
  }

  choose(index: number, choice: ApprovalChoice): void {
    this.choices = this.choices.map((state, i) => (i === index ? { ...state, choice } : state));
  }

  setReason(index: number, reason: string): void {
    this.choices = this.choices.map((state, i) => (i === index ? { ...state, reason } : state));
  }

  setAll(choice: ApprovalChoice): void {
    this.choices = setAllChoices(this.choices, choice);
  }

  outcome(index: number): string {
    if (this.approval.status === 'expired') {
      return 'לא בוצע';
    }
    const decision = this.approval.decisions?.[index];
    if (!decision) {
      return '';
    }
    if (decision.type === 'approve') {
      return 'אושר';
    }
    return decision.message ? `נדחה: ${decision.message}` : 'נדחה';
  }

  outcomeKind(index: number): 'approved' | 'rejected' | 'expired' {
    if (this.approval.status === 'expired') {
      return 'expired';
    }
    return this.approval.decisions?.[index]?.type === 'approve' ? 'approved' : 'rejected';
  }

  submit(): void {
    const decisions = toChatDecisions(this.choices);
    if (decisions && this.pending && !this.busy) {
      this.decide.emit(decisions);
    }
  }
}
