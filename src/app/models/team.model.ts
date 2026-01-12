import { Player } from './player.model';

export interface TeamStats {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
}

export interface Team {
    id: string;
    name: string;
    formation: string;  // e.g., "4-3-3", "4-4-2"
    players: Player[];
    stats: TeamStats;
    createdAt: Date;
}
