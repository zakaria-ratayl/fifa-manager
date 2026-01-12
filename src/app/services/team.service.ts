import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Team, TeamStats } from '../models/team.model';
import { LocalStorageService } from './local-storage.service';
import { MOCK_TEAM } from '../data/mock-data';

const TEAM_STORAGE_KEY = 'fifa_manager_team';

@Injectable({
    providedIn: 'root'
})
export class TeamService {
    private teamSubject: BehaviorSubject<Team | null>;
    public team$: Observable<Team | null>;

    constructor(private localStorage: LocalStorageService) {
        let savedTeam = this.localStorage.load<Team>(TEAM_STORAGE_KEY);

        // Seed default team if none exists
        if (!savedTeam) {
            savedTeam = MOCK_TEAM;
            this.localStorage.save(TEAM_STORAGE_KEY, savedTeam);
        }

        this.teamSubject = new BehaviorSubject<Team | null>(savedTeam);
        this.team$ = this.teamSubject.asObservable();
    }

    /**
     * Create a new team
     */
    createTeam(name: string, formation: string = '4-3-3'): Team {
        const newTeam: Team = {
            id: this.generateId(),
            name,
            formation,
            players: [],
            stats: {
                matchesPlayed: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsScored: 0,
                goalsConceded: 0
            },
            createdAt: new Date()
        };

        this.updateTeam(newTeam);
        return newTeam;
    }

    /**
     * Get current team
     */
    getTeam(): Team | null {
        return this.teamSubject.value;
    }

    /**
     * Update team data
     */
    updateTeam(team: Team): void {
        this.teamSubject.next(team);
        this.localStorage.save(TEAM_STORAGE_KEY, team);
    }

    /**
     * Update team formation
     */
    updateFormation(formation: string): void {
        const team = this.getTeam();
        if (team) {
            team.formation = formation;
            this.updateTeam(team);
        }
    }

    /**
     * Update team name
     */
    updateTeamName(name: string): void {
        const team = this.getTeam();
        if (team) {
            team.name = name;
            this.updateTeam(team);
        }
    }

    /**
     * Update team stats (after a match)
     */
    updateStats(stats: Partial<TeamStats>): void {
        const team = this.getTeam();
        if (team) {
            team.stats = { ...team.stats, ...stats };
            this.updateTeam(team);
        }
    }

    /**
     * Get team statistics
     */
    getTeamStats(): TeamStats | null {
        const team = this.getTeam();
        return team ? team.stats : null;
    }

    /**
     * Calculate team average rating
     */
    getTeamAverageRating(): number {
        const team = this.getTeam();
        if (!team || team.players.length === 0) {
            return 0;
        }

        const totalRating = team.players.reduce((sum, player) => sum + player.overall, 0);
        return Math.round(totalRating / team.players.length);
    }

    /**
     * Delete team
     */
    deleteTeam(): void {
        this.teamSubject.next(null);
        this.localStorage.remove(TEAM_STORAGE_KEY);
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
