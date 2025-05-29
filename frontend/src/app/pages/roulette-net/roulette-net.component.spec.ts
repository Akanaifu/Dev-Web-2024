import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouletteNetComponent } from './roulette-net.component';


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
  

});
