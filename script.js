
// ────────────────────────────────────────────────────────────

/** Lê o carrinho do localStorage */
function getCarrinho() {
  return JSON.parse(localStorage.getItem('ek_carrinho') || '[]');
}

/** Salva o carrinho no localStorage */
function setCarrinho(carrinho) {
  localStorage.setItem('ek_carrinho', JSON.stringify(carrinho));
}

/** Lê os favoritos do localStorage */
function getFavoritos() {
  return JSON.parse(localStorage.getItem('ek_favoritos') || '[]');
}

/** Salva os favoritos no localStorage */
function setFavoritos(favs) {
  localStorage.setItem('ek_favoritos', JSON.stringify(favs));
}

/** Mostra um toast de notificação temporário */
function toast(msg, cor = '#222') {
  let el = document.getElementById('ek-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ek-toast';
    Object.assign(el.style, {
      position: 'fixed', bottom: '28px', right: '24px',
      background: cor, color: '#fff',
      padding: '12px 22px', borderRadius: '8px',
      fontFamily: 'Poppins, sans-serif', fontSize: '14px',
      boxShadow: '0 4px 18px rgba(0,0,0,.25)',
      zIndex: 9999, transition: 'opacity .3s',
      opacity: '0', pointerEvents: 'none'
    });
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = cor;
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 2800);
}

/** Atualiza o badge de quantidade no link do carrinho */
function atualizarBadgeCarrinho() {
  const carrinho = getCarrinho();
  const total = carrinho.reduce((s, i) => s + i.qtd, 0);
  document.querySelectorAll('a[href="carrinho.html"]').forEach(a => {
    let badge = a.querySelector('.ek-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'ek-badge';
      Object.assign(badge.style, {
        background: '#e00', color: '#fff',
        borderRadius: '50%', fontSize: '11px',
        padding: '1px 6px', marginLeft: '4px',
        fontWeight: '700', verticalAlign: 'middle'
      });
      a.appendChild(badge);
    }
    badge.textContent = total > 0 ? total : '';
    badge.style.display = total > 0 ? 'inline' : 'none';
  });
}

// ────────────────────────────────────────────────────────────
//  ADICIONAR AO CARRINHO (botões nas páginas de produto)
// ────────────────────────────────────────────────────────────

function iniciarBotoesCarrinho() {
  document.querySelectorAll('.btn-card').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = this.closest('.card');
      const nome = card.querySelector('h3')?.textContent.trim() || 'Produto';
      const precoStr = card.querySelector('p')?.textContent.trim() || 'R$ 0,00';
      const img = card.querySelector('img')?.src || '';

      const preco = parseFloat(
        precoStr.replace('R$', '').replace('.', '').replace(',', '.').trim()
      );

      const carrinho = getCarrinho();
      const idx = carrinho.findIndex(i => i.nome === nome);
      if (idx >= 0) {
        carrinho[idx].qtd += 1;
      } else {
        carrinho.push({ nome, preco, img, qtd: 1 });
      }
      setCarrinho(carrinho);
      atualizarBadgeCarrinho();
      toast(`✓ "${nome}" adicionado ao carrinho!`, '#27ae60');
    });
  });
}

// ────────────────────────────────────────────────────────────
//  PÁGINA: CARRINHO (carrinho.html)
// ────────────────────────────────────────────────────────────

function renderizarCarrinho() {
  const main = document.querySelector('main');
  if (!main || !document.title.toLowerCase().includes('carrinho') &&
      !window.location.pathname.includes('carrinho')) return;

  // limpa conteúdo estático de exemplo
  main.innerHTML = '<h1>Seu Carrinho</h1><div id="lista-carrinho"></div><div id="resumo-carrinho"></div>';

  const lista = document.getElementById('lista-carrinho');
  const resumo = document.getElementById('resumo-carrinho');

  function renderLista() {
    const carrinho = getCarrinho();
    lista.innerHTML = '';

    if (carrinho.length === 0) {
      lista.innerHTML = '<p style="text-align:center;margin:40px 0;color:#888;">Seu carrinho está vazio. <a href="index.html">Continuar comprando →</a></p>';
      resumo.innerHTML = '';
      atualizarBadgeCarrinho();
      return;
    }

    carrinho.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `
        <img src="${item.img}" alt="${item.nome}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">
        <div class="info" style="flex:1;margin:0 16px;">
          <h2 style="font-size:16px;margin:0 0 4px">${item.nome}</h2>
          <p style="margin:0;color:#888;">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="btn-qtd" data-acao="menos" data-idx="${idx}" style="width:30px;height:30px;border-radius:50%;border:1px solid #ccc;cursor:pointer;font-size:18px;background:#f5f5f5;">−</button>
          <span>${item.qtd}</span>
          <button class="btn-qtd" data-acao="mais" data-idx="${idx}" style="width:30px;height:30px;border-radius:50%;border:1px solid #ccc;cursor:pointer;font-size:18px;background:#f5f5f5;">+</button>
        </div>
        <div style="margin-left:16px;font-weight:700;min-width:80px;text-align:right;">
          R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}
        </div>
        <button class="btn-remover" data-idx="${idx}" style="margin-left:14px;background:none;border:none;color:#e00;font-size:20px;cursor:pointer;" title="Remover">✕</button>
      `;
      lista.appendChild(div);
    });

    // total
    const subtotal = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
    const frete = subtotal >= 199 ? 0 : 19.90;
    resumo.innerHTML = `
      <div class="total" style="margin-top:24px;padding:20px;border-top:2px solid #eee;">
        <p>Subtotal: <strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong></p>
        <p>Frete: <strong>${frete === 0 ? 'GRÁTIS 🎉' : 'R$ ' + frete.toFixed(2).replace('.', ',')}</strong></p>
        ${frete > 0 ? `<p style="font-size:12px;color:#888;">Falta R$ ${(199 - subtotal).toFixed(2).replace('.', ',')} para frete grátis</p>` : ''}
        <h2>Total: R$ ${(subtotal + frete).toFixed(2).replace('.', ',')}</h2>
        <a href="checkout.html"><button class="finalizar" style="margin-top:12px;">Finalizar Compra →</button></a>
        <a href="index.html" style="display:block;margin-top:12px;text-align:center;color:#888;font-size:14px;">← Continuar comprando</a>
      </div>
    `;

    // eventos qtd / remover
    lista.querySelectorAll('.btn-qtd').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = getCarrinho();
        const i = parseInt(btn.dataset.idx);
        if (btn.dataset.acao === 'mais') {
          c[i].qtd += 1;
        } else {
          c[i].qtd -= 1;
          if (c[i].qtd <= 0) c.splice(i, 1);
        }
        setCarrinho(c);
        atualizarBadgeCarrinho();
        renderLista();
      });
    });

    lista.querySelectorAll('.btn-remover').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = getCarrinho();
        const nome = c[parseInt(btn.dataset.idx)].nome;
        c.splice(parseInt(btn.dataset.idx), 1);
        setCarrinho(c);
        atualizarBadgeCarrinho();
        renderLista();
        toast(`"${nome}" removido do carrinho`, '#e74c3c');
      });
    });
  }

  renderLista();
}

// ────────────────────────────────────────────────────────────
//  PÁGINA: FAVORITOS (favoritos.html)
// ────────────────────────────────────────────────────────────

function iniciarBotoesFavoritos() {
  // Botão "Adicionar ao Carrinho" dentro de favoritos
  document.querySelectorAll('.card-favorito button, .cards-favoritos button').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = this.closest('.card-favorito');
      if (!card) return;
      const nome = card.querySelector('h3')?.textContent.trim() || 'Produto';
      const precoStr = card.querySelector('p')?.textContent.trim() || 'R$ 0,00';
      const img = card.querySelector('img')?.src || '';
      const preco = parseFloat(
        precoStr.replace('R$', '').replace('.', '').replace(',', '.').trim()
      );
      const carrinho = getCarrinho();
      const idx = carrinho.findIndex(i => i.nome === nome);
      if (idx >= 0) { carrinho[idx].qtd += 1; } else { carrinho.push({ nome, preco, img, qtd: 1 }); }
      setCarrinho(carrinho);
      atualizarBadgeCarrinho();
      toast(`✓ "${nome}" adicionado ao carrinho!`, '#27ae60');
    });
  });
}

// ────────────────────────────────────────────────────────────
//  PÁGINA: PESQUISA (pesquisa.html)
// ────────────────────────────────────────────────────────────

const CATALOGO = [
  { nome: 'Camiseta Oversized',        preco: 89.90,  img: 'img/camiseta1.webp',  cat: 'Camisetas' },
  { nome: 'Camiseta Estampada',        preco: 79.90,  img: 'img/camisetas2.jpg',  cat: 'Camisetas' },
  { nome: 'Camiseta Básica',           preco: 59.90,  img: 'img/camiseta3.webp',  cat: 'Camisetas' },
  { nome: 'Camiseta Compton Oversized',preco: 109.90, img: 'img/camiseta4.webp',  cat: 'Camisetas' },
  { nome: 'Camiseta Oversized Onny',   preco: 99.90,  img: 'img/camiseta5.webp',  cat: 'Camisetas' },
  { nome: 'Camiseta Choose Your Fate', preco: 94.91,  img: 'img/camiseta6.webp',  cat: 'Camisetas' },
  { nome: 'Camiseta Off-Y Pink NY',    preco: 99.90,  img: 'img/camiseta7.webp',  cat: 'Camisetas' },
  { nome: 'Moletom Street',            preco: 149.90, img: 'img/moletom1.jpg',    cat: 'Moletons'  },
  { nome: 'Moletom Oversized',         preco: 159.90, img: 'img/moletom2.jpg',    cat: 'Moletons'  },
  { nome: 'Moletom Básico',            preco: 129.90, img: 'img/moletom3.jpg',    cat: 'Moletons'  },
  { nome: 'Moletom Masculino Streetwear', preco: 175.00, img: 'img/moletom4.webp', cat: 'Moletons' },
  { nome: 'Moletom Vintage com Capuz', preco: 140.33, img: 'img/moletom5.webp',  cat: 'Moletons'  },
  { nome: 'Moletom Metal Boss Life',   preco: 399.00, img: 'img/moletom6.webp',  cat: 'Moletons'  },
  { nome: 'Calça Cargo',               preco: 129.90, img: 'img/calca1.webp',    cat: 'Calças'    },
  { nome: 'Calça Jeans',               preco: 149.90, img: 'img/calca2.jpg',     cat: 'Calças'    },
  { nome: 'Calça Moletom',             preco: 119.90, img: 'img/calca3.jpg',     cat: 'Calças'    },
  { nome: 'Calça Jogger Academia',     preco: 269.00, img: 'img/calca4.webp',    cat: 'Calças'    },
  { nome: 'Calça Cargo Veludo Areia',  preco: 149.90, img: 'img/calca5.webp',    cat: 'Calças'    },
  { nome: 'Calça Wide Leg Punk',       preco: 429.00, img: 'img/calca6.webp',    cat: 'Calças'    },
  { nome: 'Calça Treze Core Bege',     preco: 119.90, img: 'img/calca9.webp',    cat: 'Calças'    },
  { nome: 'Calça Cargo Jeans Preto',   preco: 269.00, img: 'img/calca7.webp',    cat: 'Calças'    },
  { nome: 'Calça Two Loves Black',     preco: 119.90, img: 'img/calca8.webp',    cat: 'Calças'    },
  { nome: 'Calça Baggy Couro Preto',   preco: 429.00, img: 'img/calca10.webp',   cat: 'Calças'    },
  { nome: 'Tênis Nike Downshifter 13', preco: 329.99, img: 'img/tenis1.avif',    cat: 'Tênis'     },
  { nome: 'Tênis Nike Air Max Nuaxis', preco: 398.99, img: 'img/tenis2.avif',    cat: 'Tênis'     },
  { nome: 'Tênis Nike Air Max Excee',  preco: 493.99, img: 'img/tenis4.jpg',     cat: 'Tênis'     },
  { nome: 'Chinelo Nike Offcourt',     preco: 199.49, img: 'img/tenis4.avif',    cat: 'Tênis'     },
  { nome: "Women's Nike Dunk Low SE",  preco: 949.99, img: 'img/tenis5.avif',    cat: 'Tênis'     },
  { nome: 'Tênis Nike Air Max Plus',   preco: 911.99, img: 'img/tenis6.avif',    cat: 'Tênis'     },
];

function iniciarPesquisa() {
  const barra    = document.querySelector('.barra-pesquisa');
  const btnBusca = document.querySelector('.btn-pesquisa');
  const resultDiv = document.querySelector('.resultados');
  if (!barra || !resultDiv) return;

  // Limpa o conteúdo estático de exemplo
  resultDiv.innerHTML = '<p style="color:#aaa;text-align:center;margin-top:30px;">Digite algo para pesquisar…</p>';

  function buscar() {
    const termo = barra.value.trim().toLowerCase();
    resultDiv.innerHTML = '';

    if (!termo) {
      resultDiv.innerHTML = '<p style="color:#aaa;text-align:center;margin-top:30px;">Digite algo para pesquisar…</p>';
      return;
    }

    const encontrados = CATALOGO.filter(p =>
      p.nome.toLowerCase().includes(termo) || p.cat.toLowerCase().includes(termo)
    );

    if (encontrados.length === 0) {
      resultDiv.innerHTML = `<p style="text-align:center;margin-top:30px;color:#888;">Nenhum produto encontrado para "<strong>${barra.value}</strong>".</p>`;
      return;
    }

    encontrados.forEach(p => {
      const div = document.createElement('div');
      div.className = 'produto card';
      div.innerHTML = `
        <img src="${p.img}" alt="${p.nome}">
        <h3>${p.nome}</h3>
        <p>R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
        <span style="font-size:11px;color:#aaa;">${p.cat}</span>
        <button class="btn-card" style="margin-top:8px;">Adicionar ao Carrinho</button>
      `;
      resultDiv.appendChild(div);
    });

    // Reativa botões de carrinho nos resultados
    iniciarBotoesCarrinho();
  }

  btnBusca.addEventListener('click', buscar);
  barra.addEventListener('keydown', e => { if (e.key === 'Enter') buscar(); });
}

// ────────────────────────────────────────────────────────────
//  PÁGINA: CHECKOUT (checkout.html)
// ────────────────────────────────────────────────────────────

const CUPONS = {
  'EK10':   0.10,   // 10%
  'FRETE0': 0,      // frete grátis (tratado à parte)
  'EK20':   0.20,   // 20%
  'EKOFF':  0.15,   // 15%
};

function iniciarCheckout() {
  const btnFinalizar = document.getElementById('btnFinalizar');
  const msgFeedback  = document.getElementById('msgFeedback');
  const btnCupom     = document.querySelector('button[type="button"]:not(#btnFinalizar)');
  const inputCupom   = document.getElementById('cupom');

  if (!btnFinalizar) return;

  // Resumo do pedido dinâmico
  const carrinho = getCarrinho();
  const resumoDiv = document.createElement('div');
  resumoDiv.id = 'resumo-pedido';
  resumoDiv.style.cssText = 'background:#f9f9f9;border-radius:10px;padding:16px;margin-bottom:20px;';

  if (carrinho.length === 0) {
    resumoDiv.innerHTML = '<p style="color:#888;text-align:center;">Seu carrinho está vazio. <a href="index.html">Voltar à loja →</a></p>';
  } else {
    const subtotal = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
    const linhas = carrinho.map(i =>
      `<li style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;">
        <span>${i.nome} × ${i.qtd}</span>
        <strong>R$ ${(i.preco * i.qtd).toFixed(2).replace('.', ',')}</strong>
      </li>`
    ).join('');
    resumoDiv.innerHTML = `
      <h3 style="margin-top:0;">Resumo do Pedido</h3>
      <ul style="list-style:none;padding:0;margin:0 0 12px;">${linhas}</ul>
      <p id="checkout-total" style="font-weight:700;font-size:18px;text-align:right;">
        Total: R$ ${subtotal.toFixed(2).replace('.', ',')}
      </p>
    `;
  }

  const checkout = document.querySelector('.checkout') || document.querySelector('main');
  checkout.insertBefore(resumoDiv, checkout.querySelector('form') || checkout.firstChild);

  // Aplicar cupom
  if (btnCupom && inputCupom) {
    btnCupom.addEventListener('click', () => {
      const codigo = inputCupom.value.trim().toUpperCase();
      const totalEl = document.getElementById('checkout-total');

      if (!CUPONS.hasOwnProperty(codigo)) {
        msgFeedback.textContent = '❌ Cupom inválido.';
        msgFeedback.style.color = '#e00';
        return;
      }

      const carrinho = getCarrinho();
      const subtotal = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
      const desconto = subtotal * CUPONS[codigo];
      const novoTotal = subtotal - desconto;

      msgFeedback.textContent = `✅ Cupom "${codigo}" aplicado! Desconto de R$ ${desconto.toFixed(2).replace('.', ',')}`;
      msgFeedback.style.color = '#27ae60';
      if (totalEl) {
        totalEl.textContent = `Total: R$ ${novoTotal.toFixed(2).replace('.', ',')} (−${(CUPONS[codigo] * 100).toFixed(0)}%)`;
      }
    });
  }

  // Finalizar pedido
  btnFinalizar.addEventListener('click', () => {
    const nome    = document.getElementById('nome')?.value.trim();
    const email   = document.getElementById('email')?.value.trim();
    const end     = document.getElementById('endereco')?.value.trim();
    const cidade  = document.getElementById('cidade')?.value.trim();
    const cep     = document.getElementById('cep')?.value.trim();

    if (!nome || nome.length < 3) {
      msgFeedback.textContent = '⚠️ Digite seu nome completo.';
      msgFeedback.style.color = '#e00'; return;
    }
    const regEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.test(email)) {
      msgFeedback.textContent = '⚠️ Digite um e-mail válido.';
      msgFeedback.style.color = '#e00'; return;
    }
    if (!end || end.length < 5) {
      msgFeedback.textContent = '⚠️ Digite seu endereço completo.';
      msgFeedback.style.color = '#e00'; return;
    }
    if (!cidade) {
      msgFeedback.textContent = '⚠️ Digite sua cidade.';
      msgFeedback.style.color = '#e00'; return;
    }
    const cepNum = cep.replace(/\D/g, '');
    if (cepNum.length < 8) {
      msgFeedback.textContent = '⚠️ Digite um CEP válido (8 dígitos).';
      msgFeedback.style.color = '#e00'; return;
    }

    const carrinho = getCarrinho();
    if (carrinho.length === 0) {
      msgFeedback.textContent = '⚠️ Seu carrinho está vazio!';
      msgFeedback.style.color = '#e00'; return;
    }

    // Grava pedido simulado
    const pedidos = JSON.parse(localStorage.getItem('ek_pedidos') || '[]');
    const num = pedidos.length + 1;
    pedidos.push({
      num: String(num).padStart(3, '0'),
      itens: carrinho,
      status: 'Aguardando confirmação',
      data: new Date().toLocaleDateString('pt-BR')
    });
    localStorage.setItem('ek_pedidos', JSON.stringify(pedidos));

    // Limpa carrinho
    setCarrinho([]);
    atualizarBadgeCarrinho();

    msgFeedback.textContent = `🎉 Pedido #${String(num).padStart(3, '0')} realizado com sucesso! Obrigado, ${nome}!`;
    msgFeedback.style.color = '#27ae60';
    msgFeedback.style.fontSize = '16px';
    btnFinalizar.disabled = true;
    document.getElementById('resumo-pedido').innerHTML += `<a href="pedidos.html" style="display:block;margin-top:14px;text-align:center;">Ver meus pedidos →</a>`;
  });

  // Formata CEP
  const inputCep = document.getElementById('cep');
  if (inputCep) {
    inputCep.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
      this.value = v;
    });
  }
}

// ────────────────────────────────────────────────────────────
//  PÁGINA: PEDIDOS (pedidos.html)
// ────────────────────────────────────────────────────────────

function renderizarPedidos() {
  const main = document.querySelector('main');
  if (!main || !window.location.pathname.includes('pedidos')) return;

  const pedidos = JSON.parse(localStorage.getItem('ek_pedidos') || '[]');
  const existentes = document.querySelectorAll('.pedido');
  existentes.forEach(el => el.remove());

  const h1 = main.querySelector('h1');

  if (pedidos.length === 0) {
    const p = document.createElement('p');
    p.style.cssText = 'text-align:center;color:#888;margin:40px 0;';
    p.innerHTML = 'Você ainda não fez nenhum pedido. <a href="index.html">Ir às compras →</a>';
    h1 ? h1.after(p) : main.appendChild(p);
    return;
  }

  // Pedidos mais recentes primeiro
  [...pedidos].reverse().forEach(pedido => {
    const div = document.createElement('div');
    div.className = 'pedido';
    const itensHtml = pedido.itens.map(i =>
      `<li>${i.nome} × ${i.qtd} — R$ ${(i.preco * i.qtd).toFixed(2).replace('.', ',')}</li>`
    ).join('');
    const total = pedido.itens.reduce((s, i) => s + i.preco * i.qtd, 0);
    div.innerHTML = `
      <h3>Pedido #${pedido.num} <small style="font-weight:400;color:#888;">${pedido.data}</small></h3>
      <ul style="padding-left:18px;margin:8px 0;">${itensHtml}</ul>
      <p>Total: <strong>R$ ${total.toFixed(2).replace('.', ',')}</strong></p>
      <p>Status: <span style="color:#27ae60;font-weight:600;">${pedido.status}</span></p>
    `;
    h1 ? h1.after(div) : main.appendChild(div);
  });
}

// ────────────────────────────────────────────────────────────
//  PÁGINA: CONTATO (contato.html)  — mantém lógica original
// ────────────────────────────────────────────────────────────

function iniciarContato() {
  const formulario  = document.getElementById('formContato');
  const msgFeedback = document.getElementById('msgFeedback');
  const btnEnviar   = document.getElementById('btnEnviar');
  const btnLimpar   = document.getElementById('btnLimpar');
  const inputNome   = document.getElementById('nome');
  const inputTel    = document.getElementById('telefone');

  if (!formulario) return;

  function mostrarErro(msg) {
    msgFeedback.textContent = msg;
    msgFeedback.style.color = '#e00';
  }

  inputNome.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
  });

  inputTel.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 2) { /* nada */ }
    else if (v.length <= 7) { v = '(' + v.slice(0, 2) + ') ' + v.slice(2); }
    else { v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7); }
    this.value = v;
  });

  btnEnviar.addEventListener('click', function () {
    const nome     = inputNome.value.trim();
    const email    = document.getElementById('email').value.trim();
    const telefone = inputTel.value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();

    if (nome.length < 3)   { mostrarErro('O nome deve ter pelo menos 3 letras.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { mostrarErro('Digite um e-mail válido.'); return; }
    if (telefone.replace(/\D/g, '').length < 10)    { mostrarErro('Digite um telefone válido com DDD.'); return; }
    if (mensagem.length < 20) { mostrarErro(`A mensagem deve ter pelo menos 20 caracteres. (${mensagem.length}/20)`); return; }

    msgFeedback.textContent = `Olá, ${nome}! Sua mensagem foi enviada com sucesso! ✅`;
    msgFeedback.style.color = '#27ae60';
    formulario.reset();
  });

  btnLimpar.addEventListener('click', function () {
    formulario.reset();
    msgFeedback.textContent = '';
  });
}

// ────────────────────────────────────────────────────────────
//  PÁGINA: CONTA (conta.html)
// ────────────────────────────────────────────────────────────

function iniciarConta() {
  const btnSair   = document.querySelector('.sair');
  const btnEntrar = document.querySelector('button[type="submit"]');
  const btnEditar = document.querySelector('.editar');

  if (!btnSair && !btnEntrar) return;

  const usuario = localStorage.getItem('ek_usuario');

  if (usuario) {
    const bem = document.querySelector('.conta h2');
    if (bem) bem.textContent = `Bem-vindo, ${usuario}!`;
    if (btnEntrar) btnEntrar.style.display = 'none';
  } else {
    if (btnEditar) btnEditar.style.display = 'none';
  }

  if (btnEntrar) {
    btnEntrar.addEventListener('click', () => {
      const nome = prompt('Digite seu nome para entrar:');
      if (nome && nome.trim().length >= 2) {
        localStorage.setItem('ek_usuario', nome.trim());
        location.reload();
      }
    });
  }

  if (btnSair) {
    btnSair.addEventListener('click', () => {
      if (confirm('Deseja realmente sair da sua conta?')) {
        localStorage.removeItem('ek_usuario');
        toast('Você saiu da conta.', '#888');
        setTimeout(() => location.reload(), 1000);
      }
    });
  }
}

// ────────────────────────────────────────────────────────────
//  ÍNDICE: destaques de produto na home (index.html)
// ────────────────────────────────────────────────────────────

function iniciarHome() {
  const btnColecao = document.querySelector('.btn');
  if (!btnColecao) return;
  btnColecao.addEventListener('click', () => {
    window.location.href = 'camisetas.html';
  });
}

// ────────────────────────────────────────────────────────────
//  INICIALIZAÇÃO — executa ao carregar o DOM
// ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  atualizarBadgeCarrinho();

  const path = window.location.pathname;

  iniciarHome();
  iniciarBotoesCarrinho();
  iniciarBotoesFavoritos();
  iniciarContato();
  iniciarConta();

  if (path.includes('carrinho'))  renderizarCarrinho();
  if (path.includes('pesquisa'))  iniciarPesquisa();
  if (path.includes('checkout'))  iniciarCheckout();
  if (path.includes('pedidos'))   renderizarPedidos();
});