import { Injectable, OnInit } from '@angular/core';
import { Letter } from './letter-maker.service';

interface LocalData {
  lastPlayed: Date,
  currentGuesses: {letterIndex: number, letter: string}[][],
  finishedToday: boolean,
  finalGuessCounts: number[],
  winStreak: number,
  bestWinStreak: number,
  gamesFinished: number,
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  /* 
  TODO: currently there's a bug where you can cheat the win streak. Explanation:
  Working properly: If you win one day, then don't play at all the next day, then play the third day, you don't lose your streak.
  Broken: If you win one day, then sign in the next day but DON'T PLAY at all, then the third day you'll still have the same streak as day one.
  
  Basically, if you never guess the final time you'll never lose your win streak!
  */
  
  private readonly localStorageName: string = 'mw-data';
  private localData: LocalData;

  constructor() { 
    const localDataPull = localStorage.getItem(this.localStorageName);
    let now = new Date()
    now.setHours(0,0,0,0); // just need day
    // now.setDate(now.getDate() - 1);


    if(!localDataPull) { // no local storage
      console.log('no local storage found, initializing'); // TODO: remove
      this.localData = { 
        lastPlayed: now,
        currentGuesses: [],
        finishedToday: false,
        finalGuessCounts: [0,0,0,0,0,0],
        winStreak: 0,
        bestWinStreak: 0,
        gamesFinished: 0

      }
      this.writeData();
    }
    else { // If there is local storage...
      this.localData = JSON.parse(localDataPull);
      const daysSinceLastPlay: number = (now.getTime() - new Date(this.localData.lastPlayed).getTime())/ (1000*60*60*24);

      if(daysSinceLastPlay > 0.5) { // user hasn't played today
        const playedYesterday = daysSinceLastPlay < 2; // using 0.5 to prevent floating point error!
        this.localData = { // reset daily data
          ...this.localData,
          lastPlayed: now,
          currentGuesses: [],
          finishedToday: false,
          winStreak: playedYesterday ? this.localData.winStreak : 0,
        }
      }
    }
  }

  private writeData(): void {
    localStorage.setItem(this.localStorageName, JSON.stringify(this.localData));
  }

  public getTodaysGuesses(): {letterIndex: number, letter: string}[][] {
    return this.localData.currentGuesses.slice();
  }

  public getGuessCountHistory(): number[] {
    return this.localData.finalGuessCounts.slice();
  }

  public getFinishedToday(): boolean {
    return this.localData.finishedToday;
  }

  public getWinStreak(): number {
    return this.localData.winStreak;
  }

  public getGamesFinished(): number {
    return this.localData.gamesFinished;
  }

  public getBestWinStreak(): number {
    return this.localData.bestWinStreak;
  }

  public submitGameOverData(playerWon: boolean): void {
    this.localData.finishedToday = true;
    this.localData.gamesFinished++;
    this.localData.winStreak = playerWon ? this.localData.winStreak+1 : 0;
    if (this.localData.bestWinStreak < this.localData.winStreak) {
      this.localData.bestWinStreak = this.localData.winStreak;
    }
    if(playerWon) {
      this.localData.finalGuessCounts[this.localData.currentGuesses.length-1]++;
    }

    this.writeData();
  }

  public submitGuess(guessLetters: Letter[]) {
    const lettersToAdd: {letterIndex: number, letter: string}[] = [];
    for (let letter of guessLetters) {
      lettersToAdd.push({
        letterIndex: letter.letterIndex,
        letter: letter.letter
      });
    }
    this.localData.currentGuesses.push(lettersToAdd);
    this.writeData();
  }
  
  public clearStorageAndResetApp(): void {
    localStorage.removeItem(this.localStorageName);
    location.reload();
  }

  public devSetHistory(history: number[]) {
    this.localData.finalGuessCounts = history;
    this.writeData();
  }

  public devBumpBackLastDayPlayed(days: number): void {
    const today = new Date(this.localData.lastPlayed);
    this.localData.lastPlayed = new Date(today.getTime() - days*24*60*60*1000);
    this.writeData();
    location.reload();
  }
}
