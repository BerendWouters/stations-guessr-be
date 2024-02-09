import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  tileLayer,
  latLng,
  marker,
  Marker,
  Icon,
  icon,
  LatLng,
  polyline,
} from 'leaflet';
import {
  ConnectionResponse,
  IrailService,
  TrainStation,
} from '../service/irail.service';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { distinctUntilChanged, filter, map, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Game, GameStateStore } from '../service/game.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {
  center = latLng(50.8431806, 4.3835893);
  zoom = 8;
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution:
          'Map data from <a href="openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
    ],
    zoom: 5,
    center: latLng(50.8431806, 4.3835893),
  };
  trainStations: TrainStation[] = [];
  stationControl = new FormControl('', [
    this.existingStationNameValidator(this.trainStations),
  ]);

  markers: any[] = [];
  foundStations: TrainStation[] = [];
  constructor(
    private snackbar: MatSnackBar,
    public gameStateStore: GameStateStore,
    private iRailService: IrailService
  ) {
    this.gameStateStore.init();
    this.gameStateStore.state$
      .pipe(
        tap((s) => {
          this.trainStations = s.trainStations;
          this.stationControl = new FormControl('', [
            this.existingStationNameValidator(s.trainStations),
          ]);
          this.stationControl.statusChanges
            .pipe(
              filter((s) => s === 'VALID'),
              tap((x) => this.play())
            )
            .subscribe();
        })
      )
      .subscribe();
  }

  displayFn(station: TrainStation): string {
    return station && station.name ? station.name : '';
  }

  ngOnInit() {
    this.gameStateStore.state$
      .pipe(
        map((s) => s.foundStations),
        distinctUntilChanged(),
        tap((s) => this.appendStations(s))
      )
      .subscribe();
  }

  play(): void {
    const controlValue = this.stationControl.value;
    if (controlValue) {
      this.gameStateStore.play(controlValue);
    }
  }
  private appendStations(trainStations: TrainStation[]) {
    this.markers = [];
    trainStations.forEach((trainStation) => {
      const coords = latLng(
        parseFloat(trainStation.locationY),
        parseFloat(trainStation.locationX)
      );
      const trainStationMarker = marker(coords, {
        title: trainStation.name,
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
        }),
      });

      this.iRailService
        .getLiveBoard(trainStation.id)
        .pipe(
          tap((l) => {
            const connections = l.departures.departure.map((d) => d.station);
            connections.forEach((connectionStation) => {
              const id = trainStation.name;
              this.iRailService
                .getConnection(id, connectionStation)
                .pipe(
                  tap((c) => {
                    this.renderConnections(trainStation, c);
                  })
                )
                .subscribe();
            });
          })
        )
        .subscribe();

      this.markers.push(trainStationMarker);
      this.center = coords;
      this.zoom = 13;
      this.snackbar.open(`You've found ${trainStation?.name}! 🚉`);
      this.stationControl.setValue('');
    });
  }

  private existingStationNameValidator(stations: TrainStation[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const match = stations.find((x) =>
        this.gameStateStore.matcher(x, control.value)
      );
      return match ? null : { value: control.value };
    };
  }
  calculatePercentage(currentValue: number, maxValue: number) {
    return (currentValue / maxValue) * 100;
  }

  renderConnections(
    trainStation: TrainStation,
    connection: ConnectionResponse
  ) {
    if (!connection.connection[0]?.departure?.stops) {
      return;
    }
    const allCoords = [
      latLng(
        parseFloat(trainStation.locationY),
        parseFloat(trainStation.locationX)
      ),
      ...connection.connection[0].departure.stops.stop.map((s) => {
        return latLng(
          parseFloat(s.stationinfo.locationY),
          parseFloat(s.stationinfo.locationX)
        );
      }),
    ];
    const lat = polyline(allCoords, {
      color:
        '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
    });
    this.markers.push(lat);
  }
}
