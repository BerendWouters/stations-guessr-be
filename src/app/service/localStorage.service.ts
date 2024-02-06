import { Injectable } from '@angular/core';
import { Game } from './game.service';
import { TrainStation } from './irail.service';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  public save(trainStations: TrainStation[]) {
    const json = JSON.stringify(trainStations);
    localStorage.setItem('game.foundstations', json);
  }

  public load(): TrainStation[] | null {
    const json = localStorage.getItem('game.foundstations');
    if (json) {
      return JSON.parse(json);
    }
    return null;
  }
}
