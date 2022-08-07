import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageUserComponent } from './message-user.component';

describe('MessageUserComponent', () => {
  let component: MessageUserComponent;
  let fixture: ComponentFixture<MessageUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessageUserComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
