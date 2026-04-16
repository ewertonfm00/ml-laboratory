import { query } from '@/lib/db';
import { Skill, SkillCategoria } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

interface SkillWithCategoria extends Skill {
  categoria_nome: string;
  categoria_tipo: string;
}

async function getData() {
  try {
    const [categorias, skills] = await Promise.all([
      query<SkillCategoria>(
        `SELECT id, nome, tipo, subcategoria, ativa
         FROM _plataforma.skill_categorias
         WHERE ativa = true
         ORDER BY tipo, nome`
      ),
      query<SkillWithCategoria>(
        `SELECT s.id, s.categoria_id, s.nome, s.descricao, s.nivel_minimo, s.nivel_maximo, s.ativa,
                sc.nome as categoria_nome, sc.tipo as categoria_tipo
         FROM _plataforma.skills s
         JOIN _plataforma.skill_categorias sc ON sc.id = s.categoria_id
         WHERE s.ativa = true
         ORDER BY sc.tipo, sc.nome, s.nome`
      ),
    ]);
    return { categorias, skills };
  } catch (e) {
    console.error('Erro ao buscar skills:', e);
    return { categorias: [], skills: [] };
  }
}

const tipoColors: Record<string, { bg: string; text: string }> = {
  tecnica: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  comportamental: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  gestao: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  comunicacao: { bg: 'bg-green-500/20', text: 'text-green-400' },
};

function NivelBar({ min, max }: { min: number; max: number }) {
  const MAX = 10;
  return (
    <div className="flex items-center gap-1 mt-1">
      {Array.from({ length: MAX }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${
            i >= min - 1 && i < max
              ? 'bg-violet-500'
              : 'bg-[#2A2A3E]'
          }`}
        />
      ))}
      <span className="text-slate-500 text-xs ml-1">{min}–{max}</span>
    </div>
  );
}

export const revalidate = 120;

export default async function SkillsPage({ params }: Props) {
  const { slug } = await params;
  const { categorias, skills } = await getData();

  // Group skills by categoria
  const skillsByCategoria = skills.reduce<Record<string, SkillWithCategoria[]>>((acc, s) => {
    if (!acc[s.categoria_id]) acc[s.categoria_id] = [];
    acc[s.categoria_id].push(s);
    return acc;
  }, {});

  // Group categorias by tipo
  const catsByTipo = categorias.reduce<Record<string, SkillCategoria[]>>((acc, c) => {
    if (!acc[c.tipo]) acc[c.tipo] = [];
    acc[c.tipo].push(c);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Skills</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {categorias.length} categorias · {skills.length} skills ativas
        </p>
      </div>

      {categorias.length === 0 ? (
        <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-12 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-slate-300 font-medium">Nenhuma skill cadastrada</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(catsByTipo).map(([tipo, cats]) => {
            const style = tipoColors[tipo] ?? { bg: 'bg-slate-500/20', text: 'text-slate-400' };
            return (
              <div key={tipo}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                    {tipo}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cats.map((cat) => {
                    const catSkills = skillsByCategoria[cat.id] ?? [];
                    return (
                      <div key={cat.id} className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-4">
                        <div className="mb-3">
                          <p className="text-white font-medium">{cat.nome}</p>
                          {cat.subcategoria && (
                            <p className="text-slate-500 text-xs mt-0.5">{cat.subcategoria}</p>
                          )}
                        </div>
                        {catSkills.length === 0 ? (
                          <p className="text-slate-600 text-xs">Nenhuma skill nesta categoria</p>
                        ) : (
                          <ul className="space-y-3">
                            {catSkills.map((skill) => (
                              <li key={skill.id}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-slate-200 text-sm font-medium">{skill.nome}</p>
                                    {skill.descricao && (
                                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{skill.descricao}</p>
                                    )}
                                    <NivelBar min={skill.nivel_minimo} max={skill.nivel_maximo} />
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
