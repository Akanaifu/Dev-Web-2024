import {Component} from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Menu positioning
 */
@Component({
  selector: 'navigation-bar',
  templateUrl: 'navigation-bar.component.html',
  imports: [MatButtonModule, MatMenuModule],
})
export class NavigationBarComponent {}