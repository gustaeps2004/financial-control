import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { ParseYearMonthPipe } from '../../../../shared/validation/parse-year-month.pipe';
import type { AuthTokenPayload } from '../../../authentications/domain/ports/token-generator';
import { CurrentUser } from '../../../authentications/infrastructure/http/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../authentications/infrastructure/http/guards/jwt-auth.guard';
import { CardStatementsService } from '../../application/card-statements.service';
import { RegisterStatementPaymentDto } from '../../application/dto/register-statement-payment.dto';
import { SetStatementAdjustmentDto } from '../../application/dto/set-statement-adjustment.dto';
import { StatementAdjustmentResponseDto } from './dto/statement-adjustment-response.dto';
import { StatementPaymentResponseDto } from './dto/statement-payment-response.dto';

@Controller('card-statements')
@UseGuards(JwtAuthGuard)
export class CardStatementsController {
  constructor(private readonly cardStatementsService: CardStatementsService) {}

  @Put(':cardId/:statementMonth/adjustment')
  async setAdjustment(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Param('statementMonth', ParseYearMonthPipe) statementMonth: YearMonth,
    @Body() dto: SetStatementAdjustmentDto,
  ): Promise<StatementAdjustmentResponseDto> {
    const adjustment = await this.cardStatementsService.setAdjustment(
      currentUser.sub,
      cardId,
      statementMonth,
      dto,
    );
    return new StatementAdjustmentResponseDto(adjustment);
  }

  @Delete(':cardId/:statementMonth/adjustment')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAdjustment(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Param('statementMonth', ParseYearMonthPipe) statementMonth: YearMonth,
  ): Promise<void> {
    await this.cardStatementsService.removeAdjustment(
      currentUser.sub,
      cardId,
      statementMonth,
    );
  }

  @Post(':cardId/:statementMonth/payments')
  @HttpCode(HttpStatus.CREATED)
  async registerPayment(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Param('statementMonth', ParseYearMonthPipe) statementMonth: YearMonth,
    @Body() dto: RegisterStatementPaymentDto,
  ): Promise<StatementPaymentResponseDto> {
    const payment = await this.cardStatementsService.registerPayment(
      currentUser.sub,
      cardId,
      statementMonth,
      dto,
    );
    return new StatementPaymentResponseDto(payment);
  }

  @Delete('payments/:paymentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePayment(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ): Promise<void> {
    await this.cardStatementsService.removePayment(currentUser.sub, paymentId);
  }
}
