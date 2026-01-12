import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { Player, Position } from '../../models/player.model';
import { ratingValidator, ageValidator, formValidator } from '../../validators/custom-validators';

@Component({
    selector: 'app-player-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './player-detail.component.html',
    styleUrl: './player-detail.component.scss'
})
export class PlayerDetailComponent implements OnInit, OnDestroy {
    player: Player | undefined;
    playerForm: FormGroup;
    positions = Object.values(Position);
    isEditing = false;
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private playerService: PlayerService,
        private fb: FormBuilder
    ) {
        this.playerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            position: ['', Validators.required],
            age: [0, [Validators.required, ageValidator()]],
            jerseyNumber: [null],
            form: [5, [Validators.required, formValidator()]],
            skills: this.fb.group({
                pace: [0, [Validators.required, ratingValidator()]],
                shooting: [0, [Validators.required, ratingValidator()]],
                passing: [0, [Validators.required, ratingValidator()]],
                dribbling: [0, [Validators.required, ratingValidator()]],
                defending: [0, [Validators.required, ratingValidator()]],
                physical: [0, [Validators.required, ratingValidator()]]
            })
        });
    }

    ngOnInit(): void {
        const playerId = this.route.snapshot.paramMap.get('id');
        if (playerId) {
            this.loadPlayer(playerId);

            // Subscribe to player updates
            this.playerService.players$
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.loadPlayer(playerId);
                });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadPlayer(id: string): void {
        this.player = this.playerService.getPlayerById(id);
        if (this.player) {
            this.playerForm.patchValue(this.player);
        }
    }

    toggleEdit(): void {
        this.isEditing = !this.isEditing;
        if (!this.isEditing && this.player) {
            this.playerForm.patchValue(this.player);
        }
    }

    onSubmit(): void {
        if (this.playerForm.valid && this.player) {
            this.playerService.updatePlayer(this.player.id, this.playerForm.value);
            this.isEditing = false;
        }
    }

    deletePlayer(): void {
        if (this.player && confirm('Are you sure you want to delete this player?')) {
            this.playerService.deletePlayer(this.player.id);
            this.router.navigate(['/players']);
        }
    }

    getRatingColor(rating: number): string {
        if (rating >= 80) return '#10b981';
        if (rating >= 70) return '#3b82f6';
        if (rating >= 60) return '#f59e0b';
        return '#ef4444';
    }

    getSkillArray(): { name: string; value: number }[] {
        if (!this.player) return [];
        return [
            { name: 'Pace', value: this.player.skills.pace },
            { name: 'Shooting', value: this.player.skills.shooting },
            { name: 'Passing', value: this.player.skills.passing },
            { name: 'Dribbling', value: this.player.skills.dribbling },
            { name: 'Defending', value: this.player.skills.defending },
            { name: 'Physical', value: this.player.skills.physical }
        ];
    }
}
