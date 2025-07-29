import {Component, input, Input} from '@angular/core';
import {ZerofillPipe} from '../../pipes/zerofill-pipe';
import {UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-score-box',
  imports: [
    ZerofillPipe,
    UpperCasePipe
  ],
  templateUrl: './score-box.html',
  styleUrl: './score-box.css'
})
export class ScoreBox {
  @Input() label: string = '';
  @Input() digits: number = 4;
  score = input.required<number>();
}
