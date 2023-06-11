import { Injectable, isDevMode } from '@angular/core';
import { GuessService } from './guess.service';


@Injectable({
  providedIn: 'root'
})
export class LetterMakerService {
  // Style declarations for use in the generative methods
  public readonly letterStyles: {[key: string]: {}} = {
    'unknown': {
      'color': 'white',
      'background-color': '#818384'
    },
    'right': {
      'color': 'white',
      'background-color': '#538d4e'
    },
    'wrong': {
      'color': '#bbbbbb',
      'background-color': '#3a3a3c'
    },
    'close': {
      'color': 'white',
      'background-color': '#b59f3b'
    }
  };
  public readonly styleOptions = {
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
      ['white', '#818384'], // wordle un-guessed gray
      ['white', 'black'],
      ['white', 'darkred'],
      ['black', 'white'],
      ['black', 'rgba(255,150,150,1'],
      ['black', 'lightgray'],
      ['white', 'rgba(50,50,50,1)'],
      ['black', 'rgba(200,200,255,1)'], // light blue
      ['rgba(0,50,0,1)', 'lightgreen'],
    ],
  };

  constructor() {}

  /**
   * @description Used to generate a single letter object based on the given inputs. Most of the style work is done in generateLetterStyle()
   * @param {string} char - The character to generate a Letter object for
   * @param {number} letterIndex - The index of the letter along the string, used for seeding
   * @param {boolean} randomStyle - (optional) If the style coloring should be randomized. Defaults to true.
   * @param {Object} forcedStyle - (optional) Any styling that should be forced into the styling for the generated Letter object. Defaults to none.
   * @returns {Letter} A Letter object
   */
  public generateLetter(char: string, letterIndex: number, randomStyle: boolean = true, forcedStyle: {[key: string]: string} = {}, seedOffset: number = 0): Letter {
    const seed = char.charCodeAt(0) * (letterIndex + 1) * 127;
    return {
      letter: this.letterCase(char, seed + seedOffset),
      letterIndex,
      style: this.generateLetterStyle(char, seed + seedOffset, randomStyle, forcedStyle),
    };
  }

  /**
   * @description Generates an array of Letter objects, based on the given inputs. Essentially just calls generateLetter() for each character of the input string
   * @param {string} str The string of characters to convert to an array of ransom letter objects
   * @param {boolean} randomStyle - (optional) If the style coloring should be randomized. Defaults to true.
   * @param {Object} forcedStyle - (optional) Any styling that should be forced into the styling for the generated Letter object. Defaults to none.
   * @returns {Letter[]} An array of Letter objects
   */
  public generateLetterArray(str: string, randomStyle: boolean = true, forcedStyle: {[key: string]: string} = {}, seedOffset: number = 0): Letter[] {
    let output: Letter[] = [];
    for (let i = 0; i < str.length; i++) {
      output.push(
        this.generateLetter(str[i], i, randomStyle, forcedStyle, seedOffset)
      );
    }
    return output;
  }

  /**
   * @description Generates the style object based on the given letter data 
   * @param {string} char - The character to generate a Letter object for, primarily used for special cases such as a space or a non-letter
   * @param {number} seed - The seed used to generate the random aspects of the styling
   * @param {boolean} randomStyle - (optional) If the style coloring should be randomized. Defaults to true.
   * @param {Object} forcedStyle - (optional) Any styling that should be forced into the styling for the letter. Defaults to none.
   * @returns {Object} Returns a {[key: string]: string} object containing all the necessary styling data to create a ransom note character tile
   */
  private generateLetterStyle(char: string, seed: number, randomStyle: boolean, forcedStyle: {[key: string]: string}): Object {

    if(char === ' ') {
      return {
        'margin-left': '3vmax',
        'display': 'inline-block',
      };
    }

    // This ang calculation system allows for high angle rotations but with low frequency. Will very often be near zero, but occasionally very rotated
    const maxAng = 30;
    const angWeight = 8;
    let rotationAng = 0;
    for (let i = 0; i < angWeight; i++) {
      rotationAng += this.randInt(maxAng*2, seed*i+10)-maxAng;
    }
    rotationAng = Math.floor(rotationAng / angWeight);
    // rotationAng = this.randInt(20, seed+10)-10

    let outputStyle: {[key: string]: string} = {
      'font-family': this.randFont(seed+2),
      'z-index': '' + (this.randInt(2, seed+3)+1),
      'position': 'relative',
      'border-top': '1px',
      'border-left': '1px',
      'border-bottom': '2px',
      'border-right': '2px',
      'border-style': 'solid',
      'border-color': 'black',
      'transform': `rotate(${rotationAng}deg)`,
      'padding-top': '0px',
      'padding-bottom': '0px',
      'display': 'inline-block'
    };

    if (!char.match(/[a-z]/i)) { // a symbol or number!
      outputStyle = {
        ...outputStyle,
        ...this.letterStyles['wrong'],
      }
    }
    else if (!randomStyle) { // If we want default wordle style
      outputStyle = {
        ...outputStyle,
        ...this.letterStyles['unknown'],
      }
    }
    else { // if we want to generate random color style
      outputStyle = {
        ...outputStyle,
        ...this.randColor(seed+1),
      }
    }

    // Add size-based styling depending on the width of the screen
    if (window.innerWidth < 450) {
      outputStyle = { // mobile
        ...outputStyle,
        'font-size': (this.randInt(10, seed+5)+60)/10 + 'vw' ,
        'padding-right': (this.randInt(7, seed+6)+1)/3 + 'vw',
        'padding-left': (this.randInt(7, seed+7)+1)/3 + 'vw',
        'margin-left': (this.randInt(4, seed+8))/20 + 'vw',
      }
    }
    else {
      outputStyle = {
        ...outputStyle, 
        'font-size': (this.randInt(10, seed+5)+30) + 'px' ,
        'padding-right': (this.randInt(7, seed+6)+1) + 'px',
        'padding-left': (this.randInt(7, seed+7)+1) + 'px',
        'margin-left': (this.randInt(4, seed+8)) + 'px',
        'cursor': 'pointer',
      }
    }
    
    return {
      ...outputStyle,
      ...forcedStyle,
    };
  }

  private letterCase(letter: string, seed: number): string {
    return this.randInt(10, seed) < 3 ? letter.toUpperCase() : letter.toLowerCase();
  }

  /**
   * @description - Picks a random font from the styleOptions object based on the given seed
   * @param {number} seed - The seed used to select the random font
   * @returns {string} - The randomly selected font
   */
  private randFont(seed: number): string {
    return this.styleOptions.fontStyle[
      this.randInt(this.styleOptions.fontStyle.length, seed)
    ];
  }

  /**
   * @description - Picks a random color and background-color pairing based on the given seed
   * @param {number} seed - The seed used to select the random font
   * @returns {Object} - The randomly selected color and background-color data, given in an object to be spread into the overall styling
   */
  private randColor(seed: number): {[key: string]: string} {
    const randIndex = this.randInt(this.styleOptions.colorGroups.length, seed);
    return {
      'color': this.styleOptions.colorGroups[randIndex][0],
      'background-color': this.styleOptions.colorGroups[randIndex][1],
    }
  }

  /**
   * @description Generates a pseudorandom number, which will always be the same given the same num and seed inputs. Likely only needed in this service as it's the only service that generates random numbers
   * @param {number} num - The maximum possible integer (exclusive)
   * @param {number} seed - The seed from which to generate the pseudorandom number
   * @returns {number} - The pseudorandom number, between 0 (inclusive) and the num input (exclusive)
   */
  private randInt(num: number, seed: number): number {
    const a = seed * 15485863;
    const rand = (a * a * a % 2038074743) / 2038074743;
    return Math.floor( rand * num );
  }
}

export interface Letter {
  letter: string,
  letterIndex: number,
  style: Object,
  guessData?: string
}
