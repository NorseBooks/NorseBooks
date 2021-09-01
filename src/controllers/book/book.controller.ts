import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { BookService } from '../../services/book/book.service';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { QueryNumber } from '../../decorators/query-number.decorator';
import { QueryString } from '../../decorators/query-string.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';

/**
 * Book controller.
 */
@Controller('api/book')
@UseInterceptors(new ResponseInterceptor())
export class BookController {
  constructor(private readonly bookService: BookService) {}
}
