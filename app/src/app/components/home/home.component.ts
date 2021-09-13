import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { BookService } from '../../services/book/book.service';
import { NBBook } from '../../services/book/book.interface';

/**
 * The app home page.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public loggedIn = false;
  public searchResults: NBBook[] = [];
  public recommended: NBBook[] = [];

  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.loggedIn = this.userService.loggedIn();
    this.searchResults = await this.bookService.searchBooks({}, 0);

    if (this.loggedIn) {
      this.recommended = await this.userService.getRecommendations();
    }
  }
}
