#!/usr/bin/env python3
"""
squad-clickup-sync.py
Sincroniza atualizações de squads/agentes com o ClickUp automaticamente.
Acionado pelo hook PostToolUse do Claude Code em operações Edit/Write.

Scoring 0-100 por agente baseado em QUALIDADE, não apenas presença.
"""

import sys
import json
import os
import re
import urllib.request
from datetime import date
from pathlib import Path

# ─── CONFIG ──────────────────────────────────────────────────────────────────
CLICKUP_TOKEN   = "pk_94215947_45JBXNKEHNBYPSBUX7HBC5NXCK1000II"
CLICKUP_LIST_ID = "901326912257"
PROJECT_ROOT    = Path(__file__).resolve().parent.parent

# ─── FRONTMATTER ─────────────────────────────────────────────────────────────
def extract_frontmatter(content: str) -> dict:
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}
    fm = {}
    for line in match.group(1).split('\n'):
        if ':' in line:
            key, _, value = line.partition(':')
            fm[key.strip()] = value.strip().strip('"\'')
    return fm

def strip_frontmatter(content: str) -> str:
    """Remove o bloco frontmatter do conteúdo para evitar falsos positivos."""
    return re.sub(r'^---\s*\n.*?\n---\s*\n', '', content, flags=re.DOTALL)

# ─── HELPERS DE CONTAGEM ─────────────────────────────────────────────────────
PT_WORDS = {'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'para', 'por',
            'com', 'ao', 'aos', 'um', 'uma', 'o', 'a', 'os', 'as'}

def is_portuguese(name: str) -> bool:
    if not name or len(name) < 4:
        return False
    if not name.isascii():
        return True
    return bool(set(name.lower().split()) & PT_WORDS)

def count_backtick_items(section_text: str) -> int:
    """Conta itens com `` `campo` `` dentro de uma seção."""
    return len(re.findall(r'`\w[\w_-]*`', section_text))

def extract_section(content: str, header_pattern: str) -> str:
    """Extrai o conteúdo de uma seção até o próximo ##."""
    match = re.search(
        rf'##\s+{header_pattern}.*?\n(.*?)(?=\n##|\Z)',
        content, re.DOTALL | re.IGNORECASE
    )
    return match.group(1) if match else ''

def count_bullets(text: str) -> int:
    return len(re.findall(r'^\s*[-*]\s+\S', text, re.MULTILINE))

def count_commands(body: str) -> int:
    """Conta comandos no formato `*comando` com descrição."""
    return len(re.findall(r'`\*[\w-]+`', body))

def has_all_data_fields(body: str) -> bool:
    """Verifica se seção Data tem Fonte, Destino, Modelo e Cache."""
    data_sec = extract_section(body, r'Data')
    required = ['Fonte', 'Destino', 'Modelo', 'Cache']
    return all(f in data_sec for f in required)

def has_collaboration(body: str) -> bool:
    """Verifica se seção Colaboração tem Alimenta definido."""
    colab = extract_section(body, r'Colabora[çc][aã]o|Colaboracao') or ''
    return 'Alimenta' in colab

# ─── SCORING ─────────────────────────────────────────────────────────────────
def score_agent(content: str) -> tuple[int, list[str]]:
    """
    Avalia qualidade do agente em 5 dimensões (0–100).

    Dimensão 1 — Frontmatter (30 pts)
      • id definido                          10 pts
      • name em português (> 8 chars)        10 pts
      • role descritiva (> 30 chars)          5 pts
      • whenToUse detalhado (> 50 chars)      5 pts

    Dimensão 2 — Inputs (20 pts)
      • Seção Inputs existe                   5 pts
      • ≥ 2 campos tipados com backtick      10 pts
      • ≥ 2 itens com descrição (bullet)      5 pts

    Dimensão 3 — Outputs (20 pts)
      • Seção Outputs existe                  5 pts
      • ≥ 2 campos tipados com backtick      10 pts
      • ≥ 2 itens com descrição (bullet)      5 pts

    Dimensão 4 — Operacional (20 pts)
      • ≥ 2 comandos `*cmd`                  10 pts
      • Colaboração com Alimenta definido     5 pts
      • Data section com 4 campos             5 pts

    Dimensão 5 — Responsabilidades (10 pts)
      • ≥ 3 responsabilidades listadas       10 pts
    """
    fm   = extract_frontmatter(content)
    body = strip_frontmatter(content)
    score = 0
    log   = []

    # ── Dimensão 1: Frontmatter (30 pts) ─────────────────────────────────────
    if fm.get('id'):
        score += 10
        log.append('✅ ID técnico definido (+10)')
    else:
        log.append('❌ ID técnico ausente (0)')

    name = fm.get('name', '')
    if name and is_portuguese(name) and len(name) > 8:
        score += 10
        log.append(f'✅ Nome em português: "{name}" (+10)')
    elif name:
        score += 4
        log.append(f'⚠️ Nome presente mas em inglês ou curto: "{name}" (+4)')
    else:
        log.append('❌ Nome ausente (0)')

    role = fm.get('role', '')
    if len(role) > 30:
        score += 5
        log.append(f'✅ Role descritiva ({len(role)} chars) (+5)')
    elif role:
        score += 2
        log.append(f'⚠️ Role curta ({len(role)} chars) (+2)')
    else:
        log.append('❌ Role ausente (0)')

    when = fm.get('whenToUse', '')
    if len(when) > 50:
        score += 5
        log.append(f'✅ whenToUse detalhado ({len(when)} chars) (+5)')
    elif when:
        score += 2
        log.append(f'⚠️ whenToUse vago ({len(when)} chars) (+2)')
    else:
        log.append('❌ whenToUse ausente (0)')

    # ── Dimensão 2: Inputs (20 pts) ───────────────────────────────────────────
    inputs_sec = extract_section(body, r'Inputs?(\s+esperados)?')
    if inputs_sec:
        score += 5
        log.append('✅ Seção Inputs existe (+5)')
        bt = count_backtick_items(inputs_sec)
        if bt >= 2:
            score += 10
            log.append(f'✅ {bt} campos tipados em Inputs (+10)')
        elif bt == 1:
            score += 4
            log.append(f'⚠️ Apenas {bt} campo tipado em Inputs (+4)')
        else:
            log.append('❌ Sem campos tipados em Inputs (0)')
        bl = count_bullets(inputs_sec)
        if bl >= 2:
            score += 5
            log.append(f'✅ {bl} inputs descritos (+5)')
        else:
            log.append(f'⚠️ Poucos bullets em Inputs: {bl} (0)')
    else:
        log.append('❌ Seção Inputs ausente (0)')

    # ── Dimensão 3: Outputs (20 pts) ──────────────────────────────────────────
    outputs_sec = extract_section(body, r'Outputs?(\s+gerados)?')
    if outputs_sec:
        score += 5
        log.append('✅ Seção Outputs existe (+5)')
        bt = count_backtick_items(outputs_sec)
        if bt >= 2:
            score += 10
            log.append(f'✅ {bt} campos tipados em Outputs (+10)')
        elif bt == 1:
            score += 4
            log.append(f'⚠️ Apenas {bt} campo tipado em Outputs (+4)')
        else:
            log.append('❌ Sem campos tipados em Outputs (0)')
        bl = count_bullets(outputs_sec)
        if bl >= 2:
            score += 5
            log.append(f'✅ {bl} outputs descritos (+5)')
        else:
            log.append(f'⚠️ Poucos bullets em Outputs: {bl} (0)')
    else:
        log.append('❌ Seção Outputs ausente (0)')

    # ── Dimensão 4: Operacional (20 pts) ──────────────────────────────────────
    cmds = count_commands(body)
    if cmds >= 2:
        score += 10
        log.append(f'✅ {cmds} comandos definidos (+10)')
    elif cmds == 1:
        score += 4
        log.append(f'⚠️ Apenas {cmds} comando (+4)')
    else:
        log.append('❌ Sem comandos definidos (0)')

    if has_collaboration(body):
        score += 5
        log.append('✅ Colaboração com Alimenta definido (+5)')
    else:
        log.append('❌ Alimenta ausente na Colaboração (0)')

    if has_all_data_fields(body):
        score += 5
        log.append('✅ Data section completa — Fonte, Destino, Modelo, Cache (+5)')
    else:
        log.append('⚠️ Data section incompleta (0)')

    # ── Dimensão 5: Responsabilidades (10 pts) ────────────────────────────────
    resp_sec = extract_section(body, r'Responsabilidades')
    resp_count = count_bullets(resp_sec)
    if resp_count >= 3:
        score += 10
        log.append(f'✅ {resp_count} responsabilidades listadas (+10)')
    elif resp_count >= 1:
        score += 4
        log.append(f'⚠️ Apenas {resp_count} responsabilidade(s) (+4)')
    else:
        log.append('❌ Responsabilidades ausentes (0)')

    return min(score, 100), log

def stars(score: int) -> str:
    if score >= 90: return '⭐⭐⭐'
    if score >= 70: return '⭐⭐'
    if score >= 50: return '⭐'
    return '🔴'

# ─── SQUAD READER ────────────────────────────────────────────────────────────
def read_squad(squad_dir: Path) -> dict:
    yaml_path   = squad_dir / 'squad.yaml'
    agents_path = squad_dir / 'agents'

    title = squad_dir.name
    status = ''
    level  = ''

    if yaml_path.exists():
        for line in yaml_path.read_text(encoding='utf-8').split('\n'):
            s = line.strip()
            if s.startswith('title:'):
                title = s.split(':', 1)[1].strip().strip('"\'')
            elif s.startswith('status:'):
                status = s.split(':', 1)[1].strip()
            elif s.startswith('level:'):
                level = s.split(':', 1)[1].strip()

    agents = []
    if agents_path.exists():
        for agent_file in sorted(agents_path.glob('*.md')):
            content    = agent_file.read_text(encoding='utf-8')
            fm         = extract_frontmatter(content)
            agent_id   = fm.get('id', agent_file.stem)
            agent_name = fm.get('name', agent_id)
            score, log = score_agent(content)
            agents.append({
                'id': agent_id, 'name': agent_name,
                'score': score, 'log': log
            })

    return {
        'name': squad_dir.name, 'title': title,
        'status': status, 'level': level, 'agents': agents
    }

# ─── MIND MAP FORMAT ─────────────────────────────────────────────────────────
def build_mindmap(squad: dict, trigger: str) -> str:
    hoje   = date.today().strftime('%d/%m/%Y')
    agents = squad['agents']
    avg    = round(sum(a['score'] for a in agents) / len(agents)) if agents else 0
    icon   = '✅' if squad['status'] == 'active' else ('📋' if squad['status'] == 'planned' else '🔵')

    lines = [
        '# 🗺️ ML Laboratory — Squad Update',
        '',
        f"📅 **Data:** {hoje}",
        f"🔄 **Arquivo alterado:** `{trigger}`",
        f"📦 **Squad:** {squad['title']} (`{squad['name']}`)",
        f"📊 **Score médio:** {avg}/100 {stars(avg)}",
        '',
        '---',
        '',
        f"## {icon} {squad['title']}",
        f"**Nível:** {squad['level']} | **Status:** {squad['status'] or 'n/d'}",
        '',
        '### Mapa de Agentes',
        '',
        '| Agente | ID Técnico | Nota | Status |',
        '|--------|-----------|:----:|--------|',
    ]

    for a in agents:
        lines.append(
            f"| **{a['name']}** | `{a['id']}` | {a['score']}/100 | {stars(a['score'])} |"
        )

    lines += ['', '---', '', '### Detalhamento por Agente', '']

    for a in agents:
        lines.append(f"#### {a['name']} — {a['score']}/100 {stars(a['score'])}")
        lines.append(f"*ID técnico:* `{a['id']}`  ")
        lines.append('')
        # Agrupa por dimensão
        for item in a['log']:
            lines.append(f"- {item}")
        lines.append('')

    lines += [
        '---',
        '',
        '**Critérios de scoring:**',
        '- Frontmatter completo (id, nome PT, role >30 chars, whenToUse >50 chars): **30 pts**',
        '- Seção Inputs com ≥2 campos tipados e descritos: **20 pts**',
        '- Seção Outputs com ≥2 campos tipados e descritos: **20 pts**',
        '- Operacional (≥2 comandos, Colaboração, Data section): **20 pts**',
        '- ≥3 responsabilidades listadas: **10 pts**',
        '',
        '*Gerado automaticamente pelo hook squad-clickup-sync.py*',
    ]
    return '\n'.join(lines)

# ─── CLICKUP ─────────────────────────────────────────────────────────────────
def post_clickup(title: str, body: str) -> str:
    payload = json.dumps(
        {'name': title, 'description': body, 'status': 'to do'},
        ensure_ascii=False
    ).encode('utf-8')
    req = urllib.request.Request(
        f"https://api.clickup.com/api/v2/list/{CLICKUP_LIST_ID}/task",
        data=payload,
        headers={'Authorization': CLICKUP_TOKEN,
                 'Content-Type': 'application/json; charset=utf-8'},
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.load(resp).get('url', '')

# ─── MAIN ────────────────────────────────────────────────────────────────────
def main():
    try:
        raw = sys.stdin.read().strip()
        if not raw:
            return
        payload = json.loads(raw)
    except Exception:
        return

    tool_input = payload.get('tool_input', payload)
    file_path  = (
        tool_input.get('file_path') or
        tool_input.get('path') or
        payload.get('file_path') or ''
    )

    if not file_path:
        return

    fp = str(file_path).replace('\\', '/')
    if '/squads/' not in fp:
        return
    if not (fp.endswith('.md') or fp.endswith('squad.yaml')):
        return

    path = Path(file_path)
    squad_dir = None
    for parent in [path.parent, path.parent.parent, path.parent.parent.parent]:
        if (parent / 'squad.yaml').exists():
            squad_dir = parent
            break

    if not squad_dir:
        return

    squad = read_squad(squad_dir)
    if not squad['agents']:
        return

    trigger  = path.name
    mindmap  = build_mindmap(squad, trigger)
    avg      = round(sum(a['score'] for a in squad['agents']) / len(squad['agents']))
    hoje     = date.today().strftime('%Y-%m-%d')
    title    = f"[Squad Update] {squad['title']} — Score médio: {avg}/100 ({hoje})"

    try:
        url = post_clickup(title, mindmap)
        print(f"✅ ClickUp: {url}", file=sys.stderr)
    except Exception as e:
        print(f"⚠️ ClickUp sync falhou: {e}", file=sys.stderr)

if __name__ == '__main__':
    main()
