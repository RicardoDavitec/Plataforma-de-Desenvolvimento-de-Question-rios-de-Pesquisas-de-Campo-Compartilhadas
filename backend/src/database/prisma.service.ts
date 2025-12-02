import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    console.log('✅ [PrismaService] Inicializado para PostgreSQL');
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma conectado ao PostgreSQL com sucesso');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
