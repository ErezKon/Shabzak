import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationModel } from '../models/confirmation.model';
import { ConfirmationDialogResult } from '../models/dialog-result.model';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule
  ],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss'
})
export class ConfirmationComponent implements OnDestroy {

  title: string;
  confirmationMessage: string;
  yesButtonText: string;
  noButtonText: string;

  subscription: Subscription;

  constructor(public dialogRef: MatDialogRef<ConfirmationComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationModel)
  {
    this.title = data.title ?? 'אישור פעולה';
    this.confirmationMessage = data.confirmationMessage ?? 'האם אתה בטוח שברצונך לבצע את הפעלה';
    this.yesButtonText = data.yesButtonText ?? 'אשר';
    this.noButtonText = data.noButtonText ?? 'בטל';
    
    this.subscription = this.dialogRef.backdropClick().subscribe(s => {
      this.dialogRef.close(ConfirmationDialogResult.NonSelected);
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onNoClick() {
    this.dialogRef.close(ConfirmationDialogResult.Cancel);
  }

  onOk() {
    this.dialogRef.close(ConfirmationDialogResult.Accept);
  }
}
