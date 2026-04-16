import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjetoIndexPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/p/${slug}/numeros`);
}
