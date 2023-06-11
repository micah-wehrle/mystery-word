import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PopupService } from './services/popup.service';
import { GuessService } from './services/guess.service';
import { LetterService } from './services/letter.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'mystery-word';

  constructor(private letterService: LetterService, private storageService: StorageService, private guessService: GuessService, private popupService: PopupService) {}

  public currentPopup: string = '';
  private popupSub!: Subscription;

  ngOnInit(): void {

    this.popupSub = this.popupService.getPopupToShow().subscribe({
      next: (popup: string) => {
        this.currentPopup = popup;
      }
    });
  }

  ngOnDestroy(): void {

    if (this.popupSub) {
      this.popupSub.unsubscribe();
    } 
  }
}


//TODO - Todo todos
/*

[ ] I need to decide how I want the wins and streaks and stuff to be counted. Big questions:
  What counts as a "day played"?
    Opening the game at all?
    Making at least one guess?
    Playing to completion?
  Should win streaks be broken if you don't play at all on a day?

This project needs major refactoring...

The plan:

  Services:
    [x] letter maker (will generate letters. that's it)
    [x] http (has async functions that retrieve data from back end)
    [~] ransom note (manages the ransom note data. full note, letter metadata, what is still there, etc)
    [~] guesses (manages the guesses)
    [ ] storage (manages local storage)

  Component structure
    [ ] app
      [ ] header
        [ ] button with popup
        [ ] fancy bg
        [ ] logo (clickable?)
        [ ] Add notice for when back end is offline? Perhaps factor into http service?
      [ ] body
        [ ] guesses
          [ ] array of guesses
            [ ] hide all but current guess on scroll?
        [ ] ransom note
          [ ] just a bunch of buttons
      [ ] popups
        [x] (use universal frame!)
        [x] help
        [x] game over
        [ ] in-game info?
        [ ] fun (like kerry's ransom)
  
  Last TODOs:
    [ ] Remove all dev crap
    [ ] Finish all TODOs (duh)
*/