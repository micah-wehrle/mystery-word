import { Component, OnInit } from '@angular/core';
import { PopupService } from 'src/app/services/popup.service';
import { LetterMakerService } from 'src/app/services/letter-maker.service';
import { Letter } from 'src/app/services/letter.service';

@Component({
  selector: 'app-info-popup',
  templateUrl: './info-popup.component.html',
  styleUrls: ['./info-popup.component.css']
})
export class InfoPopupComponent implements OnInit {
  public infoHeaderLetters: Letter[] = this.letterMakerService.generateLetterArray('so you need some help?')
  
  constructor(private letterMakerService: LetterMakerService, private popupService: PopupService) { }

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
