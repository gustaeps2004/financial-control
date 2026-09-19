import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UsersService } from '../../application/users.service';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.register(dto);
    return new UserResponseDto(user);
  }
}
