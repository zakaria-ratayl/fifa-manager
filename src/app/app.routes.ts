import type { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TeamComponent } from './components/team/team.component';
import { PlayersComponent } from './components/players/players.component';
import { PlayerDetailComponent } from './components/player-detail/player-detail.component';
import { MatchesComponent } from './components/matches/matches.component';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'team', component: TeamComponent },
    { path: 'players', component: PlayersComponent },
    { path: 'players/:id', component: PlayerDetailComponent },
    { path: 'matches', component: MatchesComponent },
    { path: '**', redirectTo: '/dashboard' }
];
