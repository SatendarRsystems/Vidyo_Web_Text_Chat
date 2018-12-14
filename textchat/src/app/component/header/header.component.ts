import { Component, OnInit } from '@angular/core';
import { VidyoClientService } from '../../service/vidyo-client.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  /**
  * Description: Constructor of header component
  * @param object  vidyoClientService
  */
  constructor(private vidyoClientService: VidyoClientService) { }

  /**
  * Description: oninit of header component
  */
  ngOnInit() {
  }

  /**
  * Description: logout the application by calling serice method
  */
  logout() {
    this.vidyoClientService.logout();
  }

}
