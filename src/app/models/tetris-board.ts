import {TetrisGrid} from './tetris-grid';
import {TetrisPiece} from './tetris-piece';
import {TetrisColor} from './tetris-color';

export class TetrisBoard {

  constructor(
    public readonly grid: TetrisGrid
  ) {}

  public static createEmptyBoard(nRows: number, nCols:number): TetrisBoard {
    const emptyGrid: TetrisGrid = Array.from({ length: nRows }, () => Array(nCols).fill(0));
    return new TetrisBoard(emptyGrid);
  }

  public get nRows(): number {
    return this.grid.length;
  }

  public get nCols(): number {
    return this.grid[0].length;
  }

  public addPiece(newPiece: TetrisPiece): TetrisBoard {
    if (newPiece.collide(this)) {
      throw new Error('Piece collides with the board');
    }
    const newGrid = this.grid.map(row => [...row]);
    for (let r = 0; r < newPiece.nRows; r++) {
      for (let c = 0; c < newPiece.nCols; c++) {
        const gridPosRow = newPiece.rowPos + r;
        const gridPosCol = newPiece.colPos + c;
        if (gridPosRow >= 0) {
          if (newPiece.grid[r][c] !== TetrisColor.Empty) {
            newGrid[gridPosRow][gridPosCol] = newPiece.grid[r][c];
          }
        }
      }
    }
    return new TetrisBoard(newGrid);
  }

  public equals(other: TetrisBoard): boolean {
    if (this.nRows !== other.nRows || this.nCols !== other.nCols) {
      return false;
    }
    for (let r = 0; r < this.nRows; r++) {
      for (let c = 0; c < this.nCols; c++) {
        if (this.grid[r][c] !== other.grid[r][c]) {
          return false;
        }
      }
    }
    return true;
  }

}
