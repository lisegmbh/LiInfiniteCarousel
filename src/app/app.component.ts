import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit{
  public demoItems: Array<any> = new Array<any>(6).fill('').map(this.getRandomColor);

  public ngOnInit(): void {
  }
  
  public getRandomColor(): string {
	  return "#"+((1<<24)*Math.random()|0).toString(16);
  }
}
