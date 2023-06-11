import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PopupService } from 'src/app/services/popup.service';
import { GuessService } from 'src/app/services/guess.service';
import { LetterMakerService } from 'src/app/services/letter-maker.service';
import { Letter, LetterService } from 'src/app/services/letter.service';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public headerLetters: Letter[] = [];
  public isDev: boolean;
  private seedOff = 27; // 27 my current favorite. I wrote down 1, 5, 13 also?

  // TODO - remove dev stuff
  public devItems: { text: string, callback: Function }[] = [
    { text: "~~DEV TOOLS~~", 
      callback: () => {
        this.isDev = false;
        this.guessService.devIgnoreWordCheck = false;
      }
    },
    { text: "Print Today's Word", 
      callback: () => {
        console.log(this.guessService.getSolutionWord());
      }
    },
    { text: 'Print Local Storage', 
      callback: () => {
        let data = localStorage.getItem('mw-data');
        data = data ? data : ''
        console.log(JSON.parse(data));
      } 
    },
    { text: 'Clear Local Storage', 
      callback: () => {
        this.storageService.clearStorageAndResetApp();
      } 
    },
    { text: 'Add Fake History', 
      callback: () => {
        this.storageService.devSetHistory([0, 2, 7, 15, 9, 22]);
      } 
    },
    { text: 'New Header', 
      callback: () => {
        this.headerLetters = this.letterMakerService.generateLetterArray('mystery word', true, {}, ++this.seedOff);
        console.log('Displaying header with Seed Offset:', this.seedOff);
      } 
    },
    { text: 'Toggle Word Check', 
      callback: () => {
        this.guessService.devIgnoreWordCheck = !this.guessService.devIgnoreWordCheck;
        this.guessService.lockApp();
        this.guessService.unlockApp();
        console.log(`Will now ${this.guessService.devIgnoreWordCheck ? 'IGNORE' : 'VALIDATE'} every word submitted.`)
      } 
    },
    { text: '"Skip" to Next Day', 
      callback: () => {
        this.storageService.devBumpBackLastDayPlayed(1);
      } 
    },
    { text: '"Skip" Two Days', 
      callback: () => {
        this.storageService.devBumpBackLastDayPlayed(2);
      } 
    },
  ];

  constructor(private letterMakerService: LetterMakerService, private storageService: StorageService, private guessService: GuessService, private popupService: PopupService) { //TODO - remove uneccessary service (from dev use!)
    this.isDev = !environment.production;
  }

  ngOnInit(): void {
    this.headerLetters = this.letterMakerService.generateLetterArray('mystery word', true, {}, this.seedOff);

    this.guessService.getAppState().subscribe({
      next: (appState) => {
        if (appState.devMode) {
          this.isDev = true;
        }
      }
    })
    
    for(let letter of this.headerLetters) {
      if(letter.letter === ' ') {
        letter.style = {
          ...letter.style,
          'margin-left': '5vw',
        }
      }
      else {
        letter.style = {
          ...letter.style,
          'font-size': (Math.floor(Math.random()*3)+5) + 'vw',
          'cursor': 'default'
        };
      }
    }
  }


  // TODO: remove dev stuff?
  onScroll() {
    console.log(window.scrollY);
  }

  onAbout() {
    window.scrollTo(0,0);
    this.popupService.setPopupToShow('about');
  }

  onHowToPlay() {
    window.scrollTo(0,0);
    this.popupService.setPopupToShow('info');
  }
  
  onShowStats() {
    window.scrollTo(0,0);
    this.popupService.setPopupToShow('gameOver');
  }
}