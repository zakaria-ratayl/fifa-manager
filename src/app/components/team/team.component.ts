import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team.model';
import { Player, Position } from '../../models/player.model';

@Component({
    selector: 'app-team',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './team.component.html',
    styleUrl: './team.component.scss'
})
export class TeamComponent implements OnInit, OnDestroy {
    team: Team | null = null;
    teamForm: FormGroup;
    formations = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2'];
    startingXI: (Player | null)[] = [];
    private destroy$ = new Subject<void>();

    // Perspective-adjusted coordinates (Top %, Left %)
    // Adjusted for a 3D trapezoid view where top is narrower visually, but CSS positioning is 2D absolute.
    // We strive for visual balance on a perspective pitch.
    private FORMATION_POSITIONS: { [key: string]: { top: string, left: string }[] } = {
        '4-3-3': [
            { top: '85%', left: '50%' }, // GK
            { top: '65%', left: '20%' }, { top: '65%', left: '40%' }, { top: '65%', left: '60%' }, { top: '65%', left: '80%' }, // DEF (LB, CB, CB, RB)
            { top: '45%', left: '30%' }, { top: '45%', left: '50%' }, { top: '45%', left: '70%' }, // MID (CM, CDM, CM)
            { top: '25%', left: '20%' }, { top: '20%', left: '50%' }, { top: '25%', left: '80%' }  // FWD (LW, ST, RW)
        ],
        '4-4-2': [
            { top: '85%', left: '50%' }, // GK
            { top: '65%', left: '20%' }, { top: '65%', left: '40%' }, { top: '65%', left: '60%' }, { top: '65%', left: '80%' }, // DEF
            { top: '45%', left: '20%' }, { top: '45%', left: '40%' }, { top: '45%', left: '60%' }, { top: '45%', left: '80%' }, // MID
            { top: '20%', left: '35%' }, { top: '20%', left: '65%' }  // FWD
        ],
        '4-2-3-1': [
            { top: '85%', left: '50%' }, // GK
            { top: '65%', left: '20%' }, { top: '65%', left: '40%' }, { top: '65%', left: '60%' }, { top: '65%', left: '80%' }, // DEF
            { top: '50%', left: '40%' }, { top: '50%', left: '60%' }, // CDM
            { top: '35%', left: '20%' }, { top: '35%', left: '50%' }, { top: '35%', left: '80%' }, // AM
            { top: '15%', left: '50%' }  // ST
        ],
        '3-5-2': [
            { top: '85%', left: '50%' }, // GK
            { top: '70%', left: '30%' }, { top: '70%', left: '50%' }, { top: '70%', left: '70%' }, // DEF (CB)
            { top: '45%', left: '15%' }, { top: '50%', left: '35%' }, { top: '50%', left: '65%' }, { top: '45%', left: '85%' }, // WB/MID
            { top: '40%', left: '50%' }, // CAM
            { top: '20%', left: '35%' }, { top: '20%', left: '65%' }  // FWD
        ],
        '5-3-2': [
            { top: '85%', left: '50%' }, // GK
            { top: '65%', left: '15%' }, { top: '65%', left: '30%' }, { top: '65%', left: '50%' }, { top: '65%', left: '70%' }, { top: '65%', left: '85%' }, // DEF
            { top: '45%', left: '30%' }, { top: '45%', left: '50%' }, { top: '45%', left: '70%' }, // MID
            { top: '20%', left: '35%' }, { top: '20%', left: '65%' }  // FWD
        ]
    };

    constructor(
        private teamService: TeamService,
        private fb: FormBuilder
    ) {
        this.teamForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            formation: ['4-3-3', Validators.required]
        });
    }

    ngOnInit(): void {
        this.teamService.team$
            .pipe(takeUntil(this.destroy$))
            .subscribe(team => {
                this.team = team;
                if (team) {
                    this.teamForm.patchValue({
                        name: team.name,
                        formation: team.formation
                    });
                    this.updateStartingXI(team);
                }
            });

        // Listen for formation changes to animate/update positions immediately
        this.teamForm.get('formation')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(formation => {
                if (this.team) {
                    // Optimistic update for visual responsiveness
                    this.team.formation = formation;
                    this.updateStartingXI(this.team);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit(): void {
        if (this.teamForm.valid) {
            const { name, formation } = this.teamForm.value;
            if (this.team) {
                this.teamService.updateTeamName(name);
                this.teamService.updateFormation(formation);
            } else {
                this.teamService.createTeam(name, formation);
            }
        }
    }

    /**
     * Determines the optimal 11 players for the pitch based on ratings and positions.
     */
    updateStartingXI(team: Team): void {
        // Simple algorithm: Get best GK, best Defenders, best Mids, best Attackers
        // This is a simplification. A real app would let users drag and drop.

        const allPlayers = [...team.players].sort((a, b) => b.overall - a.overall);
        const formationStr = team.formation || '4-3-3';
        // formation string parsing "4-3-3" -> [4, 3, 3] field players + 1 GK
        const parts = formationStr.split('-').map(Number);
        const defCount = parts[0];
        const midCount = parts[1];
        const fwdCount = parts[2] || 0; // Handle 4-4-2 (2 parts) logic if needed, but usually 3 parts. 
        // 4-4-2 is 3 parts technically in our list? No, standard is 3 parts. 4-4-2 is 3 numbers? No, "4-4-2".

        // Let's just map roles strictly
        const xi: (Player | null)[] = [];

        // 1. Goalkeeper
        const gk = allPlayers.find(p => p.position === Position.GK);
        xi.push(gk || null);

        // 2. Defenders
        const defenders = allPlayers.filter(p => p.position === Position.DEF)
            .slice(0, defCount);
        xi.push(...defenders);
        // Fill empty def slots if not enough dedicated defenders (fallback to others)
        while (xi.length < 1 + defCount) xi.push(allPlayers.find(p => !xi.includes(p) && p.position !== Position.GK) || null);

        // 3. Midfielders
        const mids = allPlayers.filter(p => p.position === Position.MID)
            .slice(0, midCount);
        xi.push(...mids);
        while (xi.length < 1 + defCount + midCount) xi.push(allPlayers.find(p => !xi.includes(p) && p.position !== Position.GK) || null);

        // 4. Forwards
        const fwds = allPlayers.filter(p => p.position === Position.FWD)
            .slice(0, fwdCount);
        xi.push(...fwds);

        // Fill remaining spaces with ANY best remaining players
        while (xi.length < 11) {
            const bestRemaining = allPlayers.find(p => !xi.includes(p));
            xi.push(bestRemaining || null);
        }

        this.startingXI = xi;
    }

    getPlayerStyle(index: number): { [key: string]: string } {
        const formation = this.team?.formation || '4-3-3';
        const positions = this.FORMATION_POSITIONS[formation] || this.FORMATION_POSITIONS['4-3-3'];
        // Safety check
        const pos = positions[index] || { top: '50%', left: '50%' };

        return {
            'top': pos.top,
            'left': pos.left
        };
    }

    get averageRating(): number {
        return this.teamService.getTeamAverageRating();
    }

    get hasTeam(): boolean {
        return this.team !== null;
    }
}
