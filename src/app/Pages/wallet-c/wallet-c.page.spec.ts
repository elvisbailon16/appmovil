import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalletCPage } from './wallet-c.page';

describe('WalletCPage', () => {
  let component: WalletCPage;
  let fixture: ComponentFixture<WalletCPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletCPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
