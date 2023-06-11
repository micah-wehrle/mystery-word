import { ApplicationInitStatus, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppState, GuessService, LetterUpdate } from 'src/app/services/guess.service';
import { LetterMakerService } from 'src/app/services/letter-maker.service';
import { Letter, LetterService } from 'src/app/services/letter.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ransom-letter',
  templateUrl: './ransom-letter.component.html',
  styleUrls: ['./ransom-letter.component.css']
})
export class RansomLetterComponent implements OnInit, OnDestroy {

  public letters: Letter[] = [];
  public appUsable: boolean = false;
  private letterUpdatesToApply: LetterUpdate[] = [];

  private letterRestorationSub!: Subscription;
  private appStateSub!: Subscription;
  
  constructor(private letterService: LetterService, private letterMakerService: LetterMakerService, private guessService: GuessService) {
    // needs to happen early so that it's listening before the guess-pane begins emitting letter updates gotten from storage
    this.subscribeToLetterRestoration(); 
    this.subscribeToAppState();
  }
  
  ngOnInit(): void {
    // TODO: remove for v1.0. Sucks because I'm sort of proud of this event handling as I was able to do something which was originally not something I thought I'd need to be able to do lol
    if (!environment.production) {
      document.addEventListener('keydown', (event: KeyboardEvent): void => {
        if (!this.guessService.getAppUsable()) {
          return;
        }
        if (event.key.match(/^[a-z]$/)) {
          for (let letter of this.letters) {
            if (letter.letter.toLowerCase() === event.key) {
              if (letter.style.hasOwnProperty('visibility')) {
                interface Style {
                  visibility: string;
                }
                if ((letter.style as Style).visibility === 'hidden') {
                  continue;
                }
              }
              this.onGuessLetter(letter);
              break;
            }
          }
        }
        else if (event.key === 'Backspace') {
          this.guessService.removeLetter();
        }
        else if (event.key === 'Enter') {
          this.guessService.submitGuess();
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.letterRestorationSub) {
      this.letterRestorationSub.unsubscribe();
    }

    if (this.appStateSub) {
      this.appStateSub.unsubscribe();
    }
  }
    
  private subscribeToLetterRestoration(): void {
    this.letterRestorationSub = this.guessService.getLetterUpdates().subscribe({
      next: (letterUpdate: LetterUpdate) => {
        if (letterUpdate.index !== -1) {
          if (this.letters.length === 0) {
            // Haven't gotten data from back end!
            this.letterUpdatesToApply.push(letterUpdate);
          }
          else {
            this.letters[letterUpdate.index].style = {
              ...this.letters[letterUpdate.index].style,
              'visibility': letterUpdate.visibleInRansomNote ? 'visible' : 'hidden',
            }
          }
        }
      }
    });
  }

  private updateLetterStates(): void {
    for (let letter of this.letters) {
      const letterState = this.guessService.getLetterState(letter.letter);
      letter.style = {
        ...letter.style,
        ...this.letterMakerService.letterStyles[letterState]
      }
    }
  }

  private subscribeToAppState(): void {
    this.appStateSub = this.guessService.getAppState().subscribe({
      next: (appState) => {
        this.appUsable = appState.appUsable;

        if (appState.appBroken) {
          //TODO - handle app broken!
        }

        if (appState.ransomText) {
          this.letters = this.letterMakerService.generateLetterArray(appState.ransomText, false);
          if (this.letterUpdatesToApply.length > 0) {
            for (let letterUpdate of this.letterUpdatesToApply) {
              this.letters[letterUpdate.index].style = {
                ...this.letters[letterUpdate.index].style,
                'visibility': letterUpdate.visibleInRansomNote ? 'visible' : 'hidden',
              }
            }
            this.letterUpdatesToApply = [];
            this.updateLetterStates();
          }
        }

        if (appState.updateColors) {
          this.updateLetterStates();
        }
      }
    })
  }

  public onGuessLetter(letter: Letter): void {
    if(!this.appUsable || !letter.letter.match(/[a-z]/i) || this.letterService.gameOver) { 
      return; 
    }
    
    if (this.guessService.addLetter({...letter})) {
      letter.style = {
        ...letter.style,
        'visibility': 'hidden'
      };
    }
  }

}
