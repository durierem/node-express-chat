# NODE EXPRESS CHAT

## Usage

`docker-compose up` lance mongo + back + front servi sur `http://localhost`.
Modifiez l'ENV au besoin, notamment pour une éventuelle connexion à Mongo Atlas.

## Persistence des données

2 collections : `Messages` et `Users`.

Les `Users` sont uniquement les utilisateurs connectés. Ils sont supprimés à
la fin d'une session.

## Sockets

### Connexion d'un utilisateur

1. À la connexion d'un utilisateur (lorsqu'il renseigne son pseudo et clique sur
"Connect"), il envoie un message sur le canal `login`. L'utilisateur est ensuite
enregistré en base avec un `session_id` (`socket.id`).
2. Le serveur appelle ensuite la fonction callback fournie par le client avec
toutes les informations nécessaires au remplissage initial de la vue.
3. Le serveur broadcast l'information d'un nouvel arrivant à tous les clients
(sauf celui qui vient d'arriver).

### Déconnexion d'un utilisateur

À la déconnexion d'un client, l'utilisateur correspondant est supprimé de la
base de données et le serveur broadcast à tous les autres clients l'information
sur le canal `logout`.

### Compteurs de messages

Lors de l'enregistrement d'un nouveau message ou du login d'un nouvel
utilisateur, le serveur envoie à tout les clients sur le canal `counter` un
objet contenant le nombre total de message et le nombre de messages par
utilisateurs.

Ce fonctionnement permet de :

1. centraliser le nombre de message côté back et éviter des compteurs locaux
côté front
2. utiliser des aggrégations MongoDB :p

À noter que les nombres de messages par utilisateur ne concernent que les
utilisateurs connectés.
