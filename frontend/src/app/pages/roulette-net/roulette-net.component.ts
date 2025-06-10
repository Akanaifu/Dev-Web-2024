import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IRouletteWheelSection } from '../../interfaces/roulette-wheel.interface';
import { IBettingBoardCell } from '../../interfaces/betting-board.interface';
import { RouletteNetLogic } from './roulette-net-logic';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments.prod';

/**
 * COMPOSANT PRINCIPAL DE LA ROULETTE EN LIGNE
 * 
 * RESPONSABILITÉS :
 * - Interface utilisateur pour le jeu de roulette européenne
 * - Gestion de l'affichage de la roue et du plateau de mise
 * - Coordination des animations (rotation de la bille)
 * - Délégation de la logique métier au service RouletteNetLogic
 * 
 * ARCHITECTURE GETTERS/SETTERS :
 * - Les getters délèguent l'accès aux données du service depuis le template
 * - Avantages : Séparation des responsabilités, centralisation de la logique, template plus simple
 * - Le pattern permet de garder la logique métier dans le service tout en rendant les données accessibles au template
 * 
 * PATTERN DE DÉLÉGATION :
 * - Le composant ne contient que la logique d'affichage et d'animation
 * - Toute la logique métier (calculs, API calls) est déléguée au service RouletteNetLogic
 * - Cette séparation facilite les tests unitaires et la maintenance
 */
@Component({
    selector: 'app-roulette-net',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './roulette-net.component.html',
    styleUrls: ['./roulette-net.component.css'],
})
export class RouletteNetComponent implements OnInit {
    
    // ===== DONNÉES D'AFFICHAGE POUR L'INTERFACE UTILISATEUR =====
    // Ces tableaux structurent l'interface utilisateur selon les règles de la roulette européenne
    
    /** Sections visuelles de la roue avec angles et couleurs pour l'affichage */
    wheelSections: IRouletteWheelSection[] = [];
    
    /** Mises externes (1-18, 19-36, rouge, noir, etc.) */
    outsideBets: IBettingBoardCell[] = [];
    
    /** Grille des numéros organisée en lignes pour l'affichage du plateau */
    numberBoardRows: IBettingBoardCell[][] = [];
    
    /** Cellule spéciale pour le zéro (case verte) */
    zeroCell!: IBettingBoardCell;
    
    /** Mises sur les colonnes (2 à 1) */
    columnBets: IBettingBoardCell[] = [];
    
    /** Mises sur les douzaines (1-12, 13-24, 25-36) */
    dozenBets: IBettingBoardCell[] = [];
    
    /** Mises pair/impair et rouge/noir */
    evenOddRedBlack: IBettingBoardCell[] = [];
    
    /** Mises à cheval (entre deux numéros adjacents) */
    splitBets: IBettingBoardCell[] = [];
    
    /** Mises en carré (quatre numéros) */
    cornerBets: IBettingBoardCell[] = [];
    
    /** Mises transversales (trois numéros en ligne) */
    streetBets: IBettingBoardCell[] = [];
    
    /** Mises sixains (six numéros sur deux lignes) */
    doubleStreetBets: IBettingBoardCell[] = [];
    
    // ===== VARIABLES D'ANIMATION ET D'ÉTAT =====
    
    /** 
     * Angle de rotation de la bille sur la roue (en degrés)
     * Utilisé pour l'animation CSS de la bille pendant le spin
     * Valeur initiale : 0, modifiée pendant l'animation pour créer l'effet de rotation
     */
    ballRotation: number = 0;
    
    /** 
     * Message de résultat affiché après un spin
     * Contient le numéro gagnant, la couleur, et les gains/pertes
     * Utilise white-space: pre-line pour supporter les sauts de ligne avec \n
     */
    resultMessage: string | null = null;

    // ===== LABELS D'AFFICHAGE POUR L'INTERFACE =====
    // Ces constantes définissent le texte affiché sur les zones de mise externes
    
    /** Labels pour les colonnes (affichage "2 à 1") */
    columnLabels = ['2 à 1', '2 à 1', '2 à 1'];
    
    /** Labels pour les douzaines */
    dozenLabels = ['1 à 12', '13 à 24', '25 à 36'];
    
    /** Labels pour les mises pair/impair et couleurs */
    evenOddLabels = ['EVEN', 'RED', 'BLACK', 'ODD'];
    
    /** Labels pour les mises hautes/basses */
    topLabels = ['1 à 18', '19 à 36'];

    /** URL de base pour les appels API backend */
    private BASE_URL = environment.production ? '/api' : 'http://localhost:3000';

    /**
     * CONSTRUCTEUR
     * 
     * @param game Service de logique métier (injection publique pour accès template)
     * @param http Client HTTP pour les appels API
     */
    constructor(
        public game: RouletteNetLogic,
        private http: HttpClient
    ) { }

    /**
     * INITIALISATION DU COMPOSANT
     * 
     * Méthode du cycle de vie Angular appelée après la création du composant.
     * Prépare tous les éléments visuels nécessaires à l'affichage du jeu.
     * 
     * ORDRE D'EXÉCUTION :
     * 1. Préparation des sections visuelles de la roue
     * 2. Chargement de la configuration du plateau depuis l'API
     */
    ngOnInit(): void {
        this.prepareWheelSections();
        this.loadBettingBoard();
    }

    /**
     * PRÉPARATION DES SECTIONS VISUELLES DE LA ROUE
     * 
     * Génère les données d'affichage pour chaque section de la roue :
     * - Calcul des angles de rotation (360° / 37 sections = 9.73° par section)
     * - Attribution des couleurs selon les règles de la roulette européenne
     * - Création des objets IRouletteWheelSection pour le template
     * 
     * LOGIQUE DES COULEURS :
     * - 0 : Vert (#016D29)
     * - Numéros rouges : Rouge (#E0080B)
     * - Autres numéros : Noir (#000)
     */
    prepareWheelSections() {
        const numbers = this.game.getWheelNumbers();
        this.wheelSections = numbers.map((num, i) => {
            let color: 'red' | 'black' | 'green' = 'black';
            let backgroundColor = this.game.getSectionColor(num);
            return {
                number: num,
                color,
                angle: i * 9.73, // 360° / 37 sections
                backgroundColor
            };
        });
    }
    
    /**
     * CHARGEMENT DE LA CONFIGURATION DU PLATEAU DE MISE
     * 
     * Récupère depuis l'API backend toutes les zones de mise disponibles :
     * - Mises externes (rouge/noir, pair/impair, etc.)
     * - Grille des numéros organisée en lignes
     * - Mises spéciales (colonnes, douzaines, etc.)
     * - Cotes associées à chaque type de mise
     * 
     * GESTION D'ERREUR :
     * - En cas d'échec API, un fallback local pourrait être implémenté
     * - Les erreurs sont loggées pour le débogage
     */
    loadBettingBoard() {
        this.http.get<any>(`${this.BASE_URL}/api/roulette-odds/betting-board`).subscribe({
            next: (data) => {
                // Attribution des données reçues aux propriétés du composant
                this.outsideBets = data.outsideBets;
                this.numberBoardRows = data.numberBoardRows;
                this.zeroCell = data.zeroCell;
                this.columnBets = data.columnBets;
                this.dozenBets = data.dozenBets;
                this.evenOddRedBlack = data.evenOddRedBlack;
                this.splitBets = data.splitBets;
                this.cornerBets = data.cornerBets;
                this.streetBets = data.streetBets;
                this.doubleStreetBets = data.doubleStreetBets;
            },
            error: (error) => {
                console.error('❌ Erreur lors du chargement du tableau de mise:', error);
            }
        });
    }
    

    /**
     * SUPPRESSION D'UNE MISE VIA CLIC DROIT
     * 
     * Gère la suppression d'une mise spécifique via le menu contextuel.
     * Cette action recrédite visuellement le montant au solde de l'utilisateur.
     * 
     * @param event Événement de clic droit (pour empêcher le menu contextuel)
     * @param cell Cellule du plateau contenant la mise à supprimer
     * 
     * SÉCURITÉ :
     * - Bloquée pendant la rotation (isSpinning = true)
     * - Empêche le menu contextuel natif du navigateur
     */
    removeBet(event: Event, cell: IBettingBoardCell) {
        event.preventDefault(); // Empêche l'affichage du menu contextuel
        if (this.isSpinning) return; // Sécurité : pas de modification pendant le spin
        this.game.removeBet(cell);
    }

    /**
     * REMISE À ZÉRO COMPLÈTE DU JEU
     * 
     * Remet à zéro toutes les variables de jeu pour recommencer une partie :
     * - Efface toutes les mises
     * - Remet le solde à sa valeur originale
     * - Vide l'historique des numéros
     * 
     * SÉCURITÉ :
     * - Action bloquée pendant la rotation pour éviter les conflits d'état
     */
    resetGame() {
        if (this.isSpinning) return; // Sécurité : pas de reset pendant le spin
        this.game.resetGame();
    }
    
    /**
     * LANCEMENT DE LA ROULETTE AVEC ANIMATION COMPLÈTE
     * 
     * Méthode principale qui coordonne :
     * 1. L'appel API pour obtenir le numéro gagnant
     * 2. L'animation visuelle de la bille (5 secondes)
     * 3. Le calcul des gains/pertes
     * 4. L'affichage des résultats
     * 5. La mise à jour de l'historique
     * 
     * ANIMATION DE LA BILLE :
     * - Durée : 5000ms (5 secondes)
     * - Rotations : 5 tours complets + position finale
     * - Utilise requestAnimationFrame pour une animation fluide
     * - Calcul de l'angle final basé sur la position du numéro gagnant
     * 
     * GESTION D'ÉTAT :
     * - isSpinning = true pendant toute la durée
     * - Bloque toutes les interactions utilisateur
     * - Reset automatique à la fin
     */
    async spin() {
        // Sécurité : empêcher les spins multiples simultanés
        if (this.isSpinning) return;
        this.isSpinning = true;

        try {
            // 1. APPEL API POUR OBTENIR LE NUMÉRO GAGNANT
            const result = await this.game.spin();
            
            // 2. CONFIGURATION DE L'ANIMATION DE LA BILLE
            this.ballRotation = 0; // Position initiale
            const numbers = this.game.getWheelNumbers();
            const index = numbers.indexOf(result.number);
            
            // Calcul de l'angle final de la bille
            const baseAngle = 360 - index * 9.73; // Position du numéro sur la roue
            const extraTurns = 5 * 360; // 5 tours complets pour l'effet visuel
            const targetBall = -baseAngle - extraTurns * 1.2; // Position finale avec effet
            
            // Paramètres d'animation
            const duration = 5000; // 5 secondes
            const initialBall = this.ballRotation;
            const start = performance.now();
            
            /**
             * FONCTION D'ANIMATION RÉCURSIVE
             * 
             * Gère le mouvement fluide de la bille avec :
             * - Interpolation linéaire entre position initiale et finale
             * - Utilisation de requestAnimationFrame pour 60fps
             * - Calcul des gains à la fin de l'animation
             * 
             * @param now Timestamp actuel pour calculer le progrès
             */
            const animate = async (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1); // Progrès de 0 à 1
                
                // Interpolation linéaire de la position de la bille
                this.ballRotation = initialBall + (targetBall - initialBall) * progress;
                
                if (progress < 1) {
                    // Animation en cours : continuer
                    requestAnimationFrame(animate);
                } else {
                    // 3. ANIMATION TERMINÉE : TRAITEMENT DES RÉSULTATS
                    
                    // Affichage du numéro gagnant avec saut de ligne
                    this.resultMessage = `Le numéro gagnant est ${result.number} ${result.color} !\n`;
                    
                    // Mise à jour de l'historique des numéros (max 10)
                    this.game.previousNumbers.unshift(result.number);
                    if (this.game.previousNumbers.length > 10) {
                        this.game.previousNumbers.pop();
                    }
                    
                    try {
                        // 4. CALCUL DES GAINS/PERTES VIA L'API
                        // Cette approche garantit que le solde est mis à jour avant de permettre un nouveau spin
                        const winResult = await this.game.win(result.number);
                        
                        // 5. AFFICHAGE DES RÉSULTATS SELON LE TYPE DE RÉSULTAT
                        if (winResult.payout > 0) {
                            // Cas de gain
                            this.resultMessage += `Vous avez gagné ${winResult.payout} !`;
                        } 
                        else if (winResult.payout == 0) {
                            // Cas d'égalité (rare en roulette, mais possible avec certaines règles)
                            this.resultMessage += `Vous avez ni gagné ni perdu !\n Votre solde retourne à ${(winResult.newsolde)} !`;
                        }
                        else {
                            // Cas de perte
                            this.resultMessage += `Vous avez perdu ${Math.abs(winResult.payout)}`;
                        }
                        
                        console.log('🎰 Résultat du spin:', winResult);
                        
                        // 6. NETTOYAGE DE L'ÉTAT DU JEU
                        this.game.currentBet = 0;  // Réinitialiser le compteur de mises
                        this.game.bet = [];        // Vider le tableau des mises
                        this.game.numbersBet = []; // Vider les numéros misés
                        
                        // 7. SYNCHRONISATION DU SOLDE POUR LE PROCHAIN PARI
                        // Garantit que le prochain pari utilisera le bon solde de référence
                        this.game.resetBettingState();
                        
                    } catch (winError) {
                        console.error('❌ Erreur lors du calcul des gains:', winError);
                        this.resultMessage += ' - Erreur lors du calcul des gains';
                    }
                    
                    // 8. RÉACTIVATION DES INTERACTIONS UTILISATEUR
                    this.isSpinning = false;
                }
            };
            
            // Démarrage de l'animation
            requestAnimationFrame(animate);
            
        } catch (error) {
            console.error('❌ Erreur pendant le spin:', error);
            this.resultMessage = 'Une erreur est survenue';
            this.isSpinning = false; // S'assurer de réactiver en cas d'erreur
        }
    }

    // ===== MÉTHODES D'AFFICHAGE QUI DÉLÈGUENT AU SERVICE =====
    // Ces méthodes maintiennent la cohérence de l'architecture en centralisant la logique dans le service
    // Le pattern de délégation permet une maintenance plus facile et une meilleure testabilité

    /**
     * SÉLECTION D'UN JETON
     * 
     * Délègue la sélection de jeton au service de logique métier.
     * Cette méthode maintient la séparation des responsabilités entre affichage et logique.
     * 
     * @param index Index du jeton sélectionné dans le tableau chipValues
     */
    selectChip(index: number) {
        this.game.selectChip(index);
    }

    /**
     * RÉCUPÉRATION D'UNE MISE POUR UNE CELLULE
     * 
     * Trouve la mise associée à une cellule du plateau pour l'affichage.
     * Utilisé par le template pour afficher les jetons sur le plateau.
     * 
     * @param cell Cellule du plateau de mise
     * @returns Objet mise ou null si aucune mise sur cette cellule
     */
    getBetForCell(cell: IBettingBoardCell) {
        return this.game.getBetForCell(cell);
    }

    /**
     * CLASSE CSS POUR LA COULEUR DES JETONS
     * 
     * Détermine la classe CSS à appliquer selon le montant de la mise.
     * Permet un affichage visuel cohérent des jetons sur le plateau.
     * 
     * @param amount Montant de la mise
     * @returns Nom de la classe CSS (red, blue, orange, gold)
     */
    getChipColorClass(amount: number): string {
        return this.game.getChipColorClass(amount);
    }

    // ===== GETTERS DE DÉLÉGATION VERS LE SERVICE =====
    // Ces getters créent un pont entre le template et le service de logique métier
    // Avantage : Le template reste simple tout en accédant aux données centralisées du service
    
    /** Valeurs des jetons disponibles (1, 5, 10, 100, 'clear') */
    get chipValues() { return this.game.chipValues; }
    
    /** Couleurs CSS des jetons (red, blue, orange, gold, clearBet) */
    get chipColors() { return this.game.chipColors; }
    
    /** Index du jeton actuellement sélectionné */
    get selectedChipIndex() { return this.game.selectedChipIndex; }
    
    /** Montant total des mises en cours */
    get currentBet() { return this.game.currentBet; }
    
    /** Valeur de la mise sélectionnée */
    get wager() { return this.game.wager; }
    
    /** Tableau des mises actives avec détails */
    get bet() { return this.game.bet; }
    
    /** Numéros sur lesquels des mises sont placées */
    get numbersBet() { return this.game.numbersBet; }
    
    /** Historique des 10 derniers numéros sortis */
    get previousNumbers() { return this.game.previousNumbers; }
    
    /** Numéros rouges selon les règles de la roulette européenne */
    get numRed() { return this.game.numRed; }
    
    /**
     * GETTER POUR L'UTILISATEUR CONNECTÉ
     * 
     * Remplace l'accès direct game.currentUser dans le template.
     * Centralise l'accès aux données utilisateur.
     */
    get currentUser() { return this.game.currentUser; }
    
    /**
     * GETTER POUR LE SOLDE UTILISATEUR
     * 
     * Centralise la logique d'affichage du solde avec protection contre les valeurs nulles.
     * Affiche 0 si l'utilisateur n'est pas connecté ou si le solde est indéfini.
     */
    get userBalance(): number {
        return this.currentUser?.solde || 0;
    }
    
    /**
     * GETTER POUR VÉRIFIER LA CONNEXION UTILISATEUR
     * 
     * Simplifie les vérifications dans le template.
     * Utilisé pour l'affichage conditionnel d'éléments nécessitant une connexion.
     */
    get isUserLoggedIn(): boolean {
        return !!this.currentUser;
    }

    /**
     * GETTER/SETTER POUR L'ÉTAT DE ROTATION
     * 
     * Synchronise l'état de rotation entre composant et service.
     * Le getter permet au template d'accéder à isSpinning.
     * Le setter garantit que les modifications d'état sont propagées au service.
     */
    get isSpinning() { return this.game.isSpinning; }
    set isSpinning(value: boolean) { this.game.isSpinning = value; }
    
    /**
     * ENREGISTREMENT D'UNE NOUVELLE MISE
     * 
     * Délègue l'enregistrement d'une mise au service de logique métier.
     * Cette action débite visuellement le solde et ajoute la mise au plateau.
     * 
     * SÉCURITÉ :
     * - Bloquée pendant la rotation pour maintenir l'intégrité du jeu
     * - Validation des montants dans le service
     * 
     * @param cell Cellule du plateau sur laquelle placer la mise
     */
    setBet(cell: IBettingBoardCell) {
        if (this.isSpinning) return; // Sécurité : pas de mise pendant le spin
        this.game.setBet(cell);
    }
}

