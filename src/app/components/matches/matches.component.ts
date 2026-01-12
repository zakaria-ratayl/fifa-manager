import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatchService } from '../../services/match.service';
import { TeamService } from '../../services/team.service';
import { Match, MatchStatus } from '../../models/match.model';

@Component({
    selector: 'app-matches',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './matches.component.html',
    styleUrl: './matches.component.scss'
})
export class MatchesComponent implements OnInit, OnDestroy {
    matches: Match[] = [];
    upcomingMatches: Match[] = [];
    completedMatches: Match[] = [];
    matchForm: FormGroup;
    showScheduleForm = false;
    hasTeam = false;
    simulatingMatchId: string | null = null;
    private destroy$ = new Subject<void>();

    constructor(
        private matchService: MatchService,
        private teamService: TeamService,
        private fb: FormBuilder
    ) {
        this.matchForm = this.fb.group({
            awayTeam: ['', [Validators.required, Validators.minLength(3)]],
            date: ['', Validators.required],
            venue: ['Home Stadium']
        });
    }

    ngOnInit(): void {
        this.teamService.team$
            .pipe(takeUntil(this.destroy$))
            .subscribe(team => {
                this.hasTeam = team !== null;
            });

        this.matchService.matches$
            .pipe(takeUntil(this.destroy$))
            .subscribe(matches => {
                this.matches = matches;
                this.upcomingMatches = this.matchService.getUpcomingMatches();
                this.completedMatches = this.matchService.getCompletedMatches();
            });

        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.matchForm.patchValue({
            date: tomorrow.toISOString().split('T')[0]
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggleScheduleForm(): void {
        this.showScheduleForm = !this.showScheduleForm;
        if (!this.showScheduleForm) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            this.matchForm.reset({
                awayTeam: '',
                date: tomorrow.toISOString().split('T')[0],
                venue: 'Home Stadium'
            });
        }
    }

    onSubmit(): void {
        if (this.matchForm.valid) {
            const { awayTeam, date, venue } = this.matchForm.value;
            this.matchService.scheduleMatch(awayTeam, new Date(date), venue);
            this.toggleScheduleForm();
        }
    }

    simulateMatch(matchId: string): void {
        this.simulatingMatchId = matchId;

        // Add a small delay for animation
        setTimeout(() => {
            this.matchService.simulateMatch(matchId);
            this.simulatingMatchId = null;
        }, 1000);
    }

    deleteMatch(matchId: string): void {
        if (confirm('Are you sure you want to delete this match?')) {
            this.matchService.deleteMatch(matchId);
        }
    }

    getResultClass(match: Match): string {
        if (match.status !== MatchStatus.COMPLETED) return '';
        if (match.score.home > match.score.away) return 'win';
        if (match.score.home < match.score.away) return 'loss';
        return 'draw';
    }

    get MatchStatus() {
        return MatchStatus;
    }
}
