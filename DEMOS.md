# Démos Simples à Reproduire

Ce document explique comment reproduire les démos mentionnées dans la présentation "Road to Prod".

## Prérequis

1. **Serveur API tournant** : `cd server && source .venv/bin/activate && python main.py`
   - L'API tourne sur `http://localhost:8000`
   - Documentation Swagger disponible sur `http://localhost:8000/docs`
   - Pour des logs JSON (demo logging structuré): `LOG_MODE=PROD`

2. **Client tournant** : `cd client && npm install && npm run dev`
   - Le client tourne sur `http://localhost:5173`

3. **Outils/Navigateur** :
   - Ouvrir les DevTools (F12) pour voir les logs
   - Console pour vérifier les logs de l'API
   - Network tab pour inspecter les requêtes/réponses

---

## 1. DEMO - Gestion des Erreurs API (Côté Serveur)

### Objectif

Montrer que toutes les erreurs sont prédéfinies avec logging structuré.

### Étapes

#### A. Email déjà enregistré (Validation)

1. Accumuler à l'application avec: `demo@example.com` / `password123`
2. Une fois connecté, **ouvrir la console du serveur** (terminal où tourne `main.py`)
3. Chercher les logs JSON avec:
   - `timestamp` : moment exact de l'erreur
   - `level: WARNING` ou `ERROR` selon la gravité
   - `logger: app.routes.users` : le module qui a levé l'erreur
   - `message` : description claire
   - `module` / `function` / `line` : traçabilité exacte

#### B. ISBN déjà utilisé

1. Une fois connecté, dans le formulaire "Nouveau livre":
   - Titre: `Test Book`
   - ISBN: `978-0-13-110362-7` (utiliser un ISBN déjà existant)
   - Cliquer "Ajouter"

2. **Résultat côté client**:
   - Un toast **orange warning** apparaît en bas à droite
   - Message: "Conflit de données" ou le message du serveur
   - Le toast disparaît automatiquement après 5 secondes

3. **Résultat côté serveur** (console):
   - Log JSON avec `error_code: "DUPLICATE_RESOURCE"`
   - `status_code: 409` (Conflict)
   - Traçabilité complète : `function: "create_book"`, `line: XX`

#### C. Token expiré / Invalide

1. Une fois connecté, ouvrir DevTools → Application → Local Storage
2. Modifier manuelement le token JWT (changer quelques caractères)
3. Rafraîchir la page

4. **Résultat côté client**:
   - Toast **rouge error** : "Authentification requise" ou "Invalid or expired token"
   - Redirection vers la page de connexion

5. **Résultat côté serveur**:
   - Log avec `error_code: "INVALID_TOKEN"` ou `"AUTHENTICATION_FAILED"`
   - `status_code: 401`

---

## 2. DEMO - Gestion des Erreurs Côté Client

### Objectif

Montrer que les erreurs React et l'ErrorBoundary gèrent les problèmes sans crash.

#### A. Gestion des erreurs de formulaire

1. Formulaire "Nouvel auteur":
   - Laisser le champ "Nom" vide
   - Cliquer sur "Ajouter l'auteur"

2. **Résultat**:
   - Toast **orange warning** : "Le nom est obligatoire"
   - Pas d'appel API
   - Le formulaire reste vierge, prêt pour un nouveau remplissage

#### B. Erreur serveur (500)

1. Mettre le serveur API hors ligne (Ctrl+C sur `main.py`)
2. Dans le formulaire de création d'auteur:
   - Remplir le nom: `Test Author`
   - Cliquer "Ajouter l'auteur"

3. **Résultat côté client**:
   - Toast **rouge error** : "Erreur serveur interne" ou "Impossible de contacter le serveur"
   - La page reste fonctionnelle
   - L'utilisateur peut faire d'autres actions ou réessayer plus tard

4. Relancer le serveur: `python main.py`

#### C. ErrorBoundary (Erreur React crash)

**Note**: Cette démo récréer une erreur React intentionnelle. En développement, React affiche une "Red Screen".

1. Ouvrir le fichier [BookList.tsx](../client/src/components/BookList.tsx)
2. Dans la fonction de rendu, ajouter une ligne qui cause une erreur:
   ```jsx
   const invalid = undefined.something; // Crash intentionnel
   ```
3. Sauvegarder le fichier
4. Le client affiche une page ErrorBoundary avec:
   - Titre: "Oops!"
   - Message expliquant qu'une erreur s'est produite
   - Bouton "Rafraîchir" pour recharger l'app

5. Retirer la ligne erro et sauvegarder - l'app fonctionne à nouveau

---

## 3. DEMO - Système de Toasts avec Codes HTTP

### Objectif

Montrer que chaque code HTTP a un style visuel distinct.

| Code HTTP | Type Toast | Couleur           | Exemple                       |
| --------- | ---------- | ----------------- | ----------------------------- |
| 200-299   | success    | 🟢 Vert (emerald) | Livre ajouté avec succès      |
| 400       | warning    | 🟠 Orange (amber) | Données invalides             |
| 401       | error      | 🔴 Rouge (red)    | Authentification requise      |
| 403       | error      | 🔴 Rouge (red)    | Accès refusé                  |
| 404       | warning    | 🟠 Orange (amber) | Ressource introuvable         |
| 409       | warning    | 🟠 Orange (amber) | Conflit (ISBN/Email dupliqué) |
| 500+      | error      | 🔴 Rouge (red)    | Erreur serveur                |

### Tester les différents codes

Option la plus fiable (front + logs serveur en meme temps):

1. Ouvrir `http://localhost:5173/demo/errors/api`
2. Cliquer un des boutons de scenario HTTP
3. Observer:
   - Le toast cote client
   - Le log structure cote serveur (meme action)

Les boutons appellent ces endpoints:

- `/api/demos/errors/validation`
- `/api/demos/errors/auth`
- `/api/demos/errors/not-found`
- `/api/demos/errors/conflict`
- `/api/demos/errors/internal`

1. **200 - Succès** (Vert ✓):
   - Ajouter un nouveau livre ou auteur
   - Toast: `"Livre ajouté avec succès"` en vert avec l'icône ✓

2. **400/422 - Validation** (Orange ⚠):
   - Soumettre un formulaire sans titre
   - Toast: `"Le titre est obligatoire"` en orange avec l'icône ⚠

3. **409 - Conflit** (Orange ⚠):
   - Créer un auteur avec un nom déjà existant
   - Toast: `"Conflit de données"` en orange

4. **401 - Non authentifié** (Rouge ✕):
   - Supprimer le token localStorage et recharger
   - Le système le détecte et affiche un toast red

---

## 4. DEMO - Logging Structuré (Console Serveur)

### Objectif

Montrer que les logs serveur sont structurés en JSON avec contexte complet.

### Étapes

1. Garder le terminal du serveur visible
2. Faire une action (créer un livre, ajouter un auteur, erreur)
3. Observer dans le terminal:

```json
{
  "timestamp": "2026-03-20T14:32:45.123456",
  "level": "INFO",
  "logger": "app.routes.books",
  "message": "Book created: 42 by user demo@example.com",
  "module": "books",
  "function": "create_book",
  "line": 45,
  "extra": {
    "book_id": 42,
    "user_email": "demo@example.com",
    "isbn": "978-0-13-110362-7"
  }
}
```

### Points clés

- **timestamp**: Moment exact en UTC
- **level**: INFO, WARNING, ERROR
- **logger**: `app.routes.books` → identifie le module
- **message**: Descriptif clair
- **module/function/line**: Traçabilité précise dans le code
- **extra**: Contexte additionnel pour diagnostiquer

---

## 5. DEMO - Page 404

### Objectif

Montrer la page 404 personnalisée pour les routes invalides.

### Étapes

1. Dans l'URL du navigateur, aller sur une route inexistante:
   - Actuellement: `http://localhost:5173/`
   - Taper: `http://localhost:5173/nonexistent`

2. **Résultat**:
   - Page 404 avec:
     - Grand "404" en gris
     - Titre: "Page non trouvée"
     - Message explicatif
     - Bouton "Retour à l'accueil" qui redirige vers `/`

**Note**: Le routing React Router est implémenté, vous pouvez aussi utiliser le hub demos sur `http://localhost:5173/demo`.

---

## 6. DEMO - Flux Complet d'Authentification

### Objectif

Montrer un flux utilisateur complet avec gestion d'erreur.

### Étapes

1. **Inscription**:
   - Aller sur la page de connexion
   - Cliquer "Créer un compte"
   - Remplir un email unique: `newuser@example.com`
   - Mot de passe: `secure123`
   - Cliquer "Créer + connecter"

2. **Résultats**:
   - Toast vert: `"Inscription réussie! Connexion en cours..."`
   - Toast vert: `"Connecté avec succès!"`
   - Redirection vers l'app

3. **Déconnexion + Reconnexion**:
   - Cliquer le bouton "Déconnexion"
   - Toast: `"À bientôt!"` (peut être ajouté)
   - Retour à la page d'authentification

4. **Email déjà utilisé**:
   - Mode "Créer un compte"
   - Email: `demo@example.com` (déjà utilisé)
   - Cliquer "Créer + connecter"
   - Toast orange: `"Email already registered"` du serveur

---

## 7. DEMO - Préférences Utilisateur (En arrière-plan)

### Objectif

Montrer la persistance sans briser le flux utilisateur si l'API est HS.

### Étapes

1. Cliquer sur l'icône "⚙️" (préférences) en haut à droite
2. Changer:
   - Le thème (sepia, ardoise, forêt)
   - La taille de police

3. **Résultats**:
   - Les préférences se sauvegardent **localement** immédiatement
   - L'app envoie les données au serveur en arrière-plan
   - Si le serveur répond mal: l'app utilise toujours les prefs locales
   - Les prefs persistent au rafraîchissement

---

## Points Clés pour la Présentation

✅ **Erreurs structurées**: Pas d'erreurs brutes, tout est une classe d'exception prédéfinie
✅ **Logging traçable**: Timestamp, module, fonction, ligne exacte
✅ **Toasts visuels**: Chaque type d'erreur HTTP a une couleur et un style
✅ **Pas de crash**: ErrorBoundary capture les erreurs React
✅ **Localisation**: Pas de dépendance API pour les données statiques (préfs, formulaires)
✅ **UX limpide**: Chaque action a un feedback (toast, erreur, succès)

---

## Troubleshooting

| Problème                    | Solution                                                                          |
| --------------------------- | --------------------------------------------------------------------------------- |
| API répond pas              | Vérifier: `python main.py` dans le dossier `server/`                              |
| Client ne tourne pas        | Vérifier: `npm run dev` dans le dossier `client/`                                 |
| Toasts pas visibles         | Vérifier que le ToastContainer est rendu dans main.tsx                            |
| Logs serveur pas en JSON    | Vérifier `LOG_MODE=PROD` dans `server/.env`                                       |
| ErrorBoundary pas déclenché | Les erreurs JS runtime seulement; les erreurs async (fetch) ne le déclenchent pas |
| Token token prématurement   | Vérifier ACCESS_TOKEN_EXPIRE_MINUTES dans app/security.py                         |

---

## Fichiers Clés

- **Toast System**: [ToastContext.tsx](../client/src/context/ToastContext.tsx), [ToastContainer.tsx](../client/src/components/ToastContainer.tsx)
- **Error Handler**: [errorHandler.ts](../client/src/utils/errorHandler.ts)
- **ErrorBoundary**: [ErrorBoundary.tsx](../client/src/components/ErrorBoundary.tsx)
- **Server Exceptions**: [exceptions.py](../server/app/exceptions.py)
- **Exception Handlers**: [exception_handlers.py](../server/app/exception_handlers.py)
- **Logging Config**: [logging_config.py](../server/app/logging_config.py)
