import { Component } from '@angular/core';
import { CommonModule  } from '@angular/common';
import { TeamMember } from './team-member-detail/team-member.model';
import { TeamMemberDetailComponent } from './team-member-detail/team-member-detail';
@Component({
  selector: 'app-sobre-nosotros',
  imports: [CommonModule, TeamMemberDetailComponent],
  templateUrl: './sobre-nosotros.html',
  styleUrl: './sobre-nosotros.css',
})


export class SobreNosotros {
  selectedMember: TeamMember | null = null;

  teamMembers = [
    {
      id: 1,
      name: 'David Casado Fernández',
      initials: 'DC',
      role: 'Gestor del proyecto y frontend developer',
      description: 'Coordinación general, diseño de la interfaz y desarrollo frontend.',
      technologies: ['Angular', 'TypeScript', 'CSS'],
      avatar: ''
    },

    {
      id: 2,
      name: 'Franco Sergio Pereyra',
      initials: 'FP',
      role: 'Backend Developer/DevOps',
      description: 'Arquitectura backend y DevOps, chat y sistema de seguimiento.',
      technologies: ['Spring Boot', 'Java', 'MySQL', 'Docker', 'Angular'],
      avatar: ''
    },
    {
      id: 3,
      name: 'David Granados Pérez',
      initials: 'DG',
      role: 'Frontend Developer/UI',
      description: 'Diseño de interfaces modernas y mejora de experiencia de usuario.',
      technologies: ['Angular', 'TypeScript', 'CSS', 'HTML'],
      avatar: ''
    },

    {
      id: 4,
      name: 'Ismael Fernández Méndez',
      initials: 'IF',
      role: 'Backend Developer',
      description: 'Desarrollo de servicios backend y gestión de lógica de negocio.',
      technologies: ['Spring Boot', 'Java', 'MySQL'],
      avatar: ''
    },

    {
      id: 5,
      name: 'Juan José Fernández Requena',
      initials: 'JF',
      role: 'Full Stack Developer',
      description: 'Integración entre frontend y backend y soporte de funcionalidades principales.',
      technologies: ['Angular', 'Spring Boot', 'TypeScript', 'Java'],
      avatar: ''
    },

    {
      id: 6,
      name: 'Pablo Martínez Gálvez',
      initials: 'PM',
      role: 'Frontend Developer',
      description: 'Implementación de componentes visuales y experiencia interactiva.',
      technologies: ['Angular', 'CSS', 'TypeScript'],
      avatar: ''
    }

    // etc...
  ];

}
