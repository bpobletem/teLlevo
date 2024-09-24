import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarAutoPage } from './registrar-auto.page';

describe('RegistrarAutoPage', () => {
  let component: RegistrarAutoPage;
  let fixture: ComponentFixture<RegistrarAutoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarAutoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
