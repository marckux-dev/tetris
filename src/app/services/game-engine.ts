import {Injectable, signal, WritableSignal} from '@angular/core';
import {TetrisColor} from '../models/tetris-color';
import {TetrisBoard} from '../models/tetris-board';
import {PieceType, TetrisPiece} from '../models/tetris-piece';

@Injectable({
  providedIn: 'root'
})
export class GameEngine {
  private NROWS = 20;
  private NCOLS = 10;
  private UPS = 600; // Updates per second
  private deltaUPS = 1000 / this.UPS; // Time in milliseconds between each update call
  private FPS = 60; // Render method calls per second
  private deltaFPS = 1000 / this.FPS; // Time in milliseconds between each render call
  private isRunning = false;
  private pieceQueue: TetrisPiece[] = [];
  private currentPiece: TetrisPiece | null = null;
  private timerFPS = new Date().getTime();
  private timerUPS = new Date().getTime();
  private dropInterval = 1000; // Time in milliseconds before the piece drops down one row

  /*
    * The game board is a 2D array of TetrisColor, representing the current state of the game.
   */
  private gameBoard: TetrisBoard = TetrisBoard.createEmptyBoard(this.NROWS, this.NCOLS);

  /*
    * The renderedBoard is a signal that holds the current state of the game board.
    * It is used to trigger change detection in Angular when the board is updated.
    * This allows the UI to reactively update when the game state changes.
   */
  public renderedBoard: WritableSignal<TetrisBoard> = signal(TetrisBoard.createEmptyBoard(this.NROWS, this.NCOLS));
  public nextPieceBoard: WritableSignal<TetrisBoard> = signal(TetrisBoard.createEmptyBoard(4, 4)); // Placeholder for next piece display

  public start() {
    // Initialize the game board
    this.gameBoard = TetrisBoard.createEmptyBoard(this.NROWS, this.NCOLS);
    this.pieceQueue = this.createPieceQueue();
    this.isRunning = true;
    this.gameLoop();
  }

  private createPieceQueue(): TetrisPiece[] {
    // Create a queue of Tetris pieces to be used in the game
    const cumulativeProbabilities: Record<PieceType, number> = {
      [PieceType.O]: 0.15,
      [PieceType.I]: 0.25,
      [PieceType.S]: 0.40,
      [PieceType.Z]: 0.55,
      [PieceType.L]: 0.70,
      [PieceType.J]: 0.85,
      [PieceType.T]: 1.0
    };
    const pieces: TetrisPiece[] = [];
    const pieceTypes = Object.values(PieceType);
    for (let i = 0; i < 100; i++) { // Create a queue of 100 pieces
      const randomValue = Math.random();
      for (const pieceType of pieceTypes) {
        if (randomValue <= cumulativeProbabilities[pieceType]) {
          pieces.push(TetrisPiece.create(pieceType as PieceType, 0, Math.floor(this.NCOLS / 2) - 1));
          break;
        }
      }
    }
    return pieces;
  }

  public async gameLoop() {
    while (this.isRunning) {
      this.update();
      if (Date.now() - this.timerFPS >= this.deltaFPS) {
        this.render();
        this.timerFPS = Date.now();
      }
      // Wait for the next frame
      await new Promise(resolve => setTimeout(resolve, this.deltaUPS));
    }
  }

  public update() {
    if (!this.isRunning) return;

    // Check if there is a current piece, if not, get the next piece from the queue
    if (!this.currentPiece) {
      if (this.pieceQueue.length > 0) {
        this.currentPiece = this.pieceQueue.shift()!;
        const nextPiece = this.pieceQueue[0].moved(0, 0);
        this.nextPieceBoard.update(() => TetrisBoard.createEmptyBoard(4,4).addPiece(nextPiece) );
      } else {
        // If no pieces are left in the queue, stop the game
        this.stop();
        return;
      }
    }

    if (Date.now() - this.timerUPS >= this.dropInterval) {
      this.dropPiece();
    }
  }

  public dropPiece() {
    if (!this.currentPiece) return;
    const newPiece = this.currentPiece.moved(this.currentPiece.rowPos + 1, this.currentPiece.colPos);
    if (newPiece.collide(this.gameBoard)) {
      this.gameBoard = this.gameBoard.addPiece(this.currentPiece);
      this.currentPiece = null;
      this.removeCompletedRows();
    } else {
      this.currentPiece = newPiece;
    }
    this.timerUPS = Date.now();
  }

  public removeCompletedRows() {
    // Check for completed rows and remove them
    const completedRows: number[] = [];
    for (let row = 0; row < this.gameBoard.nrows; row++) {
      if (this.gameBoard.grid.grid[row].every(color => color !== TetrisColor.Empty)) {
        completedRows.push(row);
      }
    }

    if (completedRows.length > 0) {
      // Remove completed rows and shift the remaining rows down
      const newGrid = this.gameBoard.grid.clone();
      for (const row of completedRows) {
        newGrid.grid.splice(row, 1); // Remove the completed row
        newGrid.grid.unshift(Array(this.gameBoard.ncols).fill(TetrisColor.Empty)); // Add an empty row at the top
      }
      this.gameBoard = new TetrisBoard(newGrid);
    }
  }

  public moveCurrentPieceLeft() {
    if (!this.currentPiece) return;
    const newPiece = this.currentPiece.moved(this.currentPiece.rowPos, this.currentPiece.colPos - 1);
    if (!newPiece.collide(this.gameBoard)) {
      this.currentPiece = newPiece;
    }
  }

  public moveCurrentPieceRight() {
    if (!this.currentPiece) return;
    const newPiece = this.currentPiece.moved(this.currentPiece.rowPos, this.currentPiece.colPos + 1);
    if (!newPiece.collide(this.gameBoard)) {
      this.currentPiece = newPiece;
    }
  }

  public rotateCurrentPiece() {
    if (!this.currentPiece) return;
    const newPiece = this.currentPiece.rotated();
    if (!newPiece.collide(this.gameBoard)) {
      this.currentPiece = newPiece;
    }
  }

  public render() {
    // Update the rendered board signal with the current game board state
    if (this.currentPiece) {
      // If there is a current piece, add it to the game board
      const newBoard = this.gameBoard.addPiece(this.currentPiece);
      this.renderedBoard.set(newBoard);
    } else {
      this.renderedBoard.set(this.gameBoard);
    }
  }

  public stop() {
    this.isRunning = false;
  }

}
