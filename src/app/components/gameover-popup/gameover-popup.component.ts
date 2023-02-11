import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-gameover-popup',
  templateUrl: './gameover-popup.component.html',
  styleUrls: ['./gameover-popup.component.css']
})
export class GameoverPopupComponent implements OnInit {

  @Output() closePopup = new EventEmitter<void>();

  public guessCountHistory: number[] = [];
  public timesPlayed = 0;

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.guessCountHistory = this.storageService.getGuessCountHistory();
    this.timesPlayed = this.storageService.getTimesPlayed();
  }

  onClosePopup(): void {
    this.closePopup.next();
  }

}
