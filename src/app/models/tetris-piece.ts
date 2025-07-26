import {TetrisGrid} from './tetris-grid';
import {TetrisColor} from './tetris-color';
import {TetrisBoard} from './tetris-board';

export enum PieceType {
  O = 'O',
  I = 'I',
  S = 'S',
  Z = 'Z',
  L = 'L',
  J = 'J',
  T = 'T'
}

interface Piece {
  shape: (0 | 1)[][];
  color: TetrisColor;
}

const PIECES: Record<PieceType, Piece> = {
  [PieceType.O]: {shape: [[1,1],[1,1]], color: TetrisColor.O },
  [PieceType.I]: {shape: [[1,1,1,1]], color: TetrisColor.I },
  [PieceType.S]: {shape: [[0,1,1], [1,1,0]], color: TetrisColor.S },
  [PieceType.Z]: {shape: [[1,1,0], [0,1,1]], color: TetrisColor.Z },
  [PieceType.L]: {shape: [[0,0,1], [1,1,1]], color: TetrisColor.L },
  [PieceType.J]: {shape: [[1,0,0], [1,1,1]], color: TetrisColor.J },
  [PieceType.T]: {shape: [[1,1,1], [0,1,0]], color: TetrisColor.T },
}

export class TetrisPiece {
  private _grid: TetrisGrid;
  private _rowPos: number = 0;
  private _colPos: number = 0;

  constructor(grid: TetrisGrid, rowPos: number, colPos: number) {
    this._grid = grid;
    this._rowPos = rowPos;
    this._colPos = colPos;
  }

  public static create(pieceType: PieceType, rowPos: number, colPos: number): TetrisPiece {
    const { shape, color } = PIECES[pieceType];
    return new TetrisPiece(TetrisGrid.create(shape, color), rowPos, colPos);
  }

  public get rowPos(): number {
    return this._rowPos;
  }

  public get colPos(): number {
    return this._colPos;
  }

  public get grid(): TetrisGrid {
    return this._grid;
  }

  public collide(board: TetrisBoard): boolean {
    const [rowPos, colPos] = [this._rowPos, this._colPos];
    if (
      colPos < 0 ||
      colPos + this._grid.ncols > board.ncols ||
      rowPos + this._grid.nrows > board.nrows
    )
      return true;
    const shape = this._grid.shape;
    const boardShape = board.grid.shape;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[0].length; j++) {
        if (shape[i][j] && boardShape[i + rowPos][j + colPos]) return true;
      }
    }
    return false;
  }

  moved(rowPos: number, colPos: number) {
    const newPiece = new TetrisPiece(this._grid, rowPos, colPos);
    return newPiece;
  }

  rotated(): TetrisPiece {
    const bottomRow = this._rowPos + this._grid.nrows - 1;
    const newGrid = this._grid.rotated();
    const newRowPos = bottomRow - newGrid.nrows + 1;
    return new TetrisPiece(this._grid.rotated(), newRowPos, this._colPos);
  }


}

