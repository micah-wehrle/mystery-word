import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuessesComponent } from './guesses.component';

describe('GuessesComponent', () => {
  let component: GuessesComponent;
  let fixture: ComponentFixture<GuessesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuessesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
