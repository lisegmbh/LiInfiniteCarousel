import { Component, OnInit, HostListener, ViewChild, Input, ViewChildren, ContentChildren, QueryList, ElementRef, AfterViewInit, Renderer2, Directive, TemplateRef, Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AnimationBuilder, style, animate, AnimationFactory, AnimationPlayer } from '@angular/animations';
import { Observable, Subject, fromEvent, interval, empty } from 'rxjs';
import { takeUntil, debounceTime, startWith, switchMap, takeWhile, throttleTime } from 'rxjs/operators';
import { prevArrowIconSvg, nextArrowIconSvg } from './assets/assets';


@Pipe({ name: 'liSafeHTML' })
export class LiSafeHtmlPipe {
	constructor(private sanitizer: DomSanitizer) { }

	transform(html) {
		return this.sanitizer.bypassSecurityTrustHtml(html);
	}
}

@Directive({ selector: 'ng-template[infiniteCarouselItem]' })

export class LiInfiniteCarouselItemDirective {
	public identifier = Math.ceil(Math.random() * Date.now());
	constructor(public templateRef: TemplateRef<any>) { }
}

@Component({
	selector: 'li-infinite-carousel',
	template: `
<div class="li-infinite-carousel">
  <div class="viewport" [ngClass]="{'controls-enabled': showControls}" mouseWheel (mouseWheelUp)="prev()" (mouseWheelDown)="next()" #viewPort>
    <div class="infinite-carousel-items" #itemContainer>
      <ng-template ngFor [ngForOf]="itemsArray" let-item [ngForTrackBy]="trackByFn">
        <div [id]="carouselName + '-' + item.identifier" [class]="'infinite-carousel-item '+ itemClasses" #itemRef>
          <ng-template [ngTemplateOutlet]="item.templateRef" [ngTemplateOutletContext]="{$implicit: this}"></ng-template>
        </div>
      </ng-template>
    </div>
  </div>
  <div class="controls" *ngIf="showControls">
    <button class="li-control-prev" type="button" [attr.title]="prevControlTitle" (click)="next()" [innerHTML]="prevControlSvgIcon | liSafeHTML"></button>
    <button class="li-control-next" type="button" [attr.title]="nextControlTitle" (click)="prev()" [innerHTML]="nextControlSvgIcon | liSafeHTML"></button>
  </div>
</div>
  `,
	styles: [`
    .li-infinite-carousel { display: block; width: 100%; position: relative; }
    .li-infinite-carousel .viewport { overflow: hidden;	display: flex; width: 100%; }
    .li-infinite-carousel .infinite-carousel-items { display: block; width: 100%; overflow-x: visible; white-space: nowrap; }
    .li-infinite-carousel .infinite-carousel-items .infinite-carousel-item { display: inline-block; }
    .li-infinite-carousel .controls .li-control-prev { position: absolute; left: 20px; top: calc(50% - 20px); background-color: transparent; opacity: 0.5; border: none; cursor: pointer; }
    .li-infinite-carousel .controls .li-control-next { position: absolute; right: 20px; top: calc(50% - 20px); background-color: transparent; opacity: 0.5; border: none; cursor: pointer; }
    `],
	exportAs: 'liInfiniteCarousel'
})
export class LiInfiniteCarouselComponent implements OnInit, AfterViewInit {

	@Input()
	public carouselName: string = Date.now().toString();

	@Input()
	public nextControlSvgIcon: string = nextArrowIconSvg;
	@Input()
	public prevControlSvgIcon: string = prevArrowIconSvg;

	@Input()
	public nextControlTitle: string = "Next";
	@Input()
	public prevControlTitle: string = "Prev";

	@Input()
	public itemClasses: string = ""; // classes to apply at every carouselItemContainer

	@Input()
	public cycleTime: number = 5000; // time in milliseconds to go forward automatically. Set to 0 to disable cycling!
	@Input()
	public stopCycleOnClick: boolean = true; // if true, the cycle stops if the user clicks any element in the carousel
	@Input()
	public animationTime: number = 200; // millisoconds the next/prev animation shall take

	@ContentChildren(LiInfiniteCarouselItemDirective)
	public items: QueryList<LiInfiniteCarouselItemDirective>;

	@ViewChild('viewPort')
	public viewPort: ElementRef; // the viewPort ElementRef
	@ViewChild('itemContainer')
	public itemContainer: ElementRef; // the container of carouselItems. Will grow the more items are there
	@ViewChildren('itemRef')
	public itemRefs: QueryList<ElementRef>; // just an elementRef to the carouselItemContainers

	@HostListener('click', ['$event.target'])
	public onClick(): void {
		if (this.stopCycleOnClick) {
			this.stopCycle();
		}
	}
	public showControls: boolean = false; // display next/prev button or not
	public itemsArray: Array<LiInfiniteCarouselItemDirective> = new Array();
	private onDestroy = new Subject<void>();
	private currentTranslateValue: number = 0;
	private cycleActive: boolean = true;
	private translateXMultiplier: number = 1;
	private cycleSubject = new Subject<number>();
	private onButtonClick = new Subject<() => void>();

	constructor(private renderer: Renderer2, private animationBuilder: AnimationBuilder) { }

	public ngOnInit(): void {
		fromEvent(window, "resize")
			.pipe(
				takeUntil(this.onDestroy),
				debounceTime(500)
			).subscribe(() => {
				this.updateDisplayControls();
				this.updateItems().subscribe(() => {
					this.updateTranslateXValue();
				});
			});
	}

	public ngAfterViewInit(): void {
		setTimeout(() => {
			this.itemsArray = this.items.toArray();
			setTimeout(() => {
				this.updateItems().subscribe(() => {
					this.updateTranslateXValue();
				});
			});
		});

		this.items.changes
			.pipe(
				takeUntil(this.onDestroy)
			).subscribe(() => {
				this.updateItems().subscribe(() => {
					this.updateTranslateXValue();
				});
			}) // update items when amount of items changes

		this.cycleSubject
			.pipe(
				startWith(this.cycleTime),
				switchMap(ms => {
					console.debug(`InfiniteCarousel: cycleInterval changed to ${ms} milliseconds`);
					if (ms > 0) {
						if (ms < this.animationTime) {
							console.error(`InfiniteCarousel: Cycletime cannot be higher than animationTime! CycleTime is: ${this.cycleTime}, animationTime is: ${this.animationTime}`)
						}
						return interval(Math.max(this.cycleTime, this.animationTime))
					} else {
						return empty();
					}

				}),
				takeWhile(() => this.cycleActive),
				takeUntil(this.onDestroy)
			).subscribe(idx => {
				this.next();
			});

		this.onButtonClick
			.pipe(
				throttleTime(this.animationTime) // throttle the action, so we sont have glitchy animations when user clicks to fast
			).subscribe(fn => fn());
	}

	ngOnDestroy(): void {
		this.onDestroy.next();
		this.onDestroy.complete();
	}

	trackByFn(index: number, item: LiInfiniteCarouselItemDirective): any {
		return item.identifier;
	}

	/**
	 * moves the carousel one step to the left
	 */
	public next(): void {
		if (this.showControls) { // only available when there are more items than fitting in the viewPort
			this.onButtonClick.next(() => {
				const animationPlayer = this.createSlideAnimation(false);
				animationPlayer.onDone(() => {
					const firstElem = this.itemsArray.shift();
					this.itemsArray.push(firstElem!);
					animationPlayer.destroy();
				});
				animationPlayer.play();
			});
		}
	}

	/**
	 * move the carousel one step to the right
	 */
	public prev(): void {
		if (this.showControls) { // only available when there are more items than fitting in the viewPort
			this.onButtonClick.next(() => {
				const animationPlayer = this.createSlideAnimation(true);
				animationPlayer.onDone(() => {
					const lastElem = this.itemsArray.pop();
					this.itemsArray.unshift(lastElem!);
					animationPlayer.destroy();
				})
				animationPlayer.play();
			});
		}
	}

	/**
	 * stops the cycling of items
	 */
	public stopCycle(): void {
		this.cycleActive = false;
	}

	/**
	 * updates the item Index Array
	 * Very creepy function with 3 timeouts. Maybe any refactorings using ChangedetectorRef possible? 
	 */
	private updateItems(): Observable<boolean> {
		return new Observable<boolean>(obs => {
			this.cycleSubject.next(0);
			this.updateDisplayControls(); // because the displaycontrols affect the container width, we need to refresh it before updating the array
			setTimeout(() => {
				this.createItemArray(this.items);
				setTimeout(() => {
					this.updateDisplayControls(); // after creation of array we must refresh controls again, because we could have more or less elements than before
					setTimeout(() => {
						if (this.cycleActive && this.showControls) {
							this.cycleSubject.next(this.cycleTime);
						}
						obs.next(true)
						obs.complete();
					});
				});
			});
		});
	}

	/**
	 * returns the width of one carouselItem.
	 */
	private getCarouselItemWidth(): number {
		return this.itemRefs.first ? this.itemRefs.first.nativeElement.offsetWidth : 0;
	}

	/**
	 * returns the width of the carouselItemContainer
	 */
	private getCarouselItemContainerWidth(): number {
		return this.viewPort.nativeElement.offsetWidth;
	}

	/**
	 * creates the indexArray from the CarouselItem's queryList
	 * @param items
	 */
	private createItemArray(items: QueryList<LiInfiniteCarouselItemDirective>): void {
		const fittingItemAmount = Math.floor(this.getCarouselItemContainerWidth() / this.getCarouselItemWidth());
		if (fittingItemAmount < items.length) { // items are larger than container
			this.translateXMultiplier = -1;
			if (fittingItemAmount + 1 === items.length) {
				this.itemsArray = [...items.toArray(), ...items.toArray()]; // double the array. Otherwise we would have a gap while cycling
			} else {
				this.itemsArray = items.toArray();
			}
		} else {
			this.itemsArray = items.toArray();
			this.translateXMultiplier = 0;
		}
	}

    /**
     * updates the translateX Style of the carousel itemContainer
     */
	private updateTranslateXValue(): void {
		this.renderer.setStyle(this.itemContainer.nativeElement, "transform", `translateX(${Math.ceil(this.getCarouselItemWidth() * this.translateXMultiplier)}px)`);
	}

	/**
	 * uses animationBuilder to create an animation
	 * @param forward
	 */
	private createSlideAnimation(forward: boolean): AnimationPlayer {
		return this.animationBuilder.build([style({
			transform: `translateX(${this.getCarouselItemWidth() * this.translateXMultiplier}px)`
		}), animate(this.animationTime, style({
			transform: `translateX(${this.getCarouselItemWidth() * this.translateXMultiplier + this.getCarouselItemWidth() * (forward ? 1 : -1)}px)`
		}))]).create(this.itemContainer.nativeElement);
	}

	/**
	 * calculates wether the controls shall be shown or not
	 */
	private updateDisplayControls(): void {
		this.showControls = this.itemContainer.nativeElement.scrollWidth > this.viewPort.nativeElement.offsetWidth;
	}

}
