import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TeamMember } from './team-member.model';

@Component({
  selector: 'app-team-member-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-member-detail.html',
  styleUrl: './team-member-detail.css',
})
export class TeamMemberDetailComponent {

  @Input() member: TeamMember | null = null;

  @Output() close = new EventEmitter<void>();

}