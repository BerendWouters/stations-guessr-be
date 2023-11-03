import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapComponent } from './map/map.component';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, MapComponent],
  imports: [BrowserModule, LeafletModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
