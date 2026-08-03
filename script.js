document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  function initializeDashboardCharts() {
    if (!window.Chart) return;

    const growthCtx = document.getElementById('growthChart');
    if (growthCtx) {
      new window.Chart(growthCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          datasets: [{
            label: 'Membros',
            data: [1120, 1160, 1188, 1225, 1260, 1248],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.14)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { grid: { color: 'rgba(148,163,184,0.12)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }
        }
      });
    }

    const frequencyCtx = document.getElementById('frequencyChart');
    if (frequencyCtx) {
      new window.Chart(frequencyCtx, {
        type: 'doughnut',
        data: {
          labels: ['Culto', 'EBD', 'PG', 'Ação Social'],
          datasets: [{ data: [38, 24, 19, 19], backgroundColor: ['#f59e0b', '#38bdf8', '#8b5cf6', '#10b981'] }]
        },
        options: {
          plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1' } } },
          cutout: '68%'
        }
      });
    }

    const socialCtx = document.getElementById('socialChart');
    if (socialCtx) {
      new window.Chart(socialCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          datasets: [{ label: 'Famílias assistidas', data: [22, 24, 27, 30, 33, 38], backgroundColor: ['#8b5cf6', '#8b5cf6', '#8b5cf6', '#8b5cf6', '#8b5cf6', '#8b5cf6'] }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { grid: { color: 'rgba(148,163,184,0.12)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }
        }
      });
    }
  }

  const galleryCategories = ['Todos', 'Batismo', 'Reuniões', 'Louvorzão', 'Acompanhamento da Construção', 'Culto de Ensino', 'Culto de Ação de Graças', 'Congressos', 'Santa Ceia', 'Eventos Especiais'];

  const galleryItems = [
    {
      id: 1,
      title: 'Batismo de novos irmãos',
      date: '18 de maio de 2026',
      category: 'Batismo',
      ratio: 'portrait',
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80',
      description: 'Momento especial de fé, comunhão e renovação para a comunidade recém-batizada.'
    },
    {
      id: 2,
      title: 'Reunião de oração da semana',
      date: '09 de maio de 2026',
      category: 'Reuniões',
      ratio: 'landscape',
      image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
      description: 'Encontro de intercessão com reflexão bíblica, oração e acolhimento pastoral.'
    },
    {
      id: 3,
      title: 'Louvorzão com jovens e crianças',
      date: '04 de maio de 2026',
      category: 'Louvorzão',
      ratio: 'portrait',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
      description: 'Uma noite de adoração intensa, energia congregacional e presença do Espírito.'
    },
    {
      id: 4,
      title: 'Acompanhamento da construção',
      date: '27 de abril de 2026',
      category: 'Acompanhamento da Construção',
      ratio: 'landscape',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
      description: 'Equipe unida acompanhando cada etapa da construção do novo espaço da igreja.'
    },
    {
      id: 5,
      title: 'Culto de ensino bíblico',
      date: '20 de abril de 2026',
      category: 'Culto de Ensino',
      ratio: 'landscape',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
      description: 'Estudo aprofundado da Palavra com ensino claro, prático e edificante.'
    },
    {
      id: 6,
      title: 'Culto de ação de graças',
      date: '13 de abril de 2026',
      category: 'Culto de Ação de Graças',
      ratio: 'portrait',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
      description: 'Uma celebração acolhedora, repleta de gratidão, testemunhos e comunhão.'
    },
    {
      id: 7,
      title: 'Congressos de jovens',
      date: '06 de abril de 2026',
      category: 'Congressos',
      ratio: 'landscape',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
      description: 'Congresso com ensino, interação e um ambiente vibrante para a juventude.'
    },
    {
      id: 8,
      title: 'Santa Ceia especial',
      date: '30 de março de 2026',
      category: 'Santa Ceia',
      ratio: 'portrait',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80',
      description: 'Momento de reflexão, memória do Senhor e renovação espiritual da igreja.'
    },
    {
      id: 9,
      title: 'Evento especial de fim de ano',
      date: '22 de dezembro de 2025',
      category: 'Eventos Especiais',
      ratio: 'landscape',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
      description: 'Confraternização marcada por alegria, carinho e lembranças duradouras.'
    },
    {
      id: 10,
      title: 'Culto de louvor congregacional',
      date: '15 de março de 2026',
      category: 'Louvorzão',
      ratio: 'landscape',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80',
      description: 'Momento de adoração congregacional com presença, música e unção.'
    }
  ];

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
  let activeGalleryFilter = 'Todos';
  let selectedGalleryImageId = null;
  let currentGalleryCollection = [];
  let currentGalleryIndex = 0;
  let galleryZoomEnabled = false;

  function renderGalleryFilters() {
    const container = document.getElementById('galleryFilters');
    if (!container) return;

    container.innerHTML = '';
    galleryCategories.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `gallery-filter-pill ${activeGalleryFilter === category ? 'is-active' : ''}`;
      button.textContent = category;
      button.addEventListener('click', () => {
        activeGalleryFilter = category;
        renderGalleryFilters();
        renderGalleryItems();
      });
      container.appendChild(button);
    });
  }

  function renderGalleryItems() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;

    const filteredItems = activeGalleryFilter === 'Todos'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeGalleryFilter);

    currentGalleryCollection = filteredItems;
    currentGalleryIndex = 0;
    selectedGalleryImageId = filteredItems[0]?.id ?? null;
    galleryZoomEnabled = false;

    container.innerHTML = Array.from({ length: 6 }, (_, index) => `
      <div class="gallery-skeleton" style="animation-delay:${index * 70}ms"></div>
    `).join('');

    window.setTimeout(() => {
      container.innerHTML = '';

      if (!filteredItems.length) {
        container.innerHTML = `
          <div class="rounded-[1.4rem] border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
            Nenhuma foto foi encontrada para esta categoria ainda.
          </div>
        `;
        return;
      }

      filteredItems.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = `gallery-card gallery-card--${item.ratio}`;
        card.innerHTML = `
          <div class="gallery-card__media">
            <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async" />
            <div class="gallery-card__overlay">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="gallery-card__title">${item.title}</p>
                  <p class="mt-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">${item.date}</p>
                </div>
                <span class="gallery-card__icon"><i data-lucide="zoom-in"></i></span>
              </div>
              <div class="gallery-card__meta">
                <span class="gallery-card__badge">${item.category}</span>
                <span class="text-[11px] text-slate-400">Clique para abrir</span>
              </div>
            </div>
          </div>
        `;
        card.addEventListener('click', () => openGalleryLightbox(item.id));
        container.appendChild(card);

        window.setTimeout(() => {
          card.classList.add('is-visible');
        }, index * 80);
      });

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 650);
  }

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

  function openGalleryLightbox(id) {
    const item = galleryItems.find((entry) => entry.id === id);
    if (!item) return;

    currentGalleryCollection = activeGalleryFilter === 'Todos'
      ? galleryItems
      : galleryItems.filter((entry) => entry.category === activeGalleryFilter);

    currentGalleryIndex = currentGalleryCollection.findIndex((entry) => entry.id === id);
    if (currentGalleryIndex < 0) currentGalleryIndex = 0;

    selectedGalleryImageId = item.id;
    galleryZoomEnabled = false;
    renderGalleryLightbox();

    const modal = document.getElementById('galleryLightbox');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  }

  function renderGalleryLightbox() {
    const modal = document.getElementById('galleryLightbox');
    if (!modal) return;

    const item = currentGalleryCollection[currentGalleryIndex];
    if (!item) return;

    const image = document.getElementById('galleryLightboxImage');
    const title = document.getElementById('galleryLightboxTitle');
    const date = document.getElementById('galleryLightboxDate');
    const badge = document.getElementById('galleryLightboxBadge');
    const description = document.getElementById('galleryLightboxDescription');
    const counter = document.getElementById('galleryLightboxCounter');
    const zoomButton = document.getElementById('galleryZoomButton');
    const media = document.getElementById('galleryLightboxMedia');

    if (image) {
      image.src = item.image;
      image.alt = item.title;
    }

    if (title) title.textContent = item.title;
    if (date) date.textContent = item.date;
    if (badge) badge.textContent = item.category;
    if (description) description.textContent = item.description;
    if (counter) counter.textContent = `Foto ${currentGalleryIndex + 1} de ${currentGalleryCollection.length}`;
    if (zoomButton) zoomButton.innerHTML = `<i data-lucide="${galleryZoomEnabled ? 'minimize-2' : 'maximize-2'}" class="h-4 w-4"></i> ${galleryZoomEnabled ? 'Diminuir zoom' : 'Zoom'}`;
    if (media) {
      media.classList.toggle('is-zoomed', galleryZoomEnabled);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function closeGalleryLightbox() {
    const modal = document.getElementById('galleryLightbox');
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  function changeGalleryImage(direction) {
    if (!currentGalleryCollection.length) return;
    currentGalleryIndex = (currentGalleryIndex + direction + currentGalleryCollection.length) % currentGalleryCollection.length;
    renderGalleryLightbox();
  }

  function toggleGalleryZoom() {
    galleryZoomEnabled = !galleryZoomEnabled;
    renderGalleryLightbox();
  }

  function downloadCurrentGalleryImage() {
    const item = currentGalleryCollection[currentGalleryIndex];
    if (!item) return;

    const link = document.createElement('a');
    link.href = item.image;
    link.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`;
    link.target = '_blank';
    link.click();
    openNotificationToast(`Download iniciado para ${item.title}.`);
  }

  function shareCurrentGalleryImage() {
    const item = currentGalleryCollection[currentGalleryIndex];
    if (!item) return;

    const shareData = {
      title: item.title,
      text: `Confira ${item.title} — ${item.description}`,
      url: item.image
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(item.image);
        }
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(item.image).then(() => {
        openNotificationToast('Link da imagem copiado para a área de transferência.');
      });
    } else {
      openNotificationToast('Compartilhamento indisponível neste navegador.');
    }
  }

  function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach((el) => el.classList.add('hidden'));
    const content = document.getElementById(`tab-${tabId}`);
    if (content) {
      content.classList.remove('hidden');
    }

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.className = 'tab-btn w-full justify-start px-3 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-slate-100 whitespace-nowrap';
    });

    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeBtn) {
      activeBtn.className = 'tab-btn w-full justify-start px-3 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 whitespace-nowrap';
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

  function toggleTheme() {
    document.body.classList.toggle('theme-light');
    const icon = document.querySelector('[onclick="toggleTheme()"] i');
    if (icon) {
      icon.setAttribute('data-lucide', document.body.classList.contains('theme-light') ? 'sun' : 'moon-star');
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  window.switchTab = switchTab;
  window.openNotificationToast = openNotificationToast;
  window.openCertificateModal = openCertificateModal;
  window.closeCertificateModal = closeCertificateModal;
  window.confirmCertificateIssue = confirmCertificateIssue;
  window.openTheologianDetail = openTheologianDetail;
  window.changeRoleView = changeRoleView;
  window.toggleTheme = toggleTheme;
  window.openGalleryLightbox = openGalleryLightbox;
  window.closeGalleryLightbox = closeGalleryLightbox;
  window.changeGalleryImage = changeGalleryImage;
  window.toggleGalleryZoom = toggleGalleryZoom;
  window.downloadCurrentGalleryImage = downloadCurrentGalleryImage;
  window.shareCurrentGalleryImage = shareCurrentGalleryImage;

  document.addEventListener('keydown', (event) => {
    const modal = document.getElementById('galleryLightbox');
    if (!modal || modal.classList.contains('hidden')) return;

    if (event.key === 'Escape') {
      closeGalleryLightbox();
    } else if (event.key === 'ArrowRight') {
      changeGalleryImage(1);
    } else if (event.key === 'ArrowLeft') {
      changeGalleryImage(-1);
    }
  });

  document.querySelectorAll('[data-close-gallery-lightbox]').forEach((element) => {
    element.addEventListener('click', closeGalleryLightbox);
  });

  initializeDashboardCharts();
  renderGalleryFilters();
  renderGalleryItems();
  renderMemberList();
  switchTab('dashboard');
});
