import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LetterService } from './services/letter.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'mystery-word';

  constructor(private letterService: LetterService, private storageService: StorageService) {}

  public showHelpPopup = false;
  public showGameOverPopup = false;

  private gameOverSub!: Subscription;

  ngOnInit(): void {
    this.gameOverSub = this.letterService.gameOverUpdate.subscribe({
      next: () => {
        this.showGameOverPopup = true;
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
