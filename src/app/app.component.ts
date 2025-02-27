import { Component } from '@angular/core';
import { PlayingCardComponent } from "./components/playing-card/playing-card.component";

@Component({
  selector: 'app-root',
  templateUrl:"./app.component.html",
  styleUrl:"./app.component.css",
  imports: [PlayingCardComponent]
})
export class AppComponent {
}
