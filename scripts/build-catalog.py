from pathlib import Path
import re, json

source = Path('/home/ubuntu/upload/pasted_content_2.txt').read_text()
lines = [line.strip() for line in source.splitlines() if line.strip()]
sections = {
    '1. ESTRATÉGIA E MARKETING': ('PENSAR', 'Estratégia'),
    '2. PÚBLICO, PERSONA E CLIENTE': ('PENSAR', 'Público e Persona'),
    '3. MARCA E POSICIONAMENTO': ('PENSAR', 'Marca'),
    '4. COPYWRITING': ('ESCREVER', 'Copywriting'),
    '5. REDES SOCIAIS': ('ESCREVER', 'Redes Sociais'),
    '6. VÍDEO E ROTEIRO': ('ESCREVER', 'Vídeo e Roteiro'),
    '7. IMAGENS PARA MARKETING': ('CRIAR', 'Imagens'),
    '8. DESIGN E DIREÇÃO DE ARTE': ('CRIAR', 'Design'),
    '9. SEO E CONTEÚDO': ('CRESCER', 'SEO e Conteúdo'),
    '10. E-MAIL, WHATSAPP E CRM': ('CRESCER', 'Relacionamento'),
    '11. VENDAS E CONVERSÃO': ('CRESCER', 'Vendas'),
    '12. ANÁLISE, CONCORRÊNCIA E INTELIGÊNCIA': ('PENSAR', 'Análise'),
}
current = ('PENSAR', 'Estratégia')
specific_templates = {
    '/estrategista': 'Você é um estrategista sênior. Analise o contexto {contexto}, traduza o objetivo {objetivo} em hipóteses e proponha uma matriz de decisão priorizada para {publico}, considerando {recursos}. Entregue {formato} com riscos, trade-offs, métricas e próximos passos.',
    '/plano-marketing': 'Construa um plano de marketing de 90 dias para {contexto}. Converta o objetivo {objetivo} em frentes semanais para {publico}, usando {recursos}. Entregue {formato}, com dependências, responsáveis sugeridos, indicadores e critérios de revisão.',
    '/persona': 'Crie uma persona acionável para o negócio descrito em {contexto}, com foco em {objetivo} e no público {publico}. Organize em {formato}, incluindo dores, desejos, objeções, gatilhos, linguagem e implicações para decisões de marketing.',
    '/copywriter': 'Escreva uma peça de copy para {contexto} com o objetivo {objetivo}, destinada a {publico}. Use tom {tom}, indique a estrutura de persuasão e entregue em {formato}, com alternativas de abertura, prova e chamada para ação.',
    '/legenda': 'Crie uma legenda pronta para publicação sobre {contexto}, com objetivo {objetivo} e público {publico}. Use tom {tom}; entregue em {formato}, com gancho inicial, desenvolvimento escaneável, CTA e sugestões de hashtags contextualizadas.',
    '/roteiro-reels': 'Roteirize um Reels sobre {tema} para {publico}, com objetivo {objetivo}, duração de {duracao}, formato {formato} e tom {tom}. Especifique gancho nos primeiros 3 segundos, cenas, texto na tela, cortes, trilha e CTA final.',
    '/foto-produto': 'Atue como diretor de fotografia de produto. Para {produto}, crie uma direção visual com finalidade {finalidade}, contexto {contexto}, público {publico}, estilo {estilo}, composição {composicao}, iluminação {iluminacao} e proporção {proporcao}. Inclua materiais, lente, profundidade, sombras e acabamento.',
    '/carrossel': 'Estruture um carrossel educativo sobre {produto}, com finalidade {finalidade}, contexto {contexto} e público {publico}. Defina uma ideia por slide, hierarquia de texto, composição {composicao}, estilo {estilo}, iluminação {iluminacao} e proporção {proporcao}. Finalize com CTA e instrução visual para cada tela.',
    '/seo': 'Faça um diagnóstico de SEO para o tema {tema} e a palavra-chave {keyword}, considerando {publico}, objetivo {objetivo}, formato {formato} e tom {tom}. Entregue intenção de busca, clusters, lacunas, estrutura recomendada, snippets e plano de otimização.',
    '/artigo-blog': 'Desenhe um artigo de blog sobre {tema}, orientado pela keyword {keyword} para {publico}. Respeite objetivo {objetivo}, formato {formato} e tom {tom}; entregue título, promessa, outline H2/H3, evidências a buscar, CTA e checklist editorial.',
    '/email-vendas': 'Escreva um email de vendas para {produto}, destinado a {publico}, com objetivo {objetivo}. Considere {oferta}, use tom {tom}, entregue em {formato} e produza assunto, preheader, corpo escaneável, objeções e CTA {cta}.',
    '/crm': 'Projete uma sequência de CRM para {produto} e {publico}, com objetivo {objetivo}. Use {oferta} como contexto, tom {tom} e formato {formato}; defina gatilhos, intervalo entre mensagens, personalização, métrica de sucesso e CTA {cta}.',
    '/funil': 'Modele um funil completo para {contexto}, com objetivo {objetivo}, público {publico} e recursos {recursos}. Entregue {formato} com etapas, promessa, ativos, eventos de passagem, métricas e plano de experimentos.',
    '/campanha': 'Planeje uma campanha integrada para {contexto}, orientada a {objetivo}, público {publico} e recursos {recursos}. Use tom {tom} e formato {formato}; entregue conceito, canais, cronograma, mensagens, orçamento relativo, métricas e contingências.',
    '/landing-page': 'Escreva a arquitetura de uma landing page para {contexto}, com objetivo {objetivo} e público {publico}. Use tom {tom} e entregue {formato}: promessa, prova, benefícios, objeções, blocos de conteúdo, CTA e requisitos de conversão.',
    '/analise-concorrencia': 'Compare concorrentes relevantes para {contexto}, buscando {objetivo} para {publico} com {recursos}. Entregue {formato} com critérios comparáveis, evidências a coletar, posicionamento, oportunidades e recomendações priorizadas.',
}
commands = []
for line in lines:
    clean = re.sub(r'^[^/]*(?=/)', '', line)
    if any(key in line for key in sections):
        for key, value in sections.items():
            if key in line:
                current = value
                break
        continue
    if not clean.startswith('/'):
        continue
    parts = clean.split(' — ', 1)
    command = parts[0].strip()
    name = command[1:].replace('-', ' ').title()
    description = parts[1].strip().capitalize() if len(parts) > 1 else f'Crie uma entrega profissional usando {name.lower()}.'
    area, subcategory = current
    output = 'Imagem' if area == 'CRIAR' else ('Estratégia' if area == 'PENSAR' else 'Texto')
    tags = [subcategory.lower(), area.lower(), *[p for p in command[1:].split('-') if len(p) > 2]]
    if area == 'CRIAR':
        fields = [('produto','Produto ou assunto','text'), ('finalidade','Finalidade da peça','text'), ('publico','Público','text'), ('contexto','Contexto visual','textarea'), ('estilo','Estilo visual','select'), ('composicao','Composição','text'), ('iluminacao','Iluminação','text'), ('proporcao','Proporção','select')]
        template = f"Atue como diretor de arte especializado em {subcategory.lower()}. Crie um prompt visual detalhado para {{produto}}, com finalidade de {{finalidade}}. Mostre o assunto em {{contexto}}, pensado para {{publico}}, com estilo {{estilo}}, composição {{composicao}}, iluminação {{iluminacao}} e proporção {{proporcao}}. Evite elementos genéricos e detalhe materiais, profundidade e acabamento. Comando: {command}."
    elif any(token in command for token in ['video','roteiro','reels','tiktok','youtube','podcast']):
        fields = [('tema','Tema','text'), ('publico','Público','text'), ('objetivo','Objetivo','select'), ('duracao','Duração','text'), ('formato','Formato','select'), ('tom','Tom de voz','select')]
        template = f"Atue como roteirista especialista em {subcategory.lower()}. Desenvolva {command} sobre {{tema}} para {{publico}}, com objetivo de {{objetivo}}, duração aproximada de {{duracao}}, formato {{formato}} e tom {{tom}}. Estruture a entrega com abertura, desenvolvimento, ritmo, transições e encerramento."
    elif any(token in command for token in ['email','whatsapp','crm','followup','mensagem']):
        fields = [('produto','Produto ou serviço','text'), ('publico','Público','text'), ('objetivo','Objetivo','select'), ('oferta','Oferta ou contexto','textarea'), ('tom','Tom de voz','select'), ('cta','Chamada para ação','text')]
        template = f"Atue como especialista em relacionamento e conversão. Crie {command} para divulgar {{produto}} a {{publico}}, com objetivo de {{objetivo}}. Considere esta oferta ou contexto: {{oferta}}. Use tom {{tom}}, seja claro e finalize com a chamada para ação {{cta}}."
    elif any(token in command for token in ['seo','keyword','artigo','blog','conteudo','snippet','serp']):
        fields = [('tema','Tema principal','text'), ('keyword','Palavra-chave','text'), ('publico','Público','text'), ('objetivo','Objetivo','select'), ('formato','Formato de saída','select'), ('tom','Tom editorial','select')]
        template = f"Atue como estrategista de SEO. Execute {command} para o tema {{tema}}, considerando a palavra-chave {{keyword}}, o público {{publico}}, o objetivo {{objetivo}}, em formato {{formato}} e tom {{tom}}. Priorize intenção de busca, clareza, profundidade e recomendações acionáveis."
    else:
        fields = [('contexto','Contexto','textarea'), ('objetivo','Objetivo','select'), ('publico','Público','text'), ('recursos','Recursos disponíveis','text'), ('tom','Tom de voz','select'), ('formato','Formato de saída','select')]
        template = f"Atue como especialista em {subcategory.lower()}. Execute {command} para o contexto {{contexto}}, com objetivo {{objetivo}}, considerando o público {{publico}} e os recursos {{recursos}}. Use tom {{tom}} e entregue em formato {{formato}}, com estrutura clara, critérios e próximos passos."
    if command in specific_templates:
        template = specific_templates[command]
    else:
        field_refs = ', '.join('{' + field_name + '}' for field_name, _, _ in fields)
        template = f"Execute o slash prompt {command} como um especialista em {subcategory.lower()}. Resolva especificamente esta tarefa: {description}. A entrega deve ser {output.lower()}, orientada à execução prática. Use estes insumos preenchidos: {field_refs}. Não responda com uma orientação genérica: siga a finalidade desta entrada, explicite critérios de qualidade e organize o resultado em etapas acionáveis."
    placeholder_specs = []
    for field_name, label, field_type in fields:
        options = None
        if field_name == 'objetivo': options = ['Criar','Vender','Educar','Engajar','Planejar','Analisar']
        elif field_name == 'tom': options = ['Profissional','Didático','Casual','Inspirador','Persuasivo']
        elif field_name == 'formato': options = ['Lista estruturada','Plano de ação','Tabela','Roteiro','Briefing completo']
        elif field_name == 'estilo': options = ['Editorial premium','Minimalista','Cinematográfico','Contemporâneo','Documental']
        elif field_name == 'proporcao': options = ['1:1','4:5','9:16','16:9','3:2']
        placeholder_specs.append({'name': field_name, 'label': label, 'type': field_type, 'required': True, 'options': options or [], 'defaultValue': options[0] if options else ''})
    platform = 'Instagram' if 'instagram' in command else ('WhatsApp' if 'whatsapp' in command else ('YouTube' if 'youtube' in command else ('TikTok' if 'tiktok' in command else ('LinkedIn' if 'linkedin' in command else 'Multiplataforma'))))
    objective = 'Vender' if any(token in command for token in ['venda','oferta','conversao','conversão','cta','pitch','copy']) else ('Planejar' if any(token in command for token in ['plano','estrategia','estratégia','calendario','calendário']) else ('Analisar' if any(token in command for token in ['analise','análise','auditoria','benchmark','swot']) else ('Crescer' if any(token in command for token in ['seo','growth','crescimento','engajamento']) else 'Criar')))
    difficulty = 'Avançado' if any(token in command for token in ['auditoria','benchmark','estrategia','estratégia','funil','automacao','automação','dashboard']) else ('Básico' if any(token in command for token in ['legenda','titulo','título','bio','hashtag','emoji']) else 'Intermediário')
    commands.append({
        'id': command[1:], 'command': command, 'name': name, 'description': description,
        'category': area, 'subcategory': subcategory, 'outputType': output,
        'platform': platform, 'objective': objective, 'difficulty': difficulty,
        'featured': command in ['/carrossel','/foto-produto','/copywriter','/persona','/roteiro-reels','/campanha','/landing-page','/seo'],
        'tags': sorted(set(tags)), 'template': template,
        'placeholders': placeholder_specs
    })
out = Path('/home/ubuntu/command-center/client/src/lib/catalog.ts')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text('export type Placeholder = { name: string; label: string; type: string; required: boolean; options?: string[]; defaultValue?: string };\nexport type Command = { id: string; command: string; name: string; description: string; category: "PENSAR" | "ESCREVER" | "CRIAR" | "CRESCER"; subcategory: string; outputType: string; platform: string; objective: string; difficulty: string; featured: boolean; tags: string[]; template: string; placeholders: Placeholder[] };\n\nexport const catalog: Command[] = ' + json.dumps(commands, ensure_ascii=False, indent=2) + ';\n')
print(f'Generated {len(commands)} commands')
