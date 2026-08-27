import json
from pathlib import Path

source = Path('/home/ubuntu/command-center/client/src/lib/catalog.ts').read_text()
payload = source.split('export const catalog: Command[] = ', 1)[1].rsplit(';', 1)[0].strip()
commands = json.loads(payload)

def quote(value):
    if value is None:
        return 'NULL'
    return "'" + str(value).replace('\\', '\\\\').replace("'", "''") + "'"

rows = []
for item in commands:
    rows.append('(' + ','.join([
        quote(item['id']), quote(item['command']), quote(item['name']), quote(item['description']), quote(item['category']),
        quote(item['subcategory']), quote(item['objective']), quote(item['outputType']), quote(item['platform']), quote(item['template']),
        quote(','.join(item['tags'])), quote(item['difficulty']), '1' if item['featured'] else '0', '1'
    ]) + ')')

sql = 'INSERT INTO commands (slug, slashCommand, name, description, category, subcategory, objective, outputType, platform, promptTemplate, tags, difficulty, featured, active) VALUES\n' + ',\n'.join(rows) + '\nON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), category=VALUES(category), subcategory=VALUES(subcategory), objective=VALUES(objective), outputType=VALUES(outputType), platform=VALUES(platform), promptTemplate=VALUES(promptTemplate), tags=VALUES(tags), difficulty=VALUES(difficulty), featured=VALUES(featured), active=VALUES(active);\n'
Path('/home/ubuntu/command-center/scripts/seed_commands.sql').write_text(sql)
print(f'Generated SQL for {len(commands)} commands')
