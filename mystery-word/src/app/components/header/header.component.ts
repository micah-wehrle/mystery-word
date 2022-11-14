import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Letter, LetterService } from 'src/app/services/letter.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public headerLetters: Letter[] = [];

  @Output() openHelpPage = new EventEmitter<void>();


  constructor(private letterService: LetterService) { }

  ngOnInit(): void {

    this.headerLetters = this.letterService.generateRansomText('mystery word', 3, {}, {randomColors: true});
    
    for(let letter of this.headerLetters) {
      if(letter.letter === ' ') {
        letter.style = {
          ...letter.style,
          'margin-left': '5vw',
        }
      }
      else {
        letter.style = {
          ...letter.style,
          'font-size': (Math.floor(Math.random()*3)+5) + 'vw',
          'cursor': 'default'
        };
      }
    }
  }

  onScroll() {
    console.log(window.scrollY);
  }

  onHowToPlay() {
    window.scrollTo(0,0);
    this.openHelpPage.next();
  }

}