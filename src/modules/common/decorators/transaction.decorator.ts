import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Decorator giúp tự động hoá transaction
 * Nếu method đã được gọi với tx (TransactionClient), thì dùng tx đó.
 * Nếu không, tự mở transaction mới và commit/rollback.
 */
export function Transactional() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const prisma: PrismaService = this.prisma;

      if (!prisma) {
        throw new Error(
          `@Transactional() yêu cầu class phải inject PrismaService với property 'prisma'`,
        );
      }

      const maybeTx = args.find(
        (arg) =>
          arg &&
          typeof arg === 'object' &&
          'user' in arg && // đơn giản check Prisma client có model user/post...
          'post' in arg,
      ) as Prisma.TransactionClient | undefined;

      // Nếu method đã có tx được truyền vào => dùng luôn
      if (maybeTx) {
        return originalMethod.apply(this, args);
      }

      // Nếu chưa có tx => mở transaction mới
      return prisma.$transaction(async (tx) => {
        // Thay thế tx cho prisma ở tham số đầu tiên nếu cần
        const newArgs = [tx, ...args];
        return originalMethod.apply(this, newArgs);
      });
    };

    return descriptor;
  };
}
