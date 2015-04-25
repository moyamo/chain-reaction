/** Module object, contains all "global" variables.*/
var CReact = {
	// The canvas that the game runs in.
	canvas: undefined,
	// Number of columns of the board.
    columns: 3,
	// Number of rows of the board.
	rows: 5,
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

	// Find out which cell was clicked and notify board
	CReact.canvas.addEventListener('click', function (e) {
		var width = computeCellWidth(CReact.canvas,
				CReact.rows,
				CReact.columns);
		var mouseCoord = {
			x: e.clientX - CReact.canvas.offsetLeft,
			y: e.clientY - CReact.canvas.offsetTop
		};
		cell = getCell(mouseCoord, width);
		if (cell.row < CReact.rows && cell.col < CReact.columns) {
			onCellClick(cell.row, cell.col);
		}
	});
}

/**
 * Called when cell is clicked.
 *
 * Arguments
 *   row - row number of cell clicked
 *   column - column number of cell clicked
 */
function onCellClick(row, column) {
}

/**
 * Returns the cell in which the mouse clicked.
 *
 * Arguments
 *   mouseCoord - the coordinates of the mouse
 *   cellwidth - the width of one cell.
 *
 * Returns Coordinate of cell clicked (e.g. {row: 4, col: 3})
 */
function getCell(mouseCoord, cellwidth)
{
	return {
		row : Math.floor(mouseCoord.y / cellwidth),
		col : Math.floor(mouseCoord.x / cellwidth),
	};
}

/**
 * Calculates the width of a single cell.
 *
 * Arguments
 *   canvas - the canvas on which the cell will be placed
 *   rows - number of rows
 *   columns - number of columns
 */
function computeCellWidth(canvas, rows, columns) {
	var maxWidth = canvas.width / columns;
	var maxHeight = canvas.height / rows;
	return Math.floor(Math.min(maxWidth, maxHeight));
}

/**
 * Draws the gameBoard onto the canvas.
 *
 * Arguments
 *   gameBoard - the board to draw
 *   canvas - the canvas to draw onto
 *   rows - number of rows of the board
 *   columns - number of columns of the board
 */
function drawBoard(gameBoard, canvas, rows, columns) {
	var width = computeCellWidth(canvas, rows, columns);
	var ctx = canvas.getContext("2d");
	ctx.strokeStyle = "#440000";
	ctx.beginPath();
	for (var i = 0; i < rows + 1; ++i) {
		ctx.moveTo(0, i * width);
		ctx.lineTo(columns * width, i * width);
	}
	for (var i = 0; i < columns + 1; ++i) {
		ctx.moveTo(i * width, 0);
		ctx.lineTo(i * width, rows * width);
	}
	var fontSize = 48;
	ctx.font = fontSize.toString() + "px sans";
	for (var i = 0; i < rows; ++i) {
		for (var j = 0; j < columns; ++j) {
			var text = gameBoard[i][j].numAtoms.toString();
			ctx.fillText(text, j * width + fontSize / 2, i * width + fontSize);
		}
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
