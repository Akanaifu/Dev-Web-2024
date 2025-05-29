import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouletteNetComponent } from './roulette-net.component';

/**
 * Suite de tests unitaires pour le composant RouletteNetComponent.
 * 
 * ÉTAT ACTUEL : Tests de base en cours de développement
 * - Test de création du composant opérationnel
 * - Migration vers Jest prévue pour des tests plus avancés
 * 
 * TESTS À DÉVELOPPER :
 * - Vérification des getters qui délèguent au service
 * - Test des méthodes de mise et de spin
 * - Validation de l'état isSpinning
 * - Tests d'intégration avec le service RouletteNetLogic
 */
describe('RouletteNetComponent', () => {
  let component: RouletteNetComponent;
  let fixture: ComponentFixture<RouletteNetComponent>;

  /**
   * Configuration des tests avec TestBed Angular.
   * Note : Migration vers Jest prévue pour une meilleure performance et fonctionnalités avancées.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouletteNetComponent] // Import du composant standalone
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouletteNetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Test de base : vérification que le composant se crée correctement.
   * Ce test minimal valide l'instanciation et la configuration de base.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  // TODO: Ajouter des tests pour :
  // - Les getters qui délèguent au service (currentBet, chipValues, etc.)
  // - Les méthodes setBet(), removeBet(), spin()
  // - L'état isSpinning et son impact sur l'interface
  // - L'interaction avec RouletteNetLogic
});
