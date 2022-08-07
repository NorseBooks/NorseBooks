import { Component, OnInit, Input } from '@angular/core';
import { UserInfo, OtherUserInfo } from '../../services/user/user.interface';
import { getUserImageURL } from '../../globals';

/**
 * A user avatar.
 */
@Component({
  selector: 'nb-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
  @Input() userInfo!: UserInfo | OtherUserInfo;
  @Input() text = '';
  public userImageURL = '';

  public async ngOnInit(): Promise<void> {
    this.userImageURL = getUserImageURL(this.userInfo);
  }
}
