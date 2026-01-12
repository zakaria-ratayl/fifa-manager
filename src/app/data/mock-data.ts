import { Team } from '../models/team.model';
import { Player, Position } from '../models/player.model';
import { Match, MatchStatus } from '../models/match.model';

export const MOCK_TEAM: Team = {
    id: 'team_default',
    name: 'Dream Team FC',
    formation: '4-3-3',
    players: [],
    stats: {
        matchesPlayed: 5,
        wins: 3,
        draws: 1,
        losses: 1,
        goalsScored: 12,
        goalsConceded: 6
    },
    createdAt: new Date()
};

export const MOCK_PLAYERS: Player[] = [
    {
        id: 'player_1',
        name: 'Cristiano Ronaldo',
        position: Position.FWD,
        age: 36,
        overall: 91,
        form: 8,
        jerseyNumber: 7,
        skills: { pace: 85, shooting: 93, passing: 80, dribbling: 85, defending: 35, physical: 78 }
    },
    {
        id: 'player_2',
        name: 'Lionel Messi',
        position: Position.FWD,
        age: 34,
        overall: 93,
        form: 9,
        jerseyNumber: 10,
        skills: { pace: 80, shooting: 90, passing: 95, dribbling: 96, defending: 30, physical: 65 }
    },
    {
        id: 'player_3',
        name: 'Manuel Neuer',
        position: Position.GK,
        age: 35,
        overall: 89,
        form: 7,
        jerseyNumber: 1,
        skills: { pace: 50, shooting: 15, passing: 60, dribbling: 45, defending: 90, physical: 85 }
    },
    {
        id: 'player_4',
        name: 'Kevin De Bruyne',
        position: Position.MID,
        age: 30,
        overall: 91,
        form: 8,
        jerseyNumber: 17,
        skills: { pace: 75, shooting: 85, passing: 94, dribbling: 88, defending: 65, physical: 78 }
    },
    {
        id: 'player_5',
        name: 'Virgil van Dijk',
        position: Position.DEF,
        age: 29,
        overall: 90,
        form: 6,
        jerseyNumber: 4,
        skills: { pace: 78, shooting: 60, passing: 70, dribbling: 72, defending: 92, physical: 86 }
    },
    {
        id: 'player_6',
        name: 'Kylian Mbappé',
        position: Position.FWD,
        age: 23,
        overall: 92,
        form: 9,
        jerseyNumber: 11,
        skills: { pace: 97, shooting: 88, passing: 82, dribbling: 93, defending: 38, physical: 76 }
    },
    {
        id: 'player_7',
        name: 'Nsimba Luzolo',
        position: Position.DEF,
        age: 26,
        overall: 82,
        form: 7,
        jerseyNumber: 3,
        skills: { pace: 85, shooting: 55, passing: 72, dribbling: 75, defending: 80, physical: 75 }
    },
    {
        id: 'player_8',
        name: 'N\'Golo Kanté',
        position: Position.MID,
        age: 30,
        overall: 89,
        form: 8,
        jerseyNumber: 5,
        skills: { pace: 78, shooting: 65, passing: 78, dribbling: 80, defending: 88, physical: 84 }
    },
    {
        id: 'player_9',
        name: 'Luka Modrić',
        position: Position.MID,
        age: 35,
        overall: 88,
        form: 7,
        jerseyNumber: 14,
        skills: { pace: 72, shooting: 75, passing: 90, dribbling: 88, defending: 70, physical: 65 }
    },
    {
        id: 'player_10',
        name: 'Sergio Ramos',
        position: Position.DEF,
        age: 35,
        overall: 88,
        form: 7,
        jerseyNumber: 15,
        skills: { pace: 70, shooting: 65, passing: 72, dribbling: 68, defending: 89, physical: 84 }
    },
    {
        id: 'player_11',
        name: 'Trent A-Arnold',
        position: Position.DEF,
        age: 23,
        overall: 87,
        form: 8,
        jerseyNumber: 66,
        skills: { pace: 80, shooting: 70, passing: 90, dribbling: 80, defending: 82, physical: 72 }
    }
];

export const MOCK_MATCHES: Match[] = [
    {
        id: 'match_1',
        homeTeam: 'Dream Team FC',
        awayTeam: 'Real Madrid',
        score: { home: 2, away: 1 },
        date: new Date(new Date().setDate(new Date().getDate() - 7)), // 1 week ago
        status: MatchStatus.COMPLETED,
        venue: 'Home Stadium'
    },
    {
        id: 'match_2',
        homeTeam: 'Man City',
        awayTeam: 'Dream Team FC',
        score: { home: 2, away: 2 },
        date: new Date(new Date().setDate(new Date().getDate() - 3)), // 3 days ago
        status: MatchStatus.COMPLETED,
        venue: 'Etihad Stadium'
    },
    {
        id: 'match_3',
        homeTeam: 'Dream Team FC',
        awayTeam: 'Bayern Munich',
        score: { home: 0, away: 0 },
        date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
        status: MatchStatus.SCHEDULED,
        venue: 'Home Stadium'
    }
];
