import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PonentesPage } from './ponentes.page';

describe('PonentesPage', () => {
  let component: PonentesPage;
  let fixture: ComponentFixture<PonentesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PonentesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
