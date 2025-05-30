import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewGameService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  addNewGame(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/games`, data);
  }

  getPlayerInfo(): Observable<{
    user_id: number;
    username: string;
    email: string;
    solde: number;
  }> {
    return this.http.get<{
      user_id: number;
      username: string;
      email: string;
      solde: number;
    }>(`${this.baseUrl}/get_id/info`);
  }

  // Ajoutez ici d'autres méthodes pour d'autres endpoints backend si besoin
}
