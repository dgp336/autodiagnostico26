import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStateService } from '../../../services/auth-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);

  menuOpen = false;
  mobileMenuOpen = false;
  searchQuery = '';
  isDarkTheme = false;

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDarkTheme = savedTheme === 'dark';
      } else {
        this.isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      this.applyTheme();
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    if (typeof document !== 'undefined') {
      if (this.isDarkTheme) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  toggleMobileMenu(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }

  onLogin(): void {
    void this.router.navigate(['/login']);
  }

  onLogout(): void {
    this.authStateService.clearSession();
    this.menuOpen = false;
    void this.router.navigate(['/login']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // TODO: router.navigate(['/buscar'], { queryParams: { q: this.searchQuery } })
      console.log('Buscar:', this.searchQuery);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('.header-actions')) {
      this.menuOpen = false;
    }
  }
}