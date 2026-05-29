import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    findMine(@CurrentUser() user: any) {
        return this.notificationsService.findForUser(user.userId);
    }

    @Get('unread-count')
    unreadCount(@CurrentUser() user: any) {
        return this.notificationsService.unreadCount(user.userId);
    }

    @Patch('read-all')
    markAllRead(@CurrentUser() user: any) {
        return this.notificationsService.markAllRead(user.userId);
    }

    @Patch(':id/read')
    markRead(@Param('id') id: string, @CurrentUser() user: any) {
        return this.notificationsService.markRead(id, user.userId);
    }
}
