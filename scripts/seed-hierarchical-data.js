const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function login() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: 'joao.silva@exemplo.com',
    password: 'senha@123',
  });
  return response.data.access_token;
}

async function seedHierarchicalData() {
  console.log('🚀 Iniciando população de dados hierárquicos...\n');

  try {
    const token = await login();
    console.log('✅ Login realizado com sucesso!\n');

    const headers = { Authorization: `Bearer ${token}` };

    // 1. Criar Instituição
    console.log('📚 Criando instituição...');
    const institutionRes = await axios.post(
      `${API_URL}/institutions`,
      {
        name: 'Universidade Federal de São Paulo',
        acronym: 'UNIFESP',
        type: 'Universidade',
        cnpj: '12.345.678/0001-90',
        address: 'Rua Botucatu, 740',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04023-062',
        phone: '(11) 5576-4000',
        email: 'contato@unifesp.br',
        website: 'https://www.unifesp.br',
        rector: 'Dr. Nelson Sass',
        description: 'Universidade pública federal com foco em ciências da saúde e pesquisa científica.',
        isActive: true,
      },
      { headers }
    );
    const institutionId = institutionRes.data.id;
    console.log(`✅ Instituição criada: ${institutionRes.data.name} (${institutionId})\n`);

    // 2. Obter pesquisador existente (João Silva)
    console.log('👤 Buscando pesquisador...');
    const researchersRes = await axios.get(`${API_URL}/researchers`, { headers });
    const joaoSilva = researchersRes.data.find(r => r.email === 'joao.silva@exemplo.com');
    
    if (!joaoSilva) {
      throw new Error('Pesquisador João Silva não encontrado');
    }
    console.log(`✅ Pesquisador encontrado: ${joaoSilva.name} (${joaoSilva.id})\n`);

    // 3. Criar Projeto de Pesquisa
    console.log('📊 Criando projeto de pesquisa...');
    const projectRes = await axios.post(
      `${API_URL}/research-projects`,
      {
        name: 'Estudo de Satisfação e Qualidade dos Serviços do SUS',
        code: 'PROJ-SUS-2024',
        description: 'Projeto de pesquisa para avaliar a qualidade dos serviços oferecidos pelo Sistema Único de Saúde',
        area: 'Saúde Pública',
        startDate: '2024-01-15',
        endDate: '2025-12-31',
        status: 'active',
        budget: 250000.00,
        fundingAgency: 'CNPq',
        objectives: 'Avaliar a satisfação dos usuários do SUS e identificar pontos de melhoria nos serviços de saúde.',
        expectedResults: 'Mapeamento completo da satisfação dos usuários e relatório com recomendações de melhorias.',
        institutionId: institutionId,
        responsibleResearcherId: joaoSilva.id,
        isActive: true,
      },
      { headers }
    );
    const projectId = projectRes.data.id;
    console.log(`✅ Projeto criado: ${projectRes.data.name} (${projectId})\n`);

    // 4. Atualizar subgrupos existentes para vincular ao projeto
    console.log('📁 Vinculando subgrupos ao projeto...');
    const subgroupsRes = await axios.get(`${API_URL}/subgroups`, { headers });
    
    for (const subgroup of subgroupsRes.data) {
      await axios.patch(
        `${API_URL}/subgroups/${subgroup.id}`,
        { researchProjectId: projectId },
        { headers }
      );
      console.log(`✅ Subgrupo vinculado: ${subgroup.name}`);
    }
    console.log('');

    // 5. Criar Pesquisas de Campo
    console.log('🔬 Criando pesquisas de campo...');
    
    const fieldResearches = [
      {
        name: 'Pesquisa de Satisfação com Atendimento Ambulatorial',
        code: 'PC-AMB-001',
        description: 'Avaliação da satisfação dos pacientes com atendimento ambulatorial',
        location: 'UBS Vila Mariana - São Paulo/SP',
        startDate: '2024-03-01',
        endDate: '2024-08-31',
        status: 'in_progress',
        targetSampleSize: 500,
        currentSampleSize: 180,
        methodology: 'Questionário estruturado com entrevistas presenciais',
        objectives: 'Medir o nível de satisfação dos pacientes com o atendimento ambulatorial',
        expectedResults: 'Relatório estatístico com índices de satisfação por categoria',
        ethicsCommitteeApproval: 'CEP-UNIFESP-2024-001',
        isActive: true,
        subgroupId: subgroupsRes.data[0].id,
        responsibleResearcherId: joaoSilva.id,
      },
      {
        name: 'Pesquisa de Satisfação com Atendimento de Emergência',
        code: 'PC-EMERG-001',
        description: 'Avaliação da satisfação dos pacientes com atendimento de emergência',
        location: 'Hospital São Paulo - São Paulo/SP',
        startDate: '2024-04-01',
        endDate: '2024-09-30',
        status: 'in_progress',
        targetSampleSize: 300,
        currentSampleSize: 95,
        methodology: 'Questionário aplicado após atendimento de emergência',
        objectives: 'Avaliar a qualidade do atendimento de emergência sob a perspectiva do paciente',
        expectedResults: 'Identificação de gargalos e pontos de melhoria no serviço de emergência',
        ethicsCommitteeApproval: 'CEP-UNIFESP-2024-002',
        isActive: true,
        subgroupId: subgroupsRes.data[1].id,
        responsibleResearcherId: joaoSilva.id,
      },
    ];

    const createdFieldResearches = [];
    for (const fr of fieldResearches) {
      const frRes = await axios.post(`${API_URL}/field-researches`, fr, { headers });
      createdFieldResearches.push(frRes.data);
      console.log(`✅ Pesquisa de campo criada: ${frRes.data.name}`);
    }
    console.log('');

    // 6. Criar questionários e vincular às pesquisas de campo
    console.log('📝 Criando questionários...');
    const questionnairesRes = await axios.get(`${API_URL}/questionnaires`, { headers });
    
    if (questionnairesRes.data.length > 0) {
      // Vincular primeiro questionário à primeira pesquisa de campo
      await axios.patch(
        `${API_URL}/questionnaires/${questionnairesRes.data[0].id}`,
        { fieldResearchId: createdFieldResearches[0].id },
        { headers }
      );
      console.log(`✅ Questionário vinculado à pesquisa: ${createdFieldResearches[0].name}`);
    }
    console.log('');

    // 7. Criar sequências de questões para o questionário
    console.log('🔢 Criando sequências de questões...');
    const questionsRes = await axios.get(`${API_URL}/questions`, { headers });
    
    if (questionnairesRes.data.length > 0 && questionsRes.data.length > 0) {
      const questionnaireId = questionnairesRes.data[0].id;
      const questions = questionsRes.data.slice(0, 10); // Primeiras 10 questões
      
      for (let i = 0; i < questions.length; i++) {
        await axios.post(
          `${API_URL}/question-sequences`,
          {
            questionnaireId: questionnaireId,
            questionId: questions[i].id,
            order: i + 1,
            isRequired: i < 5, // Primeiras 5 são obrigatórias
            isActive: true,
            helpText: `Esta é a questão ${i + 1} do questionário`,
          },
          { headers }
        );
        console.log(`✅ Sequência ${i + 1} criada para questão: ${questions[i].text.substring(0, 50)}...`);
      }
    }
    console.log('');

    console.log('✨ POPULAÇÃO CONCLUÍDA COM SUCESSO! ✨\n');
    console.log('📊 RESUMO:');
    console.log(`   🏛️  1 Instituição criada`);
    console.log(`   📊 1 Projeto de pesquisa criado`);
    console.log(`   📁 ${subgroupsRes.data.length} Subgrupos vinculados`);
    console.log(`   🔬 ${createdFieldResearches.length} Pesquisas de campo criadas`);
    console.log(`   📝 Questionários vinculados`);
    console.log(`   🔢 10 Sequências de questões criadas`);
    console.log('');
    console.log('🌐 Acesse: http://localhost:3000/institutions');
    console.log('👤 Login: joao.silva@exemplo.com / senha@123');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

seedHierarchicalData();
