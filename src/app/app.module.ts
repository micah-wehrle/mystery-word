import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StringComponent } from './components/string/string.component';
import { RansomLetterComponent } from './components/ransom-letter/ransom-letter.component';
import { HeaderComponent } from './components/header/header.component';
import { GuessesComponent } from './components/guesses/guesses.component';
import { InfoPopupComponent } from './components/info-popup/info-popup.component';
import { GameoverPopupComponent } from './components/gameover-popup/gameover-popup.component';
import { GuessPaneComponent } from './components/guess-pane/guess-pane.component';

@NgModule({
  declarations: [
    AppComponent,
    StringComponent,
    RansomLetterComponent,
    HeaderComponent,
    GuessesComponent,
    InfoPopupComponent,
    GameoverPopupComponent,
    GuessPaneComponent
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
