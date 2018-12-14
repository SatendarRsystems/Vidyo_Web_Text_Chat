import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextChatWindowComponent } from './text-chat-window.component';

describe('TetChatWindowComponent', () => {
  let component: TextChatWindowComponent;
  let fixture: ComponentFixture<TextChatWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextChatWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
