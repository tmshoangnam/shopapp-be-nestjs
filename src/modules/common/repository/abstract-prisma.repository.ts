import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResult } from './base-repository.interface';

export abstract class AbstractPrismaRepository<TRecord, TEntity, CreateDto, UpdateDto, QueryDto = any> {
  protected constructor(protected readonly prisma: PrismaService) {}

  protected abstract get model(): any;
  protected abstract toEntity(record: TRecord): TEntity;
  protected abstract toCreateData(dto: CreateDto): any;
  protected abstract toUpdateData(dto: UpdateDto): any;
  protected buildWhereClause(options: QueryDto): any { return {}; }
  protected defaultInclude(): any { return undefined; }

  async create(dto: CreateDto): Promise<TEntity> {
    const record = await this.model.create({ data: this.toCreateData(dto), include: this.defaultInclude() });
    return this.toEntity(record);
  }

  async findById(id: string): Promise<TEntity | null> {
    const record = await this.model.findUnique({ where: { id }, include: this.defaultInclude() });
    return record ? this.toEntity(record) : null;
  }

  async findAll(options: any = {}): Promise<PaginatedResult<TEntity>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(options);
    const [records, total] = await Promise.all([
      this.model.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder }, include: this.defaultInclude() }),
      this.model.count({ where }),
    ]);
    return {
      data: records.map((r: TRecord) => this.toEntity(r)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, dto: UpdateDto): Promise<TEntity> {
    const record = await this.model.update({ where: { id }, data: this.toUpdateData(dto), include: this.defaultInclude() });
    return this.toEntity(record);
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }
}

