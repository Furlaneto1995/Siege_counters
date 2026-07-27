# Siege Counters — PWA

Banco de counters para o Cerco de Guilda de Summoners War.
Tema visual e ícones extraídos do SW-TuneLab / assets originais do jogo.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | App completo (CSS + JS + 1.131 monstros + orbes embutidos). É o `start_url` do PWA. |
| `siege-counters.html` | Cópia idêntica, para abrir/compartilhar solta. |
| `manifest.webmanifest` | Metadados do PWA: nome, cores, 11 ícones, atalho "Registrar counter". |
| `sw.js` | Service worker — app offline + cache dos retratos. |
| `icons/` | 15 arquivos: ícones any/maskable, apple-touch e favicon. |
| `monsters.json` | Catálogo (nome, elemento, ícone, estrelas naturais). |
| `src/` | Fontes separados (`index.html`, `style.css`, `app.js`, `data.js`). |
| `build.py` | Junta `src/` num HTML único. Rode após editar qualquer fonte. |

## Como publicar

O PWA precisa de **HTTPS** (ou `localhost`) para o service worker funcionar.

```bash
# teste local
python3 -m http.server 8000
# abra http://localhost:8000
```

### GitHub Pages (testado)

1. Crie um repositório **público** (repo privado só serve Pages no plano pago).
2. Suba o conteúdo desta pasta na **raiz** do repositório — não dentro de outra pasta.
   O `index.html` precisa ficar na raiz do que for publicado.
3. Vá em **Settings → Pages** e escolha a branch (`main`) e a pasta `/ (root)`.
4. Aguarde 1–2 minutos. O endereço será `https://SEU-USUARIO.github.io/SEU-REPO/`.

Tudo usa caminho relativo (`./`), então funciona em qualquer nome de repositório
e também em domínio próprio, sem precisar editar nada.

O arquivo `.nojekyll` (incluído) impede o Jekyll de processar o site — sem ele,
o GitHub ignora pastas e arquivos iniciados com underscore.

Alternativas igualmente boas: Netlify, Vercel e Cloudflare Pages (arraste a pasta).

## Instalar no celular

- **Android/Chrome** — aparece o botão "⤓ Instalar" na barra superior, ou use o menu ⋮ → "Instalar aplicativo".
- **iOS/Safari** — Compartilhar → "Adicionar à Tela de Início". (iOS não mostra o botão automático.)

Depois de instalado, abre em tela cheia, com o brasão de cerco como ícone.

## Offline

Testado com a rede desligada: o app carrega, os counters salvos continuam lá e o
catálogo de monstros funciona normalmente.

- **App shell** (HTML, ícones, manifest) — cache-first, roda 100% offline.
- **Retratos dos monstros** (CDN do SWARFARM) — stale-while-revalidate: cada retrato
  já visto fica em cache. Na primeira visita eles vêm da internet.
- **Counters salvos** — `localStorage`, nunca saem do aparelho. Use Exportar/Importar
  para backup ou para compartilhar com a guilda.

## Editando

```bash
# edite src/style.css ou src/app.js, depois:
python3 build.py
```

Para regerar os ícones a partir de outro sprite, veja a seção de geração no
histórico — o recorte usado foi `gui_siege.png` em `(2, 1, 242, 161)`.

## Cache do service worker

Ao publicar uma atualização, mude a constante `VERSION` no topo de `sw.js`
(`v1` → `v2`). Isso descarta os caches antigos e força o download da nova versão.
