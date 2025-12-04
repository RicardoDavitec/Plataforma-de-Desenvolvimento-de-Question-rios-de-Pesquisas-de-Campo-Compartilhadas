import { PrismaClient, UserRole, InstitutionType, QuestionType, QuestionCategory, QuestionScope } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (cuidado em produção!)
  console.log('🗑️  Limpando dados existentes...');
  await prisma.question.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.researcher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  // 1. Criar usuário coordenador
  console.log('👤 Criando usuário coordenador...');
  const hashedPassword = await bcrypt.hash('Senha@123', 12);
  
  const coordUser = await prisma.user.create({
    data: {
      email: 'coordenador@teste.com',
      password: hashedPassword,
      cpf: '12345678900',
      name: 'Dr. João Coordenador Silva',
      phone: '11987654321',
    },
  });

  // 2. Criar instituição (temporariamente sem coordenador)
  console.log('🏛️  Criando instituição...');
  const institution = await prisma.institution.create({
    data: {
      cnpj: '12345678000190',
      name: 'Universidade Federal de Teste',
      type: InstitutionType.ACADEMICA,
      email: 'contato@uft.edu.br',
      phone: '1133334444',
      website: 'https://www.uft.edu.br',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234567',
      country: 'Brasil',
      description: 'Instituição de ensino superior focada em pesquisa científica',
      foundedAt: new Date('1960-01-01'),
      coordinator: {
        create: {
          userId: coordUser.id,
          role: UserRole.COORDENADOR_PROJETO,
          academicTitle: 'Doutor em Ciências da Saúde',
          latesId: '1234567890123456',
          orcidId: '0000-0002-1234-5678',
          specialization: 'Epidemiologia, Saúde Pública',
          primaryInstitutionId: undefined as any, // Será atualizado abaixo
        },
      },
    },
    include: {
      coordinator: true,
    },
  });

  // 3. Atualizar researcher com primaryInstitutionId
  const researcher = await prisma.researcher.update({
    where: { id: institution.coordinatorId },
    data: {
      primaryInstitutionId: institution.id,
    },
  });

  console.log(`✅ Coordenador criado: ${coordUser.email}`);
  console.log(`✅ Instituição criada: ${institution.name}`);
  console.log(`✅ Researcher ID: ${researcher.id}`);

  // 4. Criar mais usuários (pesquisadores)
  console.log('👥 Criando pesquisadores adicionais...');
  
  const pesquisador1 = await prisma.user.create({
    data: {
      email: 'pesquisador1@teste.com',
      password: hashedPassword,
      cpf: '98765432100',
      name: 'Dra. Maria Pesquisadora',
      phone: '11987654322',
      researcher: {
        create: {
          role: UserRole.PESQUISADOR,
          primaryInstitutionId: institution.id,
          academicTitle: 'Mestre em Saúde Pública',
          latesId: '9876543210987654',
          orcidId: '0000-0001-9876-5432',
          specialization: 'Pesquisa Clínica',
        },
      },
    },
  });

  const pesquisador2 = await prisma.user.create({
    data: {
      email: 'pesquisador2@teste.com',
      password: hashedPassword,
      cpf: '11122233344',
      name: 'Prof. Carlos Orientador',
      phone: '11987654323',
      researcher: {
        create: {
          role: UserRole.ORIENTADOR,
          primaryInstitutionId: institution.id,
          academicTitle: 'Doutor em Medicina',
          latesId: '1112223334445556',
          orcidId: '0000-0003-1111-2222',
          specialization: 'Medicina Preventiva',
        },
      },
    },
  });

  console.log(`✅ ${pesquisador1.email} criado`);
  console.log(`✅ ${pesquisador2.email} criado`);

  // 5. Criar segunda instituição
  console.log('🏛️  Criando segunda instituição...');
  const institution2 = await prisma.institution.create({
    data: {
      cnpj: '98765432000111',
      name: 'Hospital Universitário de Pesquisa',
      type: InstitutionType.HOSPITAL,
      coordinatorId: researcher.id,
      email: 'contato@hup.org.br',
      phone: '1144445555',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20000000',
      country: 'Brasil',
      description: 'Hospital voltado para pesquisa clínica',
    },
  });

  console.log(`✅ Segunda instituição criada: ${institution2.name}`);

  // 6. Criar questões de exemplo
  console.log('❓ Criando questões de exemplo...');

  const questions = [
    {
      text: 'Qual é a sua idade?',
      type: QuestionType.NUMERICA,
      category: QuestionCategory.DEMOGRAFICA,
      scope: QuestionScope.NACIONAL,
      isRequired: true,
      minValue: 0,
      maxValue: 120,
      helpText: 'Informe sua idade em anos completos',
      objective: 'Coletar dados demográficos dos participantes',
      targetAudience: 'Todos os participantes',
      origin: 'MANUAL',
    },
    {
      text: 'Qual o seu nível de escolaridade?',
      type: QuestionType.MULTIPLA_ESCOLHA,
      category: QuestionCategory.DEMOGRAFICA,
      scope: QuestionScope.NACIONAL,
      isRequired: true,
      options: {
        choices: [
          'Ensino Fundamental Incompleto',
          'Ensino Fundamental Completo',
          'Ensino Médio Incompleto',
          'Ensino Médio Completo',
          'Ensino Superior Incompleto',
          'Ensino Superior Completo',
          'Pós-graduação',
        ],
      },
      objective: 'Identificar perfil educacional',
      origin: 'MANUAL',
    },
    {
      text: 'Como você avalia sua qualidade de vida?',
      type: QuestionType.ESCALA_LIKERT,
      category: QuestionCategory.PSICOLOGICA,
      scope: QuestionScope.INTERNACIONAL,
      isRequired: true,
      likertMin: 1,
      likertMax: 5,
      likertLabels: {
        '1': 'Muito ruim',
        '2': 'Ruim',
        '3': 'Regular',
        '4': 'Boa',
        '5': 'Muito boa',
      },
      objective: 'Avaliar percepção de qualidade de vida',
      origin: 'MANUAL',
    },
    {
      text: 'Você tem alguma doença crônica?',
      type: QuestionType.SIM_NAO,
      category: QuestionCategory.CLINICA,
      scope: QuestionScope.NACIONAL,
      isRequired: true,
      helpText: 'Considere diabetes, hipertensão, asma, etc.',
      objective: 'Identificar condições de saúde pré-existentes',
      origin: 'MANUAL',
    },
    {
      text: 'Descreva seus principais sintomas',
      type: QuestionType.ABERTA,
      category: QuestionCategory.CLINICA,
      scope: QuestionScope.LOCAL,
      isRequired: false,
      helpText: 'Descreva em detalhes os sintomas que você apresenta',
      objective: 'Coletar relatos detalhados de sintomas',
      origin: 'MANUAL',
    },
    {
      text: 'Data da última consulta médica',
      type: QuestionType.DATA,
      category: QuestionCategory.CLINICA,
      scope: QuestionScope.LOCAL,
      isRequired: false,
      objective: 'Registrar histórico de consultas',
      origin: 'MANUAL',
    },
  ];

  for (const questionData of questions) {
    await prisma.question.create({
      data: {
        ...questionData,
        creatorId: researcher.id,
      },
    });
  }

  console.log(`✅ ${questions.length} questões criadas`);

  // 7. Resumo
  console.log('\n📊 Resumo do seed:');
  console.log('=====================================');
  console.log(`👤 Usuários: 3`);
  console.log(`🔬 Pesquisadores: 3`);
  console.log(`🏛️  Instituições: 2`);
  console.log(`❓ Questões: ${questions.length}`);
  console.log('=====================================');
  console.log('\n🔑 Credenciais de teste:');
  console.log('Email: coordenador@teste.com');
  console.log('Email: pesquisador1@teste.com');
  console.log('Email: pesquisador2@teste.com');
  console.log('Senha (todos): Senha@123');
  console.log('\n✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
