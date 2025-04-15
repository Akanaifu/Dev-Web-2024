import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database } from '@angular/fire/database';
import { MachineASousLogic } from './machine-a-sous.logic';

@Component({
  selector: 'app-machine-a-sous',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-a-sous.component.html',
  styleUrls: ['./machine-a-sous.component.css'],
})
export class MachineASousComponent implements OnInit, AfterViewInit {
  private logic: MachineASousLogic;

  constructor() {
    const db = inject(Database);
    this.logic = new MachineASousLogic(db);
  }

  ngOnInit(): void {
    this.logic.fetchFirebaseData();
  }

  ngAfterViewInit(): void {
    this.logic.fetchFirebaseData();
  }

  ngOnDestroy(): void {
    clearInterval(this.logic.intervalId);
  }

  // Getter pour accéder aux propriétés de MachineASousLogic
  get combinations() {
    return this.logic.combinations;
  }

  get highlightCombination() {
    return this.logic.highlightCombination;
  }

  get showTable() {
    return this.logic.showTable;
  }

  // Méthodes pour accéder aux fonctionnalités de MachineASousLogic
  toggleTable(): void {
    this.logic.showTable = !this.logic.showTable;
  }

  getCurrentChiffre(afficheurId: string): number {
    const afficheur = this.logic.afficheurs.find((a) => a.id === afficheurId);
    return afficheur ? afficheur.currentChiffre : 0;
  }
}
