import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupToShow: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private currentPopupName: string = '';

  constructor() { }

  public getPopupToShow(): Observable<string> {
    return this.popupToShow.asObservable();
  }

  public setPopupToShow(popupName: string): void {
    this.currentPopupName = popupName;
    this.popupToShow.next(this.currentPopupName);
  }

  public getCurrentPopupName(): string {
    return this.currentPopupName;
  }
}
