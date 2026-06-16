import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesEventPage } from './detalles-event.page';

describe('DetallesEventPage', () => {
  let component: DetallesEventPage;
  let fixture: ComponentFixture<DetallesEventPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesEventPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
