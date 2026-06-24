const formulario  = document.getElementById("formContato");
const msgFeedback = document.getElementById("msgFeedback");
const btnEnviar   = document.getElementById("btnEnviar");
const btnLimpar   = document.getElementById("btnLimpar");
const inputNome   = document.getElementById("nome");
const inputTel    = document.getElementById("telefone");
 
// ─── NOME: só letras e espaços, bloqueia digitação de números ───
inputNome.addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
});
 
// ─── TELEFONE: formata automaticamente (XX) XXXXX-XXXX ───
inputTel.addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "").slice(0, 11);
 
    if (v.length <= 2) {
        v = v;
    } else if (v.length <= 7) {
        v = "(" + v.slice(0, 2) + ") " + v.slice(2);
    } else if (v.length <= 11) {
        v = "(" + v.slice(0, 2) + ") " + v.slice(2, 7) + "-" + v.slice(7);
    }
 
    this.value = v;
});
 
// ─── ENVIAR ───
btnEnviar.addEventListener("click", function () {
    const nome     = inputNome.value.trim();
    const email    = document.getElementById("email").value.trim();
    const telefone = inputTel.value.trim();
    const mensagem = document.getElementById("mensagem").value.trim();
 
    // Nome: mínimo 3 letras
    if (nome.length < 3) {
        mostrarErro("O nome deve ter pelo menos 3 letras.");
        return;
    }
 
    // Email: formato válido
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
        mostrarErro("Digite um e-mail válido. Ex: nome@email.com");
        return;
    }
 
    // Telefone: mínimo 14 caracteres formatados → (XX) XXXXX-XXXX
    if (telefone.replace(/\D/g, "").length < 10) {
        mostrarErro("Digite um telefone válido com DDD. Ex: (27) 99999-9999");
        return;
    }
 
    // Mensagem: mínimo 20 caracteres
    if (mensagem.length < 20) {
        mostrarErro("A mensagem deve ter pelo menos 20 caracteres. (" + mensagem.length + "/20)");
        return;
    }
 
    // Tudo certo!
    msgFeedback.textContent = "Olá, " + nome + "! Sua mensagem foi enviada com sucesso!";
    msgFeedback.style.color = "green";
    formulario.reset();
});
 
// ─── LIMPAR ───
btnLimpar.addEventListener("click", function () {
    formulario.reset();
    msgFeedback.textContent = "";
});
 
// ─── Função auxiliar para exibir erro ───
function mostrarErro(msg) {
    msgFeedback.textContent = msg;
    msgFeedback.style.color = "red";
}


    