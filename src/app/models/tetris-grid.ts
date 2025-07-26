import {TetrisColor} from './tetris-color';

export class TetrisGrid {
  private _grid: TetrisColor[][]

  constructor(grid: TetrisColor[][]) {
    this._grid = grid;
  }

  public static create(shape: number[][], color: TetrisColor): TetrisGrid {
    return new TetrisGrid(shape.map(row => row.map(item => item? color: TetrisColor.Empty)));
  }

  public static createEmpty(nrows: number, ncols: number): TetrisGrid {
    const shape = Array.from({length: nrows}, () => Array(ncols).fill(0));
    return new TetrisGrid(shape);
  }

  public clone(): TetrisGrid {
    return new TetrisGrid(this._grid.map(row => [...row]));
  }

  public get grid(): TetrisColor[][] {
    return this._grid;
  }

  public get nrows(): number {
    return this._grid.length;
  }

  public get ncols(): number {
    return this._grid[0].length;
  }

  public get shape(): (0 | 1)[][] {
    return this._grid.map(row => row.map( item => item? 1 : 0))
  }

  public getColor(row: number, column: number): TetrisColor {
    return this._grid[row][column];
  }

  public setColor(row: number, column: number, color: TetrisColor): void {
    this._grid[row][column] = color;
  }

  public rotated(): TetrisGrid {
    const newGrid = TetrisGrid.createEmpty(this.ncols, this.nrows);
    for (let row = 0; row < this.nrows; row++) {
      for (let col = 0; col < this.ncols; col++) {
        const color = this.getColor(row, col);
        newGrid.setColor(col, this.nrows - row - 1 ,color)
      }
    }
    return newGrid;
  }

  public rotate(): void {
    this._grid = this.rotated().grid;
  }

}
