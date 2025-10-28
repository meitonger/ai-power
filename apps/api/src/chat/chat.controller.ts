import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleChatMessage(@Body() body: { message: string }) {
    const { message } = body;
    const response = await this.chatService.generateResponse(message);
    return response;
  }
}
