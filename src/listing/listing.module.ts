import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from 'src/entities/listing.entity';
import { User } from 'src/entities/user.entity'; // Import User entity
import { Category } from 'src/entities/category.entity'; // Import Category entity
import { AuthModule } from 'src/auth/auth.module'; // Import AuthModule
// import { JwtService } from '@nestjs/jwt'; // JwtService is exported by AuthModule

@Module({
  imports: [TypeOrmModule.forFeature([Listing, User, Category]), AuthModule], // Add User and Category, and import AuthModule
  providers: [ListingService],
  controllers: [ListingController],
})
export class ListingModule {}
