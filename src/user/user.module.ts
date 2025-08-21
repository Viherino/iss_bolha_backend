import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { AuthModule } from 'src/auth/auth.module'; // Import AuthModule to use userId method from AuthService

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule // Import AuthModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule {}

