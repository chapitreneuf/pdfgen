# Générateur de PDF pour Lodel

## Installation

TODO

Le générateur de PDF utilise [les variables de traduction de la maquette Nova](https://github.com/edinum/nova/tree/master/translations). Pour utiliser le générateur avec tout autre maquette il faudra manuellement ajouter ces variables au site via le menu "Administrer les traductions du site" du panneau d'administration de Lodel.

## Utilisation dans les templates

Quand le plugin est actif et configuré, on peut récupérer le lien vers le PDF automatique dans les templates avec la variable LodelScript `[#PDFGEN_URL]`.

```html
	<!--[ Si un PDF fac-similé est lié à l'article, on pointe vers ce fichier ]-->
	<IF COND="[#ALTERFICHIER]">
		<a role="button" href="[#ID|makeurlwithid]?file=1">Télécharger le PDF</a>

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