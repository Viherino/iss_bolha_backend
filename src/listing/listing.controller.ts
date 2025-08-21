import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard';
import { Listing } from '../entities/listing.entity';
import { CreateListingDto } from './models/CreateListingDto';
import { UpdateListingDto } from './models/UpdateListingDto';
import { ListingService } from './listing.service'; // Import ListingService
import { AuthService } from '../auth/auth.service'; // Import AuthService

@Controller('listing')
export class ListingController {
  constructor(
    @InjectRepository(Listing)
    private readonly listingsRepository: Repository<Listing>, // Keep if other methods still use it, otherwise can remove
    private readonly listingService: ListingService, // Inject ListingService
    private readonly authService: AuthService, // Inject AuthService
  ) {}

  // Create a new listing
  @Post()
  @UseGuards(AuthGuard)
  async createListing(@Body() createListingDto: CreateListingDto, @Req() req) {
    const userId = await this.authService.userId(req); // Get userId from AuthService
    return this.listingService.create(createListingDto, userId); // Delegate to service
  }

  // Get all listings
  @Get()
  async getAllListings() {
    return this.listingsRepository.find({
      relations: ['user', 'category', 'images'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get listings by user
  @Get('my-listings')
  @UseGuards(AuthGuard)
  async getUserListings(@Req() req) {
    const userId = req.user.user_id; // Still using req.user.user_id from AuthGuard
    return this.listingsRepository.find({
      where: { user: { id: userId } }, // Corrected property from `id` to `user: { id: userId }` for relationship
      order: { createdAt: 'DESC' },
    });
  }

  // Search listings
  @Get('search')
  async searchListings(
    @Query('q') query: string,
    @Query('category') categoryId?: string, // Change type to string
    @Query('min_price') minPrice?: number,
    @Query('max_price') maxPrice?: number,
  ) {
    const searchQuery = this.listingsRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.user', 'user')
      .leftJoinAndSelect('listing.category', 'category')
      .where('listing.status = :status', { status: 'active' });

    if (query) {
      searchQuery.andWhere(
        'listing.title ILIKE :query',
        { query: `%${query}%` },
      );
    }

    if (categoryId) {
      searchQuery.andWhere('listing.category.id = :categoryId', { categoryId: Number(categoryId) }); // Convert to number
    }

    if (minPrice) {
      searchQuery.andWhere('listing.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      searchQuery.andWhere('listing.price <= :maxPrice', { maxPrice });
    }

    return searchQuery.getMany();
  }

  // Get single listing
  @Get(':id')
  async getSingleListing(@Param('id') id: number) {
    const listing = await this.listingsRepository.findOne({
      where: { id },
      relations: ['user', 'category', 'images'],
    });

    // Increment view count
    if (listing) {
      listing.viewsCount += 1;
      await this.listingsRepository.save(listing);
    }

    return listing;
  }

  // Update listing
  @Put(':id')
  @UseGuards(AuthGuard)
  async updateListing(
    @Param('id') id: number,
    @Body() updateListingDto: UpdateListingDto,
    @Req() req,
  ) {
    const userId = req.user.user_id;

    // Check if listing belongs to user
    const listing = await this.listingsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found or unauthorized');
    }

    return this.listingsRepository.save({
      ...listing,
      ...updateListingDto,
      updatedAt: new Date(), // Use updatedAt from entity
    });
  }

  // Delete listing
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteListing(@Param('id') id: number, @Req() req) {
    const userId = req.user.user_id;

    const listing = await this.listingsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found or unauthorized');
    }

    await this.listingsRepository.remove(listing);
    return { message: 'Listing successfully deleted' };
  }
}
