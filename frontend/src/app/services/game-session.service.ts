import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GameSession {
  game_session_id: string;
  name: string;
  bet_min: string;
  bet_max: string;
  timestamp: string;
}

export interface CreateSessionRequest {
  name: string;
  bet_min: number;
  bet_max: number;
  gameType?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GameSessionService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les sessions de jeu disponibles
  getAvailableSessions(): Observable<GameSession[]> {
    console.log('📡 SERVICE - getAvailableSessions appelé');
    return this.http.get<GameSession[]>(`${this.baseUrl}/game-sessions`);
  }

  // Créer une nouvelle session de jeu générique
  createGameSession(sessionData: CreateSessionRequest): Observable<any> {
    console.log('🎮 SERVICE - createGameSession appelé avec:', sessionData);
    return this.http.post(`${this.baseUrl}/game-sessions/create`, sessionData);
  }

  // Créer une session de roulette spécifiquement (ROxx)
  createRouletteSession(sessionData: Omit<CreateSessionRequest, 'gameType'>): Observable<any> {
    const rouletteSessionData = {
      ...sessionData,
      gameType: 'RO'
    };
    console.log('🎰 SERVICE - createRouletteSession appelé avec:', sessionData);
    console.log('🎰 SERVICE - Données envoyées au backend:', rouletteSessionData);
    console.log('🎰 SERVICE - URL:', `${this.baseUrl}/game-sessions/create`);
    return this.http.post(`${this.baseUrl}/game-sessions/create`, rouletteSessionData);
  }

  // Créer une session de salon spécifiquement (SAxx)
  createSalonSession(sessionData: Omit<CreateSessionRequest, 'gameType'>): Observable<any> {
    const salonSessionData = {
      ...sessionData,
      gameType: 'SA'
    };
    console.log('🏛️ SERVICE - createSalonSession appelé avec:', sessionData);
    console.log('🏛️ SERVICE - Données envoyées au backend:', salonSessionData);
    return this.http.post(`${this.baseUrl}/game-sessions/create`, salonSessionData);
  }

  // Rejoindre une session de jeu existante
  joinGameSession(sessionId: string): Observable<any> {
    console.log('🚪 SERVICE - joinGameSession appelé pour session:', sessionId);
    return this.http.post(`${this.baseUrl}/game-sessions/join`, { sessionId });
  }
} 