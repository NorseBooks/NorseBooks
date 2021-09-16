import { Component, OnInit, Input } from '@angular/core';
import { UserInfo } from '../../services/user/user.interface';

/**
 * A user's image.
 */
@Component({
  selector: 'nb-user-image',
  templateUrl: './user-image.component.html',
  styleUrls: ['./user-image.component.scss'],
})
export class UserImageComponent implements OnInit {
  @Input() userInfo!: UserInfo;
  @Input() size = 100;
  @Input() center = false;
  @Input() shadow = false;
  public imageSrc = '/assets/img/logo.png';

  public async ngOnInit(): Promise<void> {
    if (this.userInfo) {
      if (this.userInfo.imageID) {
        this.imageSrc = `/image/${this.userInfo.imageID}`;
      } else {
        this.imageSrc = `https://avatars.dicebear.com/api/jdenticon/${this.userInfo.id}.svg`;
      }
    }
  }
}
