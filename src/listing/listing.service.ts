import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from 'src/entities/listing.entity';
import { User } from 'src/entities/user.entity';
import { Category } from 'src/entities/category.entity';
import { CreateListingDto } from './models/CreateListingDto';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(Listing) private readonly listingRepository: Repository<Listing>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createListingDto: CreateListingDto, userId: number): Promise<Listing> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Find category by ID
    const category = await this.categoryRepository.findOne({ where: { id: createListingDto.category_id } });
    if (!category) {
      throw new BadRequestException('Category not found.');
    }

    // Removed logic for creating new category by name as we now select by ID

    const newListing = this.listingRepository.create({
      ...createListingDto,
      user: user,
      category: category,
      status: 'active', // Default status
      condition: createListingDto.condition || 'used', // Default condition if not provided
      price: +createListingDto.price, // Ensure price is a number
    });

    return this.listingRepository.save(newListing);
  }
}
