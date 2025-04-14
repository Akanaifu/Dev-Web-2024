import { Database, ref, get, child } from '@angular/fire/database';

export class MachineASousLogic {
  private db: Database;
  title = 'Machine à sous';
  showTable = false;
  highlightCombination: string | null = null;

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
  generationCount = 0;

  constructor(db: Database) {
    this.db = db;
  }

  fetchFirebaseData(): void {
    const dbRef = ref(this.db);
    get(child(dbRef, '/'))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log('Firebase Data:', snapshot.val());
          const data = snapshot.val();

          const lastPartKey = Object.keys(data).pop();
          const lastPart = lastPartKey ? data[lastPartKey] : null;

          if (
            lastPart &&
            lastPart.combinaison &&
            lastPart.combinaison.length > 0
          ) {
            const allCombinations = lastPart.combinaison;
            console.log('All Combinations from Last Part:', allCombinations);

            let index = 0;
            this.intervalId = setInterval(() => {
              if (index < allCombinations.length) {
                const combination = allCombinations[index];
                console.log(
                  `Displaying Combination ${index + 1}:`,
                  combination
                );

                this.afficheurs.forEach((afficheur, i) => {
                  afficheur.currentChiffre = combination[i] || 0;
                });

                this.checkCombination();
                index++;
              } else {
                clearInterval(this.intervalId);

                const gainElement = document.getElementById('gain');
                if (gainElement) {
                  gainElement.textContent = `Gain: ${lastPart.gain}`;
                }
              }
            }, 1000);
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

  checkCombination(): void {
    const combination = this.afficheurs
      .map((afficheur) => afficheur.currentChiffre)
      .join('');

    const matchedCombinations: string[] = [];

    if (combination === '777') {
      matchedCombinations.push('combo-1');
    } else if (
      combination[0] === combination[1] &&
      combination[1] === combination[2]
    ) {
      matchedCombinations.push('combo-2');
    } else if (
      (+combination[0] === +combination[1] + 1 &&
        +combination[1] === +combination[2] + 1) ||
      (+combination[0] === +combination[1] - 1 &&
        +combination[1] === +combination[2] - 1)
    ) {
      matchedCombinations.push('combo-3');
    } else if (combination[0] === combination[2]) {
      matchedCombinations.push('combo-4');
    }

    if (
      ((+combination[0] % 2 === 0 &&
        +combination[1] % 2 === 0 &&
        +combination[2] % 2 === 0) ||
        (+combination[0] % 2 !== 0 &&
          +combination[1] % 2 !== 0 &&
          +combination[2] % 2 !== 0)) &&
      !(combination[0] === combination[1] && combination[1] === combination[2])
    ) {
      matchedCombinations.push('combo-5');
    }

    this.highlightCombination =
      matchedCombinations.length > 0 ? matchedCombinations.join(', ') : null;
  }
}
