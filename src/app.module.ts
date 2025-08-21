import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ListingModule } from './listing/listing.module';
import { CategoryModule } from './category/category.module';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module'; // Import the new UserModule

const dotenv = require('dotenv');
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      entities: [__dirname + '/../**/*.entity.{js, ts}'],
      synchronize: false, // Set back to false for production readiness
    }),
    AuthModule,
    ListingModule,
    CategoryModule,
    MessageModule,
    UserModule, // Add UserModule here
  ],
  providers: [],
})
export class AppModule {}
