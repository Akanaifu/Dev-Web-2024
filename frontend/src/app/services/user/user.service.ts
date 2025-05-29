import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users'; // Replace with your backend URL

  balanceChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor(private http: HttpClient) {}

  // ...existing methods...

  getUserBalance(userId: number): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(
      `${this.apiUrl}/${userId}/balance`
    );
  }

  getUserId(): Observable<{ solde: number; user_id: number }> {
    return this.http.get<{ solde: number; user_id: number }>(
      'http://localhost:3000/get_id/info',
      { withCredentials: true }
    );
  }

  updateUserBalance(
    userId: number,
    value: number,
    action: 'add' | 'subtract'
  ): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}/balance`, {
      value,
      action,
    });
  }
}
