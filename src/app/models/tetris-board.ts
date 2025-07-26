import {TetrisGrid} from './tetris-grid';
import {TetrisPiece} from './tetris-piece';

export class TetrisBoard {
  private _grid: TetrisGrid;

  constructor(grid: TetrisGrid) {
    this._grid = grid;
  }

  public static createEmptyBoard(nrows: number, ncols:number): TetrisBoard {
    return new TetrisBoard(TetrisGrid.createEmpty(nrows, ncols));
  }

  public clone(): TetrisBoard {
    return new TetrisBoard(this.grid.clone());
  }

  public get grid(): TetrisGrid {
    return this._grid;
  }

  public get nrows() {
    return this._grid.nrows;
  }

  public get ncols() {
    return this._grid.ncols;
  }

  public addPiece(newPiece: TetrisPiece): TetrisBoard {
    if (newPiece.collide(this)) {
      throw new Error('Piece collides with the board');
    }
    const newGrid = this.grid.clone();
    const [rowPos, colPos] = [newPiece.rowPos, newPiece.colPos];
    for (let row = 0; row < newPiece.grid.nrows; row++) {
      for (let col = 0; col < newPiece.grid.ncols; col++) {
        const color = newPiece.grid.getColor(row, col);
        if (color !== 0) { // Assuming 0 is the empty color
          newGrid.setColor(rowPos + row, colPos + col, color);
        }
      }
    }
    return new TetrisBoard(newGrid);
  }


}
