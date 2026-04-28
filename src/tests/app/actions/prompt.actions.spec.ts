import {
  createPromptAction,
  deletePromptAction,
  searchPromptAction,
  updatePromptAction,
} from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();
const mockedUpdateExecute = jest.fn();
const mockedDeleteExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedSearchExecute,
  })),
}));

jest.mock('@/core/application/prompts/create-prompt.use-case', () => ({
  CreatePromptUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedCreateExecute,
  })),
}));

jest.mock('@/core/application/prompts/update-prompt.use-case', () => ({
  UpdatePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedUpdateExecute })),
}));

jest.mock('@/core/application/prompts/delete-prompt.use-case', () => ({
  DeletePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedDeleteExecute })),
}));

describe('Server Actions: Prompt', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
    mockedUpdateExecute.mockReset();
    mockedDeleteExecute.mockReset();
  });

  describe('createPromptAction', () => {
    it('should create prompt with success', async () => {
      mockedCreateExecute.mockResolvedValue(undefined);
      const data = {
        title: 'Title',
        content: 'Content',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Prompt criado com sucesso');
    });

    it('should return validation errors when fields are empty', async () => {
      const data = {
        title: '',
        content: '',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Erro de validação');
      expect(result?.errors).toBeDefined();
    });

    it('should return error when PROMPT_ALREADY_EXISTS happens', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('PROMPT_ALREADY_EXISTS'));

      const data = {
        title: 'duplicado',
        content: 'duplicado',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Este prompt já existe');
    });

    it('should return generic error when prompt creation fails', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('UNKNOWN'));
      const data = {
        title: 'title',
        content: 'content',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Falha ao criar o prompt');
    });
  });

  describe('deletePromptAction', () => {
    it('should remove with success', async () => {
      mockedDeleteExecute.mockResolvedValue(undefined);
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Prompt removido com sucesso');
    });

    it('should return an error when the id is empty', async () => {
      const promptId = '';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('ID do prompt é obrigatório');
    });

    it('should return an error when the prompt does not exist', async () => {
      mockedDeleteExecute.mockRejectedValue(new Error('PROMPT_NOT_FOUND'));
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt não encontrado');
    });

    it('should return a generic error when the action fails', async () => {
      mockedDeleteExecute.mockRejectedValue(new Error('UNKNOWN'));
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao remover o prompt');
    });
  });

  describe('updatePromptAction', () => {
    it('should update with success', async () => {
      mockedUpdateExecute.mockResolvedValue({});
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'new title',
        content: 'new content',
      };

      const result = await updatePromptAction(data);

      expect(result).toMatchObject({
        success: true,
        message: 'Prompt atualizado com sucesso',
      });
    });

    it('should return a validation error when fields are missing', async () => {
      const data = {
        id: '1',
        title: '',
        content: '',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erro de validação');
      expect(result.errors).toBeDefined();
    });

    it('should return an error when the prompt does not exist', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('PROMPT_NOT_FOUND'));
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'Novo',
        content: 'Content',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt não encontrado');
    });

    it('should return a generic error when fails to update', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('UNKNOWN'));
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'new',
        content: 'content',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao atualizar o prompt');
    });
  });

  describe('searchPromptAction', () => {
    it('should return success with term search not empty', async () => {
      const input = [{ id: '1', title: 'AI Title', content: 'Content' }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should return success and list all prompts when term search is empty', async () => {
      const input = [
        { id: '1', title: 'First', content: 'Content 01' },
        { id: '2', title: 'Second', content: 'Content 02' },
      ];
      mockedSearchExecute.mockResolvedValue(input);
      const formData = new FormData();
      formData.append('q', '');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBeDefined();
      expect(result.prompts).toEqual(input);
    });

    it('should return a generic error when fails to search', async () => {
      const error = new Error('UNKNOWN');
      mockedSearchExecute.mockRejectedValue(error);

      const formData = new FormData();
      formData.append('q', 'error');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(false);
      expect(result.prompts).toBeUndefined();
      expect(result.message).toBe('Falha ao buscar prompts.');
    });

    it('should trim spaces in term before execute', async () => {
      const input = [{ id: '1', title: 'title 01', content: 'content 01' }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', '   title 01  ');

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('title 01');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should resolve absense of query with empty term', async () => {
      const input = [
        { id: '1', title: 'first title', content: 'content 01' },
        { id: '2', title: 'second title', content: 'content 02' },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
  });
});
