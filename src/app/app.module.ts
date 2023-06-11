import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StringComponent } from './components/string/string.component';
import { RansomLetterComponent } from './components/ransom-letter/ransom-letter.component';
import { HeaderComponent } from './components/header/header.component';
import { GuessesComponent } from './components/guesses-depreciated/guesses.component';
import { InfoPopupComponent } from './components/popup-pane/info-popup/info-popup.component';
import { GameoverPopupComponent } from './components/popup-pane/gameover-popup/gameover-popup.component';
import { GuessPaneComponent } from './components/guess-pane/guess-pane.component';
import { PopupPaneComponent } from './components/popup-pane/popup-pane.component';
import { AboutPopupComponent } from './components/popup-pane/about-popup/about-popup.component';

@NgModule({
  declarations: [
    AppComponent,
    StringComponent,
    RansomLetterComponent,
    HeaderComponent,
    GuessesComponent,
    InfoPopupComponent,
    GameoverPopupComponent,
    GuessPaneComponent,
    PopupPaneComponent,
    AboutPopupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
