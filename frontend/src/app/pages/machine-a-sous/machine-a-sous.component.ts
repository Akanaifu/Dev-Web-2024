import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-machine-a-sous',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-a-sous.component.html',
  styleUrls: ['./machine-a-sous.component.css'],
})
export class MachineASousComponent {
  showTable = false;
  highlightCombination: string | null = null; // Stocke la combinaison à mettre en rouge

  combinations = [
    {
      id: 'combo-1',
      title: 'Méga-jackpot',
      combination: '777',
      multiplier: 100,
      example: '777',
      class: 'mega-jackpot',
    },
    {
      id: 'combo-2',
      title: 'Jackpot',
      combination: 'xxx',
      multiplier: 10,
      example: '222',
      class: 'jackpot',
    },
    {
      id: 'combo-3',
      title: 'Suite',
      combination: 'xyz/zyx',
      multiplier: 5,
      example: '123 / 321',
      class: 'suite',
    },
    {
      id: 'combo-4',
      title: 'Sandwich',
      combination: 'xyx',
      multiplier: 2,
      example: '121',
      class: 'sandwich',
    },
    {
      id: 'combo-5',
      title: '(Im)pair',
      combination: 'ace/bdf',
      multiplier: 2,
      example: '111 / 222',
      class: 'im-pair',
    },
  ];

  afficheurs = [
    { id: 'afficheur1', currentChiffre: 0 },
    { id: 'afficheur2', currentChiffre: 0 },
    { id: 'afficheur3', currentChiffre: 0 },
  ];

  intervalId: any;
  generationCount = 0; // Compteur pour arrêter après 15 générations

  ngOnInit(): void {
    this.startRotation();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  startRotation(): void {
    this.intervalId = setInterval(() => {
      this.afficheurs.forEach((afficheur) => {
        afficheur.currentChiffre = this.generateRandomNumber();
      });

      this.generationCount++;

      if (this.generationCount >= 15) {
        clearInterval(this.intervalId); // Arrête la rotation après 15 générations
        this.checkCombination(); // Vérifie si une combinaison correspond
      }
    }, 200); // Change every 1 second
  }

  generateRandomNumber(): number {
    return Math.floor(Math.random() * 10); // Génère un chiffre entre 0 et 9
  }

  getCurrentChiffre(afficheurId: string): number {
    const afficheur = this.afficheurs.find((a) => a.id === afficheurId);
    return afficheur ? afficheur.currentChiffre : 0; // Default to 0 if not found
  }

  checkCombination(): void {
    const combination = this.afficheurs
      .map((afficheur) => afficheur.currentChiffre)
      .join('');

    // Vérifie les combinaisons
    if (combination === '777') {
      this.highlightCombination = 'combo-1'; // Méga-jackpot
    } else if (
      combination[0] === combination[1] &&
      combination[1] === combination[2]
    ) {
      this.highlightCombination = 'combo-2'; // Jackpot
    } else if (
      (+combination[0] === +combination[1] + 1 &&
        +combination[1] === +combination[2] + 1) ||
      (+combination[0] === +combination[1] - 1 &&
        +combination[1] === +combination[2] - 1)
    ) {
      this.highlightCombination = 'combo-3'; // Suite
    } else if (combination[0] === combination[2]) {
      this.highlightCombination = 'combo-4'; // Sandwich
    } else if (
      (+combination[0] % 2 === 0 &&
        +combination[1] % 2 === 0 &&
        +combination[2] % 2 === 0) ||
      (+combination[0] % 2 !== 0 &&
        +combination[1] % 2 !== 0 &&
        +combination[2] % 2 !== 0)
    ) {
      this.highlightCombination = 'combo-5'; // (Im)pair
    } else {
      this.highlightCombination = null; // Aucune combinaison correspondante
    }
  }

  toggleTable() {
    this.showTable = !this.showTable;
  }
}
