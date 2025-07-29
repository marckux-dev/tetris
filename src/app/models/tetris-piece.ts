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

  constructor(
    public readonly grid: TetrisGrid,
    public readonly rowPos: number,
    public readonly colPos: number
  ){}

  public static create(pieceType: PieceType, rowPos: number, colPos: number): TetrisPiece {
    const { shape, color } = PIECES[pieceType];
    const grid: TetrisGrid = shape.map(row => row.map(cell => cell ? color : TetrisColor.Empty));
    return new TetrisPiece(grid, rowPos, colPos);
  }

  public get nRows(): number {
    return this.grid.length;
  }

  public get nCols(): number {
    return this.grid[0].length;
  }

  public collide(board: TetrisBoard): boolean {
    const [rowPos, colPos] = [this.rowPos, this.colPos];
    if (
      colPos < 0 ||
      colPos + this.nCols > board.nCols ||
      rowPos + this.nRows > board.nRows
    )
      return true;
    return this.grid.some(
      (row, r) => row.some(
        (cell, c) => cell !== TetrisColor.Empty
          && rowPos + r >= 0
          && board.grid[rowPos + r][colPos + c] !== TetrisColor.Empty
      )
    );
  }

  moved(rowPos: number, colPos: number) {
    const newPiece = new TetrisPiece(this.grid, rowPos, colPos);
    return newPiece;
  }

  rotated(): TetrisPiece {
    const bottomRow = this.rowPos + this.nRows - 1;
    const newGrid = this.grid[0].map((_, colIndex) => this.grid.map(row => row[colIndex])).reverse();
    const newRowPos = bottomRow - newGrid.length + 1;
    return new TetrisPiece(newGrid, newRowPos, this.colPos);
  }
}

