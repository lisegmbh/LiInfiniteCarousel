import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LiInfiniteCarouselComponent, LiInfiniteCarouselItemDirective, LiSafeHtmlPipe } from './li-infinite-carousel.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule
  ],
  declarations: [
    LiInfiniteCarouselComponent,
    LiInfiniteCarouselItemDirective,
    LiSafeHtmlPipe
  ],
  exports: [
    LiInfiniteCarouselComponent,
    LiInfiniteCarouselItemDirective
  ]
})
export class LiInfiniteCarouselModule { }
