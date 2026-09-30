import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthTokenPayload } from '../../../authentications/domain/ports/token-generator';
import { CurrentUser } from '../../../authentications/infrastructure/http/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../authentications/infrastructure/http/guards/jwt-auth.guard';
import { CreateTransactionDto } from '../../application/dto/create-transaction.dto';
import { ListTransactionsQueryDto } from '../../application/dto/list-transactions-query.dto';
import { UpdateTransactionDto } from '../../application/dto/update-transaction.dto';
import { TransactionsService } from '../../application/transactions.service';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.create(
      currentUser.sub,
      dto,
    );
    return new TransactionResponseDto(transaction);
  }

  @Get()
  async findAll(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionsService.findAll(
      currentUser.sub,
      query,
    );
    return transactions.map(
      (transaction) => new TransactionResponseDto(transaction),
    );
  }

  @Patch(':id')
  async update(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.update(
      currentUser.sub,
      id,
      dto,
    );
    return new TransactionResponseDto(transaction);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.transactionsService.remove(currentUser.sub, id);
  }
}
