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
  UseGuards,
} from '@nestjs/common';
import type { AuthTokenPayload } from '../../../authentications/domain/ports/token-generator';
import { CurrentUser } from '../../../authentications/infrastructure/http/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../authentications/infrastructure/http/guards/jwt-auth.guard';
import { CreateRecurringTransactionDto } from '../../application/dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from '../../application/dto/update-recurring-transaction.dto';
import { RecurringTransactionsService } from '../../application/recurring-transactions.service';
import { RecurringTransactionResponseDto } from './dto/recurring-transaction-response.dto';

@Controller('recurring-transactions')
@UseGuards(JwtAuthGuard)
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Body() dto: CreateRecurringTransactionDto,
  ): Promise<RecurringTransactionResponseDto> {
    const recurringTransaction = await this.recurringTransactionsService.create(
      currentUser.sub,
      dto,
    );
    return new RecurringTransactionResponseDto(recurringTransaction);
  }

  @Get()
  async findAll(
    @CurrentUser() currentUser: AuthTokenPayload,
  ): Promise<RecurringTransactionResponseDto[]> {
    const recurringTransactions =
      await this.recurringTransactionsService.findAll(currentUser.sub);
    return recurringTransactions.map(
      (recurringTransaction) =>
        new RecurringTransactionResponseDto(recurringTransaction),
    );
  }

  @Patch(':id')
  async update(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecurringTransactionDto,
  ): Promise<RecurringTransactionResponseDto> {
    const recurringTransaction = await this.recurringTransactionsService.update(
      currentUser.sub,
      id,
      dto,
    );
    return new RecurringTransactionResponseDto(recurringTransaction);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.recurringTransactionsService.remove(currentUser.sub, id);
  }
}
