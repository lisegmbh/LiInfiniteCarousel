import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LiInfiniteCarouselModule } from 'projects/li-infinite-carousel/src/public_api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LiInfiniteCarouselModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
