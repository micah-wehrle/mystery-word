import { Injectable, OnInit } from '@angular/core';
import { Letter } from './letter-maker.service';

interface LocalData {
  lastPlayed: Date,
  currentGuesses: Letter[][],
  currentRansomLetterStates: string[],
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
  
  private readonly localStorageName: string = 'mw-data';
  private localData: LocalData;

  constructor() { 
    const localDataPull = localStorage.getItem(this.localStorageName);
    let now = new Date()
    now.setHours(0,0,0,0); // just need day

    if(!localDataPull) { // no local storage
      console.log('no local storage found, initializing');
      this.localData = { 
        lastPlayed: now,
        currentGuesses: [],
        finishedToday: false,
        finalGuessCounts: [0,0,0,0,0,0],
        winStreak: 0,
        bestWinStreak: 0,
        currentRansomLetterStates: [],
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

  public getTodaysLetterStates(): string[] {
    return this.localData.currentRansomLetterStates.slice();
  }

  private writeData(): void {
    localStorage.setItem(this.localStorageName, JSON.stringify(this.localData));
  }

  public getTodaysGuesses(): Letter[][] {
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

  public submitGuess(guessLetters: Letter[], allLetterStates: string[]) {
    this.localData.currentGuesses.push(guessLetters);
    this.localData.currentRansomLetterStates = allLetterStates;
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
}
