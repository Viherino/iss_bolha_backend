import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  Res,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRegisterDto } from './models/user-register.dto';
import { Response, Request } from 'express';
import { UserLoginDto } from './models/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
const bcrypt = require('bcryptjs');
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  @Post('register')
  async registerUser(@Body() userRegisterDto: UserRegisterDto) {
    // This method will now call the service to handle registration logic
    return this.authService.register(userRegisterDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: UserLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new BadRequestException('Invalid credentials.');
    }

    // Generate JWT
    const jwt: string = await this.jwtService.signAsync(
      { user_id: user.id },
      {
        expiresIn: '180d',
        secret: process.env.JWT_SECRET,
      },
    );

    // Set JWT as an HTTP-only cookie
    response.cookie('jwt', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'strict',
      maxAge: 180 * 24 * 60 * 60 * 1000, // 180 days in milliseconds
    });

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt'); // Clear the JWT cookie
    return {
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() request: Request) {
    const userId = await this.authService.userId(request);
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userWithoutPassword } = user as any;
    return { user: userWithoutPassword };
  }
}
