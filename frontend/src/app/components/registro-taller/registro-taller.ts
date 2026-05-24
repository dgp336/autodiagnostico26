import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WorkshopApplicationApiService } from '../../services/workshop-application-api.service';
import { WorkshopApplicationRequest } from '../../services/api.models';

@Component({
  selector: 'app-registro-taller',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro-taller.html',
  styleUrl: './registro-taller.css',
})
export class RegistroTallerComponent {
  private readonly applicationApi = inject(WorkshopApplicationApiService);

  /** Datos del formulario mapeados a los campos de Workshop + AppUser */
  formData = {
    // Workshop fields
    name: '',
    address: '',
    phone: '',
    email: '',
    schedule: '',
    photoUrl: '',
    vehicleLimit: 1,
    // AppUser fields
    fullName: '',
    password: '',
    confirmPassword: '',
    // UI only
    aceptaTerminos: false,
  };

  /** UI state */
  enviado = signal(false);
  enviando = signal(false);
  submitError = '';
  passwordMismatch = computed(
    () =>
      !!this.formData.password &&
      !!this.formData.confirmPassword &&
      this.formData.password !== this.formData.confirmPassword
  );

  onNameInput(): void {
    this.formData.fullName = this.normalizeTitleCase(this.formData.fullName);
  }

  onEmailInput(): void {
    this.formData.email = this.formData.email.trim().toLowerCase();
  }

  onPhoneInput(): void {
    this.formData.phone = this.formatSpanishPhone(this.formData.phone);
  }

  onScheduleInput(): void {
    this.formData.schedule = this.normalizeSchedule(this.formData.schedule);
  }

  onWorkshopNameInput(): void {
    this.formData.name = this.normalizeTitleCase(this.formData.name);
  }

  onAddressInput(): void {
    this.formData.address = this.normalizeStreetAddress(this.formData.address);
  }

  /** Formulario válido si todas las obligatorias están rellenas, contraseñas coinciden y términos aceptados */
  isFormValid(): boolean {
    const d = this.formData;
    return (
      !!d.name &&
      !!d.address &&
      !!d.phone &&
      !!d.email &&
      !!d.schedule &&
      d.vehicleLimit >= 1 &&
      !!d.fullName &&
      !!d.password &&
      d.password === d.confirmPassword &&
      d.aceptaTerminos
    );
  }

  /** Simulación de envío (solo frontend — sin llamada al backend) */
  onSubmit(): void {
    if (!this.isFormValid()) return;
    this.submitError = '';
    this.enviando.set(true);

    const payload: WorkshopApplicationRequest = {
      fullName: this.formData.fullName.trim(),
      email: this.formData.email.trim(),
      password: this.formData.password,
      workshopName: this.formData.name.trim(),
      address: this.formData.address.trim(),
      phone: this.formData.phone.trim(),
      schedule: this.formData.schedule.trim(),
      photoUrl: this.formData.photoUrl.trim(),
      vehicleLimit: this.formData.vehicleLimit,
    };

    this.applicationApi.submit(payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
      },
      error: (err) => {
        this.enviando.set(false);
        this.submitError = err?.error?.message ?? 'No se pudo enviar la solicitud del taller.';
      },
    });
  }

  resetForm(): void {
    this.formData = {
      name: '',
      address: '',
      phone: '',
      email: '',
      schedule: '',
      photoUrl: '',
      vehicleLimit: 1,
      fullName: '',
      password: '',
      confirmPassword: '',
      aceptaTerminos: false,
    };
    this.enviado.set(false);
    this.submitError = '';
  }

  private normalizeTitleCase(value: string): string {
    return value
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
      .join(' ');
  }

  private normalizeStreetAddress(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  private normalizeSchedule(value: string): string {
    return value
      .replace(/\s*[-–—]\s*/g, ' - ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private formatSpanishPhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    const nationalDigits = digits.startsWith('34') ? digits.slice(2) : digits;
    const grouped = nationalDigits.slice(0, 9).replace(/(\d{3})(?=\d)/g, '$1 ').trim();
    return grouped ? `+34 ${grouped}` : '+34 ';
  }
}
