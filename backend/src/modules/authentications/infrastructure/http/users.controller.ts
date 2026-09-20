import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserNameDto } from '../../application/dto/update-user-name.dto';
import { UsersService } from '../../application/users.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthTokenPayload } from '../../domain/ports/token-generator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.register(dto);
    return new UserResponseDto(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateName(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Body() dto: UpdateUserNameDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateName(currentUser.sub, dto);
    return new UserResponseDto(user);
  }
}
