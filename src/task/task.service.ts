import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { Task } from './entities/task.entity';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  // ─── CREATE ─────────────────────────────────────────────────────────────────
  async create(dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create(dto);
    return this.taskRepo.save(task);
  }

  // ─── READ ALL (with filter + pagination) ────────────────────────────────────
  async findAll(query: QueryTaskDto): Promise<PaginatedResult<Task>> {
    const { status, dueDateFrom, dueDateTo, page = 1, limit = 10 } = query;

    const where: FindOptionsWhere<Task> = {};

    // Filter: status
    if (status) {
      where.status = status;
    }

    // Filter: date range
    if (dueDateFrom && dueDateTo) {
      where.dueDate = Between(
        new Date(dueDateFrom),
        new Date(dueDateTo),
      ) as any;
    } else if (dueDateFrom) {
      where.dueDate = Between(
        new Date(dueDateFrom),
        new Date('9999-12-31'),
      ) as any;
    } else if (dueDateTo) {
      where.dueDate = Between(
        new Date('0001-01-01'),
        new Date(dueDateTo),
      ) as any;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.taskRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── READ ONE ────────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    return task;
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id); // throws if not found
    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  // ─── DELETE ──────────────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    const task = await this.findOne(id); // throws if not found
    await this.taskRepo.remove(task);
    return { message: `Task "${task.title}" deleted successfully` };
  }
}
