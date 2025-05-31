import { Component, OnInit } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameSessionService, GameSession, CreateSessionRequest } from '../../services/game-session.service';

interface GameConfig {
  name: string;
  prefix: string;
  icon: string;
  theme: string;
  createMethod: 'createSalonSession' | 'createRouletteSession' | 'createGameSession';
  gameRoute: string;
}

@Component({
  selector: 'app-salon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salon.component.html',
  styleUrl: './salon.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalonComponent implements OnInit {
  availableSessions: GameSession[] = [];
  showSessionList = false;
  isCreatingSession = false;
  gameType: string = 'general';
  gameConfig: GameConfig;

  // Configuration pour chaque type de jeu
  gameConfigs: { [key: string]: GameConfig } = {
    'general': {
      name: 'Salon Général',
      prefix: 'SA',
      icon: '🎮',
      theme: 'general',
      createMethod: 'createSalonSession',
      gameRoute: '/salon'
    },
    'roulette': {
      name: 'Roulette',
      prefix: 'RO',
      icon: '🎰',
      theme: 'roulette',
      createMethod: 'createRouletteSession',
      gameRoute: '/roulette-game'
    },
    'machine': {
      name: 'Machine à Sous',
      prefix: 'MA',
      icon: '🎰',
      theme: 'machine',
      createMethod: 'createGameSession',
      gameRoute: '/machine'
    }
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameSessionService: GameSessionService
  ) {
    this.gameConfig = this.gameConfigs['general']; // Valeur par défaut
  }

  ngOnInit(): void {
    console.log('🚀 SALON - ngOnInit démarré');
    
    // Récupérer le type de jeu depuis la route
    this.route.paramMap.subscribe(params => {
      console.log('🛣️ SALON - Route params détectés:', params.keys.map(key => `${key}: ${params.get(key)}`));
      
      this.gameType = params.get('gameType') || 'general';
      console.log('🎮 SALON - gameType défini:', this.gameType);
      
      this.gameConfig = this.gameConfigs[this.gameType] || this.gameConfigs['general'];
      console.log('⚙️ SALON - gameConfig sélectionnée:', this.gameConfig);
      
      this.loadAvailableSessions();
    });
  }

  createGame(): void {
    this.isCreatingSession = true;
    
    console.log('🐛 DEBUG - Création de session:');
    console.log('gameType:', this.gameType);
    console.log('gameConfig:', this.gameConfig);
    console.log('createMethod:', this.gameConfig.createMethod);
    console.log('prefix:', this.gameConfig.prefix);
    
    const sessionData = {
      name: this.gameConfig.name,
      bet_min: this.gameType === 'roulette' ? 0 : (this.gameType === 'general' ? 0 : 10),
      bet_max: this.gameType === 'roulette' ? 0 : (this.gameType === 'general' ? 0 : 1000)
    };

    console.log('sessionData:', sessionData);

    // Logique simplifiée et explicite
    let createCall;
    
    if (this.gameType === 'roulette') {
      console.log('🎰 Création session roulette avec gameType R0');
      createCall = this.gameSessionService.createRouletteSession(sessionData);
    } else if (this.gameType === 'general') {
      console.log('🎮 Création session salon avec gameType SA');
      createCall = this.gameSessionService.createSalonSession(sessionData);
    } else {
      console.log(`🎰 Création session ${this.gameType} avec gameType ${this.gameConfig.prefix}`);
      createCall = this.gameSessionService.createGameSession({
        ...sessionData,
        gameType: this.gameConfig.prefix
      });
    }

    createCall.subscribe({
      next: (response) => {
        console.log(`✅ Session ${this.gameType} créée avec succès:`, response);
        console.log('🆔 ID généré:', response.session.game_session_id);
        this.isCreatingSession = false;
        alert(`Session créée avec succès! ID: ${response.session.game_session_id}`);
        this.loadAvailableSessions();
        
        // Redirection automatique vers le jeu si c'est une roulette
        if (this.gameType === 'roulette') {
          console.log('🎰 Redirection automatique vers la roulette...');
          this.router.navigate(['/roulette-game', response.session.game_session_id]);
        }
      },
      error: (error) => {
        console.error(`❌ Erreur lors de la création de la session ${this.gameType}:`, error);
        this.isCreatingSession = false;
        alert('Erreur lors de la création de la session');
      }
    });
  }

  showJoinOptions(): void {
    this.showSessionList = true;
    this.loadAvailableSessions();
  }

  joinGame(sessionId: string): void {
    this.gameSessionService.joinGameSession(sessionId).subscribe({
      next: (response) => {
        console.log(`Session ${this.gameType} rejointe avec succès:`, response);
        alert(`Session rejointe avec succès! ID: ${sessionId}`);
        
        // Navigation vers le jeu approprié
        if (this.gameType === 'roulette') {
          this.router.navigate(['/roulette-game', sessionId]);
        } else {
          this.router.navigate([this.gameConfig.gameRoute, sessionId]);
        }
      },
      error: (error) => {
        console.error(`Erreur lors de la jointure de la session ${this.gameType}:`, error);
        alert('Erreur lors de la jointure de la session');
      }
    });
  }

  backToMenu(): void {
    this.showSessionList = false;
  }

  backToHome(): void {
    this.router.navigate(['/']);
  }

  private loadAvailableSessions(): void {
    console.log('📋 SALON - loadAvailableSessions appelé pour gameType:', this.gameType);
    console.log('🔍 SALON - Prefix à filtrer:', this.gameConfig.prefix);
    
    this.gameSessionService.getAvailableSessions().subscribe({
      next: (sessions) => {
        console.log('📊 SALON - Sessions brutes reçues du backend:', sessions);
        
        // Filtrer selon le type de jeu
        if (this.gameType === 'general') {
          this.availableSessions = sessions;
          console.log('🌐 SALON - Mode général, toutes les sessions conservées');
        } else {
          this.availableSessions = sessions.filter(session => 
            session.game_session_id.startsWith(this.gameConfig.prefix)
          );
          console.log(`🎯 SALON - Sessions filtrées pour ${this.gameType} (prefix: ${this.gameConfig.prefix}):`, this.availableSessions);
        }
        console.log(`✅ SALON - ${this.availableSessions.length} sessions ${this.gameType} chargées`);
      },
      error: (error) => {
        console.error('❌ SALON - Erreur lors du chargement des sessions:', error);
      }
    });
  }

  selectGame(gameName: string): void {
    this.router.navigate([`/${gameName}`]);
  }
}
