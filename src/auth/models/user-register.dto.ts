import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class UserRegisterDto {
  // @IsNumber() // ID is typically not provided by the user during registration
  // id: number;

  @IsString()
  username: string; // Add username as it's required by the frontend and backend entity

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  passwordConfirm: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsBoolean() // Keep coach for now, although it's not in the frontend form yet
  coach: boolean;
}
