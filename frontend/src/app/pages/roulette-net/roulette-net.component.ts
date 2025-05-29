import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IRouletteWheelSection } from '../../interfaces/roulette-wheel.interface';
import { IBettingBoardCell } from '../../interfaces/betting-board.interface';
import { RouletteNetLogic } from './roulette-net-logic';
import { HttpClient } from '@angular/common/http';

/**
 * Composant principal de l'interface utilisateur pour le jeu de roulette en ligne.
 * Gère l'affichage de la roue, du plateau de mise et les interactions utilisateur.
 * 
 * ARCHITECTURE GETTERS/SETTERS :
 * - Les getters délèguent l'accès aux données du service depuis le template
 * - Avantages : Séparation des responsabilités, centralisation de la logique, template plus simple
 * - Le pattern permet de garder la logique métier dans le service tout en rendant les données accessibles au template
 */
@Component({
    selector: 'app-roulette-net',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './roulette-net.component.html',
    styleUrls: ['./roulette-net.component.css'],
})
export class RouletteNetComponent implements OnInit {
    // Données d'affichage pour la roue de roulette et le plateau de mise
    // Ces tableaux structurent l'interface utilisateur selon les règles de la roulette européenne
    wheelSections: IRouletteWheelSection[] = [];
    outsideBets: IBettingBoardCell[] = [];
    numberBoardRows: IBettingBoardCell[][] = [];
    zeroCell!: IBettingBoardCell;
    columnBets: IBettingBoardCell[] = [];
    dozenBets: IBettingBoardCell[] = [];
    evenOddRedBlack: IBettingBoardCell[] = [];
    splitBets: IBettingBoardCell[] = [];
    cornerBets: IBettingBoardCell[] = [];
    streetBets: IBettingBoardCell[] = [];
    doubleStreetBets: IBettingBoardCell[] = [];
    
    // Variable de contrôle de l'animation de la bille sur la roue
    // L'angle de rotation permet de simuler le mouvement de la bille pendant le spin
    ballRotation : number = 0;
    
    resultMessage: string | null = null;

    // Labels d'affichage pour les différents types de mises sur le plateau
    // Ces constantes définissent le texte affiché sur les zones de mise externes
    columnLabels = ['2 à 1', '2 à 1', '2 à 1'];
    dozenLabels = ['1 à 12', '13 à 24', '25 à 36'];
    evenOddLabels = ['EVEN', 'RED', 'BLACK', 'ODD'];
    topLabels = ['1 à 18', '19 à 36'];

    private BASE_URL = 'http://localhost:3000';

    constructor(
        public game: RouletteNetLogic,
        private http: HttpClient
    ) { }

    /**
     * Initialise le composant en préparant la roue et chargeant la configuration du plateau.
     * Cette méthode setup s'assure que tous les éléments visuels sont prêts à l'affichage.
     */
    ngOnInit(): void {
        this.prepareWheelSections();
        this.loadBettingBoard();
    }

    /**
     * Prépare les sections visuelles de la roue avec angles et couleurs.
     * Chaque section correspond à un numéro avec sa position angulaire précise sur la roue.
     */
    prepareWheelSections() {
        const numbers = this.game.getWheelNumbers();
        this.wheelSections = numbers.map((num, i) => {
            let color: 'red' | 'black' | 'green' = 'black';
            let backgroundColor = this.game.getSectionColor(num);
            return {
                number: num,
                color,
                angle: i * 9.73,
                backgroundColor
            };
        });
    }
    
    /**
     * Charge la configuration du plateau de mise depuis l'API backend.
     * Cette méthode récupère toutes les zones de mise disponibles avec leurs cotes respectives.
     */
    loadBettingBoard() {
        this.http.get<any>(`${this.BASE_URL}/api/roulette-odds/betting-board`).subscribe({
            next: (data) => {
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
                console.error('Erreur lors du chargement du tableau de mise:', error);
                // Fallback à la méthode locale en cas d'échec
            }
        });
    }
    

    /**
     * Gère la suppression d'une mise via clic droit sur une cellule.
     * Cette méthode empêche le menu contextuel et délègue la suppression au service.
     */
    removeBet(event: Event, cell: IBettingBoardCell) {
        event.preventDefault();
        if (this.isSpinning) return; // Prevent bet removal when spinning
        this.game.removeBet(cell);
    }

    /**
     * Remet à zéro toutes les variables de jeu pour recommencer une partie.
     * Cette action est bloquée pendant la rotation pour éviter les conflits.
     */
    resetGame() {
        if (this.isSpinning) return; // Prevent reset when spinning
        this.game.resetGame();
    }
    
    /**
     * Lance la roulette avec animation de la bille et calcul des gains.
     * Cette méthode coordonne l'animation visuelle et les appels API pour un jeu complet.
     */
    async spin() {
        if (this.isSpinning) return;
        this.isSpinning = true;

        try {
            const result = await this.game.spin();
            // Animation de la bille
            this.ballRotation = 0;
            const numbers = this.game.getWheelNumbers();
            const index = numbers.indexOf(result.number);
            const baseAngle = 360 - index * 9.73;
            const extraTurns = 5 * 360;
            const targetBall = -baseAngle - extraTurns * 1.2;
            const duration = 5000;
            const initialBall = this.ballRotation;
            const start = performance.now();
            
            // Fonction d'animation récursive qui gère le mouvement fluide de la bille
            // L'animation se termine par le calcul et l'affichage des gains/pertes
            const animate = async (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                this.ballRotation = initialBall + (targetBall - initialBall) * progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Animation terminée
                    this.resultMessage = `Le numéro gagnant est ${result.number} ${result.color}`;
                    
                    // Mettre à jour les résultats précédents
                    this.game.previousNumbers.unshift(result.number);
                    if (this.game.previousNumbers.length > 10) {
                        this.game.previousNumbers.pop();
                    }
                    
                    try {
                        // Calcul des gains avec attente du résultat pour synchronisation complète
                        // Cette approche garantit que le solde est mis à jour avant de permettre un nouveau spin
                        const winResult = await this.game.win(result.number);
                        
                        // Affichage des gains/pertes avec messages contextuels pour l'utilisateur
                        // Le formatage du message dépend du résultat : gain, perte ou égalité
                        if (winResult.payout > 0) {
                            this.resultMessage += ` - Vous avez gagné ${winResult.payout}!`;
                        } 
                        else if (winResult.payout == 0) {
                            this.resultMessage += ` - Vous avez ni gagné ni perdu ${(winResult.payout)}`;
                        }
                        else {
                            this.resultMessage += ` - Vous avez perdu ${Math.abs(winResult.payout)}`;
                        }
                        
                        console.log('Win result:', winResult);
                        this.game.currentBet = 0;  // Utilisation du setter avec validation
                        this.game.bet = [];
                        this.game.numbersBet = [];
                        
                    } catch (winError) {
                        console.error('Error calculating wins:', winError);
                        this.resultMessage += ' - Erreur lors du calcul des gains';
                    }
                    
                    // Reset spinning state à allow new bets
                    this.isSpinning = false;
                }
            };
            
            requestAnimationFrame(animate);
        } catch (error) {
            console.error('Error during spin:', error);
            this.resultMessage = 'Une erreur est survenue';
            this.isSpinning = false; // Make sure à reset on error too
        }
    }

    // ===== MÉTHODES D'AFFICHAGE QUI DÉLÈGUENT AU SERVICE =====
    // Ces méthodes maintiennent la cohérence de l'architecture en centralisant la logique dans le service
    // Le pattern de délégation permet une maintenance plus facile et une meilleure testabilité

    /**
     * Délègue la sélection de jeton au service de logique métier.
     * Cette méthode maintient la séparation des responsabilités entre affichage et logique.
     */
    selectChip(index: number) {
        this.game.selectChip(index);
    }

    // Méthodes d'affichage qui délèguent au service pour maintenir la cohérence
    // Ces accesseurs centralisent l'accès aux données du service depuis le template
    getBetForCell(cell: IBettingBoardCell) {
        return this.game.getBetForCell(cell);
    }

    getChipColorClass(amount: number): string {
        return this.game.getChipColorClass(amount);
    }

      // Propriétés déléguées au service de logique métier pour les jetons
    // Ces getters délèguent au service pour centraliser la gestion des jetons et maintenir la cohérence
    // Avantage : Le template peut accéder directement aux données sans connaître l'implémentation du service
    // Exemple d'usage dans le template : {{ chipValues[0] }} au lieu de {{ game.chipValues[0] }}
    get chipValues() { return this.game.chipValues; }
    get chipColors() { return this.game.chipColors; }
    get selectedChipIndex() { return this.game.selectedChipIndex; }

    
    // ===== GETTERS DE DÉLÉGATION VERS LE SERVICE =====
    // Ces getters créent un pont entre le template et le service de logique métier
    // Avantage : Le template reste simple tout en accédant aux données centralisées du service
    // NOUVELLES AMÉLIORATIONS : Getters plus cohérents et complets
    
    get currentBet() { return this.game.currentBet; }
    get wager() { return this.game.wager; }
    get bet() { return this.game.bet; }
    get numbersBet() { return this.game.numbersBet; }
    get previousNumbers() { return this.game.previousNumbers; }
    get numRed() { return this.game.numRed; }
    
    // NOUVEAUX GETTERS pour une architecture plus cohérente
    
    /**
     * Getter pour l'utilisateur connecté via délégation au service.
     * Remplace l'accès direct game.currentUser dans le template.
     */
    get currentUser() { return this.game.currentUser; }
    
    /**
     * Getter pour le solde utilisateur avec protection contre les valeurs nulles.
     * Centralise la logique d'affichage du solde depuis le template.
     */
    get userBalance(): number {
        return this.currentUser?.solde || 0;
    }
    
    /**
     * Getter pour vérifier si l'utilisateur est connecté.
     * Simplifie les vérifications dans le template.
     */
    get isUserLoggedIn(): boolean {
        return !!this.currentUser;
    }

    // Getter/Setter pour synchroniser l'état de rotation entre composant et service
    // Cette approche permet au template d'accéder à isSpinning tout en gardant la logique dans le service
    // Le setter garantit que les modifications d'état sont propagées au service de logique métier
    get isSpinning() { return this.game.isSpinning; }
    set isSpinning(value: boolean) { this.game.isSpinning = value; }
    
    /**
     * Enregistre une nouvelle mise sur une cellule du plateau de jeu.
     * Cette action est bloquée pendant la rotation pour maintenir l'intégrité du jeu.
     */
    setBet(cell: IBettingBoardCell) {
        if (this.isSpinning) return; // Prevent betting when spinning
        this.game.setBet(cell);
    }
}

