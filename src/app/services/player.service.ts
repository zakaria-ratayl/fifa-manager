import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Player, PlayerSkills, Position } from '../models/player.model';
import { LocalStorageService } from './local-storage.service';
import { TeamService } from './team.service';
import { MOCK_PLAYERS } from '../data/mock-data';

const PLAYERS_STORAGE_KEY = 'fifa_manager_players';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {
    private playersSubject: BehaviorSubject<Player[]>;
    public players$: Observable<Player[]>;

    constructor(
        private localStorage: LocalStorageService,
        private teamService: TeamService
    ) {
        let savedPlayers = this.localStorage.load<Player[]>(PLAYERS_STORAGE_KEY);

        // Seed default players if none exist
        if (!savedPlayers || savedPlayers.length === 0) {
            savedPlayers = MOCK_PLAYERS;
            this.localStorage.save(PLAYERS_STORAGE_KEY, savedPlayers);
        }

        this.playersSubject = new BehaviorSubject<Player[]>(savedPlayers || []);
        this.players$ = this.playersSubject.asObservable();

        // Sync players with team
        this.syncPlayersWithTeam(savedPlayers || []);
    }

    /**
     * Get all players
     */
    getPlayers(): Player[] {
        return this.playersSubject.value;
    }

    /**
     * Get player by ID
     */
    getPlayerById(id: string): Player | undefined {
        return this.playersSubject.value.find(player => player.id === id);
    }

    /**
     * Add new player
     */
    addPlayer(playerData: Omit<Player, 'id' | 'overall'>): Player {
        const overall = this.calculateOverall(playerData.skills);
        const newPlayer: Player = {
            ...playerData,
            id: this.generateId(),
            overall,
            form: 5  // Start with average form
        };

        const players = [...this.playersSubject.value, newPlayer];
        this.updatePlayers(players);

        // Add to team
        const team = this.teamService.getTeam();
        if (team) {
            team.players.push(newPlayer);
            this.teamService.updateTeam(team);
        }

        return newPlayer;
    }

    /**
     * Update player
     */
    updatePlayer(id: string, updates: Partial<Player>): void {
        const players = this.playersSubject.value.map(player => {
            if (player.id === id) {
                const updatedPlayer = { ...player, ...updates };
                // Recalculate overall if skills changed
                if (updates.skills) {
                    updatedPlayer.overall = this.calculateOverall(updatedPlayer.skills);
                }
                return updatedPlayer;
            }
            return player;
        });

        this.updatePlayers(players);

        // Update in team
        const team = this.teamService.getTeam();
        if (team) {
            team.players = players;
            this.teamService.updateTeam(team);
        }
    }

    /**
     * Delete player
     */
    deletePlayer(id: string): void {
        const players = this.playersSubject.value.filter(player => player.id !== id);
        this.updatePlayers(players);

        // Remove from team
        const team = this.teamService.getTeam();
        if (team) {
            team.players = players;
            this.teamService.updateTeam(team);
        }
    }

    /**
     * Update player form (0-10)
     */
    updatePlayerForm(id: string, form: number): void {
        this.updatePlayer(id, { form: Math.max(0, Math.min(10, form)) });
    }

    /**
     * Get players by position
     */
    getPlayersByPosition(position: Position): Player[] {
        return this.playersSubject.value.filter(player => player.position === position);
    }

    /**
     * Get top players (by overall rating)
     */
    getTopPlayers(count: number = 3): Player[] {
        return [...this.playersSubject.value]
            .sort((a, b) => b.overall - a.overall)
            .slice(0, count);
    }

    /**
     * Calculate overall rating from skills
     */
    calculateOverall(skills: PlayerSkills): number {
        const { pace, shooting, passing, dribbling, defending, physical } = skills;
        const average = (pace + shooting + passing + dribbling + defending + physical) / 6;
        return Math.round(average);
    }

    /**
     * Update players array and save
     */
    private updatePlayers(players: Player[]): void {
        this.playersSubject.next(players);
        this.localStorage.save(PLAYERS_STORAGE_KEY, players);
    }

    /**
     * Sync players with team on initialization
     */
    private syncPlayersWithTeam(players: Player[]): void {
        const team = this.teamService.getTeam();
        if (team && players.length > 0) {
            team.players = players;
            this.teamService.updateTeam(team);
        }
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
