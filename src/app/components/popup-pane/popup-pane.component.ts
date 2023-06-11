import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-popup-pane',
  templateUrl: './popup-pane.component.html',
  styleUrls: ['./popup-pane.component.css']
})
export class PopupPaneComponent implements OnInit, OnDestroy {
  public currentPopup: string = '';
  public ransomText: string = '';
  private popupSub!: Subscription;

  constructor(private popupService: PopupService, private httpService: HttpService) { }

  ngOnInit(): void {
    this.popupSub = this.popupService.getPopupToShow().subscribe({
      next: (popup: string) => {
        this.currentPopup = popup;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.popupSub) {
      this.popupSub.unsubscribe();
    }
  }

  public onClosePopup(): void {
    this.popupService.setPopupToShow('');
  }

  public onGenerateRansom(): void {
    this.httpService.getRansom(Math.floor(Math.random()*10000)).then(
      (res) => {
        this.ransomText = res && res.ransom ? res.ransom : '';
      }
    )
  }
}
