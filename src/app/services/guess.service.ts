import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpService } from './http.service';
import { Letter, LetterMakerService } from './letter-maker.service';
import { PopupService } from './popup.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class GuessService {
  // TODO - remove this
  public devIgnoreWordCheck: boolean = true;
  private cheaterCheck: boolean = false;

  private guesses: Letter[][] = [[]];
  private appUsable: boolean = false;
  private solutionWord: string = '';
  private ransomText: string = '';
  private letterStates: string[] = [];

  // private showGameOver: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private guessUpdate: BehaviorSubject<Letter[][]> = new BehaviorSubject<Letter[][]>([[]]);
  private updateLetter: BehaviorSubject<LetterUpdate> = new BehaviorSubject<LetterUpdate>({index: -1, visibleInRansomNote: false});
  private appStateUpdate: BehaviorSubject<AppState> = new BehaviorSubject<AppState>({appUsable: this.appUsable});
  
  public readonly maxGuesses: number = 6;
  private readonly timeoutBeforeGameOverScreen: number = 1000;

  constructor(private httpService: HttpService, private letterMakerService: LetterMakerService, private storageService: StorageService, private popupService: PopupService) {
    this.initialize();
  }

  // /**
  //  * @description Allows for a component to subscribe to the showGameOver event, to be notified when the game over popup should be shown. Primarily used for displaying the game over popup.
  //  * @returns {Observable<boolean>} Returns the showGameOver observable
  //  */
  // public getShowGameOver(): Observable<boolean> {
  //   return this.showGameOver.asObservable();
  // }
  
  /**
   * @description Allows for a component to request the known state about a particular letter. The known state of a letter can be wrong, unknown, close, and right.
   * @param {string} char The letter to check the state for. More than a single letter can be passed, but only the first character of the string will be checked.
   * @returns {string} The state of the given letter as a string. Can be 'unknown', 'wrong', 'close', or 'right'.
   */
  public getLetterState(char: string): string {
    return this.letterStates[char.toLowerCase().charCodeAt(0)-97];
  }
  
  /**
   * @description Will inform if the application is in mobile state. This is done by checking the width of the screen.
   * @returns {boolean} Returns true if the application is in mobile state.
   */
  public isMobile(): boolean {
    return window.innerWidth < 450;
  }
  
  /**
   * @todo //TODO Request daily info for the local current day (as opposed to letting the server decide what "today" is)
   * @description Initializations for the guess service. Calls the word api to get daily game info, such as ransom text and the solution word.
   * @returns {void}
   */
  private initialize(): void {
    this.httpService.getDailyData()
      .then((response) => {
        if (response && response.success && response.dailyWord && response.ransom) {
          this.solutionWord = response.dailyWord.toLowerCase();
          this.ransomText = response.ransom;
          this.appUsable = true;
          this.appStateUpdate.next({
            appUsable: true,
            ransomText: this.ransomText,
            solutionWord: this.solutionWord,
          });
        }
        else {
          throw('error');
        }
      })
      .catch((error) => {
        this.appUsable = false;
        this.appStateUpdate.next({
          appUsable: false,
          appBroken: true
        })
      })
    ;
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

  public getAppUsable(): boolean {
    return this.appUsable;
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
      const isEasterEgg = this.processEasterEgg(curGuess);

      if (!isEasterEgg) { // otherwise if no easter egg entered:
        this.lockApp();
        if (curGuess.toLowerCase() === this.solutionWord.toLowerCase()) { // game over, you win!
          this.updateGuessColors(this.guesses[this.guesses.length-1]);
          this.storageService.submitGuess(this.guesses[curGuessIndex]);
          this.appStateUpdate.next({
            appUsable: false,
            gameOver: true,
            updateColors: true,
          })
          this.storageService.submitGameOverData(true);
          setTimeout(() => {
            this.popupService.setPopupToShow('gameOver');
          }, this.timeoutBeforeGameOverScreen);
        }
        else {
          this.httpService.checkWord(this.getGuessString()).then(
            (response) => {
              if (response && response.success) {
                if (response.isTestWordValid || this.devIgnoreWordCheck) { // valid guess!
                  this.updateGuessColors(this.guesses[this.guesses.length-1]);
                  this.storageService.submitGuess(this.guesses[curGuessIndex]);

                  if (this.guesses.length < this.maxGuesses) {
                    this.appUsable = true;
                    this.appStateUpdate.next({
                      appUsable: true,
                      updateColors: true,
                    });
                    this.guesses.push([]);
                  }
                  else { // game over, you lose!
                    this.appStateUpdate.next({
                      appUsable: false,
                      gameOver: true,
                      updateColors: true,
                    });
                    this.storageService.submitGameOverData(false);
                  }
                }
                else {
                  // TODO - handle bad word without alert?
                  this.unlockApp();
                  alert("That's not a real word!");
                }
              }
            },
            (error) => {
              //TODO - emit error?
            }
          );
        }
      }
    }
  }

  private processEasterEgg(guess: string): boolean {
    let easterEgg = true;
    switch(guess) {
      case 'kerry':
        this.popupService.setPopupToShow('kerry');
        break;
      case 'imdev':
        this.appStateUpdate.next({
          appUsable: this.appUsable,
          devMode: true,
        });
        break;
      case 'chetr':
        alert("That's cheating! Please confirm if you're SURE you want to cheat...");
        this.cheaterCheck = true;
        break;
      case 'imsur':
        if (this.cheaterCheck) {
          alert(`If you insist. \nThe solution is: ${this.solutionWord}`);
        }
        break;
      default:
        easterEgg = false;
        break;
    }

    if (guess === 'imsur' && !this.cheaterCheck) {
      easterEgg = false;
    }

    if (guess !== 'chetr') {
      this.cheaterCheck = false;
    }


    if (easterEgg) {
      for (let i = 1; i <= 5; i++) {
        this.removeLetter();
      }
    }

    return easterEgg;
  }

  private getGuessString(): string {
    let guess = '';
    const curGuessIndex = this.guesses.length-1;

    this.guesses[curGuessIndex].forEach((letter) => {
      guess = guess + letter.letter;
    });

    return guess.toLowerCase();
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

    // I formerly updated data here, AND ALSO after this method was called. I decided to call it outside of this method because sometimes app usability will change depending on if you win/lose and such
    // Tell the ransom-letter component to update colors now that they've been calculated
    // this.appUsable = true;
    // this.appStateUpdate.next({
    //   appUsable: this.appUsable,
    //   updateColors: true,
    // });
  }

  private updateGuesses(): void {
    this.guessUpdate.next(this.guesses);
  }

  public getGuessCount(): number {
    const guessesLength = this.guesses.length;
    return this.guesses[guessesLength - 1].length === 0 ? guessesLength-1 : guessesLength;
  }

  public setGuesses(guesses: Letter[][]): void {
    this.guesses = guesses;
  }

}

export interface AppState {
  appUsable: boolean,
  solutionWord?: string,
  ransomText?: string,
  appBroken?: boolean,
  updateColors?: boolean,
  gameOver?: boolean,
  devMode?: boolean,
}

export interface LetterUpdate {
  index: number,
  visibleInRansomNote: boolean,
}