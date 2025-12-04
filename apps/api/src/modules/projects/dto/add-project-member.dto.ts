import { IsUUID, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AddProjectMemberDto {
  @ApiProperty({
    description: 'ID do pesquisador a ser adicionado',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID do pesquisador deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do pesquisador é obrigatório' })
  researcherId: string;

  @ApiPropertyOptional({
    description: 'Papel do membro no projeto',
    enum: UserRole,
    example: UserRole.PESQUISADOR,
  })
  @IsEnum(UserRole, { message: 'Papel inválido' })
  @IsOptional()
  role?: UserRole;
}
