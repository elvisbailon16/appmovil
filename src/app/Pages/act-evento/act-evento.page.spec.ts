import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActEventoPage } from './act-evento.page';

describe('ActEventoPage', () => {
  let component: ActEventoPage;
  let fixture: ComponentFixture<ActEventoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActEventoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
