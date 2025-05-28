import { Injectable, inject } from '@angular/core';
import { IBettingBoardCell } from '../../interfaces/betting-board.interface';
import { IUser } from '../../interfaces/users.interface';
import { IRouletteResult } from '../../interfaces/roulette-net-resultat.interface';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class RouletteNetLogic {
  private http = inject(HttpClient);
  private BASE_URL = 'http://localhost:3000';
  
  currentUser!: IUser;
  
  // Les valeurs des jetons et leurs couleurs
  chipValues = [1, 5, 10, 100, 'clear'];
  chipColors = ['red', 'blue', 'orange', 'gold', 'clearBet'];
  selectedChipIndex = 1; // Par défaut, 5 est actif
  isSpinning = false; // Ajout de l'état de rotation

  currentBet = 0;
  wager = 5;
  lastWager = 0;
  bet: { amt: number; type: string; odds: number; numbers: string }[] = [];
  numbersBet: number[] = [];
  previousNumbers: number[] = [];

  numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  wheelnumbersAC = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34,
    6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 
    1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

  constructor() {
    // Récupérer les informations de l'utilisateur via l'API get_id/info
    this.fetchIUser();
  }

  // Méthode pour récupérer les informations de l'utilisateur
  fetchIUser() {
    this.http.get<IUser>(`${this.BASE_URL}/get_id/info`, { withCredentials: true })
      .subscribe({
        next: (userData) => {
          this.currentUser = userData;
          console.log('Utilisateur connecté:', this.currentUser);
          
          // Si l'utilisateur a un solde, on peut l'utiliser comme valeur initiale de la banque
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des informations utilisateur:', error);
          
        }
      });
  }

  resetGame() {
    // Utiliser le solde de l'utilisateur connecté ou 1000 par défaut
    this.currentBet = 0;
    this.wager = 5;
    this.bet = [];
    this.numbersBet = [];
    this.previousNumbers = [];
  }

  clearBet() {// Réinitialiser les mises
    this.bet = [];
    this.numbersBet = [];
  }

  removeBet(cell: IBettingBoardCell) {// Supprimer la mise
    this.wager = (this.wager === 0) ? 100 : this.wager;
    const n = cell.numbers.join(', ');
    const t = cell.type;
    for (let b of this.bet) {
      if (b.numbers === n && b.type === t) {
        if (b.amt !== 0) {
          this.wager = (b.amt > this.wager) ? this.wager : b.amt;
          b.amt -= this.wager;
          this.currentUser.solde += this.wager;
          this.currentBet -= this.wager;
        }
      }
    }
    // Nettoyer les bets à 0
    this.bet = this.bet.filter(b => b.amt > 0);
  }

  async spin(): Promise<IRouletteResult> {// Méthode pour faire tourner la roulette
    try {
        // Si l'utilisateur est connecté, on peut envoyer son ID avec la requête
        const userId = this.currentUser?.user_id;
        
        const response = await fetch('/api/roulette/spin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId }), // Envoyer l'ID de l'utilisateur si disponible
        });

        if (!response.ok) {
            throw new Error('Failed à spin the roulette');
        }

        const result = await response.json();
        return result as IRouletteResult;
    } catch (error) {
        console.error('Error spinning the roulette:', error);
        throw error;
    }
  }

  async win(winningSpin: number): Promise<{ winValue: number; betTotal: number; payout: number }> {
    try {
      // Appel de l'API win du backend
      const response = await this.http.post<{ 
        winValue: number; 
        betTotal: number; 
        payout: number;
        newsolde: number;
      }>(
        `${this.BASE_URL}/roulette/win`, 
        { 
          winningSpin, 
          bets: this.bet,
          solde: this.currentUser.solde
        }
      ).toPromise();
      
      if (response) {
        // Mettre à jour la valeur de la banque avec celle calculée par le backend
        this.currentUser.solde = response.newsolde;
        // Retourner juste les informations de gain sans la nouvelle valeur de la banque
        return { 
          winValue: response.winValue, 
          betTotal: response.betTotal, 
          payout: response.payout 
        };
      }
      
      throw new Error('Échec du calcul des gains');
    } catch (error) {
        console.error('Erreur lors du calcul des gains:', error);
      return { winValue: 0, betTotal: 0, payout: 0 };
    }
  }

  getNumberColor(number: number): 'red' | 'black' | 'green' {// Obtenir la couleur du numéro
    if (number === 0) return 'green';
    return this.numRed.includes(number) ? 'red' : 'black';
  }

  getWheelNumbers(): number[] {// Obtenir les numéros de la roulette
    return this.wheelnumbersAC;
  }

  getSectionColor(number: number): string {// Obtenir la couleur de la section
    if (number === 0) return '#016D29'; // vert
    if (this.numRed.includes(number)) return '#E0080B'; // rouge
    return '#000'; // noir
  }

  getBetForCell(cell: IBettingBoardCell) {// Obtenir la mise pour une cellule
    const n = cell.numbers.join(', ');
    const t = cell.type;
    return this.bet.find(b => b.numbers === n && b.type === t) || null;
  }

  getChipColorClass(amount: number): string {// Obtenir la classe de couleur de la puce
    if (amount < 5) return 'red';
    if (amount < 10) return 'blue';
    if (amount < 100) return 'orange';
    return 'gold';
  }
  
  // Méthode pour obtenir les informations de l'utilisateur connecté
  getCurrentIUser(): IUser | null {// Obtenir l'utilisateur connecté
    return this.currentUser;
  }

  setBet(cell: IBettingBoardCell) {// Vérifier si la mise est supérieure à 0
    this.lastWager = this.wager;
    this.wager = (this.currentUser.solde < this.wager) ? this.currentUser.solde : this.wager;

    if (this.wager > 0) {

      this.currentUser.solde -= this.wager;
      this.currentBet += this.wager;
      // Vérifier si la mise existe déjà
      const n = cell.numbers.join(', ');
      const t = cell.type;
      const o = cell.odds; 
      let found = false;
      for (let b of this.bet) {
        if (b.numbers === n && b.type === t) {
          b.amt += this.wager;
          found = true;
          break;
        }
      }
      if (!found) {
        this.bet.push({ amt: this.wager, type: t, odds: o, numbers: n });
      }
      // Ajouter les numéros à numbersBet
      for (let num of cell.numbers) {
        if (!this.numbersBet.includes(num)) {
          this.numbersBet.push(num);
        }
      }
    }
  }

  /**
   * Sélectionne une puce avec une valeur spécifique pour les mises
   * @param index Index dans le tableau des valeurs du  jeton
   * @returns true si la sélection a réussi, false sinon
   */
  selectChip(index: number): boolean {
    if (this.isSpinning) return false; // Empêcher la sélection de puce pendant la rotation
    
    if (index === this.chipValues.length - 1) {
        // Clear bet
        if (this.currentUser && this.currentUser.solde !== undefined) {
            this.currentUser.solde += this.currentBet;
        }
        this.currentBet = 0;
        this.clearBet();
    } else {
        this.selectedChipIndex = index;
        this.wager = index === 0 ? 1 : index === 1 ? 5 : index === 2 ? 10 : 100;
    }
    
    return true;
  }
} 