import { PrismaClient } from '@/generated/prisma/client';
import { test, expect, type Page } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

test('Prompt creation on UI (success)', async ({ page }: { page: Page }) => {
  const uniqueTitle = `E2E Prompt ${Date.now()}`;
  const content = 'Conteúdo gerado via E2E';

  await page.goto('/new');
  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();
  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('textarea[name="content"]', content);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.waitForSelector('text=Prompt criado com sucesso', {
    state: 'visible',
    timeout: 15000,
  });
});

test('Duplicity title validation', async ({ page }: { page: Page }) => {
  const duplicatedTitle = 'E2E Duplicate Prompt 01';
  const content = 'Content';

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  await prisma.prompt.deleteMany({ where: { title: duplicatedTitle } });
  await prisma.prompt.create({
    data: { title: duplicatedTitle, content },
  });
  await prisma.$disconnect();

  await page.goto('/new');
  await expect(page.getByPlaceholder('Título do prompt')).toBeVisible();
  await page.fill('input[name="title"]', duplicatedTitle);
  await page.fill('textarea[name="content"]', content);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.waitForSelector('text=Este prompt já existe', {
    state: 'visible',
    timeout: 15000,
  });
  await expect(
    page.getByRole('heading', { name: duplicatedTitle })
  ).toHaveCount(1);
});
