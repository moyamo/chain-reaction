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
	CReact.gameBoard = [];
	for (var i = 0; i < CReact.rows; ++i) {
		CReact.gameBoard.push([]);
		for (var j = 0; j < CReact.columns; ++j) {
			CReact.gameBoard[i].push(makeCell(0, 0));
		}
	}
	drawBoard(CReact.gameBoard, CReact.canvas, CReact.rows, CReact.columns);
}

function drawBoard(gameboard, canvas, rows, columns) {
	var maxWidth = canvas.width / columns;
	var maxHeight = canvas.height / rows;
	var width = Math.floor(Math.min(maxWidth, maxHeight));
	var ctx = canvas.getContext("2d");
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	for (var i = 0; i < rows + 1; ++i) {
		ctx.moveTo(0, i * width);
		ctx.lineTo(rows * width, i * width);
	}
	for (var i = 0; i < columns + 1; ++i) {
		ctx.moveTo(i * width, 0);
		ctx.lineTo(i * width, rows * width);
	}
	ctx.stroke();
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
