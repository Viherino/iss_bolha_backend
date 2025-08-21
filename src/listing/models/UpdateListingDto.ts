import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  category_id?: number;

  @IsOptional()
  @IsEnum(['new', 'used', 'refurbished'])
  condition?: string;

  @IsOptional()
  @IsEnum(['active', 'sold', 'expired', 'removed'])
  status?: string;
}
