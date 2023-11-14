import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { tileLayer, latLng, marker, Marker, Icon, icon, LatLng } from 'leaflet';
import { TrainStation } from '../service/irail.service';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { distinctUntilChanged, filter, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnChanges {
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
  @Input() trainStations: TrainStation[] = [];
  myControl = new FormControl('', [
    this.existingStationNameValidator(this.trainStations),
  ]);

  markers: Marker<any>[] = [];
  foundStations: TrainStation[] = [];
  constructor(private snackbar: MatSnackBar) {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      if (propName === 'trainStations') {
        const trainStations = chng.currentValue as TrainStation[];
        this.myControl = new FormControl('', [
          this.existingStationNameValidator(trainStations),
        ]);
      }
    }
  }

  displayFn(station: TrainStation): string {
    return station && station.name ? station.name : '';
  }

  ngOnInit() {
    this.myControl.statusChanges
      .pipe(
        filter((s) => s === 'VALID'),
        tap((x) => this.markStationAsFound())
      )
      .subscribe();
  }

  private markStationAsFound(): void {
    const controlValue = this.myControl.value;
    const trainStation = this.trainStations.find((x) =>
      this.matcher(x, controlValue)
    );
    if (!trainStation || this.foundStations.includes(trainStation)) {
      return;
    }
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
    this.foundStations.push(trainStation);
    this.snackbar.open(`You've found ${trainStation?.name}! 🚉`);
    this.myControl.setValue('');
  }

  private matcher(x: TrainStation, controlValue: string | null): unknown {
    return x.name.toLocaleLowerCase() === controlValue?.toLocaleLowerCase();
  }

  private existingStationNameValidator(stations: TrainStation[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const match = stations.find((x) => this.matcher(x, control.value));
      return match ? null : { value: control.value };
    };
  }
  calculatePercentage(currentValue: number, maxValue: number) {
    return (currentValue / maxValue) * 100;
  }
}
