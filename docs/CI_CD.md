# CI/CD du projet Bibliotheque

Ce document decrit le fonctionnement CI/CD actuel du projet (frontend + backend + documentation), ainsi que les options de deploiement recommandees.

## Vue d'ensemble

Le repository utilise GitHub Actions pour automatiser :

- La creation de branches de travail depuis les issues (`issue-to-branch.yml`)
- Le build et la publication de l'image Docker du backend (`docker-publish-server.yml`)
- La synchronisation automatique de la documentation vers le GitHub Wiki (`wiki-sync.yml`)

## Pipelines GitHub Actions

### 1) Creation automatique de branche (Issue -> Branch)

Workflow : `.github/workflows/issue-to-branch.yml`

- Declencheur : ouverture d'une issue GitHub (`issues: opened`)
- Regle : le titre doit commencer par un identifiant du type `ONLIB-####`
- Action : creation et push d'une branche `feat/ONLIB-####` depuis `main`
- Feedback : commentaire automatique sur l'issue en cas de succes ou d'erreur

Objectif : standardiser la strategie de branches et accelerer le demarrage du developpement.

### 2) Build et publication Docker du backend

Workflow : `.github/workflows/docker-publish-server.yml`

- Declencheurs :
  - `push` sur `main`
  - `push` de tags `v*`
  - `pull_request` vers `main`
- Scope : changements dans `server/**` ou dans le workflow CI Docker lui-meme
- Registry : `ghcr.io`
- Image : `ghcr.io/<owner>/<repo>/bibliotheque-api`

Comportement :

- Sur Pull Request :
  - Build de verification (sans push) pour valider que l'image est construisible
- Sur Push `main` ou tag `v*` :
  - Login au registry GHCR
  - Build de l'image backend (contexte `./server`)
  - Push avec tags auto-generes (branche, semver, sha)
  - Utilisation du cache GitHub Actions (`cache-from`/`cache-to`) pour accelerer

Objectif : garantir une image deployable et versionnee automatiquement.

### 3) Synchronisation de la documentation

Workflow : `.github/workflows/wiki-sync.yml`

- Declencheurs :
  - `push` sur `main` ou `master` quand des fichiers `*.md` changent
  - lancement manuel (`workflow_dispatch`)
- Actions :
  - Copie de `README.md` vers la page d'accueil du wiki (`Home.md`)
  - Copie des autres fichiers Markdown vers le wiki
  - Generation d'une sidebar wiki
  - Commit/push automatique dans le repo wiki associe

Objectif : garder une documentation projet et wiki synchronisees.

## CI/CD global du projet (entierete)

### Frontend (client)

- Le frontend est versionne dans le meme monorepo (`client/`)
- Le workflow Docker actuel couvre explicitement le backend (`server/`)
- Recommandation CI front : ajouter un workflow dedie pour `client/` avec :
  - installation des dependances
  - lint
  - tests unitaires
  - build Vite
  - eventuellement tests E2E Playwright

### Backend (server)

- Le backend est deja integre dans un flux CI/CD concret via image Docker publiee sur GHCR
- Cette image sert d'artefact de deploiement unique entre environnements

### Documentation

- La documentation est integree au flux CI via sync wiki automatique

## Deploiement simple avec Docker sur un serveur

Un deploiement production peut se faire simplement avec Docker, derriere un reverse proxy (Nginx, Traefik, Caddy).

Architecture type :

- `bibliotheque-api` (conteneur backend FastAPI)
- reverse proxy en frontal :
  - terminaison TLS (HTTPS)
  - routage domaine/sous-domaine
  - eventuels headers de securite

Flux de deploiement type :

1. Recuperer l'image publiee depuis GHCR sur le serveur
2. Demarrer le conteneur backend (ou `docker compose -f docker-compose.prod.yml up -d`)
3. Configurer le proxy pour exposer l'API publiquement
4. Faire pointer le nom de domaine vers le serveur

Avantages : simple, rapide a maintenir, ideal pour une petite a moyenne charge.

## Orchestration possible avec Kubernetes

Quand les besoins augmentent (HA, scaling, gestion multi-service), une orchestration Kubernetes est envisageable.

### Pattern recommande

- 1 Deployment par service (ex. API, frontend, worker futur)
- 1 Service Kubernetes par Deployment
- 1 Ingress pour exposition HTTP(S) derriere un controller (Nginx Ingress, Traefik)
- Variables de configuration via ConfigMap/Secret

### Ressources par defaut (base de demarrage)

Par service, definir par defaut :

- `memory`: `1Gi`
- `cpu`: `2`

Exemple (a adapter) :

```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "2"
  limits:
    memory: "1Gi"
    cpu: "2"
```

Ces valeurs sont une base conservative qui pourra evoluer selon la charge reelle, l'observabilite et les objectifs de performance.

## Recommandations d'evolution CI/CD

Pour couvrir toute l'entierete du projet de maniere plus stricte :

- Ajouter un workflow `client-ci.yml` (lint/test/build)
- Ajouter des checks backend de qualite (tests API, lint Python)
- Ajouter un workflow de deploiement automatise par environnement (staging/prod)
- Ajouter un scan de securite d'image (SAST/dependances/container)
- Ajouter une strategie de promotion d'artefacts (tag immutable -> staging -> prod)

## Resume

Le projet dispose deja d'une base CI/CD operationnelle pour :

- la creation de branches depuis issues
- la publication Docker du backend
- la sync automatique de documentation

Le deploiement peut se faire simplement en Docker derriere proxy, et une evolution vers Kubernetes est pleinement possible avec un point de depart de `1Gi` RAM et `2` CPU par service, ajustables ensuite selon les besoins.
