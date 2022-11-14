import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Letter, LetterService } from 'src/app/services/letter.service';

@Component({
  selector: 'app-guesses',
  templateUrl: './guesses.component.html',
  styleUrls: ['./guesses.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class GuessesComponent implements OnInit {

  guessLetters: Letter[][] = [];

  public emptyLetter: Letter = this.letterService.generateRansomText(' ', 0, {'cursor': 'default'})[0];
  public gameOver = false;
  public guessNum = 0;

  constructor(private letterService: LetterService) { }

  ngOnInit(): void {

    for(let i = 0; i < 1; i++) {
      this.guessLetters[i] = [this.emptyLetter, this.emptyLetter, this.emptyLetter, this.emptyLetter, this.emptyLetter];
    }

    this.letterService.guessUpdate.subscribe({
      next: (guess) => {
        guess.forEach((letter) => {
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

  onDelete() {
    this.letterService.deleteGuessLetter();
  }

  onSubmit() {
    if(this.guessLetters[0][4].letter !== ' ') {
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
      // if(!this.letterService.youWin) {
      //   if(this.guessLetters.length < 5) {
      //   }
      //   else {
      //     this.gameOver = true;
      //   }
      // }
      // else {
      //   this.gameOver = true;
      // }
    }
  }

}
