import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database, ref, get, child } from '@angular/fire/database';

@Component({
  selector: 'app-machine-a-sous',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-a-sous.component.html',
  styleUrls: ['./machine-a-sous.component.css'],
})
export class MachineASousComponent implements OnInit, AfterViewInit {
  private db: Database = inject(Database);
  title = 'Machine à sous';
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

  ngAfterViewInit(): void {
    this.fetchFirebaseData();
  }
  /*   data = {
  partie1: { timestamp: "2025-04-06T12:34:56Z",     gain: 50,     joueurId: "player1",     combinaison: [[1, 2, 3], [4, 5, 6]]   },
  partie2:  {     timestamp: "2025-04-07T12:09:56Z",    gain: 0,     joueurId: "player1",      combinaison : [[1, 2, 3], [4, 5, 8]]   }
  } */
  fetchFirebaseData(): void {
    const dbRef = ref(this.db);
    get(child(dbRef, '/'))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log('Firebase Data:', snapshot.val());
          const data = snapshot.val();

          // Récupère la dernière partie de data
          const lastPartKey = Object.keys(data).pop(); // Récupère la dernière clé
          const lastPart = lastPartKey ? data[lastPartKey] : null;

          if (
            lastPart &&
            lastPart.combinaison &&
            lastPart.combinaison.length > 0
          ) {
            const allCombinations = lastPart.combinaison; // Récupère toutes les combinaisons
            console.log('All Combinations from Last Part:', allCombinations);

            // Affiche toutes les combinaisons séquentiellement sur les afficheurs
            let index = 0;
            this.intervalId = setInterval(() => {
              if (index < allCombinations.length) {
                const combination = allCombinations[index];
                console.log(
                  `Displaying Combination ${index + 1}:`,
                  combination
                );

                // Met à jour les afficheurs avec la combinaison actuelle
                this.afficheurs.forEach((afficheur, i) => {
                  afficheur.currentChiffre = combination[i] || 0;
                });

                this.checkCombination(); // Vérifie la combinaison actuelle
                index++;
              } else {
                clearInterval(this.intervalId); // Arrête l'intervalle après avoir affiché toutes les combinaisons
              }
            }, 1000); // Change de combinaison toutes les secondes
          } else {
            console.error(
              'Invalid data structure: Missing combinaison in the last part'
            );
          }
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error('Error fetching Firebase data:', error);
      });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  startRotation(): void {
    // Disable rotation since we are now fetching combinations from Firebase
    console.warn(
      'startRotation is disabled as combinations are fetched from Firebase.'
    );
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
      return;
    } else if (
      combination[0] === combination[1] &&
      combination[1] === combination[2]
    ) {
      this.highlightCombination = 'combo-2'; // Jackpot
      return;
    } else if (
      (+combination[0] === +combination[1] + 1 &&
        +combination[1] === +combination[2] + 1) ||
      (+combination[0] === +combination[1] - 1 &&
        +combination[1] === +combination[2] - 1)
    ) {
      this.highlightCombination = 'combo-3'; // Suite
    } else if (combination[0] === combination[2]) {
      this.highlightCombination = 'combo-4'; // Sandwich
    } else {
      this.highlightCombination = null; // Aucune combinaison correspondante
    }
    if (
      (+combination[0] % 2 === 0 &&
        +combination[1] % 2 === 0 &&
        +combination[2] % 2 === 0) ||
      (+combination[0] % 2 !== 0 &&
        +combination[1] % 2 !== 0 &&
        +combination[2] % 2 !== 0)
    ) {
      this.highlightCombination = 'combo-5'; // (Im)pair
    }
    return;
  }

  toggleTable() {
    this.showTable = !this.showTable;
  }
}
