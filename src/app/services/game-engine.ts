import {effect, Injectable, signal, WritableSignal} from '@angular/core';
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
  private QUEUE_SIZE = 20; // Size of the piece queue
  private dropInterval = 1000; // Time in milliseconds before the piece drops down one row


  /*
    * The game board is a 2D array of TetrisColor, representing the current state of the game.
   */
  private gameBoard: TetrisBoard = TetrisBoard.createEmptyBoard(this.NROWS, this.NCOLS);

  private loadHighScore(): number {
    const storedHighScore = localStorage.getItem('highScore');
    return storedHighScore? parseInt(storedHighScore, 10) : 0;
  }

  /*
    * The renderedBoard is a signal that holds the current state of the game board.
    * It is used to trigger change detection in Angular when the board is updated.
    * This allows the UI to reactively update when the game state changes.
   */
  public renderedBoard: WritableSignal<TetrisBoard> = signal(TetrisBoard.createEmptyBoard(this.NROWS, this.NCOLS));
  public nextPieceBoard: WritableSignal<TetrisBoard> = signal(TetrisBoard.createEmptyBoard(4, 4)); // Placeholder for next piece display
  public currentScore: WritableSignal<number> = signal(0); // Current score of the game
  public highScore: WritableSignal<number> = signal(this.loadHighScore()); // Maximum score
  public level: WritableSignal<number> = signal(1);
  public isGameOver: WritableSignal<boolean> = signal(false);


  private persistHighStorage =  effect(
    () => {
      const score = this.currentScore();
      const highScore = this.highScore();
      if (score > highScore) {
        this.highScore.update(() => score);
        localStorage.setItem('highScore', score.toString());
      }
    }
  );

  public start() {
    // Initialize the game board
    this.gameBoard = TetrisBoard.createEmptyBoard(this.NROWS, this.NCOLS);
    this.pieceQueue = this.createPieceQueue();
    this.isRunning = true;
    this.currentPiece = null; // Reset the current piece
    this.timerFPS = Date.now();
    this.timerUPS = Date.now();
    this.dropInterval = 1000; // Reset drop interval
    this.level.set(1);
    this.currentScore.set(0);
    this.isGameOver.set(false);
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
    for (let i = 0; i < this.QUEUE_SIZE; i++) { // Create a queue
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
      this.currentPiece = this.pieceQueue.shift()!;
      if (this.pieceQueue.length === 0) {
        this.pieceQueue = this.createPieceQueue();
        this.increaseLevel();
      }
      const nextPiece = this.pieceQueue[0];
      const pos = nextPiece.grid[0][0] === TetrisColor.I? 0 : 1
      this.nextPieceBoard.set(TetrisBoard.createEmptyBoard(4, 4).addPiece(this.pieceQueue[0].moved(1, pos)));
      this.timerFPS = Date.now();
      if (this.currentPiece.collide(this.gameBoard)) {
        this.isGameOver.set(true);
        this.isRunning = false;
        return;
      }
    }

    if (Date.now() - this.timerUPS >= this.dropInterval) {
      this.dropPiece();
    }
  }

  private increaseLevel() {
    this.level.update(level => level + 1);
    this.dropInterval = Math.max(1000 - (this.level() - 1) * 100, 100); // Decrease drop interval with each level, minimum 200ms
    console.log(`Level increased to ${this.level()}. Drop interval is now ${this.dropInterval}ms.`);
  }

  public dropPiece() {
    if (!this.isRunning) return;
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
    for (let row = 0; row < this.gameBoard.nRows; row++) {
      if (this.gameBoard.grid[row].every(color => color !== TetrisColor.Empty)) {
        completedRows.push(row);
      }
    }

    if (completedRows.length > 0) {
      // Remove completed rows and shift the remaining rows down
      const newGrid = this.gameBoard.grid.slice();
      for (const row of completedRows) {
        newGrid.splice(row, 1); // Remove the completed row
        newGrid.unshift(Array(this.gameBoard.nCols).fill(TetrisColor.Empty)); // Add an empty row at the top
      }
      this.gameBoard = new TetrisBoard(newGrid);
      // Update the score based on the number of rows removed
      const scoreIncrement = Math.pow(2, completedRows.length - 1); // Example scoring system
      this.currentScore.update(score => score + scoreIncrement);
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
    const kicks = [0, -1, 1, -2, 2, -3, 3]; // Tetris kick offsets for rotation
    for (const kick of kicks) {
      const adjustedPiece = newPiece.moved(newPiece.rowPos, newPiece.colPos + kick);
      if (!adjustedPiece.collide(this.gameBoard)) {
        this.currentPiece = adjustedPiece;
        return; // Exit after a successful rotation
      }
    }
  }

  public render() {
    const newBoard = this.currentPiece ? this.gameBoard.addPiece(this.currentPiece) : this.gameBoard;
    if (!this.renderedBoard().equals(newBoard)) {
      this.renderedBoard.update(() => newBoard);
    }
  }

  public stop() {
    this.isRunning = false;
    this.isGameOver.set(true);
  }

}
