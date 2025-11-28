const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testProjectCreation() {
  console.log('🧪 Testando criação de projeto de pesquisa...\n');

  try {
    // Login
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'joao.silva@exemplo.com',
      password: 'senha@123',
    });
    const token = loginRes.data.access_token;
    console.log('✅ Login realizado com sucesso!\n');

    const headers = { Authorization: `Bearer ${token}` };

    // Buscar instituições
    console.log('📚 Buscando instituições...');
    const institutionsRes = await axios.get(`${API_URL}/institutions`, { headers });
    console.log(`Instituições encontradas: ${institutionsRes.data.length}`);
    
    if (institutionsRes.data.length === 0) {
      console.log('❌ Nenhuma instituição encontrada. Criando uma...');
      
      const newInst = await axios.post(
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
          description: 'Universidade pública federal.',
          isActive: true,
        },
        { headers }
      );
      console.log(`✅ Instituição criada: ${newInst.data.name} (${newInst.data.id})\n`);
      institutionsRes.data.push(newInst.data);
    }

    const institutionId = institutionsRes.data[0].id;
    console.log(`Usando instituição: ${institutionsRes.data[0].name} (${institutionId})\n`);

    // Buscar pesquisadores
    console.log('👤 Buscando pesquisadores...');
    const researchersRes = await axios.get(`${API_URL}/researchers`, { headers });
    console.log(`Pesquisadores encontrados: ${researchersRes.data.length}`);
    
    const joaoSilva = researchersRes.data.find(r => r.email === 'joao.silva@exemplo.com');
    if (!joaoSilva) {
      throw new Error('Pesquisador João Silva não encontrado');
    }
    console.log(`Usando pesquisador: ${joaoSilva.name} (${joaoSilva.id})\n`);

    // Criar projeto
    console.log('📊 Criando projeto de pesquisa...');
    const projectData = {
      name: 'Estudo de Satisfação do SUS - Teste 2',
      description: 'Projeto para avaliar a qualidade dos serviços do SUS',
      area: 'Saúde Pública',
      startDate: '2024-01-15',
      endDate: '2025-12-31',
      status: 'active',
      budget: 250000.00,
      fundingAgency: 'CNPq',
      objectives: 'Avaliar a satisfação dos usuários do SUS',
      expectedResults: 'Mapeamento completo da satisfação dos usuários',
      institutionId: institutionId,
      responsibleResearcherId: joaoSilva.id,
      isActive: true,
    };

    console.log('Dados do projeto:', JSON.stringify(projectData, null, 2));

    const projectRes = await axios.post(
      `${API_URL}/research-projects`,
      projectData,
      { headers }
    );

    console.log(`\n✅ Projeto criado com sucesso!`);
    console.log(`ID: ${projectRes.data.id}`);
    console.log(`Nome: ${projectRes.data.name}`);
    console.log(`Código UUID: ${projectRes.data.codeUUID}`);
    console.log(`Status: ${projectRes.data.status}`);
    console.log(`Instituição: ${projectRes.data.institutionId}`);
    console.log(`Responsável: ${projectRes.data.responsibleResearcherId}`);

    console.log('\n✨ Teste concluído com sucesso!');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testProjectCreation();
