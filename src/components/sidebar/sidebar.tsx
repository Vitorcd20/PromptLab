import { prisma } from '@/lib/prisma';
import SidebarContent from './sidebar-content';

export default async function Sidebar() {
  const prompts = await prisma.prompt.findMany({
    orderBy: { createdAt: 'desc' }, // 👈
  });
  return <SidebarContent prompts={prompts} />;
}
