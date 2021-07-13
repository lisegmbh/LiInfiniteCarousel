> :warning: **Unmaintained/Archived blog post example**: This repository contains one of our blog post's demo code. We do not maintain or update this repository. 

# LiInfiniteCarousel

Use LiInfiniteCarousel to create an easy to use carousel which can display many items and cycle through them one by one

## Demo
Demo available on Blitzstack: https://stackblitz.com/edit/liinfinitecarouseldemo

## Features

 - automatically hide next/prev buttons when items fit into container
 - javascript animation using angular animationBuilder
 - cycle through the items by click on button or automatically by timer

## Usage
Simply import LiInfiniteCarouselModule into your module and use \<li-infinite-carousel> and \<ng-template infiniteCarouselItem> tag in your html template

### Example

    <li-infinite-carousel>
		<ng-container *ngFor="let item of demoItems; let i = index">
			<ng-template let-carousel infiniteCarouselItem>
				<div>
					item {{i}}
				</div>
			</ng-template>
		</ng-container>
	</li-infinite-carousel>

## Bindings

|name|type|default value |description|
|----|----|--------------|-----------|
|carouselName|string|some random string|name of the carousel|
|nextControlSvgIcon|string| default icon for next button|svg string|
|prevControlSvgIcon|string| default icon for prev button|svg string|
|nextControlTitle|string|next|specify the title to be used on the next button|
|nextControlTitle|string|prev|specify the title to be used on the prevbutton|
|itemClasses|string|""|specify the classes the individual items shall have|
|cycleTime|number|5000|set the amount of milliseconds to cycle to the next item. Use 0 to disable cycling|
|stopCycleOnClick|boolean|true|if true, the carousel stops cycling when the user clicks inside the container|
|animationTime|number|200|Set how long the amination shall take. Cannot be lower than cycleTime!|

