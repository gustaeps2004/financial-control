import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SessionsService } from '../../application/sessions.service';
import { CreateSessionDto } from '../../application/dto/create-session.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: CreateSessionDto): Promise<LoginResponseDto> {
    const { accessToken, expiresAt } = await this.sessionsService.login(dto);
    return new LoginResponseDto(accessToken, expiresAt);
  }
}
