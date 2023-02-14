import { ApplicationInitStatus, Component, Input, OnInit } from '@angular/core';
import { AppState, GuessService, LetterUpdate } from 'src/app/services/guess.service';
import { LetterMakerService } from 'src/app/services/letter-maker.service';
import { Letter, LetterService } from 'src/app/services/letter.service';

@Component({
  selector: 'app-ransom-letter',
  templateUrl: './ransom-letter.component.html',
  styleUrls: ['./ransom-letter.component.css']
})
export class RansomLetterComponent implements OnInit {

  public letters: Letter[] = [];
  public appUsable: boolean = false;
  private letterUpdatesToApply: LetterUpdate[] = [];
  
  constructor(private letterService: LetterService, private letterMakerService: LetterMakerService, private guessService: GuessService) {
    // needs to happen early so that it's listening before the guess-pane begins emitting letter updates gotten from storage
    this.subscribeToLetterRestoration(); 
    this.subscribeToAppState();
  }
  
  ngOnInit(): void {
  }
    
  private subscribeToLetterRestoration(): void {
    this.guessService.getLetterUpdates().subscribe({
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
    this.guessService.getAppState().subscribe({
      next: (appState) => {
        this.appUsable = appState.appUsable;

        if (appState.updateColors) {
          this.updateLetterStates();
        }

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
      }
    })
  }

  onGuessLetter(letter: Letter) {
    if(!this.appUsable || !letter.letter.match(/[a-z]/i) || this.letterService.gameOver) { return; }
    
    // if(this.letterService.addGuessLetter({...letter})) {
    if (this.guessService.addLetter({...letter})) {
      letter.style = {
        ...letter.style,
        'visibility': 'hidden'
      };
    }
  }

}
