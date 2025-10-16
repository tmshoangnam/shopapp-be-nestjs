import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewsRepository } from './reviews.repository';
import { CreateReviewDto, UpdateReviewDto, ReviewFilterDto } from './dto/reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService, private readonly reviewsRepository: ReviewsRepository) {}

  async create(userId: string, data: CreateReviewDto) {
    // Check if appointment exists and belongs to user
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { review: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.userId !== userId) {
      throw new BadRequestException('You can only review your own appointments');
    }

    if (appointment.status !== 'COMPLETED') {
      throw new BadRequestException('You can only review completed appointments');
    }

    if (appointment.review) {
      throw new BadRequestException('This appointment has already been reviewed');
    }

    return this.reviewsRepository.create({
      userId,
      serviceId: appointment.serviceId,
      appointmentId: data.appointmentId,
      rating: data.rating,
      comment: data.comment,
    });
  }

  async findAll(filter: ReviewFilterDto) {
    return this.reviewsRepository.findAll(filter);
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        appointment: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: string, userId: string, data: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new BadRequestException('You can only update your own reviews');
    }

    return this.reviewsRepository.update(id, data);
  }

  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    return this.reviewsRepository.delete(id);
  }

  async getServiceRatingSummary(serviceId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { serviceId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }
}
