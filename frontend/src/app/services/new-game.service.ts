import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewGameService {
  private apiUrl = 'http://localhost:3000/new-game/add'; // URL de l'endpoint backend

  constructor(private http: HttpClient) {}

  addNewGame(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
