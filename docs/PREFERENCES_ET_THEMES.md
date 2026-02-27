# Préférences utilisateur & Thèmes

Documentation du système de personnalisation visuelle de Bibliothèque.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Thèmes disponibles](#2-thèmes-disponibles)
3. [Taille du texte](#3-taille-du-texte)
4. [Interface utilisateur — Panneau de préférences](#4-interface-utilisateur--panneau-de-préférences)
5. [Architecture frontend](#5-architecture-frontend)
6. [Architecture backend](#6-architecture-backend)
7. [Flux de synchronisation](#7-flux-de-synchronisation)
8. [Mise en page responsive](#8-mise-en-page-responsive)
9. [Référence technique](#9-référence-technique)

---

## 1. Vue d'ensemble

Le système de préférences permet à chaque utilisateur de personnaliser l'apparence de l'application :

- **Thème de couleur** : 4 thèmes sombres au choix
- **Taille du texte** : 3 niveaux de grossissement
- **Persistance double** : sauvegarde locale (localStorage) + base de données (par compte utilisateur)

Les préférences sont appliquées immédiatement sans rechargement de la page et survivent aux déconnexions grâce à localStorage.

---

## 2. Thèmes disponibles

Tous les thèmes sont des variantes sombres, ce qui garantit la lisibilité du texte clair existant dans l'interface.

| Identifiant  | Nom affiché | Couleur de fond      | Couleur d'accent               |
|--------------|-------------|----------------------|--------------------------------|
| `dark`       | Nuit        | `#0f172a` bleu nuit  | `#0ea5e9` bleu ciel            |
| `sepia`      | Sépia       | `#1c1106` brun chaud | `#d97706` ambre-orange         |
| `ardoise`    | Ardoise     | `#0a0f1a` ardoise    | `#6366f1` indigo               |
| `foret`      | Forêt       | `#0a1a0f` vert forêt | `#10b981` émeraude             |

### Variables CSS

Les thèmes fonctionnent via deux **variables CSS en triplets RGB** déclarées dans [`client/src/index.css`](../client/src/index.css), appliquées sur l'élément `<html>` via l'attribut `data-theme` :

```css
/* Thème par défaut */
:root {
  --color-bg:     15 23 42;    /* #0f172a – bleu nuit  */
  --color-accent: 14 165 233;  /* #0ea5e9 – bleu ciel  */
}

[data-theme="sepia"] {
  --color-bg:     28 17 10;
  --color-accent: 217 119 6;
}

[data-theme="ardoise"] {
  --color-bg:     10 15 26;
  --color-accent: 99 102 241;
}

[data-theme="foret"] {
  --color-bg:     10 26 15;
  --color-accent: 16 185 129;
}
```

> **Pourquoi des triplets RGB ?**
> Pour que Tailwind CSS puisse appliquer des modificateurs d'opacité comme `bg-teal/10` ou `border-teal/20`.
> La couleur `teal` est définie dans `tailwind.config.ts` comme `rgb(var(--color-accent) / <alpha-value>)`.

### Screenshot — comparaison des 4 thèmes

<!-- TODO: Insérer ici 4 captures côte à côte (page principale dans chaque thème) -->

---

## 3. Taille du texte

Trois niveaux sont disponibles, appliqués via l'attribut `data-font` sur `<html>` :

| Identifiant | Bouton | Taille de base | Comportement DOM                          |
|-------------|--------|----------------|-------------------------------------------|
| `normal`    | Aa     | 16 px (défaut) | L'attribut `data-font` est **supprimé**   |
| `large`     | Aa+    | 18 px          | `data-font="large"`                       |
| `xlarge`    | Aa++   | 20 px          | `data-font="xlarge"`                      |

```css
[data-font="large"]  { font-size: 18px; }
[data-font="xlarge"] { font-size: 20px; }
```

Toutes les tailles de texte dans l'interface utilisent des unités `rem`, ce qui les rend automatiquement relatives à cette base.

### Screenshot — comparaison des tailles de texte

<!-- TODO: Insérer ici une capture du même contenu en taille normale vs xlarge -->

---

## 4. Interface utilisateur — Panneau de préférences

### Emplacement

Le bouton **⚙** (engrenage) est situé dans l'en-tête de l'application, à droite du bouton de déconnexion.

### Screenshot — bouton ⚙ dans le header

<!-- TODO: Insérer ici une capture du header avec le bouton mis en évidence -->

### Comportement

| Action | Effet |
|--------|-------|
| Clic sur ⚙ | Ouverture du panneau flottant |
| Clic en dehors du panneau | Fermeture (overlay invisible `fixed inset-0`) |
| Clic sur ✕ | Fermeture |
| Sélection d'un thème ou d'une taille | Appliqué **instantanément** |

### Contenu du panneau

**Section Thème** — grille 2 × 2 :
- Cercle coloré (swatch) représentant la couleur de fond du thème
- Nom du thème
- Bordure et fond `teal` sur l'option active

**Section Taille du texte** — 3 boutons côte à côte : `Aa`, `Aa+`, `Aa++`

### Screenshot — panneau ouvert

<!-- TODO: Insérer ici une capture du panneau de préférences ouvert -->

---

## 5. Architecture frontend

### Hook `usePreferences`

**Fichier :** [`client/src/hooks/usePreferences.ts`](../client/src/hooks/usePreferences.ts)

Ce hook React gère l'intégralité de l'état local des préférences :

- Lecture depuis `localStorage` au premier rendu (avec fallback sur les valeurs par défaut)
- Application au DOM via `data-theme` et `data-font` sur `<html>` à chaque changement
- Sauvegarde automatique dans `localStorage`

```ts
export type Theme     = "dark" | "sepia" | "ardoise" | "foret";
export type FontScale = "normal" | "large" | "xlarge";

export interface Preferences {
  theme:     Theme;
  fontScale: FontScale;  // camelCase côté hook
}

const DEFAULTS: Preferences = { theme: "dark", fontScale: "normal" };
const STORAGE_KEY = "bibliotheque_prefs";
```

Fonctions exposées par le hook :

| Fonction | Signature | Rôle |
|----------|-----------|------|
| `prefs`  | `Preferences` | État courant |
| `update` | `(partial: Partial<Preferences>) => void` | Mise à jour partielle (pour les actions utilisateur) |
| `load`   | `(incoming: Preferences) => void` | Remplacement complet (pour l'hydratation depuis l'API) |

### Composant `PreferencesPanel`

**Fichier :** [`client/src/components/PreferencesPanel.tsx`](../client/src/components/PreferencesPanel.tsx)

Composant purement présentationnel. Il reçoit `prefs` et `onUpdate` en props et ne contient aucune logique métier.

```tsx
type Props = {
  prefs:    Preferences;
  onUpdate: (partial: Partial<Preferences>) => void;
};
```

### Intégration dans `App.tsx`

**Fichier :** [`client/src/App.tsx`](../client/src/App.tsx)

`App.tsx` est le **coordinateur** : il relie le hook, l'API et le composant.

```
┌─────────────────┐   onUpdate()   ┌──────────────────────────────┐
│ PreferencesPanel│ ─────────────► │           App.tsx            │
│  (composant UI) │                │                              │
└─────────────────┘                │  updatePrefs()               │
                                   │   ├─ _updatePrefs()  ──────► │ usePreferences
                                   │   └─ upsertPreferences() ──► │ API (best-effort)
                                   │                              │
                                   │  bootstrap() (après login)   │
                                   │   ├─ fetchPreferences() ───► │ API
                                   │   └─ loadPrefs()      ──────►│ usePreferences
                                   └──────────────────────────────┘
```

### Fonctions API client

**Fichier :** [`client/src/api/client.ts`](../client/src/api/client.ts)

```ts
// Lit les préférences du compte connecté
export const fetchPreferences = async (): Promise<Preference> =>
  (await api.get<Preference>("/api/preferences/me")).data;

// Crée ou met à jour les préférences
export const upsertPreferences = async (payload: PreferencePayload): Promise<Preference> =>
  (await api.put<Preference>("/api/preferences/me", payload)).data;
```

### Types TypeScript

**Fichier :** [`client/src/types.ts`](../client/src/types.ts)

```ts
export type Preference = {
  id:         number;
  user_id:    number;
  theme:      "dark" | "sepia" | "ardoise" | "foret";
  font_scale: "normal" | "large" | "xlarge";  // snake_case côté API
  created_at: string;
  updated_at: string;
};

export type PreferencePayload = Partial<Pick<Preference, "theme" | "font_scale">>;
```

> **Mapping camelCase / snake_case**
> Le backend Python utilise `font_scale`. Le hook frontend utilise `fontScale`.
> La conversion est faite explicitement dans `App.tsx` :
> ```ts
> // Lecture API → hook
> loadPrefs({ theme: serverPrefs.theme, fontScale: serverPrefs.font_scale });
>
> // Hook → API
> upsertPreferences({ theme: partial.theme, font_scale: partial.fontScale });
> ```

---

## 6. Architecture backend

### Modèle SQLAlchemy

**Fichier :** [`server/app/models.py`](../server/app/models.py)

```python
class Preference(Base):
    __tablename__ = "preferences"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                        unique=True, nullable=False)
    theme      = Column(String(50), nullable=False, default="dark")
    font_scale = Column(String(50), nullable=False, default="normal")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="preference")
```

Relation déclarée dans `User` :

```python
preference = relationship(
    "Preference", back_populates="owner",
    uselist=False, cascade="all, delete-orphan"
)
```

Caractéristiques de la table :

- Relation **1-1** entre `User` et `Preference` (`unique=True` sur `user_id`)
- Suppression en cascade si l'utilisateur est supprimé
- Table créée automatiquement au démarrage via `Base.metadata.create_all()` — pas d'Alembic

### Schémas Pydantic

**Fichier :** [`server/app/schemas.py`](../server/app/schemas.py)

```python
ThemeValue     = Literal["dark", "sepia", "ardoise", "foret"]
FontScaleValue = Literal["normal", "large", "xlarge"]

class PreferenceRead(BaseModel):
    id:         int
    user_id:    int
    theme:      ThemeValue
    font_scale: FontScaleValue
    created_at: datetime
    updated_at: datetime
    class Config: from_attributes = True

class PreferenceUpdate(BaseModel):
    theme:      Optional[ThemeValue]     = None
    font_scale: Optional[FontScaleValue] = None
```

Les types `Literal` garantissent que seules les valeurs autorisées sont acceptées — toute autre valeur retourne une erreur **422 Unprocessable Entity**.

### Routes API

**Fichier :** [`server/app/routes/preferences.py`](../server/app/routes/preferences.py)

| Méthode | Endpoint               | Authentification | Description |
|---------|------------------------|------------------|-------------|
| `GET`   | `/api/preferences/me`  | JWT requis       | Retourne les préférences du compte connecté. Crée des valeurs par défaut si c'est le premier appel. |
| `PUT`   | `/api/preferences/me`  | JWT requis       | Met à jour les préférences (upsert partiel). Seuls les champs fournis sont modifiés. |

---

## 7. Flux de synchronisation

### Au login

```
1. Login réussi → token JWT stocké, setAuthToken() appelé
2. bootstrap() dans App.tsx
3.  └─ fetchPreferences()           GET /api/preferences/me
4.      ├─ Succès → loadPrefs({ theme, fontScale })
        │           (valeurs DB remplacent localStorage)
        └─ Erreur réseau → valeurs localStorage conservées (fallback silencieux)
```

### À chaque changement utilisateur

```
1. Clic sur thème ou taille dans PreferencesPanel
2. onUpdate(partial) → updatePrefs(partial) dans App.tsx
3.  ├─ _updatePrefs(partial)         effet immédiat : DOM + localStorage
    └─ upsertPreferences(payload)    PUT /api/preferences/me (async, best-effort)
        └─ Erreur réseau → ignorée silencieusement
```

### Priorité des sources de données

```
Hors connexion  →  localStorage uniquement
Après login     →  Base de données  >  localStorage
```

---

## 8. Mise en page responsive

Le panneau de préférences s'inscrit dans une refonte responsive de l'application, motivée par la nécessité de l'utiliser sur des écrans **800 × 600 px**.

### Points de rupture Tailwind

| Préfixe   | Largeur min | Usage principal |
|-----------|-------------|-----------------|
| *(aucun)* | 0 px        | Mobile-first : colonnes uniques |
| `xs`      | 480 px      | Point de rupture intermédiaire (défini, usage futur) |
| `sm`      | 640 px      | Grilles 2 colonnes, padding réduit |
| `md`      | 768 px      | Grille 3 colonnes (liste + détail livre) |

Le breakpoint `xs` est déclaré dans [`client/tailwind.config.ts`](../client/tailwind.config.ts).

### Changements appliqués

| Zone | Avant | Après |
|------|-------|-------|
| Padding général | `p-6` | `p-3 sm:p-6` |
| En-tête | `flex` fixe | `flex flex-wrap gap-2` |
| Formulaires (grille interne) | `grid-cols-2` | `grid-cols-1 sm:grid-cols-2` |
| Zone liste + détail | 3 colonnes fixes | `grid-cols-1 md:grid-cols-3` |
| Hauteur scroll liste | `max-h-[70vh]` | `max-h-[40vh] md:max-h-[60vh]` |

### Screenshot — vue 800 × 600 px

<!-- TODO: Insérer ici une capture à 800×600 px -->

### Screenshot — vue desktop (≥ 1280 px)

<!-- TODO: Insérer ici une capture en résolution desktop pour comparaison -->

---

## 9. Référence technique

### Fichiers modifiés ou créés

| Fichier | Statut | Rôle |
|---------|--------|------|
| [`client/src/hooks/usePreferences.ts`](../client/src/hooks/usePreferences.ts) | Créé | Hook : état, localStorage, DOM |
| [`client/src/components/PreferencesPanel.tsx`](../client/src/components/PreferencesPanel.tsx) | Créé | Composant UI : bouton ⚙ + dropdown |
| [`server/app/routes/preferences.py`](../server/app/routes/preferences.py) | Créé | Routes API GET + PUT |
| [`client/src/index.css`](../client/src/index.css) | Modifié | Variables CSS des thèmes et font scale |
| [`client/tailwind.config.ts`](../client/tailwind.config.ts) | Modifié | Couleur `teal` dynamique, breakpoint `xs` |
| [`client/src/App.tsx`](../client/src/App.tsx) | Modifié | Intégration hook + sync API |
| [`client/src/types.ts`](../client/src/types.ts) | Modifié | Types `Preference`, `PreferencePayload` |
| [`client/src/api/client.ts`](../client/src/api/client.ts) | Modifié | `fetchPreferences`, `upsertPreferences` |
| [`server/app/models.py`](../server/app/models.py) | Modifié | Modèle `Preference`, relation sur `User` |
| [`server/app/schemas.py`](../server/app/schemas.py) | Modifié | `PreferenceRead`, `PreferenceUpdate` |
| [`server/main.py`](../server/main.py) | Modifié | Enregistrement du router `preferences` |

### Valeurs valides

```
theme      : "dark" | "sepia" | "ardoise" | "foret"
font_scale : "normal" | "large" | "xlarge"
```

Validées côté frontend (TypeScript `Literal`) **et** côté backend (Pydantic `Literal`).

### Clé localStorage

```
bibliotheque_prefs
```

Format JSON stocké :

```json
{ "theme": "foret", "fontScale": "large" }
```

### Emplacements des screenshots à compléter

| N° | Section | Contenu suggéré |
|----|---------|-----------------|
| 1  | §2 Thèmes | 4 captures côte à côte, page principale dans chaque thème |
| 2  | §3 Taille | Même contenu en `normal` vs `xlarge` |
| 3  | §4 Header | Header avec le bouton ⚙ mis en évidence |
| 4  | §4 Panneau | Panneau ouvert (thème actif + taille active visibles) |
| 5  | §8 Responsive | Vue 800 × 600 px (colonne unique) |
| 6  | §8 Responsive | Vue desktop ≥ 1280 px (3 colonnes) |
