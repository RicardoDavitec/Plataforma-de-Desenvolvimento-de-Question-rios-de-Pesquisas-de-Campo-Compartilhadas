import { PrismaClient, UserRole, InstitutionType, QuestionType, QuestionCategory, QuestionScope, ProjectStatus, ApprovalStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (cuidado em produção!)
  console.log('🗑️  Limpando dados existentes...');
  await prisma.notification.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.fieldSurvey.deleteMany();
  await prisma.questionnaireQuestion.deleteMany();
  await prisma.questionnaire.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.researchGroupMember.deleteMany();
  await prisma.question.deleteMany();
  await prisma.project.deleteMany();
  await prisma.researchGroup.deleteMany();
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

  // 8. Criar Grupo de Pesquisa
  console.log('🔬 Criando grupo de pesquisa...');
  const researchGroup = await prisma.researchGroup.create({
    data: {
      name: '#Grupo de Estudos em Saúde Pública',
      description: '#Grupo dedicado à pesquisa em saúde coletiva e epidemiologia',
      institutionId: institution.id,
      leaderId: researcher.id,
      cnpqCertified: true,
      certificationDate: new Date('2020-01-15'),
      researchLines: ['#Epidemiologia', '#Saúde Pública', '#Doenças Crônicas'],
      keywords: ['#saúde', '#pesquisa', '#epidemiologia'],
      members: {
        create: [
          {
            userId: pesquisador1.id,
            role: UserRole.PESQUISADOR,
            joinedAt: new Date('2020-02-01'),
          },
          {
            userId: pesquisador2.id,
            role: UserRole.ORIENTADOR,
            joinedAt: new Date('2020-03-01'),
          },
        ],
      },
    },
  });

  console.log(`✅ Grupo de pesquisa criado: ${researchGroup.name}`);

  // 9. Criar Projeto
  console.log('📋 Criando projeto...');
  const project = await prisma.project.create({
    data: {
      title: '#Estudo sobre Prevalência de Doenças Crônicas',
      description: '#Projeto de pesquisa para avaliar a prevalência de doenças crônicas na população brasileira',
      researchGroupId: researchGroup.id,
      coordinatorId: researcher.id,
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
      members: {
        create: [
          {
            userId: pesquisador1.id,
            role: UserRole.PESQUISADOR,
            joinedAt: new Date('2024-01-15'),
          },
          {
            userId: pesquisador2.id,
            role: UserRole.ORIENTADOR,
            joinedAt: new Date('2024-01-15'),
          },
        ],
      },
    },
  });

  console.log(`✅ Projeto criado: ${project.title}`);

  // 10. Criar Questionário
  console.log('📝 Criando questionário...');
  const questionnaire = await prisma.questionnaire.create({
    data: {
      title: '#Questionário de Saúde Geral',
      description: '#Avaliação completa de condições de saúde e hábitos de vida',
      projectId: project.id,
      creatorId: researcher.id,
      version: 1,
      isActive: true,
      estimatedDuration: 15,
      instructions: '#Por favor, responda todas as questões com atenção e honestidade',
      welcomeMessage: '#Bem-vindo ao questionário de saúde',
      thankYouMessage: '#Obrigado por participar da pesquisa',
      allowAnonymous: true,
      questions: {
        create: questions.slice(0, 4).map((q, index) => ({
          questionId: questions.indexOf(q) + 1,
          order: index + 1,
          required: q.isRequired,
        })),
      },
    },
  });

  console.log(`✅ Questionário criado: ${questionnaire.title}`);

  // 11. Criar Pesquisa de Campo
  console.log('🗺️  Criando pesquisa de campo...');
  const fieldSurvey = await prisma.fieldSurvey.create({
    data: {
      name: '#Coleta de Dados - Região Sul',
      description: '#Pesquisa de campo para coleta de dados em hospitais da região sul',
      projectId: project.id,
      questionnaireId: questionnaire.id,
      coordinatorId: researcher.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      location: '#Porto Alegre, Curitiba, Florianópolis',
      targetPopulation: '#Pacientes com doenças crônicas',
      sampleSize: 500,
      collectedSamples: 287,
      status: ProjectStatus.EM_ANDAMENTO,
      budget: 45000.00,
      notes: '#Realizar coleta em 3 capitais, Equipe de 5 pesquisadores',
    },
  });

  console.log(`✅ Pesquisa de campo criada: ${fieldSurvey.name}`);

  // 12. Criar Aprovações
  console.log('✅ Criando aprovações...');
  
  const approval1 = await prisma.approval.create({
    data: {
      projectId: project.id,
      approverId: researcher.id,
      status: ApprovalStatus.APROVADO,
      type: 'COMITE_ETICA',
      submittedAt: new Date('2023-10-01'),
      reviewedAt: new Date('2023-11-15'),
      comments: '#Projeto aprovado pelo Comitê de Ética em Pesquisa',
      documentUrl: '#https://example.com/docs/etica-approval.pdf',
      certificateNumber: '#CAAE-12345678.9.0000.5555',
    },
  });

  const approval2 = await prisma.approval.create({
    data: {
      projectId: project.id,
      approverId: pesquisador2.id,
      status: ApprovalStatus.PENDENTE,
      type: 'COORDENADOR',
      submittedAt: new Date('2024-11-01'),
      comments: '#Aguardando revisão final do coordenador',
    },
  });

  console.log(`✅ ${2} aprovações criadas`);

  // 13. Criar Notificações
  console.log('🔔 Criando notificações...');

  const notifications = [
    {
      userId: coordUser.id,
      title: '#Novo projeto cadastrado',
      message: '#O projeto "Estudo sobre Prevalência de Doenças Crônicas" foi cadastrado e aguarda sua revisão',
      type: NotificationType.NOVO_PROJETO,
      priority: NotificationPriority.ALTA,
      isRead: false,
      relatedProjectId: project.id,
    },
    {
      userId: pesquisador1.id,
      title: '#Você foi adicionado a um projeto',
      message: '#Você foi adicionado como membro do projeto "Estudo sobre Prevalência de Doenças Crônicas"',
      type: NotificationType.NOVO_MEMBRO,
      priority: NotificationPriority.MEDIA,
      isRead: false,
      relatedProjectId: project.id,
    },
    {
      userId: pesquisador2.id,
      title: '#Nova aprovação pendente',
      message: '#Há uma aprovação aguardando sua revisão no projeto "Estudo sobre Prevalência de Doenças Crônicas"',
      type: NotificationType.APROVACAO_PENDENTE,
      priority: NotificationPriority.ALTA,
      isRead: false,
      relatedProjectId: project.id,
    },
    {
      userId: coordUser.id,
      title: '#Prazo da pesquisa de campo se aproxima',
      message: '#A pesquisa de campo "Coleta de Dados - Região Sul" encerra em 30 dias',
      type: NotificationType.PRAZO_PROXIMO,
      priority: NotificationPriority.MEDIA,
      isRead: true,
      relatedProjectId: project.id,
    },
  ];

  for (const notificationData of notifications) {
    await prisma.notification.create({
      data: notificationData,
    });
  }

  console.log(`✅ ${notifications.length} notificações criadas`);

  // 14. Criar mais dados marcados com # para fácil deleção
  console.log('📦 Criando dados adicionais marcados com #...');

  // Usuários adicionais
  const testUsers = [
    {
      email: '#teste1@exemplo.com',
      name: '#Usuário Teste 1',
      cpf: '11111111111',
      phone: '11911111111',
    },
    {
      email: '#teste2@exemplo.com',
      name: '#Usuário Teste 2',
      cpf: '22222222222',
      phone: '11922222222',
    },
    {
      email: '#teste3@exemplo.com',
      name: '#Usuário Teste 3',
      cpf: '33333333333',
      phone: '11933333333',
    },
  ];

  for (const userData of testUsers) {
    await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: UserRole.PESQUISADOR,
      },
    });
  }

  // Instituições adicionais
  const testInstitutions = [
    {
      cnpj: '#11111111000111',
      name: '#Instituto de Pesquisa Teste A',
      acronym: '#IPTA',
      type: InstitutionType.INSTITUTO_PESQUISA,
      coordinatorId: researcher.id,
      email: '#contato@ipta.org',
      city: '#São Paulo',
      state: 'SP',
      country: 'Brasil',
    },
    {
      cnpj: '#22222222000122',
      name: '#Hospital Teste B',
      acronym: '#HTB',
      type: InstitutionType.HOSPITAL,
      coordinatorId: researcher.id,
      email: '#contato@htb.org',
      city: '#Campinas',
      state: 'SP',
      country: 'Brasil',
    },
  ];

  for (const instData of testInstitutions) {
    await prisma.institution.create({
      data: instData,
    });
  }

  // Questões adicionais
  const additionalQuestions = [
    {
      text: '#Qual é o seu peso em kg?',
      type: QuestionType.NUMERICA,
      category: QuestionCategory.CLINICA,
      scope: QuestionScope.LOCAL,
      isRequired: true,
      minValue: 30,
      maxValue: 250,
      creatorId: researcher.id,
      origin: 'MANUAL',
    },
    {
      text: '#Você pratica atividade física regularmente?',
      type: QuestionType.SIM_NAO,
      category: QuestionCategory.HABITOS,
      scope: QuestionScope.NACIONAL,
      isRequired: true,
      creatorId: researcher.id,
      origin: 'MANUAL',
    },
    {
      text: '#Descreva sua rotina alimentar',
      type: QuestionType.ABERTA,
      category: QuestionCategory.HABITOS,
      scope: QuestionScope.LOCAL,
      isRequired: false,
      creatorId: researcher.id,
      origin: 'MANUAL',
    },
  ];

  for (const questionData of additionalQuestions) {
    await prisma.question.create({
      data: questionData,
    });
  }

  console.log(`✅ Dados adicionais criados (3 usuários, 2 instituições, 3 questões)`);

  // 15. Resumo Final
  const counts = {
    users: await prisma.user.count(),
    researchers: await prisma.researcher.count(),
    institutions: await prisma.institution.count(),
    questions: await prisma.question.count(),
    researchGroups: await prisma.researchGroup.count(),
    projects: await prisma.project.count(),
    questionnaires: await prisma.questionnaire.count(),
    fieldSurveys: await prisma.fieldSurvey.count(),
    approvals: await prisma.approval.count(),
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
