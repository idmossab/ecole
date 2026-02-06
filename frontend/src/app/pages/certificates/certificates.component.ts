import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { certificates, Certificate } from '../../core/certificates.data';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.css'
})
export class CertificatesComponent {
  certificates: Certificate[] = certificates;
}
