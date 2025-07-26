import {Component, input, Signal} from '@angular/core';
import {TetrisColor} from '../../models/tetris-color';

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.html',
  styleUrl: './board.css'
})

export class Board {
  grid = input.required<Signal<TetrisColor[][]>>();
}
