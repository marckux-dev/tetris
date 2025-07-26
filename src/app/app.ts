import {Component, computed, inject, Signal} from '@angular/core';
import {Board} from './components/board/board';
import {GameEngine} from './services/game-engine';

@Component({
  selector: 'app-root',
  imports: [Board],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'tetris';
  engine = inject(GameEngine);
  mainGrid = computed(() => this.engine.renderedBoard().grid.grid);
  nextPieceGrid = computed(() => this.engine.nextPieceBoard().grid.grid);

  onKeyDown($event: KeyboardEvent) {
    switch ($event.key) {
      case 'Enter':
        this.engine.start();
        break;
      case 'Escape':
        this.engine.stop();
        break;
      case 'ArrowLeft':
        this.engine.moveCurrentPieceLeft();
        break;
      case 'ArrowRight':
        this.engine.moveCurrentPieceRight();
        break;
      case 'ArrowDown':
        this.engine.dropPiece();
        break;
      case 'ArrowUp':
        this.engine.rotateCurrentPiece();
        break;
    }
  }


}
