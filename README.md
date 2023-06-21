# Lariis Bot

LariisBot est un bot Discord conçu pour communiquer les dispos des équipes MK et les synchroniser avec l'application MKStats. On peut également s'en servir pour créer les LU des wars et envoyer une mention Discord automatiquement aux personnes concernées.

## Fonctionnalités

* Ajout des dispos sur Discord (à la manière de Toad Bot) et synchronisation avec celles sur l'application.
* Création de la LU automatique (avec ping)
* Synchronicité des deux supports sur le long terme.

## Utilisation

### Renseignement des dispos

1. Exécuter la commande `_dispo` dans le channel où vous utilisez Toad Bot habituellement.
2. La commande ne prend aucun paramètre et affichera les dispos pour les horaires par défaut (18h, 20h, 21h, 22h et 23h).
3. Utilisez le bot comme d'habitude
4. Normalement vous n'aurez pas besoin d'entrer la commande, l'application s'en chargera toute seule au moment où elle publiera les dispos quotidiennement (vers 9h du matin)

#### Création de la LU

1. Exécuter la commade `_createlu` dans le channel des dispos.
2. Dans un premier temps, il faut s'assurer que les personnes en can soient suffisament nombreuses. La gestion des can sub s'il y a un grand nombre de joueurs n'est pas encore implémentée.
3. La commande prend deux paramètres :
    * L'heure (1er argument)
    * Le tag de l'adversaire (2è argument)
4. Le bot mentionnera (ping) tous les membres qui étaient en can pour l'heure spécifiée sur le channel Discord.
  
### N'oubliez pas vos dispos ! 
