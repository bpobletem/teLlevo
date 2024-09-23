import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-nueva-password',
  templateUrl: './nueva-password.page.html',
  styleUrls: ['./nueva-password.page.scss'],
})
export class NuevaPasswordPage implements OnInit {

  newPasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  email: string = '';  

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.newPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordsMatch });
  }

  ngOnInit() {
    this.email = this.route.snapshot.paramMap.get('email') ?? ''; 
  }

  passwordsMatch(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    const newPassword = this.newPasswordForm.get('password')?.value;

    let usuariosRegistrados = JSON.parse(localStorage.getItem('users') || '[]');

    const userIndex = usuariosRegistrados.findIndex((user: any) => user.email === this.email);
    
    if (userIndex !== -1) {
      usuariosRegistrados[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(usuariosRegistrados));
      this.successMessage = 'Contraseña restablecida exitosamente.';
      this.errorMessage = '';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } else {
      this.errorMessage = 'Ocurrió un error. Por favor, intenta nuevamente.';
      this.successMessage = '';
    }
  }
}
