import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Match, MatchStatus, MatchScore } from '../models/match.model';
import { LocalStorageService } from './local-storage.service';
import { TeamService } from './team.service';
import { PlayerService } from './player.service';
import { MOCK_MATCHES } from '../data/mock-data';

const MATCHES_STORAGE_KEY = 'fifa_manager_matches';

@Injectable({
    providedIn: 'root'
})
export class MatchService {
    private matchesSubject: BehaviorSubject<Match[]>;
    public matches$: Observable<Match[]>;

    constructor(
        private localStorage: LocalStorageService,
        private teamService: TeamService,
        private playerService: PlayerService
    ) {
        let savedMatches = this.localStorage.load<Match[]>(MATCHES_STORAGE_KEY);

        // Seed default matches if none exist
        if (!savedMatches || savedMatches.length === 0) {
            savedMatches = MOCK_MATCHES;
            this.localStorage.save(MATCHES_STORAGE_KEY, savedMatches);
        }

        this.matchesSubject = new BehaviorSubject<Match[]>(savedMatches || []);
        this.matches$ = this.matchesSubject.asObservable();
    }

    /**
     * Get all matches
     */
    getMatches(): Match[] {
        return this.matchesSubject.value;
    }

    /**
     * Get match by ID
     */
    getMatchById(id: string): Match | undefined {
        return this.matchesSubject.value.find(match => match.id === id);
    }

    /**
     * Get upcoming matches
     */
    getUpcomingMatches(): Match[] {
        return this.matchesSubject.value
            .filter(match => match.status === MatchStatus.SCHEDULED)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    /**
     * Get completed matches
     */
    getCompletedMatches(): Match[] {
        return this.matchesSubject.value
            .filter(match => match.status === MatchStatus.COMPLETED)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    /**
     * Schedule a new match
     */
    scheduleMatch(awayTeam: string, date: Date, venue?: string): Match {
        const team = this.teamService.getTeam();
        if (!team) {
            throw new Error('No team created yet');
        }

        const newMatch: Match = {
            id: this.generateId(),
            homeTeam: team.name,
            awayTeam,
            score: { home: 0, away: 0 },
            date,
            status: MatchStatus.SCHEDULED,
            venue: venue || 'Home Stadium'
        };

        const matches = [...this.matchesSubject.value, newMatch];
        this.updateMatches(matches);

        return newMatch;
    }

    /**
     * Simulate a match
     */
    simulateMatch(matchId: string): Match {
        const match = this.getMatchById(matchId);
        if (!match) {
            throw new Error('Match not found');
        }

        if (match.status === MatchStatus.COMPLETED) {
            throw new Error('Match already completed');
        }

        // Calculate team strength
        const teamRating = this.teamService.getTeamAverageRating();
        const opponentRating = this.generateOpponentRating();

        // Simulate score based on team ratings
        const score = this.calculateMatchScore(teamRating, opponentRating);

        // Update match
        match.score = score;
        match.status = MatchStatus.COMPLETED;

        // Update team stats
        this.updateTeamStatsAfterMatch(score);

        // Update player forms based on result
        this.updatePlayerForms(score);

        // Save updated match
        const matches = this.matchesSubject.value.map(m =>
            m.id === matchId ? match : m
        );
        this.updateMatches(matches);

        return match;
    }

    /**
     * Delete match
     */
    deleteMatch(id: string): void {
        const matches = this.matchesSubject.value.filter(match => match.id !== id);
        this.updateMatches(matches);
    }

    /**
     * Calculate match score based on team ratings
     */
    private calculateMatchScore(homeRating: number, awayRating: number): MatchScore {
        // Add some randomness to make it interesting
        const homeBoost = Math.random() * 20 - 10; // -10 to +10
        const awayBoost = Math.random() * 20 - 10;

        const adjustedHome = homeRating + homeBoost;
        const adjustedAway = awayRating + awayBoost;

        // Calculate expected goals based on rating difference
        const ratingDiff = adjustedHome - adjustedAway;
        const baseGoals = 2;

        const homeGoals = Math.max(0, Math.round(baseGoals + (ratingDiff / 20) + Math.random() * 2));
        const awayGoals = Math.max(0, Math.round(baseGoals - (ratingDiff / 20) + Math.random() * 2));

        return {
            home: homeGoals,
            away: awayGoals
        };
    }

    /**
     * Update team stats after match
     */
    private updateTeamStatsAfterMatch(score: MatchScore): void {
        const team = this.teamService.getTeam();
        if (!team) return;

        const stats = team.stats;
        stats.matchesPlayed++;
        stats.goalsScored += score.home;
        stats.goalsConceded += score.away;

        if (score.home > score.away) {
            stats.wins++;
        } else if (score.home < score.away) {
            stats.losses++;
        } else {
            stats.draws++;
        }

        this.teamService.updateStats(stats);
    }

    /**
     * Update player forms based on match result
     */
    private updatePlayerForms(score: MatchScore): void {
        const players = this.playerService.getPlayers();

        players.forEach(player => {
            let formChange = 0;

            // Win: increase form
            if (score.home > score.away) {
                formChange = Math.random() * 1.5; // 0 to 1.5
            }
            // Loss: decrease form
            else if (score.home < score.away) {
                formChange = -(Math.random() * 1.5); // 0 to -1.5
            }
            // Draw: small change
            else {
                formChange = Math.random() * 0.5 - 0.25; // -0.25 to 0.25
            }

            const newForm = Math.max(0, Math.min(10, player.form + formChange));
            this.playerService.updatePlayerForm(player.id, newForm);
        });
    }

    /**
     * Generate random opponent rating (60-85)
     */
    private generateOpponentRating(): number {
        return Math.floor(Math.random() * 26) + 60; // 60-85
    }

    /**
     * Update matches array and save
     */
    private updateMatches(matches: Match[]): void {
        this.matchesSubject.next(matches);
        this.localStorage.save(MATCHES_STORAGE_KEY, matches);
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
