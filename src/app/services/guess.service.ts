import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpService } from './http.service';
import { Letter, LetterMakerService } from './letter-maker.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class GuessService {

  // TODO - remove this
  public devIgnoreWordCheck: boolean = false;

  private showGameOver: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private guessUpdate: BehaviorSubject<Letter[][]> = new BehaviorSubject<Letter[][]>([[]]);
  private updateLetter: BehaviorSubject<LetterUpdate> = new BehaviorSubject<LetterUpdate>({index: -1, visibleInRansomNote: false});
  private appStateUpdate: BehaviorSubject<AppState> = new BehaviorSubject<AppState>({appUsable: false});

  private guesses: Letter[][] = [[]];
  private appUsable: boolean = false;
  private solutionWord: string = '';
  private ransomText: string = '';
  private letterStates: string[] = [];
  
  private readonly maxGuesses: number = 6;
  private readonly timeoutBeforeGameOverScreen: number = 1000;

  constructor(private httpService: HttpService, private letterMakerService: LetterMakerService, private storageService: StorageService) {
    this.initialize();
  }

  public getShowGameOver(): Observable<boolean> {
    return this.showGameOver.asObservable();
  }

  public emitShowGameOver(): void {
    this.showGameOver.next(true);
  }
  
  public getLetterState(char: string): string {
    return this.letterStates[char.toLowerCase().charCodeAt(0)-97];
  }
  
  public isMobile(): boolean {
    return window.innerWidth < 450;
  }
  
  private initialize(): void {
    this.guesses = this.storageService.getTodaysGuesses();
    if (this.guesses.length > 0 && this.guesses[0].length === 5 || this.guesses.length === 0) {
      this.guesses.push([]);
    }

    this.httpService.getDailyData()
      .then((response) => {
        if (response && response.success && response.dailyWord && response.ransom) {
          this.solutionWord = response.dailyWord.toLowerCase();
          this.ransomText = response.ransom;
          this.appStateUpdate.next({
            appUsable: true,
            ransomText: this.ransomText,
            solutionWord: this.solutionWord,
            updateColors: true,
          });
        }
        else {
          throw('error');
        }
      })
      .catch((error) => {
        this.appStateUpdate.next({
          appUsable: false,
          appBroken: true
        })
      })
    ;

    this.letterStates = this.storageService.getTodaysLetterStates();
    if (!this.letterStates || !Array.isArray(this.letterStates) || this.letterStates.length !== 26) {
      for (let i = 0; i < 26; i++) {
        this.letterStates[i] = 'unknown';
      }
    }
  }

  public getUpdates(): Observable<Letter[][]> {
    return this.guessUpdate.asObservable();
  }

  public getLetterUpdates(): Observable<LetterUpdate> {
    return this.updateLetter.asObservable();
  }

  public getAppState(): Observable<AppState> {
    return this.appStateUpdate.asObservable();
  }

  public lockApp(): void {
    if (this.appUsable) {
      this.appUsable = false;
      this.appStateUpdate.next({ appUsable: this.appUsable });
    }
  }

  public unlockApp(): void {
    if (!this.appUsable) {
      this.appUsable = true;
      this.appStateUpdate.next({ appUsable: this.appUsable });
    }
  }

  public getSolutionWord(): string {
    return this.solutionWord;
  }

  /**
   * @description Attempts to add given letter ot the current guess
   * @param {Letter} letter The letter data to add
   * @returns {boolean} Returns true if the guess letter was successfully added to the current guess
   */
  public addLetter(letter: Letter): boolean {
    const curGuessIndex = this.guesses.length-1;
    const curGuessLength = this.guesses[curGuessIndex].length;

    if (curGuessLength < 5) {
      this.guesses[curGuessIndex].push(letter);
      this.updateGuesses();
      return true;
    }
    return false;
  }

  public removeLetter(): void {
    const curGuessIndex = this.guesses.length-1;
    const curGuessLength = this.guesses[curGuessIndex].length;

    if (curGuessLength > 0) {
      const letterToRestore = this.guesses[curGuessIndex].pop();
      this.updateGuesses();
      this.updateLetter.next({
        index: letterToRestore ? letterToRestore.letterIndex : -1,
        visibleInRansomNote: true,
      });
    }
  }

  public emitLetterUpdate(index: number, visibleInRansomNote: boolean): void {
    this.updateLetter.next({
      index,
      visibleInRansomNote,
    });
  }

  public submitGuess() {
    const curGuessIndex = this.guesses.length-1;
    const curGuessLength = this.guesses[curGuessIndex].length;

    if (curGuessLength === 5) {
      const curGuess = this.getGuessString();
      this.lockApp();
      if (curGuess.toLowerCase() === this.solutionWord.toLowerCase()) { // game over, you win!
        //TODO - game over, you win, make sure to submit guess here to storage before win condition! 
        console.log('win');
        this.updateGuessColors(this.guesses[this.guesses.length-1]);
        this.storageService.submitGuess(this.guesses[curGuessIndex], this.letterStates);
        this.appStateUpdate.next({
          appUsable: false,
          gameOver: true,
          updateColors: true,
        })
        this.storageService.submitGameOverData(true);
        setTimeout(() => {
          this.showGameOver.next(true);
        }, this.timeoutBeforeGameOverScreen);
      }
      else {
        this.httpService.checkWord(this.getGuessString()).then(
          (response) => {
            //TODO - handle response
            if (response && response.success) {
              if (response.isTestWordValid || this.devIgnoreWordCheck) { // valid guess!
                this.updateGuessColors(this.guesses[this.guesses.length-1]);
                this.storageService.submitGuess(this.guesses[curGuessIndex], this.letterStates);

                if (this.guesses.length < this.maxGuesses) {
                  this.appStateUpdate.next({
                    appUsable: true,
                    updateColors: true,
                  });
                  this.guesses.push([]);
                }
                else { // game over, you lose!
                  // TODO - handle game over lost
                  this.appStateUpdate.next({
                    appUsable: false,
                    gameOver: true,
                    updateColors: true,
                  });
                  this.storageService.submitGameOverData(false);
                }
              }
              else {
                // TODO - handle bad word without alert
                this.unlockApp();
                alert("That's not a real word!");
              }
            }
          },
          (error) => {
            //TODO - emit error
          }
        );
      }
    }
    else {
      //TODO - reject submission
    }
  }

  private getGuessString(): string {
    let guess = '';
    const curGuessIndex = this.guesses.length-1;

    this.guesses[curGuessIndex].forEach((letter) => {
      guess = guess + letter.letter;
    });

    return guess;
  }

  /**
   * @description Takes in a word guess, and figures out how each letter in the guess should be colored, as well as updating the master list of known letter colors. This is a really complex method and honestly I am not entirely sure how it works. I made it in a trance, and it's too complicated to try to figure out exactly how it does what it does.
   * @param {Letter[]} guess The array of letters to check. Pass the actual array, as the letters will be updated in place to show their new colors. Will use letters to update master list of known letter colors.
   * @returns {void} void
   */
  public updateGuessColors(guess: Letter[]): void {
    let right = 0;
    for(let i = 0; i < 5; i++) { 
      const curLetterGuess = guess[i].letter.toLowerCase();

      if(curLetterGuess === this.solutionWord.charAt(i)) { // Letter is exact match
        guess[i].guessData = 'guess-box-right';
        guess[i].style = {...guess[i].style, ...this.letterMakerService.letterStyles['right']};
        right++;
        this.letterStates[curLetterGuess.charCodeAt(0)-97] = 'right';
      }
      else if(this.solutionWord.indexOf(curLetterGuess) === -1) { // Letter isn't in the word at all
        guess[i].guessData = 'guess-box-wrong';
        this.letterStates[curLetterGuess.charCodeAt(0)-97] = 'wrong';
        guess[i].style = {...guess[i].style, ...this.letterMakerService.letterStyles['wrong']};
      }
      else { // Letter is in the word but isn't in the right place
        let totalOccurrencesInAnswer = 0; // count how many times the guessed letter appears in the answer
        let totalCorrectGuesses = 0;     // count how many incorrect guesses there are so far
        for(let j = 0; j < 5; j++) {
          totalOccurrencesInAnswer += this.solutionWord.charAt(j) === curLetterGuess ? 1 : 0;
          totalCorrectGuesses += this.solutionWord.charAt(j) === guess[j].letter.toLowerCase() && guess[j].letter.toLowerCase() === curLetterGuess ? 1 : 0;
        }
        let closeSoFar = 0;
        for(let j = 0; j < i; j++) {
          closeSoFar += guess[j].guessData === 'guess-box-close' && guess[j].letter.toLowerCase() === curLetterGuess ? 1 : 0;
        }

        if(totalOccurrencesInAnswer > totalCorrectGuesses + closeSoFar) {
          guess[i].guessData = 'guess-box-close';
          guess[i].style = {...guess[i].style, ...this.letterMakerService.letterStyles['close']};
          this.letterStates[curLetterGuess.charCodeAt(0)-97] = this.letterStates[curLetterGuess.charCodeAt(0)-97] !== 'right' ? 'close' : this.letterStates[curLetterGuess.charCodeAt(0)-97];
        }
        else {
          guess[i].guessData = 'guess-box-wrong';
          guess[i].style = {...guess[i].style, ...this.letterMakerService.letterStyles['wrong']};
        }
      }
    }
  }

  private updateGuesses(): void {
    this.guessUpdate.next(this.guesses);
  }

  public getGuessCount(): number {
    const guessesLength = this.guesses.length;
    return this.guesses[guessesLength - 1].length === 0 ? guessesLength-1 : guessesLength;
  }

}

export interface AppState {
  appUsable: boolean,
  solutionWord?: string,
  ransomText?: string,
  appBroken?: boolean,
  updateColors?: boolean,
  gameOver?: boolean,
}

export interface LetterUpdate {
  index: number,
  visibleInRansomNote: boolean,
}