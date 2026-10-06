# Elivelton Chaves — Portfólio

Portfólio pessoal desenvolvido para apresentar minha trajetória, habilidades, projetos e experiências como desenvolvedor de software.

O projeto foi construído com foco em uma experiência visual moderna, responsiva e imersiva, utilizando tecnologias web fundamentais e JavaScript puro.

---

## ✨ Sobre o projeto

Este portfólio foi desenvolvido para ser mais do que uma simples página de apresentação.

A proposta é criar uma experiência digital que represente minha forma de trabalhar com tecnologia: combinando **desenvolvimento, criatividade, resolução de problemas e atenção aos detalhes**.

O site apresenta:

- Minha apresentação profissional
- Sobre mim e minha trajetória
- Projetos desenvolvidos
- Tecnologias utilizadas
- Informações de contato
- Links para minhas redes profissionais
- Suporte a múltiplos idiomas
- Experiências e animações interativas

---

## 🚀 Tecnologias

O projeto foi desenvolvido utilizando tecnologias fundamentais do desenvolvimento web:

- **HTML5** — estrutura semântica da aplicação
- **CSS3** — layout, responsividade, animações e efeitos visuais
- **JavaScript** — interações e funcionalidades
- **Git** — controle de versão
- **GitHub** — hospedagem e versionamento do projeto

### Recursos utilizados

- HTML semântico
- CSS moderno
- CSS Mask / Gradients
- CSS Animations
- JavaScript Vanilla
- `IntersectionObserver`
- `requestAnimationFrame`
- LocalStorage
- Internacionalização (i18n)
- Design responsivo
- Acessibilidade
- `prefers-reduced-motion`

---

## 🌎 Internacionalização

O portfólio possui suporte a três idiomas:

| Idioma | Código |
|---|---|
| 🇧🇷 Português | `pt-BR` |
| 🇪🇸 Espanhol | `es` |
| 🇺🇸 Inglês | `en` |

A troca de idioma acontece sem recarregar a página.

A preferência do usuário também é armazenada localmente através do `localStorage`.

---

## 🎨 Interface

O design foi desenvolvido com uma identidade visual:

- Cinematográfica
- Minimalista
- Futurista
- Elegante
- Escura
- Focada em conteúdo visual

A interface utiliza elementos como:

- Tipografia editorial
- Contrastes suaves
- Detalhes em lavanda
- Bordas discretas
- Animações sutis
- Profundidade visual
- Efeitos de interação com o cursor

A intenção é evitar interfaces genéricas e criar uma experiência visual própria.

---

## 🖱️ Interações

O projeto possui diversas interações para tornar a navegação mais dinâmica.

### Cursor Reveal

O Hero possui um efeito de revelação baseado na posição do cursor.

Uma segunda camada visual é revelada de forma orgânica através de uma máscara circular suave, criando um efeito semelhante a uma luz passando sobre a imagem.

O efeito utiliza:

- `requestAnimationFrame`
- interpolação de movimento
- `radial-gradient`
- CSS Mask
- detecção de ponteiro
- suporte a `prefers-reduced-motion`

Em dispositivos touch, o efeito é automaticamente desativado.

---

## 📱 Responsividade

O projeto foi desenvolvido para funcionar em diferentes tamanhos de tela:

- Desktop
- Notebook
- Tablet
- Smartphone

A interface se adapta aos diferentes dispositivos mantendo a identidade visual e a experiência de navegação.

Também existe um menu mobile com comportamento específico para dispositivos menores.

---

## 📂 Estrutura

```text
portfolio/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── script.js
│   └── translations.js
│
└── assets/
    ├── background.png
    ├── revelar-background.png
    ├── elivelton
    ├── Codequest
    ├── estoque
    ├── IpVilafeliz
    └── CobraFlow
