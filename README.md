# Vita em Casa · Home

Site estático (HTML, CSS e JS) da Home da Vita em Casa, implementado a partir do Figma ("Home animação").

- `index.html` · estrutura e textos
- `styles.css` · layout fiel ao Figma e responsivo (desktop, tablet, celular)
- `main.js` · animações com GSAP + ScrollTrigger e rolagem suave com Lenis
- `assets/` · imagens (WebP) e ícones (SVG) exportados do Figma

## Animações
Entrada do hero (máscara, zoom da foto, título palavra a palavra, cartão do plano flutuando), títulos que sobem palavra a palavra, cartões em cascata, contador "+2.000", vídeos de fundo do Figma com parallax nas faixas, cartões de serviços empilhados (sticky), imagem dos planos abrindo como cortina, acordeão animado nas FAQs, botões magnéticos, barra de progresso e botão flutuante de chamada. Com "reduzir movimento" ativado no sistema, tudo aparece sem animação.

## Ver localmente
```
python -m http.server 8080
```
e abrir http://localhost:8080
