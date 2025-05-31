import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface BetWithUser {
  bet_id: number;
  user_id: number;
  pseudo: string; // récupéré via JOIN avec la table users
  game_session_id: string;
  amount: number;
  bet_status: string;
  combinaison: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class BetService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Données de test pour le développement
   */
  private getMockData(): BetWithUser[] {
    return [
      {
        bet_id: 1,
        user_id: 1,
        pseudo: 'Antoine',
        game_session_id: 'RO-2024-001',
        amount: 25.50,
        bet_status: 'won',
        combinaison: 'Rouge',
        created_at: new Date().toISOString()
      },
      {
        bet_id: 2,
        user_id: 2,
        pseudo: 'Sophie',
        game_session_id: 'RO-2024-001',
        amount: 10.00,
        bet_status: 'lost',
        combinaison: '17',
        created_at: new Date(Date.now() - 300000).toISOString()
      },
      {
        bet_id: 3,
        user_id: 3,
        pseudo: 'Pierre',
        game_session_id: 'RO-2024-002',
        amount: 50.00,
        bet_status: 'pending',
        combinaison: 'Pair',
        created_at: new Date(Date.now() - 600000).toISOString()
      },
      {
        bet_id: 4,
        user_id: 1,
        pseudo: 'Antoine',
        game_session_id: 'SA-2024-001',
        amount: 15.75,
        bet_status: 'won',
        combinaison: 'Noir',
        created_at: new Date(Date.now() - 900000).toISOString()
      },
      {
        bet_id: 5,
        user_id: 4,
        pseudo: 'Marie',
        game_session_id: 'RO-2024-001',
        amount: 100.00,
        bet_status: 'lost',
        combinaison: '0',
        created_at: new Date(Date.now() - 1200000).toISOString()
      }
    ];
  }

  /**
   * Récupère toutes les mises avec les informations des utilisateurs
   */
  getAllBetsWithUsers(): Observable<BetWithUser[]> {
    return this.http.get<BetWithUser[]>(`${this.apiUrl}/bets/with-users`).pipe(
      tap(data => console.log('✅ Données reçues du backend:', data)),
      catchError(error => {
        console.warn('⚠️ Backend non disponible, utilisation des données de test');
        console.error('Erreur API:', error);
        // Retourner les données de test en cas d'erreur
        return of(this.getMockData());
      })
    );
  }

  /**
   * Récupère les mises pour une session de jeu spécifique
   */
  getBetsBySession(sessionId: string): Observable<BetWithUser[]> {
    return this.http.get<BetWithUser[]>(`${this.apiUrl}/bets/session/${sessionId}`).pipe(
      catchError(error => {
        console.warn('⚠️ Backend non disponible pour la session, utilisation des données de test');
        console.error('Erreur API:', error);
        // Filtrer les données de test par session
        const mockData = this.getMockData().filter(bet => bet.game_session_id === sessionId);
        return of(mockData);
      })
    );
  }

  /**
   * Récupère les mises d'un utilisateur spécifique
   */
  getBetsByUser(userId: number): Observable<BetWithUser[]> {
    return this.http.get<BetWithUser[]>(`${this.apiUrl}/bets/user/${userId}`).pipe(
      catchError(error => {
        console.warn('⚠️ Backend non disponible pour l\'utilisateur, utilisation des données de test');
        console.error('Erreur API:', error);
        // Filtrer les données de test par utilisateur
        const mockData = this.getMockData().filter(bet => bet.user_id === userId);
        return of(mockData);
      })
    );
  }
} 