import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RansomLetterComponent } from './ransom-letter.component';

describe('RansomLetterComponent', () => {
  let component: RansomLetterComponent;
  let fixture: ComponentFixture<RansomLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RansomLetterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RansomLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
