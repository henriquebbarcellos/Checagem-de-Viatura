const containerHistorico = document.getElementById('lista-historico');
let historico = JSON.parse(localStorage.getItem('cbmsc_historico_conferencias')) || [];

function renderizarHistorico() {
    containerHistorico.innerHTML = '';

    if (historico.length === 0) {
        containerHistorico.innerHTML = `
            <div class="card-form" style="text-align: center; padding: 30px;">
                <p style="color: var(--text-muted); margin: 0;">Nenhuma conferência registada ainda.</p>
            </div>
        `;
        return;
    }

    historico.forEach((reg, index) => {
        let itensHtml = '';
        if (reg.itens && reg.itens.length > 0) {
            reg.itens.forEach(i => {
                if (i.status === 'ALTERADO') {
                    itensHtml += '<div style="font-size: 0.8rem; color: #ff2a2a; margin-top: 4px;">• ' + i.nome + ': <strong>ALT</strong> (' + i.observacao + ')</div>';
                }
            });
        }

        if (itensHtml === '') {
            itensHtml = '<div style="font-size: 0.8rem; color: #10b981; margin-top: 4px;">• Todos os itens conferidos OK.</div>';
        }

        const statusCor = (reg.statusGeral && reg.statusGeral.includes('OK')) ? '#10b981' : '#ff2a2a';

        const cardHtml = `
            <div class="card-form" style="border-left: 4px solid ${statusCor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="tag-viatura">${reg.viatura || 'ASU-531'}</span>
                    <span class="tag-data-hora">${reg.dataHora || 'Hoje'}</span>
                </div>
                <h3 style="font-size: 1rem; color: var(--text-main); margin-bottom: 4px;">
                    Resp: <span style="color: var(--primary-red);">${reg.responsavel || 'Não identificado'}</span>
                </h3>
                <p style="font-size: 0.85rem; font-weight: 700; color: ${statusCor}; margin-bottom: 10px;">
                    Status: ${reg.statusGeral || 'Concluído'}
                </p>
                <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid var(--card-border); margin-bottom: 14px;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Detalhes das Alterações:</span>
                    ${itensHtml}
                </div>

                <!-- BOTÕES DE AÇÃO POR ITEM DO HISTÓRICO -->
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button type="button" onclick="gerarPDFIndex(${index})" style="flex: 1; padding: 8px 4px; font-size: 0.7rem; font-weight: 800; background: rgba(255,255,255,0.08); border: 1px solid var(--card-border); color: #fff; border-radius: 8px; cursor: pointer;">
                        📄 PDF
                    </button>
                    <button type="button" onclick="enviarWhatsAppIndex(${index})" style="flex: 1; padding: 8px 4px; font-size: 0.7rem; font-weight: 800; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #10b981; border-radius: 8px; cursor: pointer;">
                        🟢 Wpp
                    </button>
                    <button type="button" onclick="enviarEmailIndex(${index})" style="flex: 1; padding: 8px 4px; font-size: 0.7rem; font-weight: 800; background: rgba(255,255,255,0.08); border: 1px solid var(--card-border); color: #fff; border-radius: 8px; cursor: pointer;">
                        ✉️ E-mail
                    </button>
                    <button type="button" onclick="deletarRegistro(${index})" style="padding: 8px 10px; font-size: 0.7rem; font-weight: 800; background: rgba(255,42,42,0.15); border: 1px solid rgba(255,42,42,0.4); color: #ff2a2a; border-radius: 8px; cursor: pointer;" title="Excluir Registro">
                        🗑️
                    </button>
                </div>

                <!-- BOTÃO MODERNO E CHAMATIVO "ENVIAR RELATÓRIO" (GOOGLE DRIVE) -->
                <button type="button" onclick="enviarParaGoogleDrive(${index})" style="width: 100%; margin-top: 8px; padding: 10px; font-size: 0.8rem; font-weight: 800; background: linear-gradient(135deg, #b91c1c, #ef4444); border: none; color: #fff; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(185, 28, 28, 0.3);">
                    <span>📤 Enviar Relatório</span>
                </button>
            </div>
        `;
        containerHistorico.innerHTML += cardHtml;
    });
}

renderizarHistorico();

// FUNÇÃO DE ENVIO AUTOMÁTICO PARA O GOOGLE DRIVE COM MODAL DE CARREGAMENTO MODERNO
function enviarParaGoogleDrive(index) {
    const reg = historico[index];
    const urlAPI = "https://script.google.com/macros/s/AKfycbzlHYJKv81KXq3aVbk70sUxqp2b_65MAWBvt4flxk6OTnGR9eARM14bQk0HCwa-bRg/exec";

    mostrarModalCarregamento("A enviar relatório para o Google Drive...", "Aguarde, a organizar nas pastas do quartel...");

    fetch(urlAPI, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reg)
    })
    .then(() => {
        mostrarModalSucesso("Relatório enviado com sucesso!", "O PDF e as fotografias foram arquivados na pasta mensal.");
    })
    .catch((erro) => {
        console.error("Erro ao enviar:", erro);
        mostrarModalErro("Erro ao enviar relatório", "Ocorreu uma falha na comunicação com o servidor.");
    });
}

// ==========================================
// COMPONENTES VISUAIS DO MODAL DE CARREGAMENTO
// ==========================================
function criarModalCarregamentoSeNaoExistir() {
    if (document.getElementById('modal-loading-dinamico')) return;

    const modalHtml = `
        <div id="modal-loading-dinamico" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(5px); z-index: 10000; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: #181a20; border: 1px solid var(--card-border); padding: 32px; border-radius: 16px; width: 100%; max-width: 360px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
                <div id="loading-icone" style="margin-bottom: 16px;">
                    <div style="width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #ef4444; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
                <h3 id="loading-titulo" style="color: #fff; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">A processar...</h3>
                <p id="loading-texto" style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px; line-height: 1.4;"></p>
                <div id="loading-botao-container" style="display: none;">
                    <button type="button" onclick="fecharModalCarregamento()" style="background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; width: 100%; cursor: pointer;">OK</button>
                </div>
            </div>
        </div>
        <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function mostrarModalCarregamento(titulo, texto) {
    criarModalCarregamentoSeNaoExistir();
    document.getElementById('loading-titulo').innerText = titulo;
    document.getElementById('loading-texto').innerText = texto;
    document.getElementById('loading-icone').style.display = 'block';
    document.getElementById('loading-icone').innerHTML = '<div style="width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #ef4444; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>';
    document.getElementById('loading-botao-container').style.display = 'none';
    document.getElementById('modal-loading-dinamico').style.display = 'flex';
}

function mostrarModalSucesso(titulo, texto) {
    criarModalCarregamentoSeNaoExistir();
    document.getElementById('loading-titulo').innerText = titulo;
    document.getElementById('loading-texto').innerText = texto;
    document.getElementById('loading-icone').style.display = 'block';
    document.getElementById('loading-icone').innerHTML = '<div style="font-size: 2.5rem; margin-bottom: 4px;">✅</div>';
    document.getElementById('loading-botao-container').style.display = 'block';
}

function mostrarModalErro(titulo, texto) {
    criarModalCarregamentoSeNaoExistir();
    document.getElementById('loading-titulo').innerText = titulo;
    document.getElementById('loading-texto').innerText = texto;
    document.getElementById('loading-icone').style.display = 'block';
    document.getElementById('loading-icone').innerHTML = '<div style="font-size: 2.5rem; margin-bottom: 4px;">❌</div>';
    document.getElementById('loading-botao-container').style.display = 'block';
}

function fecharModalCarregamento() {
    const modal = document.getElementById('modal-loading-dinamico');
    if (modal) modal.style.display = 'none';
}

function gerarPDFIndex(index) {
    const reg = historico[index];
    let itensRows = '';
    let qtdAlterados = 0;
    let categoriaAtual = '';

    reg.itens.forEach(i => {
        const isOk = (i.status === 'OK');
        if (!isOk) qtdAlterados++;

        if (i.categoria && i.categoria !== categoriaAtual) {
            categoriaAtual = i.categoria;
            itensRows += '<tr style="background-color: #f1f3f5;"><td colspan="3" style="padding: 10px 8px; font-weight: bold; font-size: 12px; color: #b91c1c; border-bottom: 2px solid #b91c1c;">' + categoriaAtual + '</td></tr>';
        }

        let conteudoObs = i.observacao === '-' ? '<span style="color: #9ca3af;">-</span>' : i.observacao;
        if (i.foto) {
            conteudoObs += '<br><div style="margin-top: 8px;"><img src="' + i.foto + '" style="max-width: 320px; max-height: 240px; border-radius: 6px; border: 1px solid #9ca3af;" /></div>';
        }

        itensRows += '<tr>' +
            '<td style="padding: 10px 8px 10px 16px; border-bottom: 1px solid #e5e7eb; font-size: 12px; vertical-align: top;">' + i.nome + '</td>' +
            '<td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: bold; color: ' + (isOk ? '#10b981' : '#ff2a2a') + '; vertical-align: top;">' + i.status + '</td>' +
            '<td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #111827; vertical-align: top;">' + conteudoObs + '</td>' +
            '</tr>';
    });

    const janelaPrint = window.open('', '_blank');
    const htmlContent = '<!DOCTYPE html>' +
        '<html lang="pt-BR">' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<title>Relatório_' + reg.viatura + '_' + reg.responsavel + '</title>' +
        '<style>' +
        'body { font-family: Inter, Arial, sans-serif; color: #111827; margin: 0; padding: 20px; }' +
        '.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #b91c1c; padding-bottom: 10px; margin-bottom: 20px; }' +
        '.title { font-size: 14px; font-weight: bold; color: #b91c1c; }' +
        '.subtitle { font-size: 12px; color: #4b5563; }' +
        '.card { background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }' +
        'table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }' +
        'th { background: #b91c1c; color: white; text-align: left; padding: 8px; font-size: 12px; }' +
        '.assinaturas { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; font-size: 12px; color: #4b5563; }' +
        '.linha-assinatura { width: 220px; border-top: 1px solid #9ca3af; margin: 40px auto 5px auto; }' +
        '@media print { body { padding: 0; } button { display: none; } }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<div class="header">' +
        '<div><div class="title">CORPO DE BOMBEIROS MILITAR DE SANTA CATARINA</div><div class="subtitle">6º BBM - 2ª Companhia - Itá (SC)</div></div>' +
        '<div style="text-align: right; font-weight: bold; font-size: 14px;">CONFERÊNCIA DE VIATURA</div>' +
        '</div>' +
        '<div class="card">' +
        '<strong>DADOS DA CONFERÊNCIA:</strong><br>' +
        'Viatura: ' + reg.viatura + '<br>' +
        'Responsável: ' + reg.responsavel + '<br>' +
        'Data e Hora: ' + reg.dataHora + '<br>' +
        'Status Geral: <span style="color: ' + (qtdAlterados === 0 ? '#10b981' : '#ff2a2a') + '; font-weight: bold;">' + reg.statusGeral + '</span>' +
        '</div>' +
        '<strong style="font-size: 13px;">ITENS CONFERIDOS:</strong>' +
        '<table><thead><tr><th>ITEM</th><th>STATUS</th><th>OBSERVAÇÃO / REGISTO FOTOGRÁFICO</th></tr></thead><tbody>' +
        itensRows +
        '</tbody></table>' +
        '<div class="assinaturas">' +
        '<div><div class="linha-assinatura"></div>Assinatura do Responsável (' + reg.responsavel + ')</div>' +
        '<div><div class="linha-assinatura"></div>Chefe de Socorro / Plantão</div>' +
        '</div>' +
        '<script>window.onload = function() { window.print(); };<\/script>' +
        '</body></html>';

    janelaPrint.document.write(htmlContent);
    janelaPrint.document.close();
}

function enviarWhatsAppIndex(index) {
    const reg = historico[index];
    let relatorioWp = "*CONFERÊNCIA DE VIATURA - " + reg.viatura + "*\n";
    relatorioWp += "*Responsável:* " + reg.responsavel + "\n";
    relatorioWp += "*Data/Hora:* " + reg.dataHora + "\n";
    relatorioWp += "*Status:* " + reg.statusGeral + "\n";
    relatorioWp += "----------------------------------------\n";
    relatorioWp += "*DETALHAMENTO:*\n";

    reg.itens.forEach(i => {
        if (i.status === 'ALTERADO') {
            relatorioWp += "• " + i.nome + ": *ALT* (" + i.observacao + ")\n";
        }
    });

    if (reg.statusGeral.includes('100% OK')) {
        relatorioWp += "• Todos os itens conferidos OK.";
    }

    const mensagemEncoded = encodeURIComponent(relatorioWp);
    const numeroDestino = "5522997085774";
    
    window.open('https://api.whatsapp.com/send?phone=' + numeroDestino + '&text=' + mensagemEncoded, '_blank');
}

function enviarEmailIndex(index) {
    const reg = historico[index];
    let corpoEmail = "RELATÓRIO DE CONFERÊNCIA DE VIATURA - CBMSC ITÁ\n\n";
    corpoEmail += "Viatura: " + reg.viatura + "\n";
    corpoEmail += "Responsável: " + reg.responsavel + "\n";
    corpoEmail += "Data/Hora: " + reg.dataHora + "\n";
    corpoEmail += "Status Geral: " + reg.statusGeral + "\n\n";
    corpoEmail += "DETALHAMENTO DOS ITENS:\n";

    reg.itens.forEach(i => {
        corpoEmail += "- " + i.nome + ": " + i.status + " " + (i.observacao !== '-' ? '(' + i.observacao + ')' : '') + "\n";
    });

    const assunto = encodeURIComponent("Checklist " + reg.viatura + " - " + reg.responsavel + " - " + reg.dataHora);
    const corpo = encodeURIComponent(corpoEmail);

    window.location.href = "mailto:?subject=" + assunto + "&body=" + corpo;
}

// ==========================================
// SISTEMA DE MODAL PARA EXCLUSÃO E LIMPEZA
// ==========================================
let indiceParaExcluir = null;

function criarModalSeNaoExistir() {
    if (document.getElementById('modal-custom-dinamico')) return;

    const modalHtml = `
        <div id="modal-custom-dinamico" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(5px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: #181a20; border: 1px solid var(--card-border); padding: 28px; border-radius: 16px; width: 100%; max-width: 380px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
                <div style="font-size: 2.5rem; margin-bottom: 12px;">🗑️</div>
                <h3 id="modal-custom-titulo" style="color: #fff; font-size: 1.2rem; font-weight: 700; margin-bottom: 10px;">Confirmação</h3>
                <p id="modal-custom-texto" style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5;"></p>
                <div style="display: flex; gap: 10px;">
                    <button type="button" onclick="fecharModalCustom()" style="background: rgba(255,255,255,0.08); color: #fff; border: 1px solid var(--card-border); padding: 12px; border-radius: 10px; font-weight: 600; flex: 1; cursor: pointer;">Cancelar</button>
                    <button type="button" id="modal-custom-btn-sim" style="background: var(--primary-red); color: #fff; border: none; padding: 12px; border-radius: 10px; font-weight: 700; flex: 1; cursor: pointer;">Sim, apagar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function abrirModalCustom(titulo, texto, callbackSim) {
    criarModalSeNaoExistir();
    document.getElementById('modal-custom-titulo').innerText = titulo;
    document.getElementById('modal-custom-texto').innerText = texto;
    
    const btnSim = document.getElementById('modal-custom-btn-sim');
    const novoBtnSim = btnSim.cloneNode(true);
    btnSim.parentNode.replaceChild(novoBtnSim, btnSim);
    
    document.getElementById('modal-custom-btn-sim').onclick = function() {
        fecharModalCustom();
        callbackSim();
    };

    document.getElementById('modal-custom-dinamico').style.display = 'flex';
}

function fecharModalCustom() {
    const modal = document.getElementById('modal-custom-dinamico');
    if (modal) modal.style.display = 'none';
}

function deletarRegistro(index) {
    abrirModalCustom(
        'Excluir Registo',
        'Deseja realmente excluir este registo do histórico?',
        function() {
            historico.splice(index, 1);
            localStorage.setItem('cbmsc_historico_conferencias', JSON.stringify(historico));
            renderizarHistorico();
        }
    );
}

function limparTodoHistorico() {
    abrirModalCustom(
        'Limpar Histórico',
        'Deseja realmente apagar todo o histórico de conferências deste dispositivo?',
        function() {
            localStorage.removeItem('cbmsc_historico_conferencias');
            historico = [];
            renderizarHistorico();
        }
    );
}