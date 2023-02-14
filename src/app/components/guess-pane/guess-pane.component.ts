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
  public dummyGuessArray: number[] = [0,1,2,3,4];
  public appUsable: boolean = false;
  public guessBoxClass: string = '';
  private solutionWord: string = ''; //TODO - decide if this is needed

  public shouldFloat: boolean = false;
  private unfloatHeight: number = -1;

  constructor(private guessService: GuessService, private storageService: StorageService) { }

  ngOnInit(): void {
    this.subscribeToGuessUpdates();
    this.getGuessesFromStorage();
    this.guessBoxClass = `guess-box-${this.guessService.isMobile() ? 'mobile' : 'desktop'}`;
  }

  public submitGuess(): void {
    this.guessService.submitGuess();
  }

  public deleteLetter(): void {
    this.guessService.removeLetter();
  }

  public tryToDeleteLetter(nextLetter: Letter): void {
    if(!nextLetter) {
      this.deleteLetter();
    }
  }

  private getGuessesFromStorage(): void {
    const todaysGuesses: Letter[][] = this.storageService.getTodaysGuesses();
    let anyGuesses = false;
    for (let guessArray of todaysGuesses) {
      anyGuesses = true;
      let i = 0;
      this.guessRows[i] = [];
      for (let letter of guessArray) {
        this.guessService.emitLetterUpdate(letter.letterIndex, false);
        this.guessRows[i].push(letter);
      }
      i++;
    }

    if (todaysGuesses.length < 6 && anyGuesses) { //TODO - adjust with dynamic guess count!
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

        if (appState.solutionWord) {
          this.solutionWord = appState.solutionWord;
        }
      }
    });
  }
}
