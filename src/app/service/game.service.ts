import { Injectable } from '@angular/core';
import { IrailService, TrainStation } from './irail.service';
import { Observable, map, tap } from 'rxjs';
import { Store } from 'rxjs-observable-store';
import { LocalStorageService } from './localStorage.service';

@Injectable({ providedIn: 'root' })
export class GameStateStore extends Store<Game> {
  constructor(
    private irailService: IrailService,
    private localStorageService: LocalStorageService
  ) {
    super(new Game());
  }

  init(): void {
    this.irailService
      .getStations()
      .pipe(
        map((r) => this.filterBelgianStations(r.station)),
        tap((r) => {
          this.setState({
            ...this.state,
            trainStations: r,
          });

          const foundStations = this.localStorageService.load();

          if (foundStations) {
            this.setState({
              ...this.state,
              foundStations: foundStations,
            });
          }
        })
      )
      .subscribe();
  }

  private filterBelgianStations(stations: TrainStation[]): TrainStation[] {
    return stations.filter((s) => s.id.startsWith('BE.NMBS.0088'));
  }

  matcher(x: TrainStation, controlValue: string | null): unknown {
    return x.name.toLocaleLowerCase() === controlValue?.toLocaleLowerCase();
  }

  play(value: string) {
    const trainStation = this.state.trainStations.find((x) =>
      this.matcher(x, value)
    );
    if (!trainStation || this.state.foundStations.includes(trainStation)) {
      return;
    }
    this.setState({
      ...this.state,
      foundStations: [...this.state.foundStations, trainStation],
    });
    this.localStorageService.save(this.state.foundStations);
    return trainStation;
  }
}

export class Game {
  trainStations: TrainStation[] = [];
  foundStations: TrainStation[] = [];
}
