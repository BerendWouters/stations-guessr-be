import { Component, OnInit } from '@angular/core';
import { IrailService, TrainStation } from './service/irail.service';
import { Observable, map } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'stations-guessr-be';
  stations$ = new Observable<TrainStation[]>();

  constructor(private irailService: IrailService) {}
  ngOnInit() {
    this.stations$ = this.irailService
      .getStations()
      .pipe(map((r) => r.station));
  }
}
