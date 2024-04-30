import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private _snackBar: MatSnackBar) { }

  openSnackBar(message: string, duration: number = 5000) {
    this._snackBar.open(message,'', {
      duration: duration
    } as MatSnackBarConfig);
  }
}
