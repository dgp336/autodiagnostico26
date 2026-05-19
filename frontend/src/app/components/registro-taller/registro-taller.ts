import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro-taller',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro-taller.html',
  styleUrl: './registro-taller.css',
})
export class RegistroTallerComponent {
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
  passwordMismatch = computed(
    () =>
      !!this.formData.password &&
      !!this.formData.confirmPassword &&
      this.formData.password !== this.formData.confirmPassword
  );

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
    this.enviando.set(true);
    setTimeout(() => {
      this.enviando.set(false);
      this.enviado.set(true);
    }, 1200);
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
  }
}
