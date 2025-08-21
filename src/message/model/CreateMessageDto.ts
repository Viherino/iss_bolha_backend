import { IsString, IsNumber } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  recipientId: number;

  @IsNumber()
  listingId: number;

  @IsString()
  content: string;
}
