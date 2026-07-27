#!/usr/bin/env python3
"""Junta src/{index.html,style.css,app.js} + monsters.json num HTML único.

Gera dois arquivos com o mesmo conteúdo:
  index.html           -> usado pelo PWA (start_url do manifest)
  siege-counters.html  -> cópia avulsa, fácil de compartilhar
"""
import json, pathlib

root = pathlib.Path(__file__).parent
src  = root / 'src'

html = (src / 'index.html').read_text(encoding='utf-8')
css  = (src / 'style.css').read_text(encoding='utf-8')
js   = (src / 'app.js').read_text(encoding='utf-8')
mons = json.loads((root / 'monsters.json').read_text(encoding='utf-8'))

data_js = 'window.MONSTERS=' + json.dumps(mons, ensure_ascii=False, separators=(',', ':')) + ';'

out = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>')
out = out.replace(
    '<script src="data.js"></script>\n<script src="app.js"></script>',
    '<script>\n' + data_js + '\n</script>\n<script>\n' + js + '\n</script>')

# sanidade: nada de CSS/JS externo sobrando, PWA ligado
assert '<style>' in out and 'window.MONSTERS' in out and 'renderSlots()' in out
assert 'href="style.css"' not in out and 'src="app.js"' not in out
assert 'manifest.webmanifest' in out and "register('sw.js')" in out

for name in ('index.html', 'siege-counters.html'):
    (root / name).write_text(out, encoding='utf-8')

print(f'index.html + siege-counters.html: {len(out)/1024:.0f} KB · {len(mons)} monstros')
