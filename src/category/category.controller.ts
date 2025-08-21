import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { AuthGuard } from '../auth/auth.guard';
import { CreateCategoryDto } from './models/createCategoryDto';

@Controller('category')
export class CategoryController {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  // Create a new category (admin only)
  @Post()
  @UseGuards(AuthGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const newCategory = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(newCategory);
  }

  // Get all categories
  @Get()
  async getAllCategories() {
    return this.categoriesRepository.find({
      relations: ['parentCategory'], // Corrected relation name to parentCategory
    });
  }

  // Get category with its listings
  @Get(':id')
  async getCategoryWithListings(@Param('id') id: number) {
    return this.categoriesRepository.findOne({
      where: { id },
      relations: ['listings', 'parent_category'],
    });
  }
}
