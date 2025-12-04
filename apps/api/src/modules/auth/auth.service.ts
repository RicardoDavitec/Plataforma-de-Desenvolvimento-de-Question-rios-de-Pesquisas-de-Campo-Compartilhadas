import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12; // Mais seguro que 10
  private readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 30; // 30 dias

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registra um novo usuário e cria seu perfil de pesquisador em uma transação
   * @param signUpDto Dados de cadastro do usuário e pesquisador
   * @returns Usuário criado com token JWT
   */
  async signUp(signUpDto: SignUpDto) {
    this.logger.log(`Tentativa de cadastro: ${signUpDto.email}`);

    // Validação: Verificar se usuário já existe
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: signUpDto.email },
          { cpf: this.cleanCpf(signUpDto.cpf) },
        ],
      },
    });

    if (existingUser) {
      this.logger.warn(`Tentativa de cadastro duplicado: ${signUpDto.email}`);
      throw new ConflictException(
        'Já existe um usuário cadastrado com este email ou CPF'
      );
    }

    // Validação: Verificar se instituição principal existe
    const institution = await this.prisma.institution.findUnique({
      where: { id: signUpDto.primaryInstitutionId },
    });

    if (!institution) {
      throw new BadRequestException('Instituição principal não encontrada');
    }

    // Validação: Verificar instituição secundária (se fornecida)
    if (signUpDto.secondaryInstitutionId) {
      const secondaryInstitution = await this.prisma.institution.findUnique({
        where: { id: signUpDto.secondaryInstitutionId },
      });

      if (!secondaryInstitution) {
        throw new BadRequestException('Instituição secundária não encontrada');
      }
    }

    // Hash da senha com bcrypt (12 rounds para segurança reforçada)
    const hashedPassword = await bcrypt.hash(
      signUpDto.password, 
      this.BCRYPT_ROUNDS
    );

    try {
      // Criar User e Researcher em uma transação atômica
      const result = await this.prisma.$transaction(async (tx) => {
        // Criar usuário
        const user = await tx.user.create({
          data: {
            email: signUpDto.email.toLowerCase().trim(),
            password: hashedPassword,
            cpf: this.cleanCpf(signUpDto.cpf),
            name: signUpDto.name.trim(),
            phone: signUpDto.phone?.trim(),
          },
        });

        // Criar perfil de pesquisador
        const researcher = await tx.researcher.create({
          data: {
            userId: user.id,
            primaryInstitutionId: signUpDto.primaryInstitutionId,
            secondaryInstitutionId: signUpDto.secondaryInstitutionId,
            academicTitle: signUpDto.academicTitle?.trim(),
            lattesNumber: signUpDto.lattesNumber?.trim(),
            orcidId: signUpDto.orcidId?.trim(),
            specialization: signUpDto.specialization?.trim(),
          },
          include: {
            primaryInstitution: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            secondaryInstitution: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        });

        // TODO: Criar notificação de boas-vindas
        // await tx.notification.create({
        //   data: {
        //     receiverId: user.id,
        //     title: 'Bem-vindo ao ResearchQuest!',
        //     message: 'Seu cadastro foi realizado com sucesso.',
        //     type: 'SYSTEM',
        //   },
        // });

        return { user, researcher };
      });

      this.logger.log(`Usuário criado com sucesso: ${result.user.id}`);

      // Gerar tokens JWT (access e refresh)
      const accessToken = this.generateAccessToken(
        result.user.id, 
        result.user.email,
        signUpDto.role
      );
      
      const refreshToken = await this.generateRefreshToken(result.user.id);

      // Retornar dados do usuário (sem senha)
      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          cpf: this.formatCpf(result.user.cpf),
          phone: result.user.phone,
          createdAt: result.user.createdAt,
        },
        researcher: {
          id: result.researcher.id,
          primaryInstitution: result.researcher.primaryInstitution,
          secondaryInstitution: result.researcher.secondaryInstitution,
          academicTitle: result.researcher.academicTitle,
          lattesNumber: result.researcher.lattesNumber,
          orcidId: result.researcher.orcidId,
          specialization: result.researcher.specialization,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(`Erro ao criar usuário: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao criar usuário. Tente novamente.');
    }
  }

  /**
   * Remove formatação do CPF (mantém apenas números)
   */
  private cleanCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Formata CPF para exibição (000.000.000-00)
   */
  private formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Autentica um usuário existente
   * @param signInDto Credenciais de login (email e senha)
   * @returns Usuário autenticado com token JWT
   */
  async signIn(signInDto: SignInDto) {
    this.logger.log(`Tentativa de login: ${signInDto.email}`);

    const user = await this.validateUser(signInDto.email, signInDto.password);
    
    if (!user) {
      this.logger.warn(`Login falhou: ${signInDto.email}`);
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    // Determinar role principal do usuário
    const role = user.researcher?.primaryInstitution 
      ? 'PESQUISADOR' 
      : 'ALUNO';

    const accessToken = this.generateAccessToken(user.id, user.email, role);
    const refreshToken = await this.generateRefreshToken(user.id);

    this.logger.log(`Login bem-sucedido: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        cpf: this.formatCpf(user.cpf),
        phone: user.phone,
      },
      researcher: user.researcher ? {
        id: user.researcher.id,
        primaryInstitution: user.researcher.primaryInstitution,
        secondaryInstitution: user.researcher.secondaryInstitution,
        academicTitle: user.researcher.academicTitle,
      } : null,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Valida credenciais do usuário
   * @param email Email do usuário
   * @param password Senha em texto plano
   * @returns Dados do usuário (sem senha) ou null se inválido
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        researcher: {
          include: {
            primaryInstitution: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            secondaryInstitution: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Comparar senha com hash usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Remover senha antes de retornar
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Gera access token JWT com informações do usuário
   * @param userId ID do usuário
   * @param email Email do usuário
   * @param role Papel do usuário no sistema
   * @returns Access token JWT assinado
   */
  private generateAccessToken(userId: string, email: string, role: string): string {
    const payload = { 
      sub: userId, 
      email: email.toLowerCase(),
      role,
      type: 'access',
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Gera refresh token e salva no banco de dados
   * @param userId ID do usuário
   * @param deviceInfo Informações do dispositivo (opcional)
   * @param ipAddress Endereço IP (opcional)
   * @returns Refresh token JWT assinado
   */
  private async generateRefreshToken(
    userId: string, 
    deviceInfo?: string, 
    ipAddress?: string
  ): Promise<string> {
    // Gerar token aleatório único
    const tokenString = crypto.randomBytes(64).toString('hex');
    
    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    // Salvar no banco de dados
    await this.prisma.refreshToken.create({
      data: {
        token: tokenString,
        userId,
        expiresAt,
        deviceInfo,
        ipAddress,
      },
    });

    this.logger.log(`Refresh token criado para usuário: ${userId}`);
    return tokenString;
  }

  /**
   * Valida e renova tokens usando refresh token
   * @param refreshTokenDto Contém o refresh token
   * @returns Novos access e refresh tokens
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    // Buscar refresh token no banco
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            researcher: {
              include: {
                primaryInstitution: true,
              },
            },
          },
        },
      },
    });

    // Validações
    if (!storedToken) {
      this.logger.warn(`Tentativa de uso de refresh token inválido`);
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (storedToken.isRevoked) {
      this.logger.warn(`Tentativa de uso de refresh token revogado: ${storedToken.userId}`);
      throw new UnauthorizedException('Refresh token foi revogado');
    }

    if (new Date() > storedToken.expiresAt) {
      this.logger.warn(`Tentativa de uso de refresh token expirado: ${storedToken.userId}`);
      throw new UnauthorizedException('Refresh token expirado');
    }

    // Revogar o refresh token antigo
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Determinar role
    const role = storedToken.user.researcher?.primaryInstitution 
      ? 'PESQUISADOR' 
      : 'ALUNO';

    // Gerar novos tokens
    const newAccessToken = this.generateAccessToken(
      storedToken.user.id, 
      storedToken.user.email,
      role
    );
    
    const newRefreshToken = await this.generateRefreshToken(
      storedToken.user.id,
      storedToken.deviceInfo,
      storedToken.ipAddress
    );

    this.logger.log(`Tokens renovados para usuário: ${storedToken.user.id}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoga um refresh token específico (logout)
   * @param refreshToken Token a ser revogado
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (storedToken) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });
      this.logger.log(`Refresh token revogado: ${storedToken.userId}`);
    }
  }

  /**
   * Revoga todos os refresh tokens de um usuário (logout de todos os dispositivos)
   * @param userId ID do usuário
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { 
        userId,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });
    this.logger.log(`Todos os tokens revogados para usuário: ${userId}`);
  }

  /**
   * Remove refresh tokens expirados (executar periodicamente)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const deleted = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    this.logger.log(`${deleted.count} tokens expirados removidos`);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        researcher: {
          include: {
            primaryInstitution: true,
            secondaryInstitution: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const { password, ...result } = user;
    return result;
  }
}
