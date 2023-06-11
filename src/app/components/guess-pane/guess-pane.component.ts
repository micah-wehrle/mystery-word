import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { GuessService } from 'src/app/services/guess.service';
import { Letter, LetterMakerService } from 'src/app/services/letter-maker.service';
import { PopupService } from 'src/app/services/popup.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-guess-pane',
  templateUrl: './guess-pane.component.html',
  styleUrls: ['./guess-pane.component.css']
})
export class GuessPaneComponent implements OnInit, OnDestroy {
  //TODO: Remove dev
  public devIgnoreWordCheck = this.guessService.devIgnoreWordCheck;

  @ViewChild('guessBox')
  public guessBox!: ElementRef;

  public guessRows: Letter[][] = [[]];
  public dummyGuessArrayOf5: number[] = [0,1,2,3,4];
  public appUsable: boolean = false;
  public guessBoxClass: string = '';
  public defaultStyle: {[key: string]: string} = this.letterMakerService.letterStyles['unknown'];
  public gameOver: boolean = false;
  public showGameOverButton: boolean = true;

  public shouldFloat: boolean = false;

  private guessAppStateSub!: Subscription;
  private guessUpdatesSub!: Subscription;

  constructor(private guessService: GuessService, private storageService: StorageService, private letterMakerService: LetterMakerService, private popupService: PopupService) { }

  ngOnInit(): void {
    this.subscribeToGuessUpdates();
    this.subscribeToAppState();
    this.guessBoxClass = `guess-box-${this.guessService.isMobile() ? 'mobile' : 'desktop'}`;
  }

  ngOnDestroy(): void {
      if (this.guessAppStateSub) {
        this.guessAppStateSub.unsubscribe();
      }

      if (this.guessUpdatesSub) {
        this.guessUpdatesSub.unsubscribe();
      }
  }

  public submitGuess(): void {
    this.guessService.submitGuess();
  }

  public deleteLetter(): void {
    this.guessService.removeLetter();
  }

  public showStatPage(): void {
    this.popupService.setPopupToShow('gameOver');
  }

  public tryToDeleteLetter(nextLetter: Letter): void {
    if(!nextLetter && !this.gameOver) {
      this.deleteLetter();
    }
  }

  public getDefaultStyle(style: Object): Object {
    return {...style, ...this.defaultStyle};
  }

  private getGuessesFromStorage(): void {
    const todaysGuesses: {letterIndex: number, letter:string}[][] = this.storageService.getTodaysGuesses();
    this.gameOver = this.storageService.getFinishedToday();
    let anyGuesses = false;
    let i = 0;
    for (let guessArray of todaysGuesses) {
      anyGuesses = true;
      this.guessRows[i] = [];
      for (let letter of guessArray) {
        // hides used letters from ransom note
        this.guessRows[i].push(this.letterMakerService.generateLetter(letter.letter.toLowerCase(), letter.letterIndex, false));
        this.guessService.emitLetterUpdate(letter.letterIndex, false);
      }
      this.guessService.updateGuessColors(this.guessRows[i]);
      i++;
    }

    if (this.guessRows.length < this.guessService.maxGuesses && anyGuesses && !this.gameOver || this.guessRows.length === 0) { 
      this.guessRows.push([]);
    }

    this.guessService.setGuesses(this.guessRows);

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
    this.guessUpdatesSub = this.guessService.getUpdates().subscribe({
      next: (guessRows: Letter[][]) => { 
        this.guessRows = guessRows; 
      }
    });
  }

  private subscribeToAppState(): void {
    this.guessAppStateSub = this.guessService.getAppState().subscribe({
      next: (appState) => {
        //TODO :remove dev
        this.devIgnoreWordCheck = this.guessService.devIgnoreWordCheck;
        
        this.appUsable = appState.appUsable;

        if (appState.appBroken) {
          //TODO- handle app broken?
        }

        if (appState.gameOver) {
          this.gameOver = appState.gameOver;
        }

        if (appState.ransomText) {
          this.getGuessesFromStorage();
        }
      }
    });
  }
}