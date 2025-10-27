// apps/api/src/root.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller() // with global prefix 'api', this serves GET /api
export class RootController {
  @Get()
  index() {
    return {
      ok: true,
      service: 'ServiceOps API',
      prefix: '/api',
      try: ['/api/health', '/api/users', '/api/vehicles', '/api/appointments'],
    };
  }
}
