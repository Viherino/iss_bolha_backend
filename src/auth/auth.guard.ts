import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Try to get JWT from cookies
    const jwt = request.cookies['jwt'];

    try {
      // Check if JWT exists
      if (!jwt) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify the token
      const decoded = await this.jwtService.verifyAsync(jwt, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user ID to the request for further use if needed
      request.user = decoded;

      return true;
    } catch (err) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }
  }
}
