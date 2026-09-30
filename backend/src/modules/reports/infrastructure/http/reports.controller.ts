import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { ParseYearMonthPipe } from '../../../../shared/validation/parse-year-month.pipe';
import type { AuthTokenPayload } from '../../../authentications/domain/ports/token-generator';
import { CurrentUser } from '../../../authentications/infrastructure/http/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../authentications/infrastructure/http/guards/jwt-auth.guard';
import {
  MonthQueryDto,
  SummaryQueryDto,
  YearQueryDto,
} from '../../application/dto/report-queries.dto';
import { ReportsService } from '../../application/reports.service';
import { AnnualView } from '../../application/views/annual.view';
import {
  CardStatementDetailView,
  CardStatementsYearView,
} from '../../application/views/card-statements.view';
import { LedgerView } from '../../application/views/ledger.view';
import { SummaryView } from '../../application/views/summary.view';
import { ReportPeriod } from '../../domain/report-period';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('ledger')
  ledger(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Query() query: MonthQueryDto,
  ): Promise<LedgerView> {
    return this.reportsService.ledger(
      currentUser.sub,
      YearMonth.parse(query.month),
    );
  }

  @Get('summary')
  summary(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Query() query: SummaryQueryDto,
  ): Promise<SummaryView> {
    const period: ReportPeriod = query.month
      ? { type: 'MONTH', month: YearMonth.parse(query.month) }
      : query.year !== undefined
        ? { type: 'YEAR', year: query.year }
        : { type: 'ALL' };
    return this.reportsService.summary(currentUser.sub, period);
  }

  @Get('annual')
  annual(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Query() query: YearQueryDto,
  ): Promise<AnnualView> {
    return this.reportsService.annual(currentUser.sub, query.year);
  }

  @Get('card-statements')
  cardStatements(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Query() query: YearQueryDto,
  ): Promise<CardStatementsYearView> {
    return this.reportsService.cardStatements(currentUser.sub, query.year);
  }

  @Get('card-statements/:cardId/:month')
  cardStatement(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Param('month', ParseYearMonthPipe) month: YearMonth,
  ): Promise<CardStatementDetailView> {
    return this.reportsService.cardStatement(currentUser.sub, cardId, month);
  }
}
