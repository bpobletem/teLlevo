import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarAutosPage } from './listar-autos.page';

describe('ListarAutosPage', () => {
  let component: ListarAutosPage;
  let fixture: ComponentFixture<ListarAutosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarAutosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
