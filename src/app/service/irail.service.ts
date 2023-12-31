import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IrailService {
  private baseUrl = 'https://api.irail.be';
  constructor(private httpClient: HttpClient) {}

  getStations(): Observable<TrainStationResponse> {
    return this.httpClient.get<TrainStationResponse>(
      `${this.baseUrl}/stations/?format=json&lang=nl`
    );
  }
}

export interface TrainStationResponse {
  version: string;
  timestamp: string;
  station: TrainStation[];
}

export interface TrainStation {
  locationX: string;
  locationY: string;
  id: string;
  '@id': string;
  name: string;
  standardName: string;
}
