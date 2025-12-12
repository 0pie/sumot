# SUMOT

SUMOT est un jeu de lettres inspiré de Wordle, développé avec **Electron** et **JavaScript**, utilisant des mots français et proposant une **définition du mot** en fin de partie.

Le projet est conçu comme une application **desktop portable** (sans installation requise).

---

## ✨ Fonctionnalités

- Grille dynamique avec mots de **3 à 10 lettres**
- Clavier virtuel AZERTY
- Animations de validation des lettres
- Couleurs distinctes :
  - 🟩 lettre correcte
  - 🟨 lettre présente
  - ⬛ lettre absente
- Clavier avec état persistant des lettres
- **Définition du mot révélée en fin de partie** (grace à Dicolink)
- Bouton de partage du résultat (emoji grid)
- Application Electron

---

## 🚀 Lancer le projet en local

### Prérequis
- **Node.js ≥ 18**
- **npm**

### Installation
```bash
npm install
```

### 🧩 Lancer l’application
```bash
npm run start
```

## 📖 Définitions des mots

Les définitions sont récupérées dynamiquement depuis :

https://www.dicolink.com/mots/

## 🛠️ Stack technique

- Electron

- JavaScript (ES Modules côté renderer)

- HTML / CSS

- SQLite (sql.js)

- Node.js