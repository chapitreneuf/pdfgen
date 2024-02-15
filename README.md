# Générateur de PDF pour Lodel

![pdfgen latest version](https://img.shields.io/github/v/tag/chapitreneuf/pdfgen?color=blue&style=flat-square) [![License](https://img.shields.io/github/license/chapitreneuf/pdfgen?color=blue&style=flat-square)](https://github.com/chapitreneuf/pdfgen/blob/master/LICENSE)

## Installation

### Prérequis

* Lodel 1.0
* Docker CE
* Docker Compose

### Lancer le convertisseur

Seul le fichier `docker-compose.yml` est nécessaire, vous pouvez le mettre où vous le souhaitez.
Vous pouvez modifier le port exposé, ainsi que les identifiants de connexion au convertisseur dans ce fichier, en modifiant la section `ports` du proxy, ainsi que les variables d'environnement `BASIC_AUTH_USER` et `BASIC_AUTH_PASS`.
Pour plus d'informations, se référer à la documentation de [configuration de Docker Compose](https://docs.docker.com/compose/compose-file/).

Une fois les modifications faites, lancer le service avec la commande :

```bash
docker-compose up
```

### Importer les variables de traduction

Importez les fichiers `translations/translation-xx.xml` fournis dans ce dépôt **via le panneau d'administration générale de Lodel dont l'URL est de la forme `lodeladmin/index.php?do=list&lo=translations`** (à ne pas confondre avec le panneau d'administration du site). Ainsi les traductions du plugin sont importées une seule fois pour tous les sites.

### Installer le plugin Lodel

Dans le répertoire `share/plugins/custom/` de votre installation, clonez le dépôt :

```bash
git clone https://github.com/chapitreneuf/pdfgen.git
```

Accédez à l'administration des plugins de votre installation lodel (`https://votreinstallation/lodeladmin/index.php?do=list&lo=mainplugins`) et activez le plugin pdfgen.

Enfin sur chaque site où vous souhaitez utiliser le générateur activez le plugin depuis l'administration des plugin du site. Une fois le plugin activé, accédez à sa configuration et saisissez l'URL du convertisseur, dans le format ci-dessous. L'URL doit correspondre à la configuration saisie précédement dans le fichier de configuration de Docker Compose :

```
http://login:password@domaine:port
```

### Ajouter des logos

Pour ajouter le logo du site en haut de la page des PDF, insérez une image `pdf_logo.png` dans le dossier `tpl/` du site.

Pour afficher le logo de la plateforme sur les PDF, insérez une image `/plugins/custom/pdfgen/public/plateforme.png`.

## URLS

Une fois activé, le plugin rend accessible les URLs suivantes :

* Récupération du PDF : `/?do=_pdfgen_get&document=[#ID]&lang=[#LANG]`
* Affichage de la version HTML intermédiaire : `/?do=_pdfgen_view&document=[#ID]&lang=[#LANG]`

L'attribut `[#LANG]` détermine la langue des variables de traductions. Il est recommandé de toujours utiliser la langue principale du site.

Le PDF généré est mis en cache par le générateur et automatiquement recalculé lorsque les données du document sont modifiées. Il est toujours possible de forcer la régénération avec l'argument `clearcache` :

`/?do=_pdfgen_get&document=[#ID]&lang=[#LANG]&clearcache=1`

Il est aussi possible de supprimer le contenu du répertoire "CACHE" de la revue.

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

## PDF des numéros et des documents non publiés (prévisualisation)

Depuis PDFgen 1.3, le plugin supporte la génération des PDF des numéros complets et la prévisualisation des PDF des documents non publiés. Il est nécessaire d'utiliser la Nova 2.4 ou supérieure pour que ces fonctionnalités soient utilisables.

Pour afficher le DOI des numéros sur les PDF, la dernière version de [lodel-options-extra](https://github.com/chapitreneuf/lodel-options-extra) doit être utilisée (option "Types présentant des DOI").

Dans le cas où la génération de numéros longs entraînerait des problèmes (messages d'erreur, PDF vides), il est possible d'augmenter la valeur de la variable `$waitTimeout` dans pdfgen.php.

## Personnalisation

### Personnalisation au niveau du site

Il est possible de personnaliser les templates du PDF en redéclarant les macros de macros_pdfgen.html dans tpl/macros_custom.html.

Les macros `PDFGEN_CUSTOM_JS` et `PDFGEN_CUSTOM_CSS` à déclarer dans tpl/macros_custom.html permettent d'ajouter respectivement des scripts et des styles à la page.

Exemple pour remplacer la numérotation des paragraphes par un numéro de page :

```html
/**
 * Affichage du numéro de page
 */
<DEFMACRO NAME="PDFGEN_CUSTOM_CSS">
	<style>
		@page {
			@bottom-center {
				content: counter(page);
			}
		}

		.article__text-contents > p.texte::before {
			content: none;
		}
	</style>
</DEFMACRO>
```

### Personnalisation globale

Depuis PDFgen 1.3, il est possible de modifier le fichier macros_pdfgen_custom.html pour introduire des modifications et définir des paramètres qui s'appliqueront à l'ensemble des sites de l'instance Lodel.

## Mise à niveau

Dans le cas d'une mise à niveau, il est nécessaire de réinstaller les variables de traduction dans l'administration générale de Lodel (voir plus haut). En cas d'erreur lors de l'import les variables doivent être mises à jour manuellement via l'interface.

## Crédits et financement

Ce projet a été développé par le [collectif Chapitre neuf](https://chapitre9.org) pour les Bibliothèques universitaires de l'Université Jean Moulin Lyon 3. Il a été financé par l'Université Jean Moulin Lyon 3.

Chapitre neuf a accepté de publier son code source sous licence libre GPL3 sans contrepartie, affirmant ainsi son engagement en faveur du logiciel libre.

* Développement backend, PHP et Lodel : Nahuel Angelinetti
* Design et intégration des templates : Thomas Brouard

## Licence

**2024, Chapitre neuf**

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
