import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { Player, Position } from '../../models/player.model';
import { ratingValidator, ageValidator } from '../../validators/custom-validators';

@Component({
    selector: 'app-players',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './players.component.html',
    styleUrl: './players.component.scss'
})
export class PlayersComponent implements OnInit, OnDestroy {
    players: Player[] = [];
    playerForm: FormGroup;
    positions = Object.values(Position);
    showAddForm = false;
    filterPosition: Position | 'ALL' = 'ALL';
    private destroy$ = new Subject<void>();

    constructor(
        private playerService: PlayerService,
        private fb: FormBuilder
    ) {
        this.playerForm = this.createPlayerForm();
    }

    ngOnInit(): void {
        this.playerService.players$
            .pipe(takeUntil(this.destroy$))
            .subscribe(players => {
                this.players = players;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    createPlayerForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            position: [Position.MID, Validators.required],
            age: [25, [Validators.required, ageValidator()]],
            jerseyNumber: [null],
            skills: this.fb.group({
                pace: [70, [Validators.required, ratingValidator()]],
                shooting: [70, [Validators.required, ratingValidator()]],
                passing: [70, [Validators.required, ratingValidator()]],
                dribbling: [70, [Validators.required, ratingValidator()]],
                defending: [70, [Validators.required, ratingValidator()]],
                physical: [70, [Validators.required, ratingValidator()]]
            })
        });
    }

    toggleAddForm(): void {
        this.showAddForm = !this.showAddForm;
        if (!this.showAddForm) {
            this.playerForm.reset(this.createPlayerForm().value);
        }
    }

    onSubmit(): void {
        if (this.playerForm.valid) {
            const playerData = this.playerForm.value;
            this.playerService.addPlayer(playerData);
            this.playerForm.reset(this.createPlayerForm().value);
            this.showAddForm = false;
        }
    }

    deletePlayer(id: string): void {
        if (confirm('Are you sure you want to delete this player?')) {
            this.playerService.deletePlayer(id);
        }
    }

    get filteredPlayers(): Player[] {
        if (this.filterPosition === 'ALL') {
            return this.players;
        }
        return this.players.filter(p => p.position === this.filterPosition);
    }

    getRatingColor(rating: number): string {
        if (rating >= 80) return '#10b981';
        if (rating >= 70) return '#3b82f6';
        if (rating >= 60) return '#f59e0b';
        return '#ef4444';
    }
}
