import { PrismaClient, UserRole, InstitutionType, QuestionType, QuestionCategory, QuestionScope, ProjectStatus, ApprovalStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seed: Populando banco com dados marcados com #');

  const hash = await bcrypt.hash('Senha@123', 12);

  // 1. Criar um usuário temporário para ser coordenador
  const tempUser = await prisma.user.create({
    data: {
      email: 'temp@temp.com',
      password: hash,
      cpf: '00000000000',
      name: 'Temp',
      role: UserRole.COORDENADOR_PROJETO,
    },
  });

  const tempResearcher = await prisma.researcher.create({
    data: {
      userId: tempUser.id,
      role: UserRole.COORDENADOR_PROJETO,
    },
  });

  // 2. Criar instituição com coordenador temporário
  const inst = await prisma.institution.create({
    data: {
      cnpj: '12345678000190',
      name: '#Universidade Teste',
      acronym: '#UT',
      type: InstitutionType.ACADEMICA,
      city: '#São Paulo',
      state: 'SP',
      country: 'Brasil',
      coordinatorId: tempResearcher.id,
    },
  });

  // 3. Atualizar pesquisador com instituição
  await prisma.researcher.update({
    where: { id: tempResearcher.id },
    data: { primaryInstitutionId: inst.id },
  });

  // 4. Criar usuários reais
  const coord = await prisma.user.create({
    data: {
      email: 'coordenador@teste.com',
      password: hash,
      cpf: '11111111111',
      name: '#Coordenador Teste',
      role: UserRole.COORDENADOR_PROJETO,
      researcher: {
        create: {
          role: UserRole.COORDENADOR_PROJETO,
          primaryInstitutionId: inst.id,
          lattesNumber: '1111111111111111',
          academicTitle: '#Doutor',
        },
      },
    },
    include: { researcher: true },
  });

  const pesq1 = await prisma.user.create({
    data: {
      email: 'pesquisador1@teste.com',
      password: hash,
      cpf: '22222222222',
      name: '#Pesquisador 1',
      role: UserRole.PESQUISADOR,
      researcher: {
        create: {
          role: UserRole.PESQUISADOR,
          primaryInstitutionId: inst.id,
        },
      },
    },
    include: { researcher: true },
  });

  // 5. Criar projeto
  const proj = await prisma.project.create({
    data: {
      title: '#Projeto Teste',
      description: '#Descrição do projeto teste',
      startDate: new Date('2024-01-01'),
      institution: { connect: { id: inst.id } },
      coordinators: {
        create: {
          researcherId: coord.researcher!.id,
          assignedAt: new Date(),
        },
      },
    },
  });

  // 6. Criar grupo de pesquisa
  const group = await prisma.researchGroup.create({
    data: {
      name: '#Grupo Teste',
      description: '#Descrição do grupo',
      projectId: proj.id,
      coordinatorId: coord.researcher!.id,
      members: {
        create: [
          {
            researcherId: coord.researcher!.id,
            role: UserRole.COORDENADOR_GRUPO,
          },
          {
            researcherId: pesq1.researcher!.id,
            role: UserRole.PESQUISADOR,
          },
        ],
      },
    },
  });

  // 7. Criar questões
  const q1 = await prisma.question.create({
    data: {
      text: '#Qual sua idade?',
      type: QuestionType.NUMERICA,
      category: QuestionCategory.DEMOGRAFICA,
      scope: QuestionScope.LOCAL,
      version: 1,
      origin: 'MANUAL',
      creatorId: coord.researcher!.id,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      text: '#Você tem doença crônica?',
      type: QuestionType.SIM_NAO,
      category: QuestionCategory.CLINICA,
      scope: QuestionScope.LOCAL,
      version: 1,
      origin: 'MANUAL',
      creatorId: coord.researcher!.id,
    },
  });

  // 8. Criar questionário
  const quest = await prisma.questionnaire.create({
    data: {
      title: '#Questionário Teste',
      description: '#Descrição',
      version: 1,
      creatorId: coord.researcher!.id,
      project: { connect: { id: proj.id } },
      questions: {
        create: [
          {
            questionId: q1.id,
            order: 1,
            required: true,
          },
          {
            questionId: q2.id,
            order: 2,
            required: false,
          },
        ],
      },
    },
  });

  // 9. Criar pesquisa de campo
  const survey = await prisma.fieldSurvey.create({
    data: {
      title: '#Pesquisa Teste',
      description: '#Coleta de dados teste',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-12-31'),
      location: '#São Paulo',
      project: { connect: { id: proj.id } },
      questionnaire: { connect: { id: quest.id } },
      researchGroup: { connect: { id: group.id } },
      participants: {
        create: {
          researcherId: coord.researcher!.id,
          role: UserRole.COORDENADOR_PROJETO,
        },
      },
    },
  });

  // 10. Criar aprovação
  const appr = await prisma.approvalRequest.create({
    data: {
      type: 'COMITE_ETICA',
      status: ApprovalStatus.APROVADO,
      submittedAt: new Date(),
      reviewedAt: new Date(),
      comments: '#Aprovado',
      project: { connect: { id: proj.id } },
      requester: { connect: { id: pesq1.researcher!.id } },
      approver: { connect: { id: coord.researcher!.id } },
    },
  });

  // 11. Criar notificação
  await prisma.notification.create({
    data: {
      type: 'NOVO_PROJETO',
      title: '#Nova Notificação',
      message: '#Você foi adicionado ao projeto',
      receiverId: pesq1.researcher!.id,
      senderId: coord.researcher!.id,
      read: false,
    },
  });

  console.log(' Seed concluído!');
  console.log(Instituição: );
  console.log(Projeto: );
  console.log(Grupo: );
  console.log(Questionário: );
  console.log(Pesquisa: );
  console.log(\nLogin: coordenador@teste.com / Senha@123);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.());
