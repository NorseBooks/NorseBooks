import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { MessageService } from '../../services/message/message.service';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';

/**
 * Message controller.
 */
@Controller('api/message')
@UseInterceptors(new ResponseInterceptor())
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
}
