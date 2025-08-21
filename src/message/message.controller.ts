import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { AuthGuard } from '../auth/auth.guard';
import { CreateMessageDto } from './model/CreateMessageDto';

@Controller('message')
export class MessageController {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  // Send a message
  @Post()
  @UseGuards(AuthGuard)
  async sendMessage(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    const senderId = req.user.user_id;

    const newMessage = this.messagesRepository.create({
      content: createMessageDto.content,
      sender: { id: senderId },
      recipient: { id: createMessageDto.recipientId },
      listing: { id: createMessageDto.listingId },
      sentAt: new Date(),
      isRead: false,
    });

    return this.messagesRepository.save(newMessage);
  }

  // Get conversations for a user
  @Get('conversations')
  @UseGuards(AuthGuard)
  async getUserConversations(@Req() req) {
    const userId = req.user.user_id;

    // Get the latest message from each conversation
    const conversations = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.recipient', 'recipient')
      .leftJoinAndSelect('message.listing', 'listing')
      .where('message.sender_id = :userId OR message.recipient_id = :userId', {
        userId,
      })
      .andWhere(qb => {
        const subQuery = qb
          .subQuery()
          .select('MAX(m2.sentAt)')
          .from(Message, 'm2')
          .where(
            '(m2.sender_id = :userId OR m2.recipient_id = :userId) AND ' +
            '((m2.sender_id = message.sender_id AND m2.recipient_id = message.recipient_id AND m2.listing_id = message.listing_id) OR ' +
            '(m2.sender_id = message.recipient_id AND m2.recipient_id = message.sender_id AND m2.listing_id = message.listing_id))',
            { userId }
          )
          .getQuery();
        return 'message.sentAt = ' + subQuery;
      })
      .orderBy('message.sentAt', 'DESC')
      .getMany();

    return conversations;
  }

  // Get messages for a specific conversation
  @Get('conversation/:listingId/:otherUserId')
  @UseGuards(AuthGuard)
  async getConversationMessages(
    @Param('listingId') listingId: number,
    @Param('otherUserId') otherUserId: number,
    @Req() req,
  ) {
    const userId = req.user.user_id;

    return this.messagesRepository.find({
      where: [
        {
          listing: { id: listingId },
          sender: { id: userId },
          recipient: { id: otherUserId },
        },
        {
          listing: { id: listingId },
          sender: { id: otherUserId },
          recipient: { id: userId },
        },
      ],
      relations: ['sender', 'recipient', 'listing'],
      order: { sentAt: 'ASC' },
    });
  }

  // Mark messages as read
  @Post('mark-read/:listingId/:otherUserId')
  @UseGuards(AuthGuard)
  async markMessagesAsRead(
    @Param('listingId') listingId: number,
    @Param('otherUserId') otherUserId: number,
    @Req() req,
  ) {
    const userId = req.user.user_id;

    // Mark all unread messages from the other user to the current user as read
    await this.messagesRepository.update(
      {
        listing: { id: listingId },
        sender: { id: otherUserId },
        recipient: { id: userId },
        isRead: false,
      },
      { isRead: true }
    );

    return { message: 'Messages marked as read' };
  }

  // Delete entire conversation
  @Delete('delete-conversation/:listingId/:otherUserId')
  @UseGuards(AuthGuard)
  async deleteConversation(
    @Param('listingId') listingId: number,
    @Param('otherUserId') otherUserId: number,
    @Req() req,
  ) {
    const userId = req.user.user_id;

    // Delete all messages between the two users for this listing
    await this.messagesRepository.delete({
      listing: { id: listingId },
      sender: { id: userId },
      recipient: { id: otherUserId },
    });

    await this.messagesRepository.delete({
      listing: { id: listingId },
      sender: { id: otherUserId },
      recipient: { id: userId },
    });

    return { message: 'Conversation deleted successfully' };
  }
}
