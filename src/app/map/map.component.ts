import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { tileLayer, latLng, marker, Marker, Icon, icon } from 'leaflet';
import { TrainStation } from '../service/irail.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnChanges {
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '...',
      }),
    ],
    zoom: 5,
    center: latLng(50.8431806, 4.3835893),
  };

  @Input() trainStations: TrainStation[] = [];
  markers: Marker<any>[] = [];
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      if (propName === 'trainStations') {
        const trainStations = chng.currentValue as TrainStation[];

        console.log(trainStations);
        trainStations.forEach((trainStation) => {
          const trainStationMarker = marker(
            [
              parseFloat(trainStation.locationY),
              parseFloat(trainStation.locationX),
            ],
            {
              icon: icon({
                ...Icon.Default.prototype.options,
                iconUrl: 'assets/marker-icon.png',
                iconRetinaUrl: 'assets/marker-icon-2x.png',
                shadowUrl: 'assets/marker-shadow.png',
              }),
            }
          );
          this.markers.push(trainStationMarker);
        });
      }
    }
  }
}
