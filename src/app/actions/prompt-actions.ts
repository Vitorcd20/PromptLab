'use server';

import {
  CreatePromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompt.dto';
import { CreatePromtUseCase } from '@/core/application/prompts/create-prompt.use-case';
import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompt.use';
import { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import z from 'zod';

type SearchFormState = {
  success: boolean;
  prompts?: PromptSummary[];
  message?: string;
};

export async function createPromptAction(data: CreatePromptDTO) {
  const validated = createPromptSchema.safeParse(data);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    return {
      success: false,
      message: 'Validation Error',
      errors: fieldErrors,
    };
  }

  try {
    const repository = new PrismaPromptRepository(prisma);
    const useCase = new CreatePromtUseCase(repository);
    await useCase.execute(validated.data);
    revalidatePath('/', 'layout');
  } catch (error) {
    const _error = error as Error;

    if (_error.message === 'PROMPT_ALREADY_EXISTS') {
      return {
        success: false,
        message: 'This prompt already exists',
      };
    }

    return {
      success: false,
      message: 'Failed to create prompt',
    };
  }

  return {
    success: true,
    message: 'Prompt created successfuly',
  };
}

export async function searchPromptAction(
  _prev: SearchFormState,
  formData: FormData
): Promise<SearchFormState> {
  const term = String(formData.get('q') ?? '').trim();

  const repository = new PrismaPromptRepository(prisma);

  const useCase = new SearchPromptsUseCase(repository);

  try {
    const results = await useCase.execute(term);

    const summuries = results.map(({ id, title, content }) => ({
      id,
      title,
      content,
    }));
    return {
      success: true,
      prompts: summuries,
    };
  } catch {
    return {
      success: false,
      message: 'Faile to get prompts.',
    };
  }
}
