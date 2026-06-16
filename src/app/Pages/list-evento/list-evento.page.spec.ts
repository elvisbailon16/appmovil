import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListEventoPage } from './list-evento.page';

describe('ListEventoPage', () => {
  let component: ListEventoPage;
  let fixture: ComponentFixture<ListEventoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListEventoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
