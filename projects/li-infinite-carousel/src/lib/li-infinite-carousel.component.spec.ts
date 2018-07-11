import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiInfiniteCarouselComponent } from './li-infinite-carousel.component';

describe('LiInfiniteCarouselComponent', () => {
  let component: LiInfiniteCarouselComponent;
  let fixture: ComponentFixture<LiInfiniteCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiInfiniteCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiInfiniteCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
