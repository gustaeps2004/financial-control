import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionsService } from '../../application/sessions.service';
import { CreateSessionDto } from '../../application/dto/create-session.dto';
import { SessionResponseDto } from './dto/session-response.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async login(
    @Body() dto: CreateSessionDto,
    @Req() request: Request,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionsService.login(dto, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return new SessionResponseDto(session.token, session.expiresAt);
  }

  @Delete(':token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Param('token') token: string): Promise<void> {
    await this.sessionsService.revoke(token);
  }
}
