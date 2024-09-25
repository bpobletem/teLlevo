import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitudesDeViajePage } from './solicitudes-de-viaje.page';

describe('SolicitudesDeViajePage', () => {
  let component: SolicitudesDeViajePage;
  let fixture: ComponentFixture<SolicitudesDeViajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudesDeViajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
