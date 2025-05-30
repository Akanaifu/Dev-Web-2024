# Explication des fichiers de tests

## backend/tests/edit-compte.test.js

Ce fichier teste l'API de modification de compte utilisateur (`PUT /edit-compte`).  
Il couvre :
- La mise à jour d'un utilisateur sans mot de passe.
- La mise à jour d'un utilisateur avec mot de passe.
- La gestion des erreurs de base de données.

## backend/tests/new_game.test.js

Ce fichier teste l'API d'ajout d'une nouvelle partie (`POST /new_game/add`).  
Il couvre :
- L'ajout d'une partie si aucune session n'existe.
- Le refus d'ajout si une session existe déjà.
- La gestion des erreurs de base de données.

## frontend/src/app/pages/machine-a-sous/export_firebase.logic.spec.ts

Ce fichier teste le service d'envoi et d'écoute des parties sur Firebase.  
Il vérifie :
- La création du service.
- Que `listenToParties` retourne un Observable.
- Que la méthode `sendPartie` existe.

## frontend/src/app/pages/machine-a-sous/machine-a-sous.component.spec.ts

Ce fichier teste le composant Angular de la machine à sous.  
Il vérifie :
- La création du composant.
- Le fonctionnement du toggle de l'affichage du tableau.
- Que la méthode pour obtenir la valeur courante d'un afficheur retourne un nombre.
- Que la méthode d'envoi d'une partie à Firebase existe.

## frontend/src/app/pages/machine-a-sous/machine-a-sous.logic.spec.ts

Ce fichier teste la logique métier de la machine à sous.  
Il vérifie :
- La création de la logique.
- Le calcul d'une fonction quadratique.
- La mise à jour des afficheurs.
- La détection d'une combinaison gagnante.
- L'appel au service d'ajout de partie.

---
Chaque test permet de s'assurer que les fonctionnalités principales de l'application fonctionnent comme prévu et que les erreurs sont bien gérées.
