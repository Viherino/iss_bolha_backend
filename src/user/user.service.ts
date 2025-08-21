import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Exclude password from the returned user object
    const { password, ...result } = user;
    return result as Partial<User>;
  }

  async update(id: number, updateUserDto: Partial<User>): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Only update allowed fields, ensuring password is NOT updated here
    user.username = updateUserDto.username ?? user.username;
    user.email = updateUserDto.email ?? user.email;
    user.firstName = updateUserDto.firstName ?? user.firstName;
    user.lastName = updateUserDto.lastName ?? user.lastName;
    user.phoneNumber = updateUserDto.phoneNumber ?? user.phoneNumber;
    user.address = updateUserDto.address ?? user.address;

    // Important: Password update should be handled through a separate, secure endpoint.
    // This general profile update endpoint will ignore any password field in the DTO for security reasons.
    if (updateUserDto.password) {
        console.warn('Password update attempted via general user profile update. This should be handled separately for security.');
    }

    const updatedUser = await this.userRepository.save(user);

    // Exclude password from the returned user object
    const { password, ...result } = updatedUser;
    return result as Partial<User>;
  }
}

