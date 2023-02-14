import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
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

  constructor(private letterService: LetterService, private storageService: StorageService, private guessService: GuessService) {}

  public showHelpPopup = false;
  public showGameOverPopup = false;

  private gameOverSub!: Subscription;

  ngOnInit(): void {
    this.gameOverSub = this.guessService.getShowGameOver().subscribe({
      next: (showGameOver) => {
        this.showGameOverPopup = showGameOver;
      },
    });
  }

  ngOnDestroy(): void {
    this.gameOverSub.unsubscribe();
  }

  onHelpPopup() {
    this.showHelpPopup = true;
  }

  onOpenStats() {
    this.showGameOverPopup = true;
  }
}


//TODO - Todo todos
/*

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
        [ ] (use universal frame!)
        [ ] help
        [ ] game over
        [ ] in-game info?
        [ ] fun (like kerry's ransom)
  
  Last TODOs:
    [ ] Remove all dev crap
    [ ] Finish all TODOs (duh)
*/