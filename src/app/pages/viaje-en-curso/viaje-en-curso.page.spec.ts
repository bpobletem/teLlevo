import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViajeEnCursoPage } from './viaje-en-curso.page';

describe('ViajeEnCursoPage', () => {
  let component: ViajeEnCursoPage;
  let fixture: ComponentFixture<ViajeEnCursoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViajeEnCursoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
