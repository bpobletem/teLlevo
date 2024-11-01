import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevaPasswordPage } from './nueva-password.page';

describe('NuevaPasswordPage', () => {
  let component: NuevaPasswordPage;
  let fixture: ComponentFixture<NuevaPasswordPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
