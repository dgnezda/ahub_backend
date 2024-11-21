import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard';
import { GetUserId } from 'decorators/get-user-id.decorator';
import { DashboardData } from 'interfaces/dashboard.interfaces';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiCreatedResponse({ description: "Get user dashboard data" })
  @ApiBadRequestResponse({ description: 'Error fetching user dashboard data.' })
  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getDashboardData(@GetUserId() userId: string) { 
    console.log("Getting dashboard data for user with ID:", userId);
    return this.dashboardService.getUserDashboard(userId);
  }
}
