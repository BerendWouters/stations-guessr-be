import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { tileLayer, latLng, marker, Marker, Icon, icon, LatLng } from 'leaflet';
import { TrainStation } from '../service/irail.service';
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

  markers: Marker<any>[] = [];
  foundStations: TrainStation[] = [];
  constructor(
    private snackbar: MatSnackBar,
    public gameStateStore: GameStateStore
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
      this.stationControl.setValue('');
    }
  }
  private appendStations(trainStations: TrainStation[]) {
    console.log(trainStations);
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

      this.markers.push(trainStationMarker);
      this.center = coords;
      this.zoom = 13;
      this.snackbar.open(`You've found ${trainStation?.name}! 🚉`);
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
}
