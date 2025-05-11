import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { RouletteNetComponentLogic } from './roulette-net.component.logic';
import { FirebaseSendService } from '../machine-a-sous/export_firebase.logic';
import { CommonModule } from '@angular/common';
import { Database } from '@angular/fire/database';
import { NewGameService } from '../machine-a-sous/new-game.service';


@Component({
    selector: 'app-roulette-net',
    imports: [CommonModule],
    templateUrl: './roulette-net.component.html',
    styleUrl: './roulette-net.component.css'
})

export class RouletteNetComponent {
[x: string]: any;
    private firebaseSendService: FirebaseSendService;
    logic:RouletteNetComponentLogic;


    constructor(private newGameService : NewGameService) {
    const db = inject(Database);
    this.logic = new RouletteNetComponentLogic(db, newGameService);
    
    this.firebaseSendService = new FirebaseSendService(db); // Injection manuelle
    }
    
    ngOnInit(this:any): void {
        this.logic.fetchFirebaseData();
    }

}

