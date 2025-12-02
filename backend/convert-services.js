const fs = require('fs');
const path = require('path');

const services = [
  'field-researches',
  'question-sequences',
  'surveys',
  'questions',
  'questionnaires'
];

services.forEach(moduleName => {
  const filePath = path.join(__dirname, 'src', moduleName, `${moduleName}.service.ts`);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remover imports TypeORM
    content = content.replace(/import\s+{\s*InjectRepository\s*}\s+from\s+['"]@nestjs\/typeorm['"];?\n?/g, '');
    content = content.replace(/import\s+{\s*Repository\s*}\s+from\s+['"]typeorm['"];?\n?/g, '');
    
    // Adicionar import do PrismaService se não existir
    if (!content.includes('PrismaService')) {
      const importIndex = content.indexOf('import');
      const firstImportEnd = content.indexOf('\n\n', importIndex);
      content = content.slice(0, firstImportEnd) + 
                "\nimport { PrismaService } from '../database/prisma.service';" +
                content.slice(firstImportEnd);
    }
    
    // Substituir constructor
    content = content.replace(
      /constructor\s*\(\s*@InjectRepository\([^)]+\)\s+private\s+(\w+):\s*Repository<[^>]+>,?\s*\)/g,
      'constructor(private prisma: PrismaService)'
    );
    
    // Limpar múltiplos @InjectRepository no mesmo constructor
    content = content.replace(
      /constructor\s*\(\s*(@InjectRepository\([^)]+\)\s+private\s+\w+:\s*Repository<[^>]+>,?\s*)+\)/gs,
      'constructor(private prisma: PrismaService)'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Atualizado: ${moduleName}.service.ts`);
  } else {
    console.log(`⚠️ Não encontrado: ${moduleName}.service.ts`);
  }
});

console.log('\n⚠️ ATENÇÃO: Services atualizados com imports corretos.');
console.log('Você precisa converter manualmente os métodos:');
console.log('- repository.find() → prisma.MODEL.findMany()');
console.log('- repository.findOne() → prisma.MODEL.findUnique()');
console.log('- repository.create() + save() → prisma.MODEL.create()');
console.log('- repository.save() → prisma.MODEL.update()');
console.log('- repository.remove() → prisma.MODEL.delete()');
