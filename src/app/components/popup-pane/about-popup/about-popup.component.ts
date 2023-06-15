import { Component, OnInit } from '@angular/core';
import { Letter, LetterMakerService } from 'src/app/services/letter-maker.service';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-about-popup',
  templateUrl: './about-popup.component.html',
  styleUrls: ['./about-popup.component.css']
})
export class AboutPopupComponent implements OnInit {
  public infoHeaderLetters: Letter[] = this.letterMakerService.generateLetterArray('i made this game :P')

  public showHistory: boolean[];
  public showTodo: boolean = false;
  public showAllHistory: boolean = true;

  public versionHistory = [
    {
      version: '0.6',
      date: 'Jun ??, 2023',
      changes: [
        'Reduced size of local storage files, no longer including styling data for guesses made for a given day. They are now generated when a game is loaded mid-session.',
        'Moved popup content into parent popup with popup management service.',
        'Created easter egg guesses!',
        'Updated daily secret word and ransom note to be tied to local time instead of the location of the server.',
        'Back end now verifies that the generated ransom text is compatible with the word of the day.',
        'Current guess line is now always visible when the user scrolls down.',
        // incomplete:
        // not printed, just for my notes:
        // 'Minor improvements, removing duplicate code and unused components.',
        // 'Several more dev tools for improving local storage management (try guessing "imdev").',
      ]
    },
    {
      version: '0.5',
      date: 'Feb 14, 2023',
      changes: [
        'Completely rebuilt service system and large portions of component structure',
        'Adjusted submit/delete buttons, added option to tap letter to delete',
        'Added local storage. Saves current-day progress, daily streak, and various past win stats. Entirely local, no user data stored on server.',
        'Added stats and post-game screen. Displays data from local storage, showing things like win streak and past performance.'        
      ]
    },
    {
      version: '0.4',
      date: 'Feb 10, 2023',
      changes: [
        'Adjusted menu button',
        'Began work on game over/win screen',
        'Began work on local storage for current-day progress and past progress',
        'Added NestJS back end, hosted on same machine. Moved daily word and ransom generation to back end',
        'Added guess validation to back end',
      ]
    },
    {
      version: '0.3',
      date: 'Nov 13, 2022',
      changes: [
        'Fixed incorrect coloring of certain letter guesses, thanks to Kerry for pointing this out',
        'Added coloring of all letters based on guesses made; colors yoinked from wordle site',
        'Completely rebuilt header with bootstrap navbar style',
        'Added nav button for linking to root site and moved help button to inside button',
        'Made adjustments to guess fields'
      ]
    },
    {
      version: '0.2',
      date: 'Nov 11, 2022',
      changes: [
        'Added new word every day, taken from list of all wordle words.',
        'Added new ransom note every day, generated by selecting words and phrases from several arrays.',
        'Added proper letter highlighting for letters in the word in but in the wrong place.'
      ]
    },
    {
      version: '0.1',
      date: 'Nov 5, 2022',
      changes: [
        'Inital Release',
      ]
    },
    // {
    //   version: '',
    //   date: '',
    //   changes: [
    //     '',
    //   ]
    // },
  ];

  public todos: string[] = [
    "Figure out some sort of login feature, so users don't need to worry about losing local data.",
    'Use logins to post global stats, such as average guesses, and who got the quickest win.',
    'Work out some better colors and even styling for various UI aspects',
    'Finish all TODOs and remove dev code.',
    '-Fix mobile layout so guess is always visible, and past guesses are visible when scrolled up.',
    '-Make client request the daily data by passing a date, so the next word will always roll over at midnight local time.',
    '-Add easter egg words (like for generating ransom notes).',
    '-Remove today guess(es) letter style from local storage, generate style dynamically.',
    '-Game-over popup.',
    '-Save past progress, and current-day progress to prevent refreshing to reset the game.',
    '-Generate a daily word and potentially a daily ransom note.',
    '-Move daily word and daily ransom note to node server (now nest).',
    '-Guess validation (no more guessing AEIOU!)',
    '-Fix yellow letter logic for when duplicate letters are guessed and/or when duplicate letters are present in the secret word.',
    'Sound effects of people screaming when you guess wrong (just a joke)',
  ]

  constructor(private letterMakerService: LetterMakerService, private popupService: PopupService) {
    this.showHistory = [true];
    for (let i = 1; i < this.versionHistory.length; i++) {
      this.showHistory.push(false);
    }
  }

  ngOnInit(): void {
    for(let letter of this.infoHeaderLetters) {
      if(letter.letter === ' ') {
        letter.style = {...letter.style, 'margin-left': '3vmax'};
      }
    }
  }

  public onClosePopup(): void {
    this.popupService.setPopupToShow('');
  }

}
