import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  { success: true; data: T; meta: { timestamp: string; requestId: string } }
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{
    success: true;
    data: T;
    meta: { timestamp: string; requestId: string };
  }> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const requestId = request.headers['x-request-id'] ?? crypto.randomUUID();
    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        meta: { timestamp: new Date().toISOString(), requestId },
      })),
    );
  }
}
