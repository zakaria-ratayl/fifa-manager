export enum MatchStatus {
    SCHEDULED = 'Scheduled',
    LIVE = 'Live',
    COMPLETED = 'Completed'
}

export interface MatchScore {
    home: number;
    away: number;
}

export interface Match {
    id: string;
    homeTeam: string;  // team name
    awayTeam: string;  // opponent team name
    score: MatchScore;
    date: Date;
    status: MatchStatus;
    venue?: string;
}
