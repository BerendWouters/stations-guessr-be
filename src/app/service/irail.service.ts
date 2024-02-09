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

  getLiveBoard(id: string): Observable<LiveboardResponse> {
    return this.httpClient.get<LiveboardResponse>(
      `${this.baseUrl}/liveboard/?id=${id}&format=json&lang=nl`
    );
  }

  getConnection(
    startId: string,
    endId: string
  ): Observable<ConnectionResponse> {
    return this.httpClient.get<ConnectionResponse>(
      `${this.baseUrl}/connections?from=${startId}&to=${endId}&timesel=departure&typeoftransport=trains&format=json`
    );
  }
}
export interface ConnectionResponse {
  connection: [{ departure: { stops: Stops } }];
}

export interface Stops {
  number: number;
  stop: Stop[];
}

export interface Stop {
  station: string;
  stationinfo: TrainStation;
}

export interface TrainStationResponse {
  version: string;
  timestamp: string;
  station: TrainStation[];
}

export interface LiveboardResponse {
  number: number;
  departures: {
    departure: Departure[];
  };
}

export interface Departure {
  station: string;
  stationInfo: TrainStation;
  departureConnection: string;
}
export interface TrainStation {
  locationX: string;
  locationY: string;
  id: string;
  '@id': string;
  name: string;
  standardName: string;
}
