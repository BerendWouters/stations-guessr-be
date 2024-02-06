import { Component, OnInit } from '@angular/core';
import { IrailService, TrainStation } from './service/irail.service';
import { Observable, filter, map } from 'rxjs';
import { Game } from './service/game.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'stations-guessr-be';
  stations$ = new Observable<TrainStation[]>();

  constructor() {}
  ngOnInit() {}
}
