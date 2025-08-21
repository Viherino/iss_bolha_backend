import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities/user.entity';
import { UserRegisterDto } from './models/user-register.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async userId(request: Request): Promise<number> {
    // Get JWT from cookies
    const jwt = request.cookies['jwt'];

    // Verify and decode the token
    const data = await this.jwtService.verifyAsync(jwt, {
      secret: process.env.JWT_SECRET,
    });

    return data['user_id'];
  }

  async register(userRegisterDto: UserRegisterDto): Promise<User> {
    // Check if user with this username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: userRegisterDto.username },
    });
    if (existingUsername) {
      throw new BadRequestException('User with this username already exists');
    }

    // Check if user with this email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: userRegisterDto.email },
    });
    if (existingEmail) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userRegisterDto.password, 10); // 10 is the salt rounds

    // Create a new user instance, correctly spreading userRegisterDto and overriding password
    const newUser = this.userRepository.create({
      username: userRegisterDto.username,
      email: userRegisterDto.email,
      password: hashedPassword,
      firstName: userRegisterDto.firstName, // Save firstName
      lastName: userRegisterDto.lastName,   // Save lastName
      // You can add other fields from userRegisterDto here if needed (e.g., coach)
    });

    // Save the user to the database
    return this.userRepository.save(newUser);
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // Exclude password from the returned user object
      return result as User;
    }
    return null;
  }
}
