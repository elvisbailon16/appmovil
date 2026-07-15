import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePonentePage } from './detalle-ponente.page';

describe('DetallePonentePage', () => {
  let component: DetallePonentePage;
  let fixture: ComponentFixture<DetallePonentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallePonentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
