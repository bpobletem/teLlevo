import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleAutoPage } from './detalle-auto.page';

describe('DetalleAutoPage', () => {
  let component: DetalleAutoPage;
  let fixture: ComponentFixture<DetalleAutoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleAutoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
