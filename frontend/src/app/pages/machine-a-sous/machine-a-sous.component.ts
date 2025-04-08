import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-machine-a-sous',
  standalone: true,
  imports: [CommonModule], // Ajoutez CommonModule ici
  templateUrl: './machine-a-sous.component.html',
  styleUrls: ['./machine-a-sous.component.css'],
})
export class MachineASousComponent {
  showTable = false;

  combinations = [
    {
      title: 'Méga jackpot',
      combination: '777',
      multiplier: 100,
      example: '777',
    },
    { title: 'Jackpot', combination: 'xxx', multiplier: 10, example: '222' },
    {
      title: 'Suite',
      combination: 'xyz/zyx',
      multiplier: 5,
      example: '123 / 321',
    },
    { title: 'Sandwich', combination: 'xyx', multiplier: 2, example: '121' },
    {
      title: '(Im)pair',
      combination: 'ace/bdf',
      multiplier: 2,
      example: '111 / 222',
    },
  ];

  toggleTable() {
    this.showTable = !this.showTable;
  }
}
