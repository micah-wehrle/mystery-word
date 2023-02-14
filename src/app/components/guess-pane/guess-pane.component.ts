import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GuessService } from 'src/app/services/guess.service';
import { Letter, LetterMakerService } from 'src/app/services/letter-maker.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-guess-pane',
  templateUrl: './guess-pane.component.html',
  styleUrls: ['./guess-pane.component.css']
})
export class GuessPaneComponent implements OnInit {

  @ViewChild('guessBox')
  public guessBox!: ElementRef;

  public guessRows: Letter[][] = [[]];
  public dummyGuessArrayOf5: number[] = [0,1,2,3,4];
  public appUsable: boolean = false;
  public guessBoxClass: string = '';
  public defaultStyle: {[key: string]: string} = this.letterMakerService.letterStyles['unknown'];
  public gameOver: boolean = false;
  public showGameOverButton: boolean = true;
  private solutionWord: string = ''; //TODO - decide if this is needed

  public shouldFloat: boolean = false;
  private unfloatHeight: number = -1;

  constructor(private guessService: GuessService, private storageService: StorageService, private letterMakerService: LetterMakerService) { }

  ngOnInit(): void {
    this.subscribeToGuessUpdates();
    this.subscribeToAppState();

    // this.getGuessesFromStorage();
    this.guessBoxClass = `guess-box-${this.guessService.isMobile() ? 'mobile' : 'desktop'}`;
  }

  public submitGuess(): void {
    this.guessService.submitGuess();
  }

  public deleteLetter(): void {
    this.guessService.removeLetter();
  }

  public showStatPage(): void {
    this.guessService.emitShowGameOver();
  }

  public tryToDeleteLetter(nextLetter: Letter): void {
    if(!nextLetter) {
      this.deleteLetter();
    }
  }

  public getDefaultStyle(style: Object): Object {
    return {...style, ...this.defaultStyle};
  }

  private getGuessesFromStorage(): void {
    const todaysGuesses: Letter[][] = this.storageService.getTodaysGuesses();
    this.gameOver = this.storageService.getFinishedToday();
    let anyGuesses = false;
    for (let guessArray of todaysGuesses) {
      anyGuesses = true;
      let i = 0;
      this.guessRows[i] = [];
      for (let letter of guessArray) {
        // hides used letters from ransom note
        this.guessService.emitLetterUpdate(letter.letterIndex, false);
      }
      i++;
    }

    if (todaysGuesses) {
      this.guessRows = todaysGuesses;
    }

    /*
      I think I can make it so I only save letter indexes! might be prudent to save letter char as well idk. 
      But what can be done is retrieve the letter styling data from the ransom note, and then each row run guessService.updateGuessColors
    */

    if (this.guessRows.length < 6 && anyGuesses && !this.gameOver || this.guessRows.length === 0) { //TODO - adjust with dynamic guess count!
      this.guessRows.push([]);
    }
  }

  @HostListener('window:scroll')
  public onScroll(): void {
    if (!this.shouldFloat) {
      const children: HTMLCollection = this.guessBox.nativeElement.children;
      const lastChild: Element = children[children.length-1];

      // this.shouldFloat = lastChild.getBoundingClientRect().y < 160;
      
    }
  }

  private subscribeToGuessUpdates(): void {
    this.guessService.getUpdates().subscribe({
      next: (guessRows: Letter[][]) => { 
        this.guessRows = guessRows; 
      }
    });
  }

  private subscribeToAppState(): void {
    this.guessService.getAppState().subscribe({
      next: (appState) => {
        this.appUsable = appState.appUsable;

        if (appState.appBroken) {
          //TODO- handle app broken
        }

        if (appState.gameOver) {
          this.gameOver = appState.gameOver;
        }

        if (appState.ransomText) {
          this.getGuessesFromStorage();
        }

        if (appState.solutionWord) {
          this.solutionWord = appState.solutionWord;
        }
      }
    });
  }
}