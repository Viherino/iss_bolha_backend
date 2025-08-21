import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber() // Changed back to IsNumber and category_id
  category_id: number;

  @IsOptional()
  @IsString()
  condition?: string;
}
