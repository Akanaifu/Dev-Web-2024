# Dev-Web-2024-2025

Template de repo pour le projet Dev Web 2024-2025

## Comment copier ce Wiki?

Pour récupérer le template et l'utiliser dans le cadre de votre projet, vous allez devoir faire un "fork" de ce repo. Cependant, le wiki n'est pas copié automatiquement. Suivez donc la procédure ci-dessous :

1.  Créez un fork de ce repository. Ce sera votre repo de projet, avec une URL de type `https://github.com/<username>/<repo-name>`.
2.  Créez un wiki dans ce nouveau repo, avec une Home page vide par exemple.
3.  Clonez le repo git du wiki original sur votre machine : `git clone https://github.com/EphecLLN/Dev-Web-2024.wiki.git`
4.  Pour "pousser" le wiki présent sur votre machine vers votre repository de projet, vous allez changer le pointeur "remote" de votre copie locale :
    `git remote add fork https://github.com/<username>/<repo-name>.wiki.git`
5.  Forcez à présent la copie du wiki sur votre machine vers votre repository de projet. Cela écrasera le wiki vide que vous aviez créé plus tôt avec le template : `git push -f fork master`

## Utilisation

Il vous est demandé de respecter la table des matières du projet, afin que les enseignants puissent facilement retrouver les informations qu'ils cherchent. Si vous souhaitez effectuer un changement dans sa structure, parlez-en d'abord avec votre coach.

Si vous trouvez que les pages sont trop longues, vous pouvez en créer de nouvelles, mais vous devez alors vous assurez que les liens sont mis à jour dans la table des matières.

# Projet Dev3

Projet pour le cour de Dev

### Site Casino

---

## Tests backend avec Jest

### Installation de Jest

Dans le dossier `backend`, lancez la commande suivante pour installer Jest et Supertest (pour les tests d'API) :

```sh
cd backend
npm install --save-dev jest supertest
```

Ajoutez le script suivant dans le fichier `backend/package.json` si ce n'est pas déjà fait :

```json
"scripts": {
  "test": "jest"
}
```

### Lancer les tests backend

Pour exécuter tous les tests du backend, utilisez :

```sh
npm test
```
ou
```sh
npx jest
```

Les fichiers de test doivent être placés dans le dossier `backend/tests` et avoir l'extension `.test.js` ou `.spec.js`.

### Exemple de test backend

Créez un fichier `backend/tests/example.test.js` avec le contenu suivant :

```javascript
// backend/tests/example.test.js
test('addition simple', () => {
  expect(1 + 2).toBe(3);
});
```

Lancez ensuite la commande `npm test` pour vérifier que le test fonctionne.

---

## Tests frontend avec Jest (Angular)

### Installation de Jest dans le frontend

Dans le dossier `frontend`, lancez :

```sh
cd frontend
npm install --save-dev jest jest-preset-angular @types/jest
```

Ajoutez un fichier `jest.config.js` dans `frontend/` :

```javascript
// frontend/jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/+(*.)+(spec|test).+(ts)'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
};
```

Créez un fichier `setup-jest.ts` dans `frontend/` :

```typescript
// frontend/setup-jest.ts
import 'jest-preset-angular/setup-jest';
```

Modifiez le script de test dans `frontend/package.json` :

```json
"scripts": {
  "test": "jest"
}
```

### Exemple de test frontend

Créez un fichier `src/app/example/example.component.spec.ts` :

```typescript
// frontend/src/app/example/example.component.spec.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: '<p>{{greet()}}</p>'
})
export class ExampleComponent {
  greet() {
    return 'Hello Jest!';
  }
}

describe('ExampleComponent', () => {
  it('should return greeting', () => {
    const component = new ExampleComponent();
    expect(component.greet()).toBe('Hello Jest!');
  });
});
```

### Lancer les tests frontend

Dans le dossier `frontend`, lancez :

```sh
npm test
```

---

**Remarque** : Vous pouvez utilisé Jasmine ou Karma mais Jest est plus rapide pour les tests unitaires
