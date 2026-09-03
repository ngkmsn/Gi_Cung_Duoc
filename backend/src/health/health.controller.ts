import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly startupTime = Date.now();

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Number(((Date.now() - this.startupTime) / 1000).toFixed(2)),
    };
  }
}
