export enum Position {
    GK = 'Goalkeeper',
    DEF = 'Defender',
    MID = 'Midfielder',
    FWD = 'Forward'
}

export interface PlayerSkills {
    pace: number;        // 0-100
    shooting: number;    // 0-100
    passing: number;     // 0-100
    dribbling: number;   // 0-100
    defending: number;   // 0-100
    physical: number;    // 0-100
}

export interface Player {
    id: string;
    name: string;
    position: Position;
    age: number;
    overall: number;     // 0-100 (calculated from skills)
    form: number;        // 0-10 (recent performance)
    skills: PlayerSkills;
    jerseyNumber?: number;
}
