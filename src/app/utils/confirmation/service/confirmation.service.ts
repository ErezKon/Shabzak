import { Injectable } from '@angular/core';
import { ConfirmationDialogResult } from '../models/dialog-result.model';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModel } from '../models/confirmation.model';
import { ConfirmationComponent } from '../component/confirmation.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  constructor(public dialog: MatDialog) { }

  showConfirmation(data: ConfirmationModel): Observable<ConfirmationDialogResult> {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: data,
      disableClose: false
    });

    return dialogRef.afterClosed();
  }
}
