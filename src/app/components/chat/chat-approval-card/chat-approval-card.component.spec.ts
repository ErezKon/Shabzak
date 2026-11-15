import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ChatApproval, ChatApprovalAction, ChatDecision } from '../../../models/chat/chat.model';
import { ChatApprovalCardComponent } from './chat-approval-card.component';

const VACATION: ChatApprovalAction = {
  index: 0,
  tool: 'request_vacation',
  title: 'בקשת חופשה עבור נועם פרידמן',
  details: ['חייל: נועם פרידמן (#8)', 'תקופה: 01/12–02/12 (יומיים)'],
  warnings: [],
  risk: 'low'
};
const DELETE: ChatApprovalAction = {
  index: 1,
  tool: 'delete_soldier',
  title: 'מחיקת החייל אבי פרץ',
  details: ['שיבוצים: 12'],
  warnings: ['המחיקה סופית'],
  risk: 'high'
};

describe('ChatApprovalCardComponent', () => {
  let fixture: ComponentFixture<ChatApprovalCardComponent>;
  let emitted: ChatDecision[][];

  function render(approval: ChatApproval, busy = false): HTMLElement {
    fixture = TestBed.createComponent(ChatApprovalCardComponent);
    fixture.componentRef.setInput('approval', approval);
    fixture.componentRef.setInput('busy', busy);
    emitted = [];
    fixture.componentInstance.decide.subscribe(decisions => emitted.push(decisions));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function click(element: HTMLElement, selector: string, index = 0): void {
    (element.querySelectorAll(selector)[index] as HTMLElement).click();
    fixture.detectChanges();
  }

  function toggle(element: HTMLElement, action: number, choice: 'approve' | 'reject'): void {
    const button = element.querySelectorAll('.action')[action].querySelector(`.${choice}-toggle button`) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ChatApprovalCardComponent], providers: [provideNoopAnimations()] });
  });

  it('shows the server-built card: title, details, warnings and a risk chip', () => {
    const element = render({ actions: [VACATION, DELETE], status: 'pending' });
    expect(element.querySelector('.approval-header')?.textContent).toContain('נדרש אישור ל-2 פעולות');
    const actions = element.querySelectorAll('.action');
    expect(actions[0].querySelector('.action-title')?.textContent).toContain('בקשת חופשה עבור נועם פרידמן');
    expect(actions[0].querySelectorAll('.details li').length).toBe(2);
    expect(actions[0].querySelector('.risk-chip')?.textContent).toContain('סיכון נמוך');
    expect(actions[1].querySelector('.risk-chip.risk-high')?.textContent).toContain('סיכון גבוה');
    expect(actions[1].querySelector('.warnings')?.textContent).toContain('המחיקה סופית');
  });

  it('submits one decision per action, in order, only once every action has a choice', () => {
    const element = render({ actions: [VACATION, DELETE], status: 'pending' });
    const submit = element.querySelector('.submit-decisions') as HTMLButtonElement;
    expect(submit.disabled).toBeTrue();
    toggle(element, 0, 'approve');
    expect(submit.disabled).toBeTrue();
    toggle(element, 1, 'reject');
    const reason = element.querySelectorAll('.action')[1].querySelector('input.reason') as HTMLInputElement;
    reason.value = '  לא לפני השבת  ';
    reason.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(submit.disabled).toBeFalse();
    submit.click();
    expect(emitted).toEqual([[{ type: 'approve' }, { type: 'reject', message: 'לא לפני השבת' }]]);
  });

  it('approves or rejects all actions at once', () => {
    const element = render({ actions: [VACATION, DELETE], status: 'pending' });
    click(element, '.approve-all');
    click(element, '.submit-decisions');
    click(element, '.reject-all');
    click(element, '.submit-decisions');
    expect(emitted).toEqual([
      [{ type: 'approve' }, { type: 'approve' }],
      [{ type: 'reject' }, { type: 'reject' }]
    ]);
  });

  it('has no bulk buttons for a single action', () => {
    const element = render({ actions: [VACATION], status: 'pending' });
    expect(element.querySelector('.approve-all')).toBeNull();
    expect(element.querySelector('.approval-header')?.textContent).toContain('נדרש אישור לפני ביצוע הפעולה');
    toggle(element, 0, 'reject');
    click(element, '.submit-decisions');
    expect(emitted).toEqual([[{ type: 'reject' }]]);
  });

  it('cannot submit while the assistant is busy', () => {
    const element = render({ actions: [VACATION], status: 'pending' }, true);
    fixture.componentInstance.setAll('approve');
    fixture.detectChanges();
    expect((element.querySelector('.submit-decisions') as HTMLButtonElement).disabled).toBeTrue();
    fixture.componentInstance.submit();
    expect(emitted).toEqual([]);
  });

  it('shows what was decided once submitted, or that the request expired', () => {
    let element = render({ actions: [VACATION, DELETE], status: 'submitted', decisions: [{ type: 'approve' }, { type: 'reject', message: 'לא' }] });
    expect(element.querySelector('mat-button-toggle-group')).toBeNull();
    expect(element.querySelector('.submit-decisions')).toBeNull();
    const outcomes = Array.from(element.querySelectorAll('.outcome')).map(e => e.textContent?.trim());
    expect(outcomes).toEqual(['אושר', 'נדחה: לא']);
    element = render({ actions: [VACATION], status: 'expired' });
    expect(element.querySelector('.outcome')?.textContent).toContain('לא בוצע');
    expect(element.querySelector('.approval-header')?.textContent).toContain('הבקשה פגה');
  });
});
