import { PrismaClient, UserRole, InstitutionType, QuestionType, QuestionCategory, QuestionScope, ProjectStatus, ApprovalStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  console.log('🗑️  Limpando dados existentes...');
  await prisma.notification.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.surveyParticipant.deleteMany();
  await prisma.fieldSurvey.deleteMany();
  await prisma.questionnaireParticipant.deleteMany();
  await prisma.questionnaireQuestion.deleteMany();
  await prisma.questionnaire.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.projectCoordinator.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.question.deleteMany();
  await prisma.project.deleteMany();
  await prisma.researchGroup.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.researcher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  const hashedPassword = await bcrypt.hash('Senha@123', 12);

  // 1. Criar Instituição Principal
  console.log('🏛️  Criando instituições...');
  const institution = await prisma.institution.create({
    data: {
      cnpj: '12345678000190',
      name: '#Universidade Federal de Teste',
      acronym: '#UFT',
      type: InstitutionType.ACADEMICA,
      email: 'contato@uft.edu.br',
      phone: '1133334444',
      website: 'https://www.uft.edu.br',
      address: '#Rua das Flores, 123',
      city: '#São Paulo',
      state: 'SP',
      zipCode: '01234567',
      country: 'Brasil',
      description: '#Instituição de ensino superior focada em pesquisa científica',
      foundedAt: new Date('1960-01-01'),
    },
  });

  // 2. Criar Usuários e Pesquisadores
  console.log('👤 Criando usuários e pesquisadores...');
  
  const coordUser = await prisma.user.create({
    data: {
      email: 'coordenador@teste.com',
      password: hashedPassword,
      cpf: '12345678900',
      name: '#Dr. João Coordenador Silva',
      phone: '11987654321',
      role: UserRole.COORDENADOR_PROJETO,
      researcher: {
        create: {
          role: UserRole.COORDENADOR_PROJETO,
          academicTitle: '#Doutor em Ciências da Saúde',
          lattesNumber: '1234567890123456',
          orcidId: '0000-0002-1234-5678',
          specialization: '#Epidemiologia, Saúde Pública',
          primaryInstitutionId: institution.id,
        },
      },
    },
    include: {
      researcher: true,
    },
  });

  const pesquisador1User = await prisma.user.create({
    data: {
      email: 'pesquisador1@teste.com',
      password: hashedPassword,
      cpf: '98765432100',
      name: '#Dra. Maria Pesquisadora',
      phone: '11987654322',
      role: UserRole.PESQUISADOR,
      researcher: {
        create: {
          role: UserRole.PESQUISADOR,
          primaryInstitutionId: institution.id,
          academicTitle: '#Mestre em Saúde Pública',
          lattesNumber: '9876543210987654',
          orcidId: '0000-0001-9876-5432',
          specialization: '#Pesquisa Clínica',
        },
      },
    },
    include: {
      researcher: true,
    },
  });

  const pesquisador2User = await prisma.user.create({
    data: {
      email: 'pesquisador2@teste.com',
      password: hashedPassword,
      cpf: '11122233344',
      name: '#Prof. Carlos Orientador',
      phone: '11987654323',
      role: UserRole.ORIENTADOR,
      researcher: {
        create: {
          role: UserRole.ORIENTADOR,
          primaryInstitutionId: institution.id,
          academicTitle: '#Doutor em Medicina',
          lattesNumber: '1112223334445556',
          orcidId: '0000-0003-1111-2222',
          specialization: '#Medicina Preventiva',
        },
      },
    },
    include: {
      researcher: true,
    },
  });

  // Atualizar instituição com coordenador
  await prisma.institution.update({
    where: { id: institution.id },
    data: { coordinatorId: coordUser.researcher!.id },
  });

  console.log(`✅ Coordenador: ${coordUser.email}`);
  console.log(`✅ Pesquisador 1: ${pesquisador1User.email}`);
  console.log(`✅ Pesquisador 2: ${pesquisador2User.email}`);

  // 3. Criar Segunda Instituição
  const institution2 = await prisma.institution.create({
    data: {
      cnpj: '98765432000111',
      name: '#Hospital Universitário de Pesquisa',
      acronym: '#HUP',
      type: InstitutionType.HOSPITAL,
      coordinatorId: coordUser.researcher!.id,
      email: 'contato@hup.org.br',
      phone: '1144445555',
      city: '#Rio de Janeiro',
      state: 'RJ',
      zipCode: '20000000',
      country: 'Brasil',
      description: '#Hospital voltado para pesquisa clínica',
    },
  });

  console.log(`✅ Segunda instituição: ${institution2.name}`);

  // 4. Criar Questões
  console.log('❓ Criando questões...');
  
  const question1 = await prisma.question.create({
    data: {
      text: '#Qual é a sua idade?',
      type: QuestionType.NUMERICA,
      category: QuestionCategory.DEMOGRAFICA,
      scope: QuestionScope.NACIONAL,
      isRequired: true,
      minValue: 0,
      maxValue: 120,
      helpText: '#Informe sua idade em anos completos',
      objective: '#Coletar dados demográficos dos participantes',
      targetAudience: '#Todos os participantes',
      origin: 'MANUAL',
      creatorId: coordUser.researcher!.id,
      version: 1,
    },
  });

  const question2 = await prisma.question.create({
    data: {
      text: '#Qual o seu nível de escolaridade?',
      type: QuestionType.MULTIPLA_ESCOLHA,
      category: QuestionCategory.DEMOGRAFICA,
      scope: QuestionScope.NACIONAL,
      isRequired: true,
      options: {
        choices: [
          '#Ensino Fundamental Incompleto',
          '#Ensino Fundamental Completo',
          '#Ensino Médio Incompleto',
          '#Ensino Médio Completo',
          '#Ensino Superior Incompleto',
          '#Ensino Superior Completo',
          '#Pós-graduação',
        ],
      },
      objective: '#Identificar perfil educacional',
      origin: 'MANUAL',
      creatorId: coordUser.researcher!.id,
      version: 1,
    },
  });

  const question3 = await prisma.question.create({
    data: {
      text: '#Como você avalia sua qualidade de vida?',
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
      objective: '#Avaliar percepção de qualidade de vida',
      origin: 'MANUAL',
      creatorId: coordUser.researcher!.id,
      version: 1,
    },
  });

  const question4 = await prisma.question.create({
    data: {
      text: '#Você tem alguma doença crônica?',
      type: QuestionType.SIM_NAO,
      category: QuestionCategory.CLINICA,
      scope: QuestionScope.NACIONAL,
      isRequired: true,
      helpText: '#Considere diabetes, hipertensão, asma, etc.',
      objective: '#Identificar condições de saúde pré-existentes',
      origin: 'MANUAL',
      creatorId: coordUser.researcher!.id,
      version: 1,
    },
  });

  console.log(`✅ 4 questões criadas`);

  // 5. Criar Grupo de Pesquisa
  console.log('🔬 Criando grupo de pesquisa...');
  const researchGroup = await prisma.researchGroup.create({
    data: {
      name: '#Grupo de Estudos em Saúde Pública',
      description: '#Grupo dedicado à pesquisa em saúde coletiva e epidemiologia',
      institutionId: institution.id,
      leaderId: coordUser.researcher!.id,
      cnpqCertified: true,
      certificationDate: new Date('2020-01-15'),
      researchLines: ['#Epidemiologia', '#Saúde Pública', '#Doenças Crônicas'],
      keywords: ['#saúde', '#pesquisa', '#epidemiologia'],
      members: {
        create: [
          {
            researcherId: coordUser.researcher!.id,
            role: UserRole.COORDENADOR_GRUPO,
            joinedAt: new Date('2020-01-15'),
          },
          {
            researcherId: pesquisador1User.researcher!.id,
            role: UserRole.PESQUISADOR,
            joinedAt: new Date('2020-02-01'),
          },
          {
            researcherId: pesquisador2User.researcher!.id,
            role: UserRole.ORIENTADOR,
            joinedAt: new Date('2020-03-01'),
          },
        ],
      },
    },
  });

  console.log(`✅ Grupo de pesquisa: ${researchGroup.name}`);

  // 6. Criar Projeto
  console.log('📋 Criando projeto...');
  const project = await prisma.project.create({
    data: {
      title: '#Estudo sobre Prevalência de Doenças Crônicas',
      description: '#Projeto de pesquisa para avaliar a prevalência de doenças crônicas na população brasileira',
      researchGroupId: researchGroup.id,
      institutionId: institution.id,
      status: ProjectStatus.EM_ANDAMENTO,
      startDate: new Date('2024-01-01'),
      expectedEndDate: new Date('2025-12-31'),
      objectives: '#Mapear doenças crônicas, Identificar fatores de risco, Propor intervenções',
      methodology: '#Estudo transversal com aplicação de questionários',
      ethicsCommitteeApproval: true,
      approvalNumber: '#CAAE-12345678.9.0000.5555',
      approvalDate: new Date('2023-11-15'),
      budget: 150000.50,
      fundingSource: '#CNPq, FAPESP',
      keywords: ['#doenças crônicas', '#epidemiologia', '#saúde pública'],
      coordinators: {
        create: [
          {
            researcherId: coordUser.researcher!.id,
            role: UserRole.COORDENADOR_PROJETO,
            assignedAt: new Date('2024-01-01'),
          },
        ],
      },
      members: {
        create: [
          {
            researcherId: pesquisador1User.researcher!.id,
            role: UserRole.PESQUISADOR,
            joinedAt: new Date('2024-01-15'),
          },
          {
            researcherId: pesquisador2User.researcher!.id,
            role: UserRole.ORIENTADOR,
            joinedAt: new Date('2024-01-15'),
          },
        ],
      },
    },
  });

  console.log(`✅ Projeto: ${project.title}`);

  // 7. Criar Questionário
  console.log('📝 Criando questionário...');
  const questionnaire = await prisma.questionnaire.create({
    data: {
      title: '#Questionário de Saúde Geral',
      description: '#Avaliação completa de condições de saúde e hábitos de vida',
      projectId: project.id,
      creatorId: coordUser.researcher!.id,
      version: 1,
      isActive: true,
      estimatedDuration: 15,
      instructions: '#Por favor, responda todas as questões com atenção e honestidade',
      welcomeMessage: '#Bem-vindo ao questionário de saúde',
      thankYouMessage: '#Obrigado por participar da pesquisa',
      allowAnonymous: true,
      questions: {
        create: [
          {
            questionId: question1.id,
            order: 1,
            required: true,
          },
          {
            questionId: question2.id,
            order: 2,
            required: true,
          },
          {
            questionId: question3.id,
            order: 3,
            required: true,
          },
          {
            questionId: question4.id,
            order: 4,
            required: true,
          },
        ],
      },
    },
  });

  console.log(`✅ Questionário: ${questionnaire.title}`);

  // 8. Criar Pesquisa de Campo
  console.log('🗺️  Criando pesquisa de campo...');
  const fieldSurvey = await prisma.fieldSurvey.create({
    data: {
      title: '#Coleta de Dados - Região Sul',
      description: '#Pesquisa de campo para coleta de dados em hospitais da região sul',
      projectId: project.id,
      questionnaireId: questionnaire.id,
      researchGroupId: researchGroup.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      location: '#Porto Alegre, Curitiba, Florianópolis',
      targetPopulation: '#Pacientes com doenças crônicas',
      participants: {
        create: [
          {
            researcherId: coordUser.researcher!.id,
            role: UserRole.COORDENADOR_PROJETO,
            joinedAt: new Date('2024-06-01'),
          },
          {
            researcherId: pesquisador1User.researcher!.id,
            role: UserRole.PESQUISADOR,
            joinedAt: new Date('2024-06-01'),
          },
        ],
      },
    },
  });

  console.log(`✅ Pesquisa de campo: ${fieldSurvey.title}`);

  // 9. Criar Aprovações
  console.log('✅ Criando aprovações...');
  
  const approval1 = await prisma.approvalRequest.create({
    data: {
      projectId: project.id,
      requesterId: coordUser.researcher!.id,
      approverId: pesquisador2User.researcher!.id,
      status: ApprovalStatus.APROVADO,
      type: 'COMITE_ETICA',
      submittedAt: new Date('2023-10-01'),
      reviewedAt: new Date('2023-11-15'),
      comments: '#Projeto aprovado pelo Comitê de Ética em Pesquisa',
      documentUrl: '#https://example.com/docs/etica-approval.pdf',
      certificateNumber: '#CAAE-12345678.9.0000.5555',
    },
  });

  const approval2 = await prisma.approvalRequest.create({
    data: {
      projectId: project.id,
      requesterId: pesquisador1User.researcher!.id,
      approverId: coordUser.researcher!.id,
      status: ApprovalStatus.PENDENTE,
      type: 'COORDENADOR',
      submittedAt: new Date('2024-11-01'),
      comments: '#Aguardando revisão final do coordenador',
    },
  });

  console.log(`✅ 2 aprovações criadas`);

  // 10. Criar Notificações
  console.log('🔔 Criando notificações...');

  await prisma.notification.create({
    data: {
      type: 'NOVO_PROJETO',
      title: '#Novo projeto cadastrado',
      message: '#O projeto "Estudo sobre Prevalência de Doenças Crônicas" foi cadastrado e aguarda sua revisão',
      receiverId: coordUser.researcher!.id,
      senderId: pesquisador1User.researcher!.id,
      read: false,
      relatedId: project.id,
      relatedType: 'PROJECT',
    },
  });

  await prisma.notification.create({
    data: {
      type: 'NOVO_MEMBRO',
      title: '#Você foi adicionado a um projeto',
      message: '#Você foi adicionado como membro do projeto "Estudo sobre Prevalência de Doenças Crônicas"',
      receiverId: pesquisador1User.researcher!.id,
      senderId: coordUser.researcher!.id,
      read: false,
      relatedId: project.id,
      relatedType: 'PROJECT',
    },
  });

  await prisma.notification.create({
    data: {
      type: 'APROVACAO_PENDENTE',
      title: '#Nova aprovação pendente',
      message: '#Há uma aprovação aguardando sua revisão no projeto "Estudo sobre Prevalência de Doenças Crônicas"',
      receiverId: coordUser.researcher!.id,
      senderId: pesquisador1User.researcher!.id,
      read: false,
      relatedId: approval2.id,
      relatedType: 'APPROVAL',
    },
  });

  await prisma.notification.create({
    data: {
      type: 'PRAZO_PROXIMO',
      title: '#Prazo da pesquisa de campo se aproxima',
      message: '#A pesquisa de campo "Coleta de Dados - Região Sul" encerra em 30 dias',
      receiverId: coordUser.researcher!.id,
      read: true,
      relatedId: fieldSurvey.id,
      relatedType: 'FIELD_SURVEY',
      readAt: new Date(),
    },
  });

  console.log(`✅ 4 notificações criadas`);

  // 11. Criar dados adicionais marcados com #
  console.log('📦 Criando dados adicionais...');

  // Usuários extras
  const testUser1 = await prisma.user.create({
    data: {
      email: '#teste1@exemplo.com',
      name: '#Usuário Teste 1',
      cpf: '11111111111',
      phone: '11911111111',
      password: hashedPassword,
      role: UserRole.ALUNO,
      researcher: {
        create: {
          role: UserRole.ALUNO,
          primaryInstitutionId: institution.id,
          academicTitle: '#Graduando',
        },
      },
    },
  });

  const testUser2 = await prisma.user.create({
    data: {
      email: '#teste2@exemplo.com',
      name: '#Usuário Teste 2',
      cpf: '22222222222',
      phone: '11922222222',
      password: hashedPassword,
      role: UserRole.VOLUNTARIO,
      researcher: {
        create: {
          role: UserRole.VOLUNTARIO,
          primaryInstitutionId: institution.id,
        },
      },
    },
  });

  // Questões extras
  await prisma.question.create({
    data: {
      text: '#Qual é o seu peso em kg?',
      type: QuestionType.NUMERICA,
      category: QuestionCategory.CLINICA,
      scope: QuestionScope.LOCAL,
      isRequired: true,
      minValue: 30,
      maxValue: 250,
      creatorId: coordUser.researcher!.id,
      origin: 'MANUAL',
      version: 1,
    },
  });

  await prisma.question.create({
    data: {
      text: '#Descreva sua rotina alimentar',
      type: QuestionType.ABERTA,
      category: QuestionCategory.CLINICA,
      scope: QuestionScope.LOCAL,
      isRequired: false,
      creatorId: coordUser.researcher!.id,
      origin: 'MANUAL',
      version: 1,
    },
  });

  console.log(`✅ Dados adicionais criados`);

  // 12. Resumo Final
  const counts = {
    users: await prisma.user.count(),
    researchers: await prisma.researcher.count(),
    institutions: await prisma.institution.count(),
    questions: await prisma.question.count(),
    researchGroups: await prisma.researchGroup.count(),
    projects: await prisma.project.count(),
    questionnaires: await prisma.questionnaire.count(),
    fieldSurveys: await prisma.fieldSurvey.count(),
    approvals: await prisma.approvalRequest.count(),
    notifications: await prisma.notification.count(),
  };

  console.log('\n📊 Resumo Final do Seed:');
  console.log('=====================================');
  console.log(`👤 Usuários: ${counts.users}`);
  console.log(`🔬 Pesquisadores: ${counts.researchers}`);
  console.log(`🏛️  Instituições: ${counts.institutions}`);
  console.log(`❓ Questões: ${counts.questions}`);
  console.log(`🔬 Grupos de Pesquisa: ${counts.researchGroups}`);
  console.log(`📋 Projetos: ${counts.projects}`);
  console.log(`📝 Questionários: ${counts.questionnaires}`);
  console.log(`🗺️  Pesquisas de Campo: ${counts.fieldSurveys}`);
  console.log(`✅ Aprovações: ${counts.approvals}`);
  console.log(`🔔 Notificações: ${counts.notifications}`);
  console.log('=====================================');
  console.log('\n🔑 Credenciais de teste:');
  console.log('Email: coordenador@teste.com');
  console.log('Email: pesquisador1@teste.com');
  console.log('Email: pesquisador2@teste.com');
  console.log('Senha (todos): Senha@123');
  console.log('\n💡 Dica: Dados marcados com # podem ser facilmente identificados e deletados');
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
