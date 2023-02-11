import { Component, Input, OnInit } from '@angular/core';
import { Letter, LetterService } from 'src/app/services/letter.service';

@Component({
  selector: 'app-ransom-letter',
  templateUrl: './ransom-letter.component.html',
  styleUrls: ['./ransom-letter.component.css']
})
export class RansomLetterComponent implements OnInit {

  constructor(private letterService: LetterService) { }

  public letters: Letter[] = [];

  ngOnInit(): void {
    this.letterService.ready.subscribe({
      next: (ready) => {
        if (ready) {
          this.letters = this.letterService.getRansomText();
          
          for(let letter of this.letters) {
            if(letter.letter === ' ') {
              letter.style = {
                ...letter.style,
                'margin-left': '3vmax'
              }
            }
          }
        
          this.letterService.showLetterUpdate.subscribe({next: (index) => {
            if(index !== -1) {
              this.letters[index].style = {
                ...this.letters[index].style,
                'visibility': 'visible'
              }
            }
          }});
        }
      }
    });

  }

  onGuessLetter(letter: Letter) {
    if(!letter.letter.match(/[a-z]/i) || this.letterService.gameOver) { return; }

    if(this.letterService.addGuessLetter({...letter})) {
      letter.style = {
        ...letter.style,
        'visibility': 'hidden'
      };
    }
  }

}
