import { Component, OnInit } from '@angular/core';
import { IrailService, TrainStation } from './service/irail.service';
import { Observable, filter, map } from 'rxjs';
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
      .pipe(map((r) => this.filterBelgianStations(r.station)));
  }

  private filterBelgianStations(stations: TrainStation[]): TrainStation[] {
    return stations.filter((s) => s.id.startsWith('BE.NMBS.0088'));
  }
}
