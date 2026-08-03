document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const memberDatabase = [
    {
      id: 1,
      nome: 'Ana Maria Fernandes',
      status: 'Membro Ativo',
      diasSemVisita: 8,
      linhaDoTempo: [
        { data: '15/03/2021', evento: 'Visitou a igreja pela primeira vez' },
        { data: '10/06/2021', evento: 'Concluiu a Classe de Batismo' },
        { data: '24/10/2021', evento: 'Batizada nas Águas pelo Pr. Eduardo' },
        { data: '12/02/2023', evento: 'Casamento Eclesiástico realizado' },
        { data: '05/01/2024', evento: 'Entrou para o Ministério de Ação Social' }
      ]
    },
    {
      id: 2,
      nome: 'Ricardo Alves',
      status: 'Membro em Alerta',
      diasSemVisita: 45,
      linhaDoTempo: [
        { data: '10/01/2020', evento: 'Recebido por Carta de Transferência' },
        { data: '05/08/2022', evento: 'Entrou no Ministério de Louvor (Violão)' },
        { data: '20/05/2024', evento: 'Afastamento temporário das escalas' }
      ]
    }
  ];

  let selectedMember = memberDatabase[0];

  function renderMemberList() {
    const container = document.getElementById('memberListContainer');
    if (!container) return;

    container.innerHTML = '';

    memberDatabase.forEach((member) => {
      const card = document.createElement('div');
      card.className = `glass-card p-3 rounded-xl border cursor-pointer transition-all ${member.id === selectedMember.id ? 'border-amber-500 bg-amber-950/20' : 'border-slate-800'}`;
      card.onclick = () => selectMember(member.id);
      card.innerHTML = `
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-slate-100">${member.nome}</span>
          <span class="text-[10px] px-2 py-0.5 rounded ${member.diasSemVisita > 30 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'} font-semibold">${member.status}</span>
        </div>
        <span class="text-[11px] text-slate-400 block mt-1">Visita há ${member.diasSemVisita} dias</span>
      `;
      container.appendChild(card);
    });

    renderMemberTimeline();
  }

  function selectMember(id) {
    selectedMember = memberDatabase.find((member) => member.id === id) || memberDatabase[0];
    renderMemberList();
  }

  function renderMemberTimeline() {
    const panel = document.getElementById('memberDetailPanel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h3 class="font-extrabold text-base text-slate-100">${selectedMember.nome}</h3>
          <span class="text-xs text-amber-400 font-semibold">${selectedMember.status}</span>
        </div>
        <button type="button" onclick="openCertificateModal()" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
          Emitir Documento
        </button>
      </div>

      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <i data-lucide="git-commit" class="w-4 h-4 text-indigo-400"></i> Linha do Tempo Espiritual
        </h4>

        <div class="space-y-2 border-l-2 border-indigo-500/30 pl-3">
          ${selectedMember.linhaDoTempo.map((item) => `
            <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
              <span class="text-[10px] text-indigo-400 font-mono block font-bold">${item.data}</span>
              <span class="text-slate-200 font-medium">${item.evento}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach((el) => el.classList.add('hidden'));
    const content = document.getElementById(`tab-${tabId}`);
    if (content) {
      content.classList.remove('hidden');
    }

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.className = 'tab-btn px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750 whitespace-nowrap';
    });

    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeBtn) {
      activeBtn.className = 'tab-btn px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 whitespace-nowrap';
    }
  }

  function openNotificationToast(text) {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMsg');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = text;
    toast.classList.remove('translate-y-20', 'opacity-0');

    clearTimeout(openNotificationToast.timeoutId);
    openNotificationToast.timeoutId = setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3500);
  }

  function openCertificateModal() {
    const modal = document.getElementById('certificateModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeCertificateModal() {
    const modal = document.getElementById('certificateModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  function confirmCertificateIssue() {
    const certTypeSelect = document.getElementById('certTypeSelect');
    const certMemberName = document.getElementById('certMemberName');

    if (!certTypeSelect || !certMemberName) return;

    const type = certTypeSelect.value;
    const name = certMemberName.value;

    closeCertificateModal();
    openNotificationToast(`${type} gerado em PDF com sucesso para ${name}!`);
  }

  function openTheologianDetail(name) {
    openNotificationToast(`Carregando perfil completo, obras e citações de ${name}...`);
  }

  function changeRoleView() {
    const roleSelect = document.getElementById('userRoleSelect');
    if (!roleSelect) return;

    const role = roleSelect.value;

    if (role === 'louvor') {
      switchTab('ministerios-musica');
    } else if (role === 'ebd') {
      switchTab('ebd-ensino');
    } else if (role === 'membro') {
      switchTab('biblioteca-historia');
    } else {
      switchTab('admin-membros');
    }

    openNotificationToast(`Interface ajustada para: ${role.toUpperCase()}`);
  }

  window.switchTab = switchTab;
  window.openNotificationToast = openNotificationToast;
  window.openCertificateModal = openCertificateModal;
  window.closeCertificateModal = closeCertificateModal;
  window.confirmCertificateIssue = confirmCertificateIssue;
  window.openTheologianDetail = openTheologianDetail;
  window.changeRoleView = changeRoleView;

  renderMemberList();
  switchTab('admin-membros');
});
