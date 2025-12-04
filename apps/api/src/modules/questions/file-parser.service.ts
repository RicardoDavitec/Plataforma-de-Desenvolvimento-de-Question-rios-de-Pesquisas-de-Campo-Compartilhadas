import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';
import { QuestionType, QuestionCategory, QuestionScope } from '@prisma/client';

interface ParsedQuestion {
  text: string;
  type: QuestionType;
  category: QuestionCategory;
  scope: QuestionScope;
  isRequired?: boolean;
  minValue?: number;
  maxValue?: number;
  validationRegex?: string;
  helpText?: string;
  options?: any;
  likertMin?: number;
  likertMax?: number;
  likertLabels?: any;
  objective?: string;
  targetAudience?: string;
  origin?: string;
  researchGroupId?: string;
}

@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  /**
   * Parseia arquivo Excel (.xlsx, .xls)
   */
  async parseExcel(buffer: Buffer): Promise<ParsedQuestion[]> {
    this.logger.log('Parseando arquivo Excel');

    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter para JSON
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

      this.logger.log(`${rawData.length} linhas encontradas no Excel`);

      // Mapear para formato de questão
      const questions = rawData.map((row, index) => {
        try {
          return this.mapRowToQuestion(row, index + 2); // +2 porque linha 1 é cabeçalho
        } catch (error) {
          this.logger.error(`Erro na linha ${index + 2}: ${error.message}`);
          throw new BadRequestException(
            `Erro na linha ${index + 2}: ${error.message}`
          );
        }
      });

      return questions.filter(q => q !== null);
    } catch (error) {
      this.logger.error(`Erro ao parsear Excel: ${error.message}`);
      throw new BadRequestException('Erro ao processar arquivo Excel');
    }
  }

  /**
   * Parseia arquivo CSV
   */
  async parseCsv(buffer: Buffer): Promise<ParsedQuestion[]> {
    this.logger.log('Parseando arquivo CSV');

    return new Promise((resolve, reject) => {
      const questions: ParsedQuestion[] = [];
      const errors: string[] = [];
      let lineNumber = 1;

      const stream = Readable.from(buffer.toString('utf-8'));

      stream
        .pipe(csvParser())
        .on('data', (row) => {
          lineNumber++;
          try {
            const question = this.mapRowToQuestion(row, lineNumber);
            if (question) {
              questions.push(question);
            }
          } catch (error) {
            errors.push(`Linha ${lineNumber}: ${error.message}`);
          }
        })
        .on('end', () => {
          this.logger.log(`${questions.length} questões parseadas do CSV`);
          
          if (errors.length > 0) {
            this.logger.warn(`${errors.length} erros encontrados`);
            reject(new BadRequestException({
              message: 'Erros ao processar CSV',
              errors,
              successCount: questions.length,
            }));
          } else {
            resolve(questions);
          }
        })
        .on('error', (error) => {
          this.logger.error(`Erro ao parsear CSV: ${error.message}`);
          reject(new BadRequestException('Erro ao processar arquivo CSV'));
        });
    });
  }

  /**
   * Mapeia uma linha do arquivo para o formato de questão
   * Formato esperado das colunas:
   * - text (obrigatório)
   * - type (obrigatório)
   * - category (obrigatório)
   * - scope (obrigatório)
   * - isRequired (opcional, true/false)
   * - minValue (opcional, numérico)
   * - maxValue (opcional, numérico)
   * - helpText (opcional)
   * - options (opcional, JSON string)
   * - likertMin (opcional, numérico)
   * - likertMax (opcional, numérico)
   * - likertLabels (opcional, JSON string)
   * - objective (opcional)
   * - targetAudience (opcional)
   * - origin (opcional)
   */
  private mapRowToQuestion(row: any, lineNumber: number): ParsedQuestion {
    // Validações básicas
    if (!row.text || row.text.trim() === '') {
      throw new Error('Campo "text" é obrigatório');
    }

    if (!row.type || row.type.trim() === '') {
      throw new Error('Campo "type" é obrigatório');
    }

    if (!row.category || row.category.trim() === '') {
      throw new Error('Campo "category" é obrigatório');
    }

    if (!row.scope || row.scope.trim() === '') {
      throw new Error('Campo "scope" é obrigatório');
    }

    // Validar enum values
    const type = this.validateQuestionType(row.type.trim());
    const category = this.validateQuestionCategory(row.category.trim());
    const scope = this.validateQuestionScope(row.scope.trim());

    const question: ParsedQuestion = {
      text: row.text.trim(),
      type,
      category,
      scope,
    };

    // Campos opcionais
    if (row.isRequired !== undefined && row.isRequired !== '') {
      question.isRequired = this.parseBoolean(row.isRequired);
    }

    if (row.minValue !== undefined && row.minValue !== '') {
      question.minValue = parseFloat(row.minValue);
      if (isNaN(question.minValue)) {
        throw new Error('minValue deve ser numérico');
      }
    }

    if (row.maxValue !== undefined && row.maxValue !== '') {
      question.maxValue = parseFloat(row.maxValue);
      if (isNaN(question.maxValue)) {
        throw new Error('maxValue deve ser numérico');
      }
    }

    if (row.helpText) {
      question.helpText = row.helpText.trim();
    }

    if (row.objective) {
      question.objective = row.objective.trim();
    }

    if (row.targetAudience) {
      question.targetAudience = row.targetAudience.trim();
    }

    if (row.origin) {
      question.origin = row.origin.trim();
    }

    // Parse JSON fields
    if (row.options) {
      try {
        question.options = typeof row.options === 'string' 
          ? JSON.parse(row.options) 
          : row.options;
      } catch (error) {
        throw new Error('Campo "options" deve ser JSON válido');
      }
    }

    if (row.likertMin !== undefined && row.likertMin !== '') {
      question.likertMin = parseInt(row.likertMin);
      if (isNaN(question.likertMin)) {
        throw new Error('likertMin deve ser numérico');
      }
    }

    if (row.likertMax !== undefined && row.likertMax !== '') {
      question.likertMax = parseInt(row.likertMax);
      if (isNaN(question.likertMax)) {
        throw new Error('likertMax deve ser numérico');
      }
    }

    if (row.likertLabels) {
      try {
        question.likertLabels = typeof row.likertLabels === 'string'
          ? JSON.parse(row.likertLabels)
          : row.likertLabels;
      } catch (error) {
        throw new Error('Campo "likertLabels" deve ser JSON válido');
      }
    }

    // Validações específicas por tipo
    this.validateQuestionFields(question);

    return question;
  }

  /**
   * Valida tipo de questão
   */
  private validateQuestionType(type: string): QuestionType {
    const validTypes = Object.values(QuestionType);
    const upperType = type.toUpperCase().replace(/ /g, '_');
    
    if (!validTypes.includes(upperType as QuestionType)) {
      throw new Error(
        `Tipo de questão inválido: "${type}". Valores válidos: ${validTypes.join(', ')}`
      );
    }

    return upperType as QuestionType;
  }

  /**
   * Valida categoria de questão
   */
  private validateQuestionCategory(category: string): QuestionCategory {
    const validCategories = Object.values(QuestionCategory);
    const upperCategory = category.toUpperCase().replace(/ /g, '_');
    
    if (!validCategories.includes(upperCategory as QuestionCategory)) {
      throw new Error(
        `Categoria inválida: "${category}". Valores válidos: ${validCategories.join(', ')}`
      );
    }

    return upperCategory as QuestionCategory;
  }

  /**
   * Valida escopo de questão
   */
  private validateQuestionScope(scope: string): QuestionScope {
    const validScopes = Object.values(QuestionScope);
    const upperScope = scope.toUpperCase().replace(/ /g, '_');
    
    if (!validScopes.includes(upperScope as QuestionScope)) {
      throw new Error(
        `Escopo inválido: "${scope}". Valores válidos: ${validScopes.join(', ')}`
      );
    }

    return upperScope as QuestionScope;
  }

  /**
   * Valida campos específicos por tipo de questão
   */
  private validateQuestionFields(question: ParsedQuestion): void {
    switch (question.type) {
      case QuestionType.NUMERICA:
        if (question.minValue !== undefined && question.maxValue !== undefined) {
          if (question.minValue > question.maxValue) {
            throw new Error('minValue não pode ser maior que maxValue');
          }
        }
        break;

      case QuestionType.MULTIPLA_ESCOLHA:
        if (!question.options || !question.options.choices) {
          throw new Error('Questões de múltipla escolha requerem campo "options" com array "choices"');
        }
        if (!Array.isArray(question.options.choices) || question.options.choices.length === 0) {
          throw new Error('Campo "options.choices" deve ser array com pelo menos uma opção');
        }
        break;

      case QuestionType.ESCALA_LIKERT:
        if (question.likertMin === undefined || question.likertMax === undefined) {
          throw new Error('Questões Likert requerem likertMin e likertMax');
        }
        if (question.likertMin >= question.likertMax) {
          throw new Error('likertMin deve ser menor que likertMax');
        }
        break;
    }
  }

  /**
   * Converte string para boolean
   */
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    const strValue = String(value).toLowerCase().trim();
    return strValue === 'true' || strValue === '1' || strValue === 'sim' || strValue === 'yes';
  }

  /**
   * Gera template Excel para download
   */
  generateExcelTemplate(): Buffer {
    const templateData = [
      {
        text: 'Qual é a sua idade?',
        type: 'NUMERICA',
        category: 'DEMOGRAFICA',
        scope: 'LOCAL',
        isRequired: 'true',
        minValue: 0,
        maxValue: 120,
        helpText: 'Informe sua idade em anos completos',
        objective: 'Coletar dados demográficos',
        targetAudience: 'Todos os participantes',
        origin: 'IMPORTED',
      },
      {
        text: 'Qual o seu nível de escolaridade?',
        type: 'MULTIPLA_ESCOLHA',
        category: 'DEMOGRAFICA',
        scope: 'NACIONAL',
        isRequired: 'true',
        options: '{"choices":["Fundamental","Médio","Superior","Pós-graduação"]}',
        objective: 'Identificar perfil educacional',
      },
      {
        text: 'Como você avalia o atendimento?',
        type: 'ESCALA_LIKERT',
        category: 'COMPORTAMENTAL',
        scope: 'LOCAL',
        isRequired: 'true',
        likertMin: 1,
        likertMax: 5,
        likertLabels: '{"1":"Muito insatisfeito","5":"Muito satisfeito"}',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questões');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Gera template CSV para download
   */
  generateCsvTemplate(): string {
    const headers = [
      'text',
      'type',
      'category',
      'scope',
      'isRequired',
      'minValue',
      'maxValue',
      'helpText',
      'options',
      'likertMin',
      'likertMax',
      'likertLabels',
      'objective',
      'targetAudience',
      'origin',
    ];

    const examples = [
      [
        'Qual é a sua idade?',
        'NUMERICA',
        'DEMOGRAFICA',
        'LOCAL',
        'true',
        '0',
        '120',
        'Informe sua idade em anos completos',
        '',
        '',
        '',
        '',
        'Coletar dados demográficos',
        'Todos os participantes',
        'IMPORTED',
      ],
      [
        'Qual o seu nível de escolaridade?',
        'MULTIPLA_ESCOLHA',
        'DEMOGRAFICA',
        'NACIONAL',
        'true',
        '',
        '',
        '',
        '{"choices":["Fundamental","Médio","Superior"]}',
        '',
        '',
        '',
        'Identificar perfil educacional',
        '',
        'IMPORTED',
      ],
    ];

    const csv = [
      headers.join(','),
      ...examples.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }
}
