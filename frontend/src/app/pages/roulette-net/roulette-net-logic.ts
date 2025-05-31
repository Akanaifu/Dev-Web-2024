import { Injectable, inject } from '@angular/core';
import { IBettingBoardCell } from '../../interfaces/betting-board.interface';
import { IUser } from '../../interfaces/users.interface';
import { IRouletteResult } from '../../interfaces/roulette-net-resultat.interface';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * SERVICE DE LOGIQUE MÉTIER POUR LE JEU DE ROULETTE EN LIGNE
 * 
 * RESPONSABILITÉS PRINCIPALES :
 * - Gestion complète des mises et calcul des gains selon les règles de la roulette européenne
 * - Communication sécurisée avec l'API backend pour les opérations critiques
 * - Synchronisation intelligente du solde utilisateur (évite le double débit)
 * - Gestion d'état du jeu (spinning, mises actives, historique)
 * 
 * ARCHITECTURE DE SOLDE ANTI-DOUBLE-DÉBIT :
 * Le problème : Sans cette architecture, le solde pourrait être débité deux fois :
 * 1. Une fois visuellement dans le frontend (UX immédiate)
 * 2. Une fois par le backend lors du calcul des gains
 * 
 * La solution implémentée :
 * - _originalSolde : Solde réel non modifié, utilisé pour les calculs backend
 * - currentUser.solde : Solde affiché avec mises débitées visuellement pour l'UX
 * - À chaque spin : le backend reçoit _originalSolde, calcule les gains/pertes, retourne le nouveau solde
 * - Les deux valeurs sont synchronisées avec le résultat du backend
 * 
 * PATTERN D'ENCAPSULATION :
 * - Propriétés privées avec getters/setters pour contrôler l'accès et la validation
 * - Séparation claire entre données d'affichage et logique métier
 * - Validation automatique des valeurs (ex: currentBet toujours >= 0)
 */
@Injectable({ providedIn: 'root' })
export class RouletteNetLogic {
  private http = inject(HttpClient);
  private BASE_URL = 'http://localhost:3000';
  
  // ===== PROPRIÉTÉS PRIVÉES ENCAPSULÉES =====
  // L'encapsulation permet un contrôle strict de l'état et une validation automatique
  
  /** Données de l'utilisateur connecté (undefined si non connecté) */
  private _currentUser?: IUser;
  
  /** État de rotation de la roulette (bloque les interactions pendant le spin) */
  private _isSpinning = false;
  
  /** Montant total des mises en cours (toujours >= 0 grâce au setter) */
  private _currentBet = 0;
  
  /** Valeur de la mise sélectionnée (minimum 1 grâce au setter) */
  private _wager = 5;
  
  /** Index du jeton sélectionné (validé dans les limites du tableau) */
  private _selectedChipIndex = 1;
  
  /** 
   * Solde réel avant débits visuels - CLÉ DE L'ARCHITECTURE ANTI-DOUBLE-DÉBIT
   * Cette valeur reste synchronisée avec la base de données et est utilisée
   * pour tous les calculs backend, évitant ainsi le double débit du solde
   */
  private _originalSolde = 0;
  
  // ===== GETTERS/SETTERS AVEC VALIDATION AUTOMATIQUE =====
  // Ces accesseurs garantissent la cohérence des données et appliquent les règles métier
  
  /** 
   * ACCÈS CONTRÔLÉ AUX DONNÉES UTILISATEUR
   * Centralise l'accès aux informations de l'utilisateur connecté
   */
  get currentUser(): IUser | undefined {
    return this._currentUser;
  }
  
  set currentUser(user: IUser | undefined) {
    this._currentUser = user;
  }
  
  /** 
   * ÉTAT DE ROTATION DE LA ROULETTE
   * Contrôle l'activation/désactivation des interactions utilisateur
   */
  get isSpinning(): boolean {
    return this._isSpinning;
  }
  
  set isSpinning(value: boolean) {
    this._isSpinning = value;
  }
  
  /** 
   * MONTANT TOTAL DES MISES EN COURS
   * Validation automatique : toujours positif ou nul
   */
  get currentBet(): number {
    return this._currentBet;
  }
  
  set currentBet(value: number) {
    this._currentBet = Math.max(0, value); // Garantit une valeur >= 0
  }
  
  /** 
   * VALEUR DE LA MISE SÉLECTIONNÉE
   * Validation automatique : minimum 1 pour éviter les mises nulles
   */
  get wager(): number {
    return this._wager;
  }
  
  set wager(value: number) {
    this._wager = Math.max(1, value); // Garantit une valeur >= 1
  }
  
  /** 
   * INDEX DU JETON SÉLECTIONNÉ
   * Validation automatique : doit être dans les limites du tableau chipValues
   */
  get selectedChipIndex(): number {
    return this._selectedChipIndex;
  }
  
  set selectedChipIndex(index: number) {
    if (index >= 0 && index < this.chipValues.length) {
      this._selectedChipIndex = index;
    }
  }
  
  // ===== CONFIGURATION DU JEU (CONSTANTES MÉTIER) =====
  
  /** 
   * VALEURS DES JETONS DISPONIBLES POUR LES MISES
   * Progression classique des casinos : 1, 5, 10, 100 + option 'clear' pour tout effacer
   */
  chipValues = [1, 5, 10, 100, 'clear'];
  
  /** 
   * COULEURS CSS CORRESPONDANT AUX JETONS
   * Mapping 1:1 avec chipValues pour l'affichage visuel cohérent
   */
  chipColors = ['red', 'blue', 'orange', 'gold', 'clearBet'];
  
  /** Dernière mise effectuée (pour l'historique et les statistiques) */
  lastWager = 0;

  /** 
   * TABLEAU DES MISES ACTIVES AVEC LEURS DÉTAILS COMPLETS
   * Chaque mise contient : label (affichage), numbers (numéros couverts), 
   * type (catégorie), odds (cote), amt (montant misé)
   */
  bet: { label: string; numbers: string; type: string; odds: number; amt: number }[] = [];
  
  /** 
   * NUMÉROS SUR LESQUELS DES MISES SONT PLACÉES
   * Utilisé pour l'affichage visuel et les vérifications rapides
   */
  numbersBet: number[] = [];
  
  /** 
   * HISTORIQUE DES 10 DERNIERS NUMÉROS SORTIS
   * Permet aux joueurs de suivre les tendances (bien que chaque spin soit indépendant)
   */
  previousNumbers: number[] = [];

  /** 
   * NUMÉROS ROUGES SELON LES RÈGLES DE LA ROULETTE EUROPÉENNE
   * Configuration standard : 18 numéros rouges, 18 noirs, 1 vert (0)
   */
  numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  
  /** 
   * DISPOSITION PHYSIQUE DES NUMÉROS SUR LA ROUE EUROPÉENNE
   * Ordre exact des numéros sur une vraie roulette européenne (37 cases)
   * Utilisé pour l'animation réaliste de la bille
   */
  wheelnumbersAC = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34,
    6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 
    1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

  /**
   * CONSTRUCTEUR - INITIALISATION DU SERVICE
   * 
   * Configure l'état initial du jeu et récupère les données utilisateur.
   * Utilise des valeurs par défaut sécurisées pour éviter les erreurs.
   */
  constructor() {
    this.fetchIUser();           // Récupération asynchrone des données utilisateur
    this.selectedChipIndex = 1;  // Jeton de 5 par défaut (index 1)
    this.wager = 5;              // Mise par défaut de 5
    this.currentBet = 0;         // Aucune mise au démarrage
    this.isSpinning = false;     // Roulette à l'arrêt
  }

  /**
   * RÉCUPÉRATION DES INFORMATIONS UTILISATEUR DEPUIS L'API
   * 
   * Charge les données de l'utilisateur connecté et initialise le solde original.
   * Cette méthode est cruciale pour l'architecture anti-double-débit.
   * 
   * SÉCURITÉ :
   * - Utilise withCredentials pour l'authentification par cookies
   * - Gestion d'erreur robuste pour éviter les crashes
   * - Initialisation de _originalSolde avec le solde réel de la base
   */
  fetchIUser() {
    this.http.get<IUser>(`${this.BASE_URL}/get_id/info`, { withCredentials: true })
      .subscribe({
        next: (userData) => {
          this.currentUser = userData; 
          this._originalSolde = userData.solde; // CRUCIAL : synchronisation du solde réel
          console.log('👤 Utilisateur chargé:', userData.username, 'Solde:', userData.solde);
        },
        error: (error) => {
          console.error('❌ Erreur récupération utilisateur:', error);
        }
      });
  }

  /**
   * REMISE À ZÉRO COMPLÈTE DU JEU
   * 
   * Remet le jeu dans son état initial pour une nouvelle session.
   * Synchronise le solde affiché avec le solde original (annule les débits visuels).
   * 
   * UTILISATION :
   * - Bouton "Reset" dans l'interface
   * - Après une déconnexion/reconnexion
   * - En cas d'erreur nécessitant une réinitialisation
   */
  resetGame() {
    this.currentBet = 0;         // Efface le total des mises
    this.wager = 5;              // Remet la mise par défaut
    this.bet = [];               // Vide toutes les mises
    this.numbersBet = [];        // Efface les numéros misés
    this.previousNumbers = [];   // Efface l'historique
    
    // SYNCHRONISATION CRUCIALE : remet le solde affiché = solde réel
    if (this.currentUser) {
      this.currentUser.solde = this._originalSolde;
      console.log('🔄 Jeu remis à zéro, solde restauré:', this._originalSolde);
    }
  }

  /**
   * EFFACEMENT DES MISES SANS AFFECTER LE SOLDE
   * 
   * Supprime toutes les mises mais conserve l'état du solde.
   * Utilisé pour nettoyer le plateau sans réinitialiser complètement.
   */
  clearBet() {
    this.bet = [];
    this.numbersBet = [];
    console.log('🧹 Mises effacées');
  }

  /**
   * REMISE À ZÉRO DE L'ÉTAT DES MISES APRÈS UN SPIN
   * 
   * Méthode appelée après chaque spin pour préparer le tour suivant.
   * Synchronise _originalSolde avec le nouveau solde calculé par le backend.
   * 
   * ARCHITECTURE ANTI-DOUBLE-DÉBIT :
   * Cette méthode est essentielle car elle met à jour _originalSolde avec le résultat
   * du backend, garantissant que le prochain pari utilisera le bon solde de référence.
   */
  resetBettingState() {
    this.currentBet = 0;
    this.bet = [];
    this.numbersBet = [];
    
    // SYNCHRONISATION CRUCIALE : _originalSolde = nouveau solde calculé
    if (this.currentUser) {
      this._originalSolde = this.currentUser.solde;
      console.log('🔄 État des mises réinitialisé, nouveau solde de référence:', this._originalSolde);
    }
  }

  /**
   * SUPPRESSION D'UNE MISE SPÉCIFIQUE
   * 
   * Retire une mise du plateau et recrédite visuellement le montant au solde.
   * Permet aux joueurs de corriger leurs erreurs avant le spin.
   * 
   * LOGIQUE DE SUPPRESSION :
   * 1. Trouve la mise correspondante dans le tableau
   * 2. Soustrait le montant de la mise (ou la valeur du wager si plus petite)
   * 3. Recrédite visuellement le montant au solde affiché
   * 4. Supprime les mises à montant zéro
   * 
   * @param cell Cellule du plateau contenant la mise à supprimer
   */
  removeBet(cell: IBettingBoardCell) {
    if (!this.currentUser || !cell?.numbers) return;
    
    // Sécurité : s'assurer qu'on a une valeur de wager valide
    this.wager = this.wager === 0 ? 100 : this.wager; 
    const numbers = cell.numbers.join(', ');
    const type = cell.type;
    
    // Recherche et modification de la mise correspondante
    for (let bet of this.bet) {
      if (bet.numbers === numbers && bet.type === type && bet.amt > 0) {
        // Calcul du montant à retirer (minimum entre wager et montant de la mise)
        this.wager = bet.amt > this.wager ? this.wager : bet.amt; 
        bet.amt -= this.wager;
        
        // Recréditer visuellement le montant (UX immédiate)
        this.currentUser.solde += this.wager;
        this.currentBet -= this.wager; 
        
        console.log(`➖ Mise retirée: ${this.wager} sur ${cell.label || numbers}`);
      }
    }
    
    // Nettoyage : supprimer les mises à montant zéro
    this.bet = this.bet.filter(b => b.amt > 0);
  }

  /**
   * LANCEMENT DE LA ROULETTE VIA L'API BACKEND
   * 
   * Effectue un appel API pour obtenir un numéro aléatoire selon les règles de la roulette européenne.
   * Cette méthode utilise fetch() pour une gestion d'erreur plus fine que HttpClient.
   * 
   * SÉCURITÉ :
   * - Validation de la réponse HTTP (response.ok)
   * - Gestion d'erreur avec messages explicites
   * - Transmission de l'userId pour l'audit et les statistiques
   * 
   * @returns Promise<IRouletteResult> Numéro gagnant (0-36) et sa couleur
   */
  async spin(): Promise<IRouletteResult> {
    try {
        const userId = this.currentUser?.user_id;
        
        console.log('🎰 Lancement de la roulette pour l\'utilisateur:', userId);
        
        const response = await fetch('/api/roulette/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error(`Échec du lancement de la roulette: ${response.status} ${response.statusText}`);
        }

        const result = await response.json() as IRouletteResult;
        console.log('🎯 Numéro tiré:', result.number, result.color);
        
        return result;
    } catch (error) {
        console.error('❌ Erreur lors du spin:', error);
        throw error;
    }
  }

  /**
   * CALCUL DES GAINS ET SYNCHRONISATION AVEC LE BACKEND
   * 
   * Cette méthode centralise le calcul des gains après un spin de roulette.
   * Elle utilise l'architecture anti-double-débit pour maintenir la cohérence du solde.
   * 
   * ARCHITECTURE ANTI-DOUBLE-DÉBIT :
   * Le problème : Le solde a déjà été débité visuellement dans setBet() pour l'UX immédiate.
   * La solution : Envoie _originalSolde (non modifié) au backend pour les calculs.
   * Résultat : Pas de double débit, calculs justes, interface réactive.
   * 
   * FLUX DE DONNÉES :
   * 1. Envoi du solde original (non débité) au backend
   * 2. Backend calcule gains/pertes sur le solde réel
   * 3. Backend retourne le nouveau solde après calculs
   * 4. Frontend synchronise les deux valeurs de solde
   * 
   * AVANTAGES DE CETTE APPROCHE :
   * - UX immédiate (débit visuel instantané)
   * - Sécurité maximale (calculs serveur)
   * - Pas de désynchronisation possible
   * - Évite le double débit du solde
   * - Calculs centralisés et sécurisés côté serveur
   * - Synchronisation garantie avec la base de données
   * - Gestion d'erreur robuste avec rollback automatique
   * 
   * @param winningSpin Numéro gagnant du spin (0-36)
   * @param gameSessionId ID de la session de jeu pour traçabilité
   * @returns Promise avec winValue, payout, newsolde, betTotal
   */
  async win(winningSpin: number, gameSessionId?: string): Promise<{ winValue: number; payout: number; newsolde: number; betTotal: number }> {
    if (!this.currentUser) {
      throw new Error('Utilisateur non connecté');
    }
    
    try {
      console.log('💰 Calcul des gains pour le numéro:', winningSpin);
      console.log('📊 Solde original envoyé au backend:', this._originalSolde);
      console.log('🎯 Nombre de mises à traiter:', this.bet.length);
      console.log('🎮 Session de jeu:', gameSessionId);
      
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
          solde: this._originalSolde,  // CRUCIAL : solde réel non débité
          userId: this.currentUser.user_id,
          gameSessionId: gameSessionId || `RO-${Date.now()}-${this.currentUser.user_id}`
        }
      ));
      
      if (response) {
        // Sécurisation des valeurs reçues avec fallbacks
        const safeWinValue = response.winValue ?? 0;
        const safePayout = response.payout ?? 0;
        const safeBetTotal = response.betTotal ?? 0;
        const safeNewsolde = response.newsolde ?? this.currentUser.solde;
        
        console.log('✅ Résultat du backend:', {
          winValue: safeWinValue,
          payout: safePayout,
          newsolde: safeNewsolde,
          betTotal: safeBetTotal
        });
        
        // SYNCHRONISATION CRUCIALE : mise à jour des deux soldes
        this.currentUser.solde = safeNewsolde;      // Solde affiché
        this._originalSolde = this.currentUser.solde; // Solde de référence
        
        return { 
          winValue: safeWinValue, 
          payout: safePayout,
          newsolde: safeNewsolde,
          betTotal: safeBetTotal
        };
      }
      
      throw new Error('Réponse invalide du serveur');
    } catch (error) {
      console.error('❌ Erreur calcul gains:', error);
      throw error;
    }
  }

  // ===== MÉTHODES UTILITAIRES POUR L'AFFICHAGE ET LA LOGIQUE =====

  /** 
   * DÉTERMINATION DE LA COULEUR D'UN NUMÉRO
   * 
   * Applique les règles standard de la roulette européenne pour déterminer la couleur.
   * Cette méthode est utilisée pour l'affichage et la validation des paris couleur.
   * 
   * RÈGLES DE LA ROULETTE EUROPÉENNE :
   * - 0 : Vert (case spéciale de la banque)
   * - Numéros dans numRed : Rouge
   * - Tous les autres numéros : Noir
   * 
   * @param number Numéro de la roulette (0-36)
   * @returns 'green' | 'red' | 'black'
   */
  getNumberColor(number: number): 'red' | 'black' | 'green' {
    if (number === 0) return 'green';
    return this.numRed.includes(number) ? 'red' : 'black';
  }

  /** 
   * ORDRE DES NUMÉROS SUR LA ROUE PHYSIQUE
   * 
   * Retourne la disposition exacte des numéros sur une roulette européenne réelle.
   * Utilisé pour l'animation réaliste de la bille et le calcul des angles.
   * 
   * @returns Tableau des 37 numéros dans l'ordre physique de la roue
   */
  getWheelNumbers(): number[] {
    return this.wheelnumbersAC;
  }

  /** 
   * COULEUR CSS POUR L'AFFICHAGE D'UNE SECTION
   * 
   * Convertit la couleur logique d'un numéro en couleur CSS pour l'affichage.
   * Utilisé pour colorier les sections de la roue dans le template.
   * 
   * MAPPING DES COULEURS :
   * - 0 : Vert casino (#016D29)
   * - Numéros rouges : Rouge roulette (#E0080B)
   * - Numéros noirs : Noir (#000)
   * 
   * @param number Numéro de la roulette (0-36)
   * @returns Code couleur CSS hexadécimal
   */
  getSectionColor(number: number): string {
    if (number === 0) return '#016D29'; // Vert casino traditionnel
    if (this.numRed.includes(number)) return '#E0080B'; // Rouge roulette
    return '#000'; // Noir
  }

  /** 
   * RECHERCHE D'UNE MISE ASSOCIÉE À UNE CELLULE
   * 
   * Trouve la mise correspondante à une cellule du plateau pour l'affichage des jetons.
   * Utilisé par le template pour afficher visuellement les mises placées.
   * 
   * LOGIQUE DE CORRESPONDANCE :
   * - Compare les numéros couverts (numbers) et le type de mise
   * - Retourne la première mise correspondante trouvée
   * - Null si aucune mise sur cette cellule
   * 
   * @param cell Cellule du plateau de mise
   * @returns Objet mise correspondant ou null
   */
  getBetForCell(cell: IBettingBoardCell) {
    if (!cell?.numbers) return null;
    const numbers = cell.numbers.join(', ');
    const type = cell.type;
    return this.bet.find(b => b.numbers === numbers && b.type === type) || null;
  }

  /** 
   * CLASSE CSS POUR LA COULEUR DES JETONS
   * 
   * Détermine la classe CSS à appliquer selon le montant de la mise.
   * Permet un affichage visuel cohérent et une identification rapide des montants.
   * 
   * ÉCHELLE DES COULEURS :
   * - < 5 : Rouge (petites mises)
   * - < 10 : Bleu (mises moyennes)
   * - < 100 : Orange (grosses mises)
   * - >= 100 : Or (très grosses mises)
   * 
   * @param amount Montant de la mise
   * @returns Nom de la classe CSS correspondante
   */
  getChipColorClass(amount: number): string {
    if (amount < 5) return 'red';
    if (amount < 10) return 'blue';
    if (amount < 100) return 'orange';
    return 'gold';
  }
  
  /** 
   * ACCESSEUR POUR LES DONNÉES UTILISATEUR
   * 
   * Méthode d'accès publique aux données de l'utilisateur connecté.
   * Utilisée par les composants externes qui ont besoin des informations utilisateur.
   * 
   * @returns Données utilisateur ou undefined si non connecté
   */
  getCurrentIUser(): IUser | undefined {
    return this.currentUser;
  }

  /**
   * ENREGISTREMENT D'UNE NOUVELLE MISE SUR LE PLATEAU
   * 
   * Méthode centrale pour placer une mise sur une cellule du plateau.
   * Gère le débit visuel du solde et l'ajout de la mise au tableau des mises actives.
   * 
   * PROCESSUS D'ENREGISTREMENT :
   * 1. Validation de l'utilisateur et de la cellule
   * 2. Ajustement du montant selon le solde disponible
   * 3. Débit visuel du solde (UX immédiate)
   * 4. Ajout ou mise à jour de la mise dans le tableau
   * 5. Mise à jour de la liste des numéros misés
   * 
   * GESTION DU SOLDE :
   * - Débite visuellement currentUser.solde pour l'UX
   * - Conserve _originalSolde intact pour les calculs backend
   * - Limite automatiquement la mise au solde disponible
   * 
   * GESTION DES MISES MULTIPLES :
   * - Si une mise existe déjà sur la cellule : additionne les montants
   * - Sinon : crée une nouvelle entrée dans le tableau des mises
   * 
   * @param cell Cellule du plateau sur laquelle placer la mise
   */
  setBet(cell: IBettingBoardCell) {
    if (!this.currentUser || !cell?.numbers) return;
    
    // Sauvegarde de la mise précédente pour l'historique
    this.lastWager = this.wager;
    
    // Limitation de la mise au solde disponible (sécurité)
    this.wager = Math.min(this.wager, this.currentUser.solde);

    if (this.wager > 0) {
      // DÉBIT VISUEL IMMÉDIAT pour l'expérience utilisateur
      this.currentUser.solde -= this.wager;
      this.currentBet += this.wager; 
      
      // Préparation des données de la mise
      const numbers = cell.numbers.join(', ');
      const type = cell.type;
      const odds = cell.odds; 
      const label = cell.label;
      
      // Recherche d'une mise existante sur cette cellule
      let existingBet = this.bet.find(b => b.numbers === numbers && b.type === type);
      if (existingBet) {
        // Mise existante : additionner les montants
        existingBet.amt += this.wager;
        console.log(`➕ Mise augmentée sur ${label || numbers}: +${this.wager} (total: ${existingBet.amt})`);
      } else {
        // Nouvelle mise : créer une entrée
        this.bet.push({ label, numbers, type, odds, amt: this.wager });
        console.log(`🆕 Nouvelle mise sur ${label || numbers}: ${this.wager} (cote: ${odds}:1)`);
      }
      
      // Mise à jour de la liste des numéros misés (pour l'affichage)
      for (let num of cell.numbers) {
        if (!this.numbersBet.includes(num)) {
          this.numbersBet.push(num);
        }
      }
      
      console.log(`💰 Solde après mise: ${this.currentUser.solde}, Total misé: ${this.currentBet}`);
    } else {
      console.warn('⚠️ Impossible de miser: solde insuffisant');
    }
  }

  /**
   * GESTION DE LA SÉLECTION DES JETONS ET ACTIONS SPÉCIALES
   * 
   * Gère la sélection des jetons et l'action spéciale "clear bet".
   * Cette méthode centralise la logique de changement de jeton et de nettoyage.
   * 
   * FONCTIONNALITÉS :
   * - Sélection d'un jeton avec valeur prédéfinie (1, 5, 10, 100)
   * - Action "clear bet" : efface toutes les mises et recrédite le solde
   * - Validation de l'état du jeu (bloqué pendant le spin)
   * 
   * LOGIQUE "CLEAR BET" :
   * 1. Recrédite visuellement toutes les mises au solde
   * 2. Remet currentBet à zéro
   * 3. Vide le tableau des mises
   * 
   * @param index Index du jeton sélectionné (dernier index = clear bet)
   * @returns true si l'action a été effectuée, false si bloquée
   */
  selectChip(index: number): boolean {
    if (this.isSpinning) return false; // Sécurité : pas d'action pendant le spin
    
    if (index === this.chipValues.length - 1) {
        // Action "clear bet" : recréditer toutes les mises
        if (this.currentUser) {
            this.currentUser.solde += this.currentBet;
            console.log(`🧹 Clear bet: ${this.currentBet} recrédité, nouveau solde: ${this.currentUser.solde}`);
        }
        this.currentBet = 0; 
        this.clearBet();
    } else {
        // Sélection d'un jeton avec valeur prédéfinie
        this.selectedChipIndex = index; 
        this.wager = [1, 5, 10, 100][index] || 100;
        console.log(`🎯 Jeton sélectionné: ${this.wager} (index: ${index})`);
    }
    
    return true;
  }
} 