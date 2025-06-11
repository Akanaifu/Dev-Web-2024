import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, firstValueFrom } from 'rxjs';
import { IBettingBoardCell } from '../../interfaces/betting-board.interface';
import { IRouletteResult } from '../../interfaces/roulette-net-resultat.interface';
import { environment } from '../../../environments/environments';

// Interfaces pour le service
export interface SpinRequest {
  userId?: number;
}

export interface SpinResponse {
  number: number;
  color: 'red' | 'black' | 'green';
}

export interface WinRequest {
  winningSpin: number;
  bets: BetData[];
  solde: number;
  userId: number;
}

export interface WinResponse {
  winValue: number;
  payout: number;
  newsolde: number;
  betTotal: number;
}

export interface BetData {
  label: string;
  numbers: string;
  type: string;
  odds: number;
  amt: number;
}

export interface BettingBoardData {
  outsideBets: IBettingBoardCell[];
  numberBoardRows: IBettingBoardCell[][];
  zeroCell: IBettingBoardCell;
  columnBets: IBettingBoardCell[];
  dozenBets: IBettingBoardCell[];
  evenOddRedBlack: IBettingBoardCell[];
  splitBets: IBettingBoardCell[];
  cornerBets: IBettingBoardCell[];
  streetBets: IBettingBoardCell[];
  doubleStreetBets: IBettingBoardCell[];
}

export interface UpdateSoldeRequest {
  newSolde: number;
}

export interface UpdateSoldeResponse {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class RouletteNetService {

  private http = inject(HttpClient);
  private BASE_URL = environment.production ? '/api' : 'http://localhost:3000/api';

  // Signals pour l'état du jeu - inspiré du pattern login.service.ts
  gameState = signal<{
    isSpinning: boolean;
    lastResult: IRouletteResult | null;
    currentBets: BetData[];
  }>({
    isSpinning: false,
    lastResult: null,
    currentBets: []
  });

  bettingBoard = signal<BettingBoardData | null>(null);

  /**
   * Lance la roulette via l'API backend.
   * Utilise le pattern Observable avec tap et map comme login.service.ts
   */
  spin(request: SpinRequest = {}): Observable<IRouletteResult> {
    return this.http.post<SpinResponse>(`${this.BASE_URL}/api/roulette/spin`, request).pipe(
      tap((result) => {
        // Mise à jour du signal avec le résultat
        this.gameState.update(state => ({
          ...state,
          lastResult: {
            number: result.number,
            color: result.color
          }
        }));
      }),
      map((result) => ({
        number: result.number,
        color: result.color
      }))
    );
  }

  /**
   * Calcule les gains/pertes d'un spin.
   * Utilise le pattern Observable avec tap et map
   */
  calculateWin(request: WinRequest): Observable<WinResponse> {
    return this.http.post<WinResponse>(`${this.BASE_URL}/api/roulette/win`, request).pipe(
      tap((result) => {
        console.log('🎰 Résultat du calcul des gains:', result);
        // Optionnel : mettre à jour l'état si nécessaire
      }),
      map((result) => result)
    );
  }

  /**
   * Version async/await pour le calcul des gains (pour compatibilité avec le code existant)
   */
  async calculateWinAsync(request: WinRequest): Promise<WinResponse> {
    try {
      return await firstValueFrom(this.calculateWin(request));
    } catch (error) {
      console.error('❌ Erreur lors du calcul des gains:', error);
      throw error;
    }
  }

  /**
   * Version async/await pour le spin (pour compatibilité avec le code existant)
   */
  async spinAsync(request: SpinRequest = {}): Promise<IRouletteResult> {
    try {
      return await firstValueFrom(this.spin(request));
    } catch (error) {
      console.error('❌ Erreur lors du spin:', error);
      throw error;
    }
  }

  /**
   * Charge la configuration du plateau de mise depuis l'API.
   * Utilise le pattern Observable avec tap et map
   */
  loadBettingBoard(): Observable<BettingBoardData> {
    return this.http.get<BettingBoardData>(`${this.BASE_URL}/api/roulette-odds/betting-board`).pipe(
      tap((data) => {
        // Mise à jour du signal avec les données du plateau
        this.bettingBoard.set(data);
        console.log('🎯 Plateau de mise chargé:', data);
      }),
      map((data) => data)
    );
  }

  /**
   * Met à jour le solde utilisateur via l'API centralisée.
   * Utilise le pattern Observable avec tap et map
   */
  updateSolde(request: UpdateSoldeRequest): Observable<UpdateSoldeResponse> {
    return this.http.post<UpdateSoldeResponse>(`${this.BASE_URL}/api/update_solde/update`, request, {
      withCredentials: true
    }).pipe(
      tap((result) => {
        if (result.success) {
          console.log('💰 Solde mis à jour avec succès');
        } else {
          console.error('❌ Erreur mise à jour solde:', result.message);
        }
      }),
      map((result) => result)
    );
  }

  /**
   * Version async/await pour la mise à jour du solde
   */
  async updateSoldeAsync(newSolde: number): Promise<UpdateSoldeResponse> {
    try {
      return await firstValueFrom(this.updateSolde({ newSolde }));
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du solde:', error);
      throw error;
    }
  }

  /**
   * Met à jour l'état de rotation du jeu.
   * Inspiré du pattern signal du login.service.ts
   */
  setSpinning(isSpinning: boolean): void {
    this.gameState.update(state => ({
      ...state,
      isSpinning
    }));
  }

  /**
   * Met à jour les mises actives.
   */
  setBets(bets: BetData[]): void {
    this.gameState.update(state => ({
      ...state,
      currentBets: bets
    }));
  }

  /**
   * Remet à zéro l'état du jeu.
   */
  resetGameState(): void {
    this.gameState.set({
      isSpinning: false,
      lastResult: null,
      currentBets: []
    });
  }

  /**
   * Getters pour accéder aux données des signals (pattern login.service.ts)
   */
  getGameState() {
    return this.gameState();
  }

  getBettingBoard() {
    return this.bettingBoard();
  }

  isSpinning() {
    return this.gameState().isSpinning;
  }

  getLastResult() {
    return this.gameState().lastResult;
  }

  getCurrentBets() {
    return this.gameState().currentBets;
  }
}
