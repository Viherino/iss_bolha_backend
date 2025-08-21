import { Controller, Get, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard'; // Assuming you have an AuthGuard
import { AuthService } from 'src/auth/auth.service'; // Import AuthService
import { Request } from 'express'; // Import Request from express

@Controller('users')
@UseGuards(AuthGuard) // Protect these routes
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService, // Inject AuthService
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: Request): Promise<Partial<User>> {
    const userId = await this.authService.userId(request);
    // Ensure the user is only trying to fetch their own profile or an admin can fetch any
    // For now, we'll only allow fetching own profile for simplicity
    if (userId !== +id) {
        throw new Error('Unauthorized access to user profile'); // More specific HTTP exception can be used
    }
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
    @Req() request: Request,
  ): Promise<Partial<User>> {
    const userId = await this.authService.userId(request);
    // Ensure the user is only trying to update their own profile
    if (userId !== +id) {
        throw new Error('Unauthorized attempt to update user profile'); // More specific HTTP exception can be used
    }
    return this.usersService.update(+id, updateUserDto);
  }
}

