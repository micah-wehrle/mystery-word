import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPaneComponent } from './popup-pane.component';

describe('PopupPaneComponent', () => {
  let component: PopupPaneComponent;
  let fixture: ComponentFixture<PopupPaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupPaneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
