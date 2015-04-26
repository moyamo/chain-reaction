/** Module object, contains all "global" variables.*/
var CReact = {
	// The canvas that the game runs in.
	canvas: undefined,
	// Number of columns of the board.
	columns: 6,
	// Number of rows of the board.
	rows: 5,
	// Number of players in the game.
	players: 2,
	// Represents the gameboard.
	gameBoard: undefined,
	// Number of the player whose turn it is.
	turn: 1,
	// Time to wait between animations in milliseconds.
	animationDelay: 700,
	// playerColors[i] is the color of the ith player.
	playerColors : [[0,0,0], [255, 0, 0], [0, 255, 0], [0, 0, 255]],
	// True if an atom can be placed on the board. Used for locking.
	canPlay: true,
	// True if player has made their first move
	hasPlayed: [],
	// True if player has lost the game. (He made a move and lost all atoms)
	hasLost: [],
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
			var threshold;
			var r = (CReact.rows - 1).toString();
			var c = (CReact.columns - 1).toString();
			var is = i.toString();
			var js = j.toString();

			if (["0,0", "0," + c, r + ",0", r+","+c].indexOf(is+","+js) != -1) {
				// corner
				threshold = 2;
			} else if (i == 0 || j == 0 || i == r || j == c) {
				// edge
				threshold = 3;
			} else {
				threshold = 4;
			}
			CReact.gameBoard[i].push(makeCell(0, 0, threshold));

		}
	}
	drawBoard(CReact.gameBoard, CReact.canvas, CReact.rows, CReact.columns);
	CReact.hasPlayed = [];
	CReact.hasLost = [];
	for (var i = 0; i <= CReact.players; ++i) {
		CReact.hasPlayed.push(false);
		CReact.hasLost.push(false);
	}
	CReact.canPlay = true;

	// Find out which cell was clicked and notify board
	CReact.canvas.addEventListener('click', function (e) {
		if (!CReact.canPlay) return;
		CReact.canPlay = false;
		var width = computeCellWidth(CReact.canvas,
				CReact.rows,
				CReact.columns);
		var mouseCoord = {
			x: e.clientX - CReact.canvas.offsetLeft,
			y: e.clientY - CReact.canvas.offsetTop
		};
		var cell = getCell(mouseCoord, width);
		if (cell.row < CReact.rows && cell.col < CReact.columns) {
			onCellClick(cell);
		} else {
			CReact.canPlay = true;
		}
	});
}

/** Updates the hasLost list based on gameBoard */
function updateLoser()
{
	var board = CReact.gameBoard;
	// If they have played they might have lost
	for (var i = 0; i <= CReact.players; ++i) {
		CReact.hasLost[i] = CReact.hasPlayed[i];
	}
	// If they own a square they have not lost
	for (var i = 0; i < CReact.rows; ++i) {
		for (var j = 0; j < CReact.columns; ++j) {
			CReact.hasLost[board[i][j].player] = false;
		}
	}
}

/** Returns the player that has won or zero if there is no winner yet */
function findWinner()
{
	var count = 0;
	var winner = 0;
	for (var i = 1; i <= CReact.players; ++i) {
		if (!CReact.hasLost[i]) {
			winner = i;
			count++;
		}
	}
	if (count == 1) {
		return winner;
	} else {
		return 0;
	}
}

/**
 * Called when cell is clicked.
 *
 * Arguments
 *   cellcoord - Coordinates of cell clicked
 */
function onCellClick(cellcoord) {
	var board = CReact.gameBoard;
	var cell = board[cellcoord.row][cellcoord.col];
	var turn = CReact.turn;
	// If cell is already claimed, no-op;
	if (cell.player == 0 || cell.player == turn) {
		cell.numAtoms += 1;
		cell.player = turn;
		if (!CReact.hasPlayed[turn]) {
			CReact.hasPlayed[turn] = true;
		}
		// Cycle players until we find one who hasn't lost
		do {
			CReact.turn = CReact.turn % CReact.players + 1;
		} while (CReact.hasLost[CReact.turn])

		var draw = function () {
			drawBoard(CReact.gameBoard, CReact.canvas,
					CReact.rows, CReact.columns);
		};
		// Explode and pause for the animation
		var explodeAndWait = function (queue) {
			queue = handleExplosions(queue, CReact.gameBoard);
			window.requestAnimationFrame(draw);
			// Check if there is a winner
			updateLoser(); // See who has lost
			var winner = findWinner();
			if (winner != 0) {
				setTimeout(function() {
					drawWinner(winner);
				}, CReact.animationDelay);
			} else {
				if (queue.length > 0) {
					setTimeout(function() {
						explodeAndWait(queue);
					}, CReact.animationDelay);
				} else {
					CReact.canPlay = true;
				}
			}
		};
		explodeAndWait([cellcoord]);
	} else {
		CReact.canPlay = true;
	}
}

/**
 * Explodes each cell in queue simultaneously if ready and returns a list of
 * cells affected.
 *
 * Arguments
 *   queue - Array of cells to attempt to explode
 *
 * Returns a list of cells whose atoms have increased
 */
function handleExplosions(queue, board)
{
	var newQueue = [];
	var dr = [-1, 1, 0, 0];
	var dc = [0, 0, 1, -1];
	for (var i = 0; i < queue.length; ++i) {
		var r = queue[i].row;
		var c = queue[i].col;
		if (board[r][c].numAtoms < board[r][c].threshold) continue;
		for (var j = 0; j < 4; ++j) {
			var nr = r + dr[j];
			var nc = c + dc[j];
			if (nr >= 0 && nr < CReact.rows && nc >= 0 && nc < CReact.columns) {
				board[nr][nc].numAtoms++;
				board[nr][nc].player = board[r][c].player;
				board[r][c].numAtoms--;
				newQueue.push({row: nr, col: nc});
			}
		}
		if (board[r][c].numAtoms == 0) {
			board[r][c].player = 0;
		}
	}
	return newQueue;
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
 * Clears the board and draws congratulations for the winner.
 *
 * Arguments
 *   winner - the winner
 */
function drawWinner(winner) {
	var canvas = CReact.canvas;
	var ctx = canvas.getContext("2d");
	var width = canvas.width;
	var height = canvas.height;
	var fontSize = Math.floor(width / 7);
	var text = "Player " + winner.toString() + " wins!";
	ctx.font = fontSize.toString() + "px sans";
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = toSolidColor(CReact.playerColors[winner]);
	ctx.fillText(text, 0, height / 2);
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
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = toSolidColor(CReact.playerColors[CReact.turn]);
	ctx.beginPath();
	for (var i = 0; i < rows + 1; ++i) {
		ctx.moveTo(0, i * width);
		ctx.lineTo(columns * width, i * width);
	}
	for (var i = 0; i < columns + 1; ++i) {
		ctx.moveTo(i * width, 0);
		ctx.lineTo(i * width, rows * width);
	}

	ctx.stroke();
	for (var i = 0; i < rows; ++i) {
		for (var j = 0; j < columns; ++j) {
			drawCell(canvas, gameBoard[i][j], j * width, i * width, width);
		}
	}
}

/**
 * Draw the contents of a cell.
 *
 * Arguments
 *   canvas - the canvas to draw on
 *   cell - the cell to draw
 *   x - the x coordinate of the top left of the cell
 *   y - the y coordinate of the top left of the cell
 *   width - the width (and height) of the cell (it is a square)
 */
function drawCell(canvas, cell, x, y, width)
{
	var ctx = canvas.getContext('2d');
	ctx.save();
	var drawCircle = function(x, y, width, colors) {
		var x1 = Math.floor(x),
			y1 = Math.floor(y),
			r1 = Math.floor(width / 4),
			x2 = Math.floor(x + 4*width / 20),
			y2 = Math.floor(y + 4*width / 20),
			r2 = Math.floor(width);
		var radgrad = ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
		radgrad.addColorStop(0, colors[0]);
		radgrad.addColorStop(0.9, colors[1]);
		radgrad.addColorStop(1, colors[2]);
		ctx.fillStyle = radgrad;
		ctx.fillRect(0, 0 , canvas.width, canvas.height);
	}
	// Support 8 atoms just in case
	var offx = [0.5, 0.6, 0.4, 0.5, 0.5, 0.7, 0.4, 0.6];
	var offy = [0.5, 0.4, 0.4, 0.3, 0.4, 0.3, 0.5, 0.2];
	for (var i = 0; i < cell.numAtoms; ++i) {
		drawCircle(x + width *offx[i], y + width *offy[i], width / 5,
				toGradient(CReact.playerColors[cell.player]));
	}
	ctx.restore();
}

/**
 * Creates a cell
 *
 * Arguments:
 *   numAtoms - number of atoms in the cell
 *   player - the player who owns the atoms (zero if unowned)
 *   threshold - maximum number of atoms a cell can hold (will explode)
 */
function makeCell(numAtoms, player, threshold) {
	return {
		numAtoms : numAtoms,
		player : player,
		threshold: threshold
	};
}

/**
 * Takes a triple of rgb values and returns a string prepresenting the color
 *
 * Arguments:
 *   color - an array of 3 rgb values
 *   alpha - optional alpha channel
 */
function toSolidColor(color, alpha) {
	var r = color[0].toString();
	var b = color[1].toString();
	var g = color[2].toString();
	var result;
	if (alpha === undefined) {
		alpha = 255;
	}
		result = "rgba(" + r + "," + b + "," + g + ", " + alpha.toString() + ')';
	return result;
}

/**
 * Takes a triple of rgb values and returns three colors representing a gradient.
 *
 * Arguments:
 *   color - an array of 3 rgb values
 */
function toGradient(color) {
	var result = [];
	result.push(toSolidColor(color));
	var newcolor = [];
	for (var i = 0; i < color.length; ++i) {
		newcolor.push(Math.floor(0.5 * color[i]));
	}
	result.push(toSolidColor(newcolor));
	result.push(toSolidColor(newcolor, 0));
	return result;
}
