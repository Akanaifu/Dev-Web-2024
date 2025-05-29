import { Injectable, inject } from '@angular/core';
import { IBettingBoardCell } from '../../interfaces/betting-board.interface';
import { IUser } from '../../interfaces/users.interface';
import { IRouletteResult } from '../../interfaces/roulette-net-resultat.interface';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Service de logique métier pour le jeu de roulette en ligne.
 * 
 * RESPONSABILITÉS :
 * - Gestion des mises et calcul des gains
 * - Communication avec l'API backend
 * - Synchronisation du solde utilisateur
 * - État du jeu (spinning, mises actives, etc.)
 * 
 * ARCHITECTURE DE SOLDE (résout le problème de double débit) :
 * - _originalSolde : Solde réel pour les calculs backend
 * - currentUser.solde : Solde affiché avec mises débitées visuellement
 * - À chaque spin : backend reçoit _originalSolde, frontend affiche le nouveau solde
 */
@Injectable({ providedIn: 'root' })
export class RouletteNetLogic {
  private http = inject(HttpClient);
  private BASE_URL = 'http://localhost:3000';
  
  // ===== PROPRIÉTÉS PRIVÉES ENCAPSULÉES =====
  private _currentUser?: IUser;
  private _isSpinning = false;
  private _currentBet = 0;
  private _wager = 5;
  private _selectedChipIndex = 1;
  private _originalSolde = 0; // Garde le solde réel avant débits visuels
  
  // ===== GETTERS/SETTERS AVEC VALIDATION =====
  
  /** Accès contrôlé aux données utilisateur */
  get currentUser(): IUser | undefined {
    return this._currentUser;
  }
  
  set currentUser(user: IUser | undefined) {
    this._currentUser = user;
  }
  
  /** État de rotation de la roulette */
  get isSpinning(): boolean {
    return this._isSpinning;
  }
  
  set isSpinning(value: boolean) {
    this._isSpinning = value;
  }
  
  /** Montant total des mises en cours (toujours positif) */
  get currentBet(): number {
    return this._currentBet;
  }
  
  set currentBet(value: number) {
    this._currentBet = Math.max(0, value);
  }
  
  /** Valeur de la mise sélectionnée (minimum 1) */
  get wager(): number {
    return this._wager;
  }
  
  set wager(value: number) {
    this._wager = Math.max(1, value);
  }
  
  /** Index du jeton sélectionné avec validation des limites */
  get selectedChipIndex(): number {
    return this._selectedChipIndex;
  }
  
  set selectedChipIndex(index: number) {
    if (index >= 0 && index < this.chipValues.length) {
      this._selectedChipIndex = index;
    }
  }
  
  // ===== CONFIGURATION DU JEU =====
  
  /** Valeurs des jetons disponibles pour les mises */
  chipValues = [1, 5, 10, 100, 'clear'];
  
  /** Couleurs CSS correspondant aux jetons */
  chipColors = ['red', 'blue', 'orange', 'gold', 'clearBet'];
  
  /** Dernière mise effectuée (pour l'historique) */
  lastWager = 0;

  /** Tableau des mises actives avec leurs détails */
  bet: { label: string; numbers: string; type: string; odds: number; amt: number }[] = [];
  
  /** Numéros sur lesquels des mises sont placées */
  numbersBet: number[] = [];
  
  /** Historique des 10 derniers numéros sortis */
  previousNumbers: number[] = [];

  /** Numéros rouges selon les règles de la roulette européenne */
  numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  
  /** Disposition physique des numéros sur la roue physique */
  wheelnumbersAC = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34,
    6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 
    1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

  constructor() {
    this.fetchIUser();
    this.selectedChipIndex = 1; // Jeton de 5 par défaut
    this.wager = 5;
    this.currentBet = 0;
    this.isSpinning = false;
  }

  /**
   * Récupère les informations utilisateur depuis l'API.
   * Initialise _originalSolde avec le solde réel de la base de données.
   */
  fetchIUser() {
    this.http.get<IUser>(`${this.BASE_URL}/get_id/info`, { withCredentials: true })
      .subscribe({
        next: (userData) => {
          this.currentUser = userData; 
          this._originalSolde = userData.solde;
        },
        error: (error) => {
          console.error('❌ Erreur récupération utilisateur:', error);
        }
      });
  }

  /**
   * Remet à zéro l'état du jeu.
   * Synchronise le solde affiché avec le solde original.
   */
  resetGame() {
    this.currentBet = 0; 
    this.wager = 5;      
    this.bet = [];
    this.numbersBet = [];
    this.previousNumbers = [];
    
    if (this.currentUser) {
      this.currentUser.solde = this._originalSolde;
    }
  }

  /**
   * Efface toutes les mises sans affecter le solde.
   */
  clearBet() {
    this.bet = [];
    this.numbersBet = [];
  }

  /**
   * Remet à zéro l'état des mises après un spin.
   * Synchronise _originalSolde avec le nouveau solde calculé.
   */
  resetBettingState() {
    this.currentBet = 0;
    this.bet = [];
    this.numbersBet = [];
    
    if (this.currentUser) {
      this._originalSolde = this.currentUser.solde;
    }
  }

  /**
   * Supprime une mise spécifique.
   * Recrédite visuellement le montant au solde affiché.
   */
  removeBet(cell: IBettingBoardCell) {
    if (!this.currentUser || !cell?.numbers) return;
    
    this.wager = this.wager === 0 ? 100 : this.wager; 
    const numbers = cell.numbers.join(', ');
    const type = cell.type;
    
    for (let bet of this.bet) {
      if (bet.numbers === numbers && bet.type === type && bet.amt > 0) {
        this.wager = bet.amt > this.wager ? this.wager : bet.amt; 
        bet.amt -= this.wager;
        
        // Recréditer visuellement le montant
        this.currentUser.solde += this.wager;
        this.currentBet -= this.wager; 
      }
    }
    
    // Supprimer les mises à zéro
    this.bet = this.bet.filter(b => b.amt > 0);
  }

  /**
   * Lance la roulette via l'API backend.
   * Retourne un numéro aléatoire et sa couleur.
   */
  async spin(): Promise<IRouletteResult> {
    try {
        const userId = this.currentUser?.user_id;
        
        const response = await fetch('/api/roulette/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error('Échec du lancement de la roulette');
        }

        return await response.json() as IRouletteResult;
    } catch (error) {
        console.error('Erreur lors du spin:', error);
        throw error;
    }
  }

  /**
   * Calcule les gains/pertes d'un spin.
   * 
   * LOGIQUE ANTI-DOUBLE-DÉBIT :
   * - Envoie _originalSolde (non débité) au backend
   * - Le backend calcule : soldeOriginal + gains - pertes
   * - Met à jour les deux valeurs avec le résultat
   */
  async win(winningSpin: number): Promise<{ winValue: number; payout: number; newsolde: number; betTotal: number }> {
    if (!this.currentUser) {
      throw new Error('Utilisateur non connecté');
    }
    
    try {
      const response = await firstValueFrom(this.http.post<{ 
        winValue: number; 
        payout: number;
        newsolde: number;
        betTotal: number;
      }>(
        `${this.BASE_URL}/api/roulette/win`, 
        { 
          winningSpin, 
          bets: this.bet,
          solde: this._originalSolde,  // Solde réel (non débité)
          userId: this.currentUser.user_id
        }
      ));
      
      if (response) {
        const safeWinValue = response.winValue ?? 0;
        const safePayout = response.payout ?? 0;
        const safeBetTotal = response.betTotal ?? 0;
        const safeNewsolde = response.newsolde ?? this.currentUser.solde;
        
        // Mettre à jour les deux soldes avec le résultat du backend
        this.currentUser.solde = safeNewsolde;
        this._originalSolde = safeNewsolde;
        
        return { 
          winValue: safeWinValue, 
          payout: safePayout,
          newsolde: safeNewsolde,
          betTotal: safeBetTotal
        };
      }
      
      throw new Error('Réponse invalide du serveur');
    } catch (error) {
      console.error('Erreur calcul gains:', error);
      throw error;
    }
  }

  // ===== MÉTHODES UTILITAIRES =====

  /** Retourne la couleur d'un numéro (rouge/noir/vert) */
  getNumberColor(number: number): 'red' | 'black' | 'green' {
    if (number === 0) return 'green';
    return this.numRed.includes(number) ? 'red' : 'black';
  }

  /** Retourne l'ordre des numéros sur la roue physique */
  getWheelNumbers(): number[] {
    return this.wheelnumbersAC;
  }

  /** Retourne la couleur CSS pour l'affichage d'une section */
  getSectionColor(number: number): string {
    if (number === 0) return '#016D29'; // vert
    if (this.numRed.includes(number)) return '#E0080B'; // rouge
    return '#000'; // noir
  }

  /** Trouve la mise associée à une cellule du plateau */
  getBetForCell(cell: IBettingBoardCell) {
    if (!cell?.numbers) return null;
    const numbers = cell.numbers.join(', ');
    const type = cell.type;
    return this.bet.find(b => b.numbers === numbers && b.type === type) || null;
  }

  /** Retourne la classe CSS du jeton selon le montant */
  getChipColorClass(amount: number): string {
    if (amount < 5) return 'red';
    if (amount < 10) return 'blue';
    if (amount < 100) return 'orange';
    return 'gold';
  }
  
  /** Accesseur pour les données utilisateur */
  getCurrentIUser(): IUser | undefined {
    return this.currentUser;
  }

  /**
   * Enregistre une nouvelle mise sur une cellule.
   * 
   * GESTION DU SOLDE :
   * - Débite visuellement currentUser.solde (UX)
   * - Conserve _originalSolde pour les calculs backend
   */
  setBet(cell: IBettingBoardCell) {
    if (!this.currentUser || !cell?.numbers) return;
    
    this.lastWager = this.wager;
    this.wager = Math.min(this.wager, this.currentUser.solde);

    if (this.wager > 0) {
      // Débit visuel pour l'expérience utilisateur
      this.currentUser.solde -= this.wager;
      this.currentBet += this.wager; 
      
      // Ajouter ou mettre à jour la mise
      const numbers = cell.numbers.join(', ');
      const type = cell.type;
      const odds = cell.odds; 
      const label = cell.label;
      
      let existingBet = this.bet.find(b => b.numbers === numbers && b.type === type);
      if (existingBet) {
        existingBet.amt += this.wager;
      } else {
        this.bet.push({ label, numbers, type, odds, amt: this.wager });
      }
      
      // Ajouter les numéros à la liste des numéros misés
      for (let num of cell.numbers) {
        if (!this.numbersBet.includes(num)) {
          this.numbersBet.push(num);
        }
      }
    }
  }

  /**
   * Gère la sélection des jetons et l'action "clear bet".
   */
  selectChip(index: number): boolean {
    if (this.isSpinning) return false;
    
    if (index === this.chipValues.length - 1) {
        // Action "clear bet" : recréditer toutes les mises
        if (this.currentUser) {
            this.currentUser.solde += this.currentBet;
        }
        this.currentBet = 0; 
        this.clearBet();
    } else {
        // Sélection d'un jeton avec valeur prédéfinie
        this.selectedChipIndex = index; 
        this.wager = [1, 5, 10, 100][index] || 100;
    }
    
    return true;
  }
} 