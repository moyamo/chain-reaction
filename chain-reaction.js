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
}
