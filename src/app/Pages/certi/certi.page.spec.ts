import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertiPage } from './certi.page';

describe('CertiPage', () => {
  let component: CertiPage;
  let fixture: ComponentFixture<CertiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CertiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
