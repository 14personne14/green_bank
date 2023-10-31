/**
 * Renvoie le choix de l'utilisateur dans une liste de boutons radio
 * @param {String} name Le nom de la liste qu'il faut regarder
 * @returns Le choix de l'utilisateur dans la liste 'nom'. Si il n'y en a pas, la fonction renvoie 'no-choice'
 */
function getSelectValue(name) {
	var button = document.querySelector(`input[name="${name}"]:checked`);
	if (button) {
		return button.value;
	} else {
		return 'no-choice';
	}
}

/**
 * Récupère les données d'un fichier JSON
 * @param {String} path Le chemin d'accès au fichier
 * @returns Les données du fichiers JSON
 */
async function getJsonData(path) {
	var res = await fetch(path);
	var json_data = res.json();
	return json_data;
}

/**
 * Supprime les espace d'un texte et le met en minuscule
 * @param {String} texte Le texte à formatter
 * @returns Le texte bien formatté
 */
function minimizeTexte(texte) {
	// Supprime tous les espaces
	texte = texte.replace(/\s/g, '');
	// Convertit le texte en minuscules
	texte = texte.toLowerCase();

	return texte;
}

/**
 * Initialise la page avec les valeurs du fichier JSON
 */
async function initPage() {
	var data = await getJsonData('../data/data.json');
	var html = '';

	for (var liste_choix in data['Choix']) {
		html += `
        <div class="choix">
            <p class="text-choix">
                ${liste_choix}
            </p>`;
		for (var choix in data['Choix'][liste_choix]) {
			var nom = data['Choix'][liste_choix][choix]['Nom'];
			var id = minimizeTexte(nom);
			var name = minimizeTexte(liste_choix);

			html += `
            <input type="radio" id="option${id}" name="${name}" value="${nom}">
            <label for="option${id}">${nom}</label>`;
		}
		html += `</div>`;
	}
	var box = document.getElementById('box');
	box.innerHTML = html;

	// Tous les bouttons
	var allButtons = document.querySelectorAll('input[type="radio"]');
	// Appelle la fonction 'actualiser()' dès qu'une valeur change
	allButtons.forEach((button) => {
		button.addEventListener('change', actualiser);
	});
}

/**
 * Actualise l'affichage
 */
async function actualiser() {
	var data = await getJsonData('../data/data.json');
	var liste_selection = [];
	for (var liste_choix in data['Choix']) {
        var value = getSelectValue(minimizeTexte(liste_choix));
        if (value == 'no-choice') {
            liste_selection.push(value);
        } else {
            liste_selection.push([liste_choix, value]);
        }
	}

	var result = document.getElementById('result');
	if (liste_selection.includes('no-choice')) {
		result.innerHTML = `Vous n'avez pas selectionné toute les options.`;
	} else {
        var taux_emprunt;
        var note = 0; 
        // Calcul note 
        console.log(liste_selection);
        for (var i = 0; i < liste_selection.length; i++) {
            console.log(i)
            console.log(liste_selection[i]);
            var selection = liste_selection[i]
            if (['Types de vehicules', 'Energie', 'Kilometrage', 'Annee'].includes(selection[0])) {
                for (var j in data['Choix'][selection[0]]) {
                    console.log(data['Choix'][selection[0]][j]['Nom'], selection[1]);
                    if (data['Choix'][selection[0]][j]['Nom'] == selection[1]) {
                        console.log(data['Choix'][selection[0]][j]['Note']);
                        note += data['Choix'][selection[0]][j]['Note'];
                    }
                }	
			}
        }
        // Calcul du taux sans bonus/malus
        for (var i = data['Taux Emprunt'].length - 1; i >= 0; i--) {
            if (note <= data['Taux Emprunt'][i]['Score Vehicules Max']) {
				taux_emprunt = data['Taux Emprunt'][i]['Taux Emprunt'];
			}
        }
        // Calcul du taux final !
        for (var nbr_passagers in data['Choix']['Passagers']) {
            if (data['Choix']['Passagers'][nbr_passagers]['Nom'] == liste_selection[4][1]) {
                taux_emprunt += data['Choix']['Passagers'][nbr_passagers]['Note'];
            }
        }
        // Mise a jour du site 
		result.innerHTML = `Votre taux d'emprunt est : <b>${taux_emprunt.toFixed(2)}</b>`;
	}
}

// Initialise en appelant une premiere fois au debut du code
initPage();
actualiser();
