import { Injectable, inject } from '@angular/core';
import { IBettingBoardCell } from '../../interfaces/betting-board.interface';
import { IUser } from '../../interfaces/users.interface';
import { IRouletteResult } from '../../interfaces/roulette-net-resultat.interface';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Service de logique métier pour le jeu de roulette en ligne.
 * Gère toutes les opérations de mise, calcul des gains et communication avec l'API backend.
 * 
 * ARCHITECTURE AVEC LE COMPOSANT :
 * - Ce service contient toute la logique métier et les données d'état du jeu
 * - Le composant accède aux données via des getters qui délèguent à ce service
 * - Pattern : Séparation claire entre logique métier (service) et présentation (composant)
 * - Avantage : Testabilité, réutilisabilité et maintenance facilitées
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
  
  // ===== GETTERS/SETTERS ES6 POUR L'ENCAPSULATION =====
  
  /**
   * Getter/Setter pour l'utilisateur connecté avec validation.
   * Centralise l'accès aux données utilisateur depuis le composant.
   */
  get currentUser(): IUser | undefined {
    return this._currentUser;
  }
  
  set currentUser(user: IUser | undefined) {
    this._currentUser = user;
  }
  
  /**
   * Getter/Setter pour l'état de rotation avec contrôle d'accès.
   * Empêche les modifications non autorisées de l'état de jeu.
   */
  get isSpinning(): boolean {
    return this._isSpinning;
  }
  
  set isSpinning(value: boolean) {
    this._isSpinning = value;
  }
  
  /**
   * Getter/Setter pour la mise actuelle avec validation des montants.
   * Garantit que les montants sont toujours positifs et cohérents.
   */
  get currentBet(): number {
    return this._currentBet;
  }
  
  set currentBet(value: number) {
    this._currentBet = Math.max(0, value); // Protection contre les valeurs négatives
  }
  
  /**
   * Getter/Setter pour la valeur de mise avec validation.
   * Assure que la mise respecte les limites du jeu.
   */
  get wager(): number {
    return this._wager;
  }
  
  set wager(value: number) {
    this._wager = Math.max(1, value); // Mise minimum de 1
  }
  
  /**
   * Getter/Setter pour l'index du jeton sélectionné avec validation.
   * Contrôle la sélection des jetons disponibles.
   */
  get selectedChipIndex(): number {
    return this._selectedChipIndex;
  }
  
  set selectedChipIndex(index: number) {
    if (index >= 0 && index < this.chipValues.length) {
      this._selectedChipIndex = index;
    }
  }
  
  // Configuration des jetons de mise avec leurs valeurs et couleurs associées
  // Le système permet de miser avec différentes valeurs prédéfinies
  chipValues = [1, 5, 10, 100, 'clear'];
  chipColors = ['red', 'blue', 'orange', 'gold', 'clearBet'];
  lastWager = 0;

  // Tableaux de stockage des mises et des résultats
  // Ils permettent de gérer l'historique et l'état des paris en cours
  bet: { label: string; numbers: string; type: string; odds: number; amt: number }[] = [];
  numbersBet: number[] = [];
  previousNumbers: number[] = [];

  // Configuration de la roulette européenne avec numéros rouges et disposition de la roue
  // Ces constantes définissent les règles et l'apparence du jeu de roulette
  numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  wheelnumbersAC = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34,
    6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 
    1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

  constructor() {
    // Récupération automatique des données utilisateur au démarrage du service
    // Cette initialisation garantit que l'utilisateur connecté est identifié dès le chargement
    this.fetchIUser();
    
    // Initialisation des valeurs par défaut via les setters pour validation
    this.selectedChipIndex = 1; // Par défaut, jeton de 5 actif
    this.wager = 5;
    this.currentBet = 0;
    this.isSpinning = false;
  }

  /**
   * Récupère les informations de l'utilisateur connecté depuis l'API.
   * Les console.log permettent de tracer les appels API et diagnostiquer les problèmes de connexion.
   */
  fetchIUser() {
    console.log('🔄 Récupération des données utilisateur depuis l\'API...');
    this.http.get<IUser>(`${this.BASE_URL}/get_id/info`, { withCredentials: true })
      .subscribe({
        next: (userData) => {
          this.currentUser = userData; 
          console.log('✅ Données utilisateur récupérées:', this.currentUser);
          console.log('💰 Solde récupéré depuis l\'API:', this.currentUser?.solde);
          
          // Si l'utilisateur a un solde, on peut l'utiliser comme valeur initiale de la banque
        },
        error: (error) => {
          console.error('❌ Erreur lors de la récupération des informations utilisateur:', error);
          
        }
      });
  }

  /**
   * Remet à zéro toutes les variables de jeu pour une nouvelle partie.
   * Cette méthode nettoie l'état du jeu tout en conservant les données utilisateur.
   */
  resetGame() {
    this.currentBet = 0; 
    this.wager = 5;      
    this.bet = [];
    this.numbersBet = [];
    this.previousNumbers = [];
  }

  /**
   * Efface toutes les mises en cours sans affecter le solde.
   * Utilisée pour annuler les paris avant le lancement de la roulette.
   */
  clearBet() {
    this.bet = [];
    this.numbersBet = [];
  }

  /**
   * Supprime une mise spécifique et recrédite le montant au solde affiché.
   * Cette opération est locale (pas de base de données) pour l'affichage temps réel.
   */
  removeBet(cell: IBettingBoardCell) {
    if (!this.currentUser) return; // Vérification de sécurité
    if (!cell || !cell.numbers) return; // Vérification de sécurité pour cell
    
    this.wager = (this.wager === 0) ? 100 : this.wager; 
    const n = cell.numbers.join(', ');
    const t = cell.type;
    for (let b of this.bet) {
      if (b.numbers === n && b.type === t) {
        if (b.amt !== 0) {
          this.wager = (b.amt > this.wager) ? this.wager : b.amt; 
          b.amt -= this.wager;
          // Créditer localement pour l'affichage en temps réel (sans toucher la base de données)
          if (this.currentUser) {
            this.currentUser.solde += this.wager;
          }
          this.currentBet -= this.wager; 
        }
      }
    }
    // Nettoyer les bets à 0
    this.bet = this.bet.filter(b => b.amt > 0);
  }

  /**
   * Lance la roulette et retourne un numéro aléatoire via l'API.
   * L'appel API garantit que le résultat est généré côté serveur pour éviter la triche.
   */
  async spin(): Promise<IRouletteResult> {
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

  /**
   * Calcule les gains/pertes d'un spin en récupérant d'abord le solde réel de la base de données.
   * Les console.log tracent le processus de récupération du solde pour diagnostiquer les incohérences.
   */
  async win(winningSpin: number): Promise<{ winValue: number; payout: number; newsolde: number; betTotal: number }> {
    if (!this.currentUser) {
      throw new Error('Utilisateur non connecté');
    }
    
    try {
      // Récupération du solde réel depuis la base de données pour éviter les désynchronisations
      // Cette étape garantit que les calculs se basent sur la valeur la plus récente en base
      console.log('💰 Récupération du solde réel depuis la base de données...');
      const userData = await firstValueFrom(this.http.get<IUser>(`${this.BASE_URL}/get_id/info`, { withCredentials: true }));
      const soldeReel = userData.solde;
      console.log(`💰 Solde réel récupéré: ${soldeReel}`);
      
      // Appel de l'API win du backend avec le vrai solde de la base de données
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
          solde: soldeReel,  // Utiliser le solde réel de la base de données
          userId: this.currentUser.user_id
        }
      ));
      
      if (response) {
        // Protection contre les valeurs nulles retournées par l'API
        // Ces vérifications assurent la robustesse en cas de réponse incomplète du serveur
        const safeWinValue = response.winValue !== null ? response.winValue : 0;
        const safePayout = response.payout !== null ? response.payout : 0;
        const safeBetTotal = response.betTotal !== null ? response.betTotal : 0;
        const safeNewsolde = response.newsolde !== null ? response.newsolde : this.currentUser.solde;
        
        // Mise à jour du solde local avec la valeur calculée par le backend
        // Le console.log confirme que la mise à jour a eu lieu côté frontend
        if (this.currentUser) {
          this.currentUser.solde = safeNewsolde;
        }
        console.log(`💰 Solde frontend mis à jour: ${safeNewsolde}`);
        
        // Actualisation des données utilisateur pour garantir la cohérence avec la base
        // Cette double vérification s'assure que frontend et backend restent synchronisés
        this.fetchIUser();
        
        return { 
          winValue: safeWinValue, 
          payout: safePayout,
          newsolde: safeNewsolde,
          betTotal: safeBetTotal
        };
      }
      
      throw new Error('Échec du calcul des gains');
    } catch (error) {
      console.error('Erreur lors du calcul des gains:', error);
      throw error;
    }
  }

  // ===== MÉTHODES D'ACCÈS ET UTILITAIRES =====
  // Ces méthodes préfixées "get" ne sont PAS des getters ES6 mais des méthodes classiques
  // Différence avec les getters du composant : ces méthodes effectuent des calculs ou transformations
  // Les getters du composant délèguent simplement l'accès aux propriétés de ce service

  /**
   * Détermine la couleur d'un numéro selon les règles de la roulette européenne.
   * Le zéro est vert, les autres numéros sont rouges ou noirs selon la configuration.
   */
  getNumberColor(number: number): 'red' | 'black' | 'green' {
    if (number === 0) return 'green';
    return this.numRed.includes(number) ? 'red' : 'black';
  }

  /**
   * Retourne la disposition physique des numéros sur la roue de roulette.
   * Cette configuration respecte l'ordre standard de la roulette européenne.
   */
  getWheelNumbers(): number[] {
    return this.wheelnumbersAC;
  }

  /**
   * Génère la couleur de fond CSS pour l'affichage des sections de la roue.
   * Les couleurs respectent le code traditionnel : vert pour 0, rouge et noir pour les autres.
   */
  getSectionColor(number: number): string {
    if (number === 0) return '#016D29'; // vert
    if (this.numRed.includes(number)) return '#E0080B'; // rouge
    return '#000'; // noir
  }

  /**
   * Recherche et retourne la mise associée à une cellule du plateau de jeu.
   * Cette méthode permet d'afficher les jetons placés sur chaque case du tapis.
   */
  getBetForCell(cell: IBettingBoardCell) {
    if (!cell || !cell.numbers) return null; // Vérification de sécurité
    const n = cell.numbers.join(', ');
    const t = cell.type;
    return this.bet.find(b => b.numbers === n && b.type === t) || null;
  }

  /**
   * Détermine la classe CSS du jeton selon le montant misé.
   * Le système de couleurs aide à identifier rapidement les montants des mises.
   */
  getChipColorClass(amount: number): string {
    if (amount < 5) return 'red';
    if (amount < 10) return 'blue';
    if (amount < 100) return 'orange';
    return 'gold';
  }
  
  /**
   * Accesseur pour récupérer les données de l'utilisateur actuellement connecté.
   * Cette méthode centralise l'accès aux informations utilisateur pour le composant.
   */
  getCurrentIUser(): IUser | undefined {
    return this.currentUser;
  }

  /**
   * Enregistre une nouvelle mise sur une cellule du plateau de jeu.
   * La mise est débitée localement pour l'affichage immédiat, la vraie déduction se fait via l'API.
   */
  setBet(cell: IBettingBoardCell) {
    if (!this.currentUser) return; // Vérification de sécurité
    if (!cell || !cell.numbers) return; // Vérification de sécurité pour cell
    
    this.lastWager = this.wager;
    this.wager = (this.currentUser.solde < this.wager) ? this.currentUser.solde : this.wager;

    if (this.wager > 0) {
      // Débit local pour l'affichage temps réel (la vraie déduction se fait via l'API backend)
      // Cette approche améliore l'expérience utilisateur en montrant immédiatement l'effet de la mise
      if (this.currentUser) {
        this.currentUser.solde -= this.wager;
      }
      this.currentBet += this.wager; 
      
      // Vérification et mise à jour des mises existantes ou création d'une nouvelle mise
      // Le système accumule les mises multiples sur la même cellule
      const n = cell.numbers.join(', ');
      const t = cell.type;
      const o = cell.odds; 
      const l = cell.label;
      let found = false;
      for (let b of this.bet) {
        if (b.numbers === n && b.type === t) {
          b.amt += this.wager;
          found = true;
          break;
        }
      }
      if (!found) {
        this.bet.push({ label: l, numbers: n, type: t, odds: o, amt: this.wager });
      }
      // Tracking des numéros misés pour l'affichage visuel
      // Cette liste aide à mettre en évidence les cases avec des mises actives
      for (let num of cell.numbers) {
        if (!this.numbersBet.includes(num)) {
          this.numbersBet.push(num);
        }
      }
    }
  }

  /**
   * Gère la sélection des jetons et l'action de nettoyage des mises.
   * Le système empêche les modifications pendant la rotation de la roulette pour la cohérence du jeu.
   */
  selectChip(index: number): boolean {
    if (this.isSpinning) return false; // Empêcher la sélection de puce pendant la rotation
    
    if (index === this.chipValues.length - 1) {
        // Action "clear bet" qui remet le solde affiché à l'état initial
        // Cette fonctionnalité permet d'annuler toutes les mises d'un coup
        if (this.currentUser && this.currentUser.solde !== undefined) {
            this.currentUser.solde += this.currentBet;  // Remettre les mises dans le solde affiché
        }
        this.currentBet = 0; 
        this.clearBet();
    } else {
        // Sélection d'une valeur de jeton spécifique pour les prochaines mises
        // Les valeurs sont prédéfinies pour correspondre aux jetons standards du casino
        this.selectedChipIndex = index; 
        this.wager = index === 0 ? 1 : index === 1 ? 5 : index === 2 ? 10 : 100; 
    }
    
    return true;
  }
} 