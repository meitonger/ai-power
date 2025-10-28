import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleChatMessage(@Body() body: { message: string }) {
    const { message } = body;
    const reply = await this.chatService.generateResponse(message);
    return { reply };
  }

  @Post('similar-questions')
  async findSimilarQuestions(@Body() body: { message: string }) {
    const { message } = body;
    const questions = await this.chatService.findSimilarQuestions(message);
    return { questions };
  }
}
