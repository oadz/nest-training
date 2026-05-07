// ─── update-task.dto.ts ──────────────────────────────────────────────────────
import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

// PartialType makes all fields optional automatically — DRY principle
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

// ─── query-task.dto.ts ───────────────────────────────────────────────────────
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TaskStatus } from '../entities/task.entity';

export class QueryTaskDto {
  // Filter by status
  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  // Filter by date range
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filter tasks from this date',
  })
  @IsDateString()
  @IsOptional()
  dueDateFrom?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Filter tasks until this date',
  })
  @IsDateString()
  @IsOptional()
  dueDateTo?: string;

  // Pagination
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}
