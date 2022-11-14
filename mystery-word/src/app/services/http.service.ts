import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, Observable, throwError } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  readonly dictionaryUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

  constructor(private http: HttpClient) { }

  public checkWord(word: string): Observable<void> {
    
    return this.http.get<void>(this.dictionaryUrl + word)
      .pipe(
        map((res) => {
          
        })
      );

  }
}
