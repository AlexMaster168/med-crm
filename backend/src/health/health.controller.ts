import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    MemoryHealthIndicator,
    MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly mongoose: MongooseHealthIndicator,
        private readonly memory: MemoryHealthIndicator,
    ) {}

    @Public()
    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.mongoose.pingCheck('mongo'),
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
        ]);
    }
}
