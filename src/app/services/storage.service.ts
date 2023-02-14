import { Injectable, OnInit } from '@angular/core';
import { Letter } from './letter-maker.service';

interface LocalData {
  lastPlayed: Date,
  currentGuesses: Letter[][],
  currentRansomLetterStates: string[],
  finishedToday: boolean,
  finalGuessCounts: number[],
  playStreak: number,
  winStreak: number,
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
        playStreak: 1,
        winStreak: 0,
        currentRansomLetterStates: [],
      }
      this.writeData();
    }
    else { // If there is local storage...
      this.localData = JSON.parse(localDataPull);
      const daysSinceLastPlay: number = (now.getTime() - new Date(this.localData.lastPlayed).getTime())/ (1000*60*60*24);

      if(daysSinceLastPlay > 0.5) { // user hasn't played today
        console.log('user hasnt played today');
        const playedYesterday = daysSinceLastPlay < 2; // using 0.5 to prevent floating point error!
        this.localData = { // reset daily data
          ...this.localData,
          lastPlayed: now,
          currentGuesses: [],
          finishedToday: false,
          playStreak: playedYesterday ? this.localData.playStreak + 1 : 1,
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

  public getTimesPlayed(): number {
    let timesPlayed = 0;

    for(let i = 1; i <= 7; i++) {
      if(this.localData.finalGuessCounts[i]) {
        timesPlayed += this.localData.finalGuessCounts[i];
      }
    }

    return timesPlayed;
  }

  public submitGameOverData(playerWon: boolean): void {
    this.localData.finishedToday = true;
    this.localData.winStreak = playerWon ? this.localData.winStreak+1 : 0;
    this.localData.finalGuessCounts[this.localData.currentGuesses.length-1]++;

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
}
