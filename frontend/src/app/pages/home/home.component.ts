import { Component } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavigationBarComponent } from '../../component/navigation-bar/navigation-bar.component'

@Component({
  selector: 'app-home',
  imports: [NavigationBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent {

}
