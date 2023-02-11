import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-string',
  templateUrl: './string.component.html',
  styleUrls: ['./string.component.css']
})
export class StringComponent implements OnInit {

  private textToShow = 'you had better watch your udemy lectures or you will never see your precious spoon collection again and now i am just adding more letters to make this thing way longer so that it will scroll off the page';
  public wordArray: string[] = [];
  public hideLetter: {[key: string]: boolean}= {};
  public guessText: {wordI: number, letterI: number, letter: string}[] = [];

  constructor() { }

  ngOnInit(): void {
    let finalString = '';
    let i = 0;
    for(let char of this.textToShow.split('')) {
      finalString += this.upperOrLower(char, i++);
    }
    this.wordArray = finalString.split(' ');
  }

  public generateRandomStyle(wordI: number, letterI: number, letter: string, isGuess?: boolean) {

    const seed = (wordI+1)*(letterI+1)*letter.charCodeAt(0);
    const maxAng = 10;
    const colorGroupData = this.styleData.colorGroups[this.randInt(this.styleData.colorGroups.length, seed+1)];

    const onMobile = window.innerWidth < 450;

    const styleForMobileAndDesktop = {
      'font-family': this.styleData.fontStyle[(this.randInt(this.styleData.fontStyle.length, seed+2))],
      'color': colorGroupData[0],
      'background-color': colorGroupData[1],
      'z-index': '' + (this.randInt(2, seed+3)+1),
      'position': 'relative',
      'visibility': isGuess ? 'visible' : this.hideLetter['' + wordI + ',' + letterI + ',' + letter] ? 'hidden' : 'visible',
      'border-top': '1px',
      'border-left': '1px',
      'border-bottom': '2px',
      'border-right': '2px',
      'border-style': 'solid',
      'border-color': 'black',
      'transform': `rotate(${this.randInt(maxAng*2, seed+4)-maxAng}deg)`,
      'padding-top': '0px',
      'padding-bottom': '0px',
      'display': 'inline-block'
    };

    const mobileStyle = {
      'font-size': (this.randInt(10, seed)+60)/10 + 'vw' ,
      'padding-right': (this.randInt(7, seed)+1)/3 + 'vw',
      'padding-left': (this.randInt(7, seed)+1)/3 + 'vw',
      'margin-left': (this.randInt(4, seed))/20 + 'vw',
    };

    const desktopStyle = {
      'font-size': (this.randInt(10, seed)+30) + 'px' ,
      'padding-right': (this.randInt(7, seed)+1) + 'px',
      'padding-left': (this.randInt(7, seed)+1) + 'px',
      'margin-left': (this.randInt(4, seed)) + 'px',
      'cursor': 'pointer',
    };


    return {
      ...styleForMobileAndDesktop,
      ...(onMobile ? mobileStyle : desktopStyle)
    };

  }

  private styleData = {
    fontStyle: [
      'Arial',
      'Verdana',
      'Tahoma',
      'Trebuchet MS',
      'Times New Roman',
      'Georgia',
      'Garamond',
      'Courier New',
    ],
    colorGroups: [ // order: font, bg
      ['white', 'black'],
      ['white', 'darkred'],
      ['black', 'white'],
      ['black', 'rgba(255,150,150,1'],
      ['black', 'lightgray'],
      ['white', 'rgba(50,50,50,1)'],
      ['black', 'rgba(200,200,255,1)'],
      ['rgba(0,50,0,1)', 'lightgreen'],
    ]
  }

  private randInt(num: number, seed: number): number {
    const a = seed * 15485863;
    const rand = (a * a * a % 2038074743) / 2038074743;
    return Math.floor( rand * num );
  }

  upperOrLower(str: string, index: number): string {
    return this.randInt(100, index) > 70 ? str.toUpperCase() : str.toLowerCase();
  }

  public onLetterClick(wordI: number, letterI: number, letter: string) {
    this.guessText.push({
      wordI: wordI,
      letterI: letterI,
      letter: letter
    });
    this.hideLetter['' + wordI + ',' + letterI + ',' + letter] = true;
  }

  public sendLetterBack(wordI: number, letterI: number, letter: string) {
    this.hideLetter['' + wordI + ',' + letterI + ',' + letter] = false;
    
    let i = 0;

    for(let guessLetter of this.guessText) {
      if(guessLetter.letter === letter && guessLetter.letterI === letterI && guessLetter.wordI === wordI) {
        this.guessText.splice(i, 1);
        return;
      }
      i++;
    }

  }
}
