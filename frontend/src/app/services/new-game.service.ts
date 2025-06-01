import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewGameService {
  private apiUrl = 'http://localhost:3000/new-game';

  constructor(private http: HttpClient) {}

  addNewGame(gameData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, gameData);
  }

  getPlayerInfo(): Observable<any> {
    return this.http.get('http://localhost:3000/users/me');
  }
}
