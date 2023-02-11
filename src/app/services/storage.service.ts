import { Injectable, OnInit } from '@angular/core';

interface LocalData {
  lastPlayed: Date,
  currentGuesses: number[],
  finishedToday: boolean,
  guessCountHistory: number[],
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  
  private localData: LocalData;

  constructor() { 
    const localDataPull = null; localStorage.getItem('mw-data');
    let now = new Date()
    now.setHours(0,0,0,0);

    if(!localDataPull) { // no local storage

      this.localData = {
        lastPlayed: now,
        currentGuesses: [],
        finishedToday: false,
        guessCountHistory: [],
      }

      localStorage.setItem('mw-data', JSON.stringify(this.localData) );
    }
    else { // If there is local storage...
      this.localData = JSON.parse(localDataPull);

      if(now !== this.localData.lastPlayed) { // user hasn't played today
        this.localData = {
          ...this.localData,
          lastPlayed: now,
          currentGuesses: [],
          finishedToday: false,
        }
      }
    }
  }

  public getGuesses(): number[] {
    return this.localData.currentGuesses.slice();
  }

  public getGuessCountHistory(): number[] {
    return this.localData.guessCountHistory.slice();
  }

  public getTimesPlayed(): number {
    let timesPlayed = 0;

    for(let i = 1; i <= 7; i++) {
      if(this.localData.guessCountHistory[i]) {
        timesPlayed += this.localData.guessCountHistory[i];
      }
    }

    return timesPlayed;
  }
}
