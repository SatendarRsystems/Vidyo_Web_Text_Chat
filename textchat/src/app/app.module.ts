import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { HeaderComponent } from './component/header/header.component';
import { UserListComponent } from './component/user-list/user-list.component';
import { UserListHeaderComponent } from './component/user-list-header/user-list-header.component';
import { TextChatWindowComponent } from './component/text-chat-window/text-chat-window.component';
import { AppRoutingModule } from './app-routing.module';
import { ChatWindowComponent } from './component/chat-window/chat-window.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    UserListComponent,
    UserListHeaderComponent,
    TextChatWindowComponent,
    ChatWindowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
