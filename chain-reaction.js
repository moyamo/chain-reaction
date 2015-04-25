/** Module object, contains all "global" variables.*/
var CReact = {
	// The canvas that the game runs in.
	canvas: undefined,
	// Number of columns of the board.
    columns: 8,
	// Number of rows of the board.
	rows: 8,
	// Number of players in the game.
	players: 2,
	// Represents the gameboard.
	gameBoard: undefined,
};

/**
 * Loads the game into a canvas.
 *
 * Arguments:
 *   canvasId - the ID of the canvas to load the game into
 */
function loadGame(canvasId) {
	CReact.canvas = document.getElementById(canvasId);
	gameBoard = [];
	for (var i = 0; i < CReact.rows; ++i) {
		gameBoard.push([]);
		for (var j = 0; j < CReact.columns; ++j) {
			gameBoard[i].push(makeCell(0, 0));
		}
	}
}

/**
 * Creates a cell
 *
 * Arguments:
 *   numAtoms - number of atoms in the cell
 *   player - the player who owns the atoms (zero if unowned)
 */
function makeCell(numAtoms, player) {
	return {
		numAtoms : numAtoms,
		player : player,
	};
}
