ROAD TO PROD
ERIC PHILIPPPE – JORGELINA LEDESMA
INTRO
ERIC
Diapo 1.
Bibliothèque ONLINE, votre nouvelle solution pour gérer votre librairie, que vous soyez professionnel, gestionnaire d’une bibliothèque, ou bien juste un book nerd, laissez ma collègue Jorgelina et moi-même Eric PHILIPPE, vous présenter la pertinence de notre solution, dans un contexte Road to Prod !
JORGELINA
Diapo 2.
Bonjour, je suis Jorgelina, et notre présentation va s’articuler autour de ces axes :
Description du diaporama avec les différents axes
Laissez-moi maintenant vous parler d’un point majeur dans le cycle de développement de notre solution,
GESTION DES CONFLITS
Diapo 3.
La gestion des conflits au cours du développement.

Diapo 4.

Avant tout, un peu de contexte, notre branching stratégie s’articule autour de la logique suivante
Une branche principale, dernière vérité du code à date, des branches release qui partent en staging pour être testée d’abord, puis en production. Et lors d’une nouvelle feature, l’utilisateur créé une branche à partir de la release visée.

On travaille actuellement sur la 1.0.0 et on se rend compte que deux branches sont en conflits…
DEMO

Diapo 5.
Comme va-t-on dans ce cas traiter nos pull request ? Très simple, nous suivons une logique en 3 étapes, diagnostique, traitement, puis prévention.
Le diagnostic va consister à remettre les différentes tâches en contexte. Quelle tâche implique ces changements, quelle est sa priorité ? De là, on en écarte des métriques en dur, qui permettent de décider de façon stricte, sans interprétation.

- Priorité de la story
- Pertinence du module développé dans le/les fichiers en conflits
- Impact dans le reste du projet
- Facilité de reproductibilité du commit éliminé du conflit.

De cette façon, on peut alors décider que cette branche sera celle passant en priorité, laissant la seconde en attente, pour conclure la phase de traitement. Relever les manquants dans les fichiers en question, les refaire, décider de quand y attribuer du temps, et acter dessus.

A la suite du traitement, se déroule automatiquement un build permettant de vérifier les états posts-conflits. C’est là qu’on rentre dans la phase prévention. Prévenir, tester, et échanger. Si tous les tests sont au vert, on peut alors échanger avec les parties prenantes, afin de définir ce qui a causé ce conflit, quels moyens de communications peuvent être mis en place …
De cette façon, plus aucun souci, les merges conflicts ne sont qu’un moment permettant d’améliorer encore un peu plus notre processus à chaque fois !
MIGRATION BDD
ERIC
Super ! Maintenant que notre conflit est géré. Sauf que ce commit partait avec un changement sur la base de données. Comment va-t-on alors s’y prendre ?
Diapo 5.
L’application étant développée de façon à être la moins lourde possible, on considérera ici un système de base de données SqlIte. Simple à embarquer, si le serveur tourne, ça veut dire que la base tourne, la disponibilité de la base est alors intrinsèquement liée à la survie du serveur.
Sqlite en plus d’avoir ce low dependence avantage, tient dans un seul fichier, ce qui permet un système de backup ultra simple, à chaque migration on fait un fichier de backup, on essaie la nouvelle version, et auquel cas, soit on reste sur la nouvelle version, pour laquelle SQLite a automatiquement migré, soit on repart sur l’ancienne version.
DEMO
ERROR MANAGEMENT
Diapo 6.
Alors super. Le conflit est géré, la base de données migrée correctement, mais maintenant, comment gérer les erreurs courantes dans notre code. (reste du diapo.)
Diapo 7.
D’abord, côté serveur, qui est donc la racine des problèmes généralement. On profite ici pleinement d’un Python orienté objet qui va permettre de prédéfinir des erreurs.
FastAPI, étant la colonne vertébrale de notre API, permet de rediriger la totalité des erreurs vers notre système maison.
Ici, chaque erreur n’est pas une exception, mais une prévision. Les erreurs n’interviennent pas nulle part, on lève systématiquement tous les erreurs nous-même. Si une exception ressort de notre application, c’est que le développeur adopte une approche exception first avant tout traitement
Ex. books.py.
On profite alors d’un profile générique, erreurs réseaux, SQL, mémoire, tout devient prédictif, plus une surprise.
Pour tenir à ce contrat prédictif et lisible, l’application déploie son système robuste de logging. A chaque exception, sont écrites en consoles le timestamp, le niveau d’impact, l’instance du logger l’ayant relevé, le message relevé, le module, la fonction et la ligne exacte. Le tout permet une traçabilité haute et une intervention rapide. C’est le travail du formateur d’exception permettant une souplesse accrue dans les champs.
Demo/Exemple
Diapo 8.
Concernant la voie « publique » de notre API, deux choses sont mises en place, un swagger entièrement documenté et prédictible, permettant la journalisation précises des routes, ainsi qu’un formatage documenté, et implémenté des codes d’erreurs http.
(Broder autour du diapo’)
Notre erreur est alors relevée depuis notre serveur, mais qu’en est-t-il de la vue côté client ?
JORGELINA
Diapo 9.
Côté client, nous abordons 3 stratégies, les erreurs de consultation de l’API, les erreurs JavaScript ainsi que les erreurs de routing.
Diapo 10.
Côté network, axios gère la totalité des requêtes, et ce module NPM permet également de sous-traiter l’interception de toutes les erreurs. Auquel cas, (DEMO), on peut volontairement provoquer une erreur, et constater le toast. Le toast, en fonction du code http, adoptera différents styles pour souligner la gravité de l’erreur.
Diapo 11.

Côté erreurs sur le client, au moindre soucis, React à l’aide d’une balise <ErrorBoundary> permettant de rediriger le souci sur un composant sans aucune logique métier dedans, purement HTML informant l’utilisateur des soucis majeur. Il sera également redirigé à contacter les administrateurs auquel cas.
Composant à hériter explication
Diapo 12.
Si l’utilisateur final s’amuserai à accéder à des routes pour lesquels il ne devrait pas accéder, le site offre une page 404 renvoyant sur la page d’accueil
DEMO
ERIC
Notre application est donc bel et bien prête à être déployé, comment procéder ensuite ?
CI/CD
Diapo 13.
A chaque commit sur la release, des premiers tests sur les différents composant est effectué.
Le serveur lui est testé. Python le permet, pas de lint à effectuer, comme on profite de syntaxe par indentation. Des tests unitaires sont à dispositions, suivant ces tests des fonctions critiques, on accorde à la suite la possibilité de build le container docker prêt pour les environnements de staging puis de productions.

JORGELINA
Diapo 14.
Concernant le côté client, ici on profite d’un premier test par le compiler typescript permettant de par exemple vérifier le typage de nos variables, puis ensuite passer un coup de linter pour respecter les bonnes pratiques conseillées par l’organisme derrière JavaScript. Ce module s’appelle Eslint avec une configuration par défaut, proposant un juste milieu entre code propre, et pas contraignant.
Comme le serveur, le build du client se fait découlant une nouvelle version du container docker.
Diapo 15.
A noter qui plus est, que à chaque commit d’un fichier markdown, une action est déclenchée pour tenir à jour une documentation technique et publique sans intervention manuelle supplémentaire.
ERIC
HOSTING

Diapo 16.
Comme expliqué avant, notre stratégie de déploiement repose sur un environnement de staging, et un de production, chacun représenté dans une machine virtuelle d’un Proxmox en Bare Metal, permettant un coup moindre pour les premières versions de notre solution.
Le proxmox bare metal contient un reverse proxy permettant de lier le nom de domaine aux différents services (https://api.domain.com et https://domain.com)
Tout se lance d’un simple docker compose, allant se nourrir des images docker construites plus tôt.
Une commande, docker compose pull dans l’environnement de notre choix, et l’entièreté de notre application est alors prête à fonctionner.
La configuration permet de reconstruire l’image en parallèle, laissant un downtime nul.

Diapo 17.
Le coût d’un nom de domaine ainsi que de la maintenance d’un serveur bare metal ne dépasse pas les 5 euros par mois et profite d’une importante volatilité pour le faire évoluer par la suite.
En effet, nous pouvons simplement attribuer plus de ressources d’abord aux containers, puis à la VM, puis sur la machine.
On pourra envisager des solutions de plus grandes envergures par la suite si l’application le réclame, à l’instar de services cloud comme AWS, ainsi qu’une migration de la base de données de Sqlite à du Postgresql pour profiter de ses performances ainsi que la possibilité de lancer plusieurs instances synchronisées.
CONCLUSION

ERIC
Nous avons donc couvert un cycle complet, vers la production optimisée de notre application de librairie en ligne. Facilitante entre les développeurs, simple de modifications côté base de données et une gestion d’erreur prédictive ne laissant place qu’à des affichages lisibles et simple.
JORGELINA
Le tout est supporté par une intégration continue, mêlé d’une infrastructure solide à moindre coup, permettant d’optimiser le time to business de façon idéale.
Afin de faire évoluer l’application en même temps que ces utilisateurs, on pourra faire en priorité évoluer la technique du type de base de données.
Dans un but plus commercial, nous sommes en train de mettre en place un premier modèle freemium, permettant des accès complets à l’application, avec des ads revenus pour subvenir aux différents frais liés à l’application
