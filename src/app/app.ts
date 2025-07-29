import {Component, computed, inject, Signal} from '@angular/core';
import {Board} from './components/board/board';
import {GameEngine} from './services/game-engine';
import {ScoreBox} from './components/score-box/score-box';

@Component({
  selector: 'app-root',
  imports: [Board, ScoreBox],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'tetris';
  engine = inject(GameEngine);
  mainGrid = computed(() => this.engine.renderedBoard().grid);
  nextPieceGrid = computed(() => this.engine.nextPieceBoard().grid);
  currentScore = computed(() => this.engine.currentScore());
  highScore = computed(() => this.engine.highScore());
  currentLevel = computed(() => this.engine.level());
  isGameOver = computed(() => this.engine.isGameOver());

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
