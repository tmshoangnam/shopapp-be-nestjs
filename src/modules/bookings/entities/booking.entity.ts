// Booking and Payment status enums will be imported from Prisma client
// These are generated types from the Prisma schema

export class BookingEntity {
  id: string;
  userId: string;
  serviceId: string;
  partnerId?: string;
  staffId?: string;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  status: string; // BookingStatus enum from Prisma
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  paymentStatus: string; // PaymentStatus enum from Prisma
  paymentMethod?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };

  service?: {
    id: string;
    name: string;
    description: string;
    category: string;
    duration: number;
    price: number;
    image: string;
  };

  partner?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };

  payments?: Array<{
    id: string;
    amount: number;
    currency: string;
    method: string;
    status: string; // PaymentStatus enum from Prisma
    transactionId?: string;
    gateway?: string;
    createdAt: Date;
  }>;
}
