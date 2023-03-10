import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Letter, LetterService } from 'src/app/services/letter.service';

@Component({
  selector: 'app-info-popup',
  templateUrl: './info-popup.component.html',
  styleUrls: ['./info-popup.component.css']
})
export class InfoPopupComponent implements OnInit {

  public infoHeaderLetters: Letter[] = this.letterService.generateRansomText('so you need some help, eh?', 5, {'cursor': 'default'}, {randomColors: true});
  public ransomText = '';
  public showHistory: boolean[];
  public showTodo: boolean = false;
  public showAllHistory: boolean = true;

  public versionHistory = [
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
    'Fix mobile layout so guess is always visible, and past guesses are visible when scrolled up.',
    'Remove today guess(es) letter style from local storage, generate style dynamically.',
    'Add easter egg words (like for generating ransom notes).',
    'Finish all TODOs and remove dev code.',
    '-Game-over popup.',
    '-Save past progress, and current-day progress to prevent refreshing to reset the game.',
    '-Generate a daily word and potentially a daily ransom note.',
    '-Move daily word and daily ransom note to node server (now nest).',
    '-Guess validation (no more guessing AEIOU!)',
    '-Fix yellow letter logic for when duplicate letters are guessed and/or when duplicate letters are present in the secret word.',
    'High scores? (Maybe not. One can dream)',
    'Sound effetcs of people screaming when you guess wrong (just a joke)',
  ]

  @Output() closePopup = new EventEmitter<void>();

  constructor(private letterService: LetterService) {
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
    this.closePopup.next();
  }

  public onGenerateRansom():void {
    this.ransomText = this.letterService.randomRansomString(Math.floor(Math.random()*1000000));
  }

}
