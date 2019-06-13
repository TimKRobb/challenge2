var entry = ""; // le tableau qui contient les nombres entrés
var newEntry = true; // le booléen qui indique si on repart de zéro quand on appuie sur une touche

var calculator = document.getElementById("Calculatrice");

var entryArea = document.createElement("div");
entryArea.setAttribute("id", "entryArea");
calculator.appendChild(entryArea);

var createButton = function(id,text) {
	var button = document.createElement("div");
	button.setAttribute("class","button");
	button.setAttribute("id",id);
	button.innerHTML = text;
	button.addEventListener("click",function() {
		buttonPressed(text);
	});
	calculator.appendChild(button);
}

createButton("button1","1");
createButton("button2","2");
createButton("button3","3");
createButton("buttonPlus","+");

createButton("button4","4");
createButton("button5","5");
createButton("button6","6");
createButton("buttonMinus","-");

createButton("button7","7");
createButton("button8","8");
createButton("button9","9");
createButton("buttonMult","×");

createButton("button0","0");
createButton("buttonOpenBracket","(");
createButton("buttonCloseBracket",")");
createButton("buttonDiv","÷");

createButton("buttonDel","←");
createButton("buttonPeriod",".");
createButton("buttonEquals","=");


var updateEntryArea = function() {

if ( entry.length == 0 ) {
		entryArea.innerHTML = 0;
	} else if ( entry.length > 27 ) {
		entryArea.innerHTML = entry.substr(entry.length-28);
	} else {
		entryArea.innerHTML = entry;
	}

}

var buttonPressed = function(b) {

	if (entry=="ERROR" || (newEntry && ! "+-×÷".includes(b))) {
		entry="";
	}

	newEntry = false;

	if ("0123456789.+-×÷()".includes(b)) {
		entry += b;
	} else if (b=="←") {
		entry = entry.substr(0,entry.length-1);
	} else if (b=="=") {
		entry = resolveEntry(entry);
		newEntry=true;
	}

	updateEntryArea();

}

/*var displayError = function() {
	entry = "ERROR";
	updateEntryArea();
}

*/var resolveEntry = function(e) {

	// La fonction qu'on appelle quand on appuie sur le bouton =
	// Elle s'appelle elle-même quand il y a des parenthèses ou des opérations multiples,
	// afin de résoudre le contenu des parenthèses ou les opérations multiples récursivement

	// Si l'entrée est un nombre, le renvoyer tel quel

	if ( !isNaN(Number(e)) ) {
		return e;
	}

	// Si l'entrée est vide, renvoyer 0

	if ( e == "0" ) {
		return "0";
	}

	// Si l'entrée contient "ERROR", renvoyer "ERROR"

	if ( e.search("ERROR") > -1 ) {
		return "ERROR";
	}

	// Si le premier caractère de l'entrée est une parenthèse fermante, renvoyer "ERROR"

	if (e[0] == ")") {
		return "ERROR";
	}

	// Si le nombre de parenthèses fermantes est différent de celui des parenthèses ouvrantes,
	// renvoyer "ERROR"

	var findParOpen = e.match(/\(/g);
	var findParClose = e.match(/\)/g);
	if ( ! findParOpen ) {
		findParOpen = [];
	}
	if ( ! findParClose ) {
		findParClose = [];
	}

	if ( findParOpen.length != findParClose.length ) {
		return "ERROR";
	}

	// A ce stade, on sait que le nombre de ( est égal au nombre de ), qu'il y en ait ou pas.
	// Il s'agit maintenant de résoudre le contenu des parenthèses les plus extérieures,
	// et de concaténer le résultat au reste de l'entrée

	var p1 = e.search(/\(/);

	if ( p1 > -1 ) {

		var p2 = 0;
		var parCount = 0;

		for (var i=p1+1; i<e.length && !p2; i++) {

			if ( e.substr(i,1) == "(" ) {
				parCount++;
			} else if ( e.substr(i,1) == ")" ) {
				if (parCount>0) {
					parCount--;
				} else {
					p2 = i;
				}
			}

		}

		var e1 = e.substr(0,p1);
		var e2 = e.substr(p1+1,p2-(p1+1));
		var e3 = e.substr(p2+1);

		if (!"+-×÷)".includes(e1[e1.length-1]) && e1 != "") {
			e1 += "×";
		}

		if (!"+-×÷(".includes(e3[0]) && e3 != "") {
			e3 = "×" + e3;
		}

		return resolveEntry(e1+resolveEntry(e2)+e3);
	}

	// A ce stade, on a une entrée qui ne contient pas de parenthèses, mais forcément au moins une opération.
	// Il s'agit donc de les résoudre dans l'ordre dans lequel ils ont été entrés.

	var num1 = 0,			// Le premier nombre à évaluer
		num2 = 0,			// Le second nombre à évaluer
		operation = "",		// L'opération à exécuter
		pointer1 = 0,		// Pointe sur la position de l'opération
		pointer2 = 0,		// Pointe sur la position de ce qui suit le second nombre (potentiellement rien)
		result = 0;			// Le résultat à renvoyer

	// Si le premier caractère à tester est un -, considérer qu'il fait partie du nombre qui va suivre

	if (e[0] == "-") {
		pointer1++;
	}

	while (!"+-×÷()".includes(e[pointer1])) {	// Identifier la position de la première opération ou
		pointer1++;								// de la première parenthèse. A noter qu'il y en a
	}											// forcément une, puisque à ce stade ce n'est pas un nombre

	num1 = Number(e.substr(0,pointer1));	// Extraire le premier nombre de l'entrée
	if (isNaN(num1) && operation == "-") {
		num1 = 0;
	}

	operation = e.substr(pointer1++,1);		// Extraire l'opération à effectuer

	pointer2 = pointer1;					// Initialiser le pointeur

	// Si le caractère qui suit l'opération identifiée est un -, considérer qu'il fait partie du nombre

	if (e[pointer2] == "-") {
		pointer2++;
	}

	do {									// Identifier la fin du second nombre
		pointer2++;
	} while ( pointer2 < e.length && !"+-×÷()".includes(e[pointer2]) )

	num2 = Number(e.substr(pointer1,pointer2-pointer1));		// Extraire le second nombre de l'entrée

	switch (operation) {
		case "+": result = num1 + num2; break;
		case "-": result = num1 - num2; break;
		case "×": result = num1 * num2; break;
		case "÷": if (num2 == 0) { return "ERROR"; } else { result = num1 / num2; }
	}

	return resolveEntry(result + e.substr(pointer2));

}

updateEntryArea();