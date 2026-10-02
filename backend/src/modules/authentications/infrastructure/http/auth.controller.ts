import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SessionsService } from '../../application/sessions.service';
import { CreateGoogleSessionDto } from '../../application/dto/create-google-session.dto';
import { CreateSessionDto } from '../../application/dto/create-session.dto';
import { GoogleLoginResponseDto } from './dto/google-login-response.dto';
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

  // Signs in, and up, with Google: see SessionsService.loginWithGoogle.
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(
    @Body() dto: CreateGoogleSessionDto,
  ): Promise<GoogleLoginResponseDto> {
    const result = await this.sessionsService.loginWithGoogle(dto);
    return new GoogleLoginResponseDto(result);
  }
}
