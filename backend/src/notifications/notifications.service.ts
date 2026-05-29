import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    Notification,
    NotificationDocument,
    NotificationType,
} from '../schemas/notification.schema';

interface CreateNotificationInput {
    userId: string | Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string | Types.ObjectId;
}

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<NotificationDocument>,
    ) {}

    /**
     * Создать уведомление. Ошибки проглатываются: сбой уведомления
     * не должен ломать основную операцию (запись/подтверждение и т.д.).
     */
    async create(input: CreateNotificationInput): Promise<void> {
        try {
            await this.notificationModel.create({
                userId: new Types.ObjectId(input.userId),
                type: input.type,
                title: input.title,
                message: input.message,
                relatedId: input.relatedId ? new Types.ObjectId(input.relatedId) : undefined,
            });
        } catch {
            // намеренно игнорируем — уведомления не критичны
        }
    }

    findForUser(userId: string) {
        return this.notificationModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(50)
            .exec();
    }

    unreadCount(userId: string) {
        return this.notificationModel.countDocuments({
            userId: new Types.ObjectId(userId),
            read: false,
        });
    }

    async markRead(id: string, userId: string) {
        const n = await this.notificationModel.findOneAndUpdate(
            { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
            { read: true },
            { new: true },
        );
        if (!n) throw new NotFoundException('Уведомление не найдено');
        return n;
    }

    async markAllRead(userId: string) {
        await this.notificationModel.updateMany(
            { userId: new Types.ObjectId(userId), read: false },
            { read: true },
        );
        return { message: 'Все уведомления отмечены прочитанными' };
    }
}
