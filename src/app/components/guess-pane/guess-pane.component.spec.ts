import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuessPaneComponent } from './guess-pane.component';

describe('GuessPaneComponent', () => {
  let component: GuessPaneComponent;
  let fixture: ComponentFixture<GuessPaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuessPaneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuessPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
