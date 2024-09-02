import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface WindowSize {
  height: number;
  width: number;
}

@Injectable({
  providedIn: 'root'
})
export class WindowSizeService {

  private size: WindowSize

  private size$ = new BehaviorSubject<WindowSize>({
    height: 700,
    width: 400
  });
  
  getSize$ = this.size$.asObservable();

  constructor() { 
    this.size = {
      height: 700,
      width: 400
    }
  }

  changeSize(height: number, width: number) {
    
    this.size = {
      height: height,
      width: width
    }
    this.size$.next(this.size);
  }

}
