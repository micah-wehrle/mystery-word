import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopupService } from 'src/app/services/popup.service';
import { GuessService } from 'src/app/services/guess.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-gameover-popup',
  templateUrl: './gameover-popup.component.html',
  styleUrls: ['./gameover-popup.component.css']
})
export class GameoverPopupComponent implements OnInit {
  public gameOver: boolean = false;

  public finalGuessCounts: number[] = [];
  public longestPastGuessAmount: number = 0;
  public isWinner: boolean = false;
  public todayGuessCount: number = 0;
  public gamesFinished: number = 0;

  public stats: Stat[] = [];

  private totalWins: number = 0;

  constructor(private storageService: StorageService, private guessService: GuessService, private popupService: PopupService) {}

  ngOnInit(): void {
    this.scrollToTop();
    
    this.finalGuessCounts = this.storageService.getGuessCountHistory();
    this.gamesFinished = this.storageService.getGamesFinished();
    for (let game of this.finalGuessCounts) {
      this.longestPastGuessAmount = game > this.longestPastGuessAmount ? game : this.longestPastGuessAmount;
      this.totalWins += game;
    }
    this.gameOver = this.storageService.getFinishedToday();
    this.isWinner = this.storageService.getWinStreak() > 0;
    const timesPlayed = this.storageService.getGamesFinished();
    this.stats = [
      {
        type: 'Played',
        value: `${this.storageService.getGamesFinished()}`,
      },
      {
        type: 'Win %',
        value: `${timesPlayed === 0 ? 0 : Math.floor(this.totalWins / this.storageService.getGamesFinished() * 100)}`,
      },
      {
        type: 'Win Streak',
        value: `${this.storageService.getWinStreak()}`,
      },
      {
        type: 'Best Streak',
        value: `${this.storageService.getBestWinStreak()}`,
      },
    ];

    this.todayGuessCount = this.gameOver && this.isWinner ? this.guessService.getGuessCount() : 0;
  }

  private scrollToTop(): void {
    window.scroll(0,0);
  }

  public getProgressBarStyle(index: number): {[key: string]: string} {
    const isBarForToday = index+1 === this.todayGuessCount;
    const width = this.totalWins > 0 ? (this.finalGuessCounts[index]/this.longestPastGuessAmount*93+7)+'%' : '7%';
    let style: {[key: string]: string} = {
      'background-color': isBarForToday ? 'darkgreen' : 'gray',
      'width': width,
    };
    if (this.finalGuessCounts[index] === 0) {
      style = {
        ...style,
        'text-align': 'center',
        'padding-right': '0',
      }
    }

    return style;
  }

  onClosePopup(): void {
    this.popupService.setPopupToShow('');
  }

}

interface Stat {
  type: string
  value: string,
}