import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackendResponse } from 'src/app/services/http.service';
import { Letter, LetterService } from 'src/app/services/letter.service';

// TODO - Delete this component

@Component({
  selector: 'app-guesses',
  templateUrl: './guesses.component.html',
  styleUrls: ['./guesses.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class GuessesComponent implements OnInit, OnDestroy {

  guessLetters: Letter[][] = [];

  public emptyLetter: Letter = this.letterService.generateRansomText(' ', 0, {'cursor': 'default'})[0];
  public gameOver = false;
  public guessNum = 0;
  
  private checkingWord: boolean = false;

  private letterGuessSub!: Subscription;

  constructor(private letterService: LetterService) { }

  ngOnInit(): void {
    console.log("USING DEPRECIATED COMPONENT. PLEASE REMOVE GUESSES.COMPONENT");
    for(let i = 0; i < 1; i++) {
      this.guessLetters[i] = [this.emptyLetter, this.emptyLetter, this.emptyLetter, this.emptyLetter, this.emptyLetter];
    }

    this.letterGuessSub = this.letterService.guessUpdate.subscribe({
      next: (guess) => {
        guess.forEach((letter) => {
          // make incoming guesses always start out gray!
          letter.style = {
            ...letter.style,
            'color': 'white',
            'background-color': '#818384'
          }
        });
        this.guessLetters[this.guessNum] = guess;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.letterGuessSub) {
      this.letterGuessSub.unsubscribe();
    }
  }

  public onDelete(): void {
    if (this.checkingWord) {
      return;
    }

    this.letterService.deleteGuessLetter();
  }

  async onSubmit() {
    if (this.checkingWord) {
      return;
    }
    
    if (this.checkForSecretWord()) {
      return;
    }

    if (this.guessLetters[this.guessLetters.length-1][4].letter === ' ') {
      return;
    }

    // validate word is legit
    this.checkingWord = true;

    const response: BackendResponse = await this.letterService.validateGuessIsAWord(this.guessAsString());
    this.checkingWord = false;

    if (!response || !response.success) {
      alert('Bad response from back end! Sorry!');
      return;
    }
    
    if (!response.isTestWordValid) {
      alert('That isn\'t a real word!');
      return;
    }

    let returnData = this.letterService.checkGuess(this.guessLetters[this.guessNum]);
    // this.letterService.updateRansomStyles(returnData);
    this.guessLetters[this.guessNum] = returnData;
    this.guessNum++;

    
    if(this.guessNum > 6 || this.letterService.gameOver) {
      this.gameOver = true;
      this.letterService.gameOver = true;
    }
    else if(this.guessLetters.length <= 6) {
      this.guessLetters.push([this.emptyLetter, this.emptyLetter, this.emptyLetter, this.emptyLetter, this.emptyLetter])
    }
  }

  private guessAsString(): string {
    let guessString = '';
    this.guessLetters[this.guessNum].forEach((letter) => { guessString += letter.letter; });
    return guessString;
  }

  private checkForSecretWord(): boolean {
    let guess = this.guessAsString().trim().toLowerCase();

    switch (guess) {
      case 'kerry':
        return true;
    }

    return false;
  }

}
