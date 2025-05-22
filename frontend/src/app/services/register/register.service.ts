import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private http = inject(HttpClient);
  private BASE_URL = 'http://localhost:3000';

  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${this.BASE_URL}/register`, userData);
  }
}