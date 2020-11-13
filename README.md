# Générateur de PDF pour Lodel

## Installation

### Prérequis

 * Lodel 1.0
 * Docker CE
 * Docker Compose

### Lancer le convertisseur

Seul le fichier `docker-compose.yml` est nécessaire, vous pouvez le mettre où vous le souhaitez.
Vous pouvez modifier le port exposé, ainsi que les identifiants de connexion au convertisseur dans ce fichier, en modifiant la section `ports` du proxy, ainsi que les variables d'environnement `BASIC_AUTH_USER` et `BASIC_AUTH_PASS`.
Pour plus d'informations, vous pouvez vous référer à la documentation de [configuration de Docker Compose](https://docs.docker.com/compose/compose-file/).

Une fois les modifications faites, vous pouvez lancer le service en lançant la commande:
```bash
docker-compose up
```

### Installer le plugin Lodel

Dans le répertoire `share/plugins/custom/` de votre installation, clonez le dépôt:

```bash
git clone https://github.com/edinum/pdfgen.git
```

Accédez à l'administration des plugins de votre installation lodel (`https://votreinstallation/lodeladmin/index.php?do=list&lo=mainplugins`) et activez le plugin pdfgen.

Et enfin, sur chaque site où vous souhaitez activer le plugin, allez dans l'administration des plugin du site, puis activez le plugin.
Une fois activé, accédez à la configuration de celui-ci, définissez un logo (Attention, un bug de lodel peut empêcher l'envoi de celui-ci, une PR a été déposée), puis saisissez l'URL du convertisseur, dans le format ci-dessous, en fonction de la configuration que vous avez saisi dans le fichier de configuration de Docker Compose que vous avez défini précédemment
```
http://login:password@domaine:port
```

Dès à présent, vous devriez être capables d'accéder aux PDF de vos articles via une URL du type:
https://domaine/[#SITENAME]/?do=_pdfgen_get&document=[#ID]&lang=[#LANG]

## Variables de traduction

* Variables de traduction : importer les fichiers `translations/translation-xx.xml` fournis dans ce dépôt **via le panneau d'administration générale de Lodel dont l'URL est de la forme `lodeladmin/index.php?do=list&lo=translations`** (à ne pas confondre avec le panneau d'administration du site). Ainsi les traductions du plugin sont importées une seule fois pour tous les sites.

## Utilisation dans les templates

Quand le plugin est actif et configuré, on peut récupérer le lien vers le PDF automatique dans les templates avec la variable LodelScript `[#PDFGEN_URL]`.

```html
	<!--[ Si un PDF fac-similé est lié à l'article, on pointe vers ce fichier ]-->
	<IF COND="[#ALTERFICHIER]">
		<a role="button" href="[#ID|makeurlwithid|query_string('file', '1')]">Télécharger le PDF</a>

	<!--[ Sinon on vérifie que le générateur est actif et si oui on pointe vers le PDF automatique ]-->
	<ELSEIF COND="[#PDFGEN_URL]" />
		<a role="button" href="[#PDFGEN_URL]">Télécharger le PDF</a>
	</IF>
```

## FAQ

### Ajouter un logo en haut de page

Le logo doit être nommé `pdf_logo.png` et inséré dans le dossier `tpl/` du site.

## Crédits et financement

Ce projet a été développé par le [collectif Edinum](https://edinum.org) pour les Bibliothèques universitaires de l'Université Jean Moulin Lyon 3. Il a été financé par l'Université Jean Moulin Lyon 3. 

Le collectif Edinum a accepté de publier son code source sous licence libre GPL3 sans contrepartie, affirmant ainsi son engagement en faveur du logiciel libre.

* Développement backend, PHP et Lodel : Nahuel Angelinetti
* Design et intégration des templates : Thomas Brouard

## Licence

**2020, Edinum.org**

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.