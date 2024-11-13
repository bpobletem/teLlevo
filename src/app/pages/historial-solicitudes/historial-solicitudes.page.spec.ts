import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialSolicitudesPage } from './historial-solicitudes.page';

describe('HistorialSolicitudesPage', () => {
  let component: HistorialSolicitudesPage;
  let fixture: ComponentFixture<HistorialSolicitudesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialSolicitudesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
