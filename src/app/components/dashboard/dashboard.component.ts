import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TeamService } from '../../services/team.service';
import { PlayerService } from '../../services/player.service';
import { MatchService } from '../../services/match.service';
import { Team } from '../../models/team.model';
import { Player } from '../../models/player.model';
import { Match } from '../../models/match.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
    team: Team | null = null;
    topPlayers: Player[] = [];
    upcomingMatches: Match[] = [];
    teamAverageRating = 0;
    private destroy$ = new Subject<void>();

    constructor(
        private teamService: TeamService,
        private playerService: PlayerService,
        private matchService: MatchService
    ) { }

    ngOnInit(): void {
        // Subscribe to team updates
        this.teamService.team$
            .pipe(takeUntil(this.destroy$))
            .subscribe(team => {
                this.team = team;
                this.teamAverageRating = this.teamService.getTeamAverageRating();
            });

        // Subscribe to players updates
        this.playerService.players$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.topPlayers = this.playerService.getTopPlayers(3);
                this.teamAverageRating = this.teamService.getTeamAverageRating();
            });

        // Subscribe to matches updates
        this.matchService.matches$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.upcomingMatches = this.matchService.getUpcomingMatches().slice(0, 3);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get winPercentage(): number {
        if (!this.team || this.team.stats.matchesPlayed === 0) return 0;
        return Math.round((this.team.stats.wins / this.team.stats.matchesPlayed) * 100);
    }

    get hasTeam(): boolean {
        return this.team !== null;
    }

    getRatingColor(rating: number): string {
        if (rating >= 80) return '#10b981'; // green
        if (rating >= 70) return '#3b82f6'; // blue
        if (rating >= 60) return '#f59e0b'; // orange
        return '#ef4444'; // red
    }
}
