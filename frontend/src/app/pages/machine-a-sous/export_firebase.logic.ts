import { Injectable } from '@angular/core';
import { Database, ref, set, get, onValue } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseSendService {
  constructor(private db: Database) {}

  /**
   * Envoie une partie dans la base de données Firebase avec une clé personnalisée.
   * @param joueurId L'identifiant du joueur (ex: 'player1')
   * @param solde Le solde du joueur (ex: 50)
   */
  async sendPartie(joueurId: number, solde: number): Promise<void> {
    const rootRef = ref(this.db);

    try {
      // Récupérer les données existantes pour compter le nombre d'entrées
      const snapshot = await get(rootRef);
      const data = snapshot.val();
      const nbData = data ? Object.keys(data).length : 0;
      console.log('🚀 ~ FirebaseSendService ~ sendPartie ~ nbData:', nbData);

      // Générer la clé personnalisée
      const partieKey = `MA${nbData + 1}`;

      // Préparer les données à insérer
      const partieData = {
        solde: solde,
        joueurId: joueurId.toString(),
        partieJouee: false,
        partieAffichee: false,
        combinaisons: [],
        gain: 0,
      };

      // Insérer les données avec la clé personnalisée directement à la racine
      const partieRef = ref(this.db, partieKey);
      await set(partieRef, partieData);

      console.log(`Données envoyées avec succès sous la clé ${partieKey}.`);
    } catch (error) {
      console.error("Erreur lors de l'envoi des données à Firebase :", error);
      throw error;
    }
  }

  listenToParties(): Observable<any> {
    return new Observable((observer) => {
      const partiesRef = ref(this.db, 'parties');
      const unsubscribe = onValue(
        partiesRef,
        (snapshot) => {
          observer.next(snapshot.val());
        },
        (error) => {
          observer.error(error);
        }
      );

      // Nettoyage à la destruction de l'observable
      return { unsubscribe };
    });
  }
}
