import {Component, input, Signal} from '@angular/core';
import {TetrisGrid} from '../../models/tetris-grid';

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.html',
  styleUrl: './board.css'
})

export class Board {
  grid = input.required<TetrisGrid>();
}
