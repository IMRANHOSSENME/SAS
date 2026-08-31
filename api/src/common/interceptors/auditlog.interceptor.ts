import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/auditlog.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    return next.handle().pipe(
      tap(() => {
        // Log only write operations (POST, PUT, PATCH, DELETE)
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          const adminId = request.user?.id; // Assuming JWT auth places user on request
          
          if (adminId) {
            // In a real app, you'd extract resource, resourceId, oldValue, newValue
            // from the request and response. Here is a basic implementation.
            const auditLog = this.auditLogRepository.create({
              adminId,
              action: method,
              resource: request.url,
              ipAddress: request.ip,
            });
            
            // We run this asynchronously so it doesn't block the response
            this.auditLogRepository.save(auditLog).catch(err => {
              console.error('Failed to save audit log:', err);
            });
          }
        }
      }),
    );
  }
}
