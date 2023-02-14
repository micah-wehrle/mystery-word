import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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

  // TODO - remove this
  public devItems: string[] = [
    "Print Today's Word",
    'Print Local Storage',
    'Clear Local Storage',
    'Add Fake History',
    'New Header',
    'Toggle Word Check',
  ];

  @Output() openHelpPage = new EventEmitter<void>();
  @Output() openStats = new EventEmitter<void>();

  private seedOff = 27;


  constructor(private letterMakerService: LetterMakerService, private storageService: StorageService, private guessService: GuessService) { //TODO - remove uneccessary service (dev only)
    this.isDev = !environment.production;
  }

  ngOnInit(): void {

    //TODO - switch to letter maker
    // this.headerLetters = this.letterService.generateRansomText('mystery word', 3, {}, {randomColors: true}); // Dang just really got used to how this one looks!
    this.headerLetters = this.letterMakerService.generateLetterArray('mystery word', true, {}, 27); // pretty good: 1,5, 13?

    
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



  onScroll() {
    console.log(window.scrollY);
  }

  onHowToPlay() {
    window.scrollTo(0,0);
    this.openHelpPage.next();
  }

  onShowStats() {
    window.scrollTo(0,0);
    this.openStats.next();
  }

  public devTools(toolNum: number): void {
    switch(toolNum) {
      case 2:
        this.storageService.clearStorageAndResetApp();
        break;
      case 0:
        console.log(this.guessService.getSolutionWord());
        break;
      case 1:
        let data = localStorage.getItem('mw-data');
        data = data ? data : ''
        console.log(JSON.parse(data));
        break;
      case 3:
        this.storageService.devSetHistory([0, 2, 7, 15, 9, 22])
        break;
      case 4:
        this.headerLetters = this.letterMakerService.generateLetterArray('mystery word', true, {}, ++this.seedOff);
        console.log('SeedOffset:', this.seedOff);
        break;
      case 5:
        this.guessService.devIgnoreWordCheck = !this.guessService.devIgnoreWordCheck;
        console.log(`Will ${this.guessService.devIgnoreWordCheck ? 'IGNORE' : 'VALIDATE'} every word submitted.`)
        break;
    }
  }

}