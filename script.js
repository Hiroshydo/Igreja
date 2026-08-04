function switchTab(tabId) {
  if (typeof window.__appSwitchTab === 'function') {
    window.__appSwitchTab(tabId);
    return;
  }

  switchNavigationTab(tabId);
}

  function bindTouchFriendlyAction(element, callback) {
    if (!element) return;

    let suppressNextClick = false;

    element.addEventListener('touchstart', (event) => {
      suppressNextClick = true;
      event.preventDefault();
      event.stopPropagation();
      callback(event);
    }, { passive: false });

    element.addEventListener('click', (event) => {
      if (suppressNextClick) {
        suppressNextClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      callback(event);
    });
  }

  function initializeApp() {
    if (window.lucide) {
      window.lucide.createIcons();
    }

    function initializeDashboardCharts() {
      if (!window.Chart) return;

      dashboardCharts.forEach((chart) => chart?.destroy());
      dashboardCharts = [];

    const chartsConfig = [
      {
        id: 'growthChart',
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
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { grid: { color: 'rgba(148,163,184,0.12)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }
        }
      },
      {
        id: 'frequencyChart',
        type: 'doughnut',
        data: {
          labels: ['Culto', 'EBD', 'PG', 'Ação Social'],
          datasets: [{ data: [38, 24, 19, 19], backgroundColor: ['#f59e0b', '#38bdf8', '#8b5cf6', '#10b981'] }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 900, easing: 'easeOutQuart' },
          responsiveAnimationDuration: 320,
          plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', boxWidth: 10, padding: 14 } } },
          cutout: '68%'
        }
      },
      {
        id: 'socialChart',
        type: 'bar',
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          datasets: [{ label: 'Famílias assistidas', data: [22, 24, 27, 30, 33, 38], backgroundColor: ['#8b5cf6', '#8b5cf6', '#8b5cf6', '#8b5cf6', '#8b5cf6', '#8b5cf6'] }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { grid: { color: 'rgba(148,163,184,0.12)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }
        }
      }
    ];

    chartsConfig.forEach((config) => {
      const ctx = document.getElementById(config.id);
      if (ctx) {
        dashboardCharts.push(new window.Chart(ctx, {
          type: config.type,
          data: config.data,
          options: config.options
        }));
      }
    });
  }

  function resizeDashboardCharts() {
    window.requestAnimationFrame(() => {
      dashboardCharts.forEach((chart) => chart?.resize());
    });
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
  let adminAuthenticated = false;
  let dashboardCharts = [];
  let adminActiveModule = 'gallery';
  let adminEditing = { gallery: null, events: null, members: null, books: null };
  let adminFilters = { members: { query: '', ministry: 'Todos' } };
  let adminData = {
    gallery: [
      {
        id: 1,
        title: 'Batismo da juventude',
        date: '2026-05-18',
        category: 'Batismo',
        description: 'Momento especial de renovação e comunhão.',
        images: [
          {
            name: 'batismo.jpg',
            dataUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80'
          }
        ]
      }
    ],
    events: [
      {
        id: 1,
        title: 'Culto de jovens',
        date: '2026-08-07',
        time: '19:30',
        preacher: 'Pr. Eduardo',
        theme: 'Verdade que transforma',
        observations: 'Levar material de estudo.'
      }
    ],
    members: [
      {
        id: 1,
        fullName: 'Ana Maria Fernandes',
        phone: '(11) 99876-0001',
        email: 'ana@email.com',
        birthDate: '1991-04-12',
        address: 'Rua das Flores, 120',
        ministry: 'Louvor',
        status: 'Ativo'
      }
    ],
    books: [
      {
        id: 1,
        title: 'Estudo Bíblico para Jovens',
        author: 'Pr. Eduardo',
        category: 'Discipulado',
        status: 'Disponível',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'
      }
    ]
  };

  const adminDemoCredentials = {
    email: 'admin@igrejaviva.com',
    password: 'admin123'
  };

  function loadAdminData() {
    const savedData = localStorage.getItem('churchAdminData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        adminData = { ...adminData, ...parsed };
      } catch (error) {
        console.warn('Não foi possível carregar os dados administrativos.', error);
      }
    }
    const authSaved = localStorage.getItem('churchAdminAuth');
    adminAuthenticated = authSaved === 'true';

    const savedModule = localStorage.getItem('churchAdminModule');
    if (savedModule && ['gallery', 'events', 'members', 'books'].includes(savedModule)) {
      adminActiveModule = savedModule;
    }
  }

  function saveAdminData() {
    localStorage.setItem('churchAdminData', JSON.stringify(adminData));
    localStorage.setItem('churchAdminModule', adminActiveModule);
  }

  function buildGalleryPlaceholderImage(item) {
    const title = (item?.title || 'Galeria da Igreja').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const category = (item?.category || 'Momento especial').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const date = (item?.date || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const accent = category.includes('Batismo') ? '#f59e0b' : category.includes('Louvor') ? '#8b5cf6' : category.includes('Culto') ? '#38bdf8' : '#10b981';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
        <rect width="800" height="1000" fill="#020617" />
        <rect x="34" y="34" width="732" height="932" rx="42" fill="rgba(15, 23, 42, 0.96)" stroke="${accent}" stroke-width="4" />
        <circle cx="620" cy="200" r="150" fill="${accent}" opacity="0.2" />
        <path d="M220 720c60-140 180-220 330-220s270 80 330 220" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity="0.35" />
        <rect x="120" y="140" width="560" height="120" rx="24" fill="rgba(248, 250, 252, 0.08)" />
        <text x="400" y="210" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="700" fill="#f8fafc">${title}</text>
        <text x="400" y="300" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="600" fill="${accent}">${category}</text>
        <text x="400" y="860" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#cbd5e1">${date || 'Registro da igreja'}</text>
        <text x="400" y="910" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#94a3b8">Imagem indisponível - exibindo fallback local</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function resolveGalleryImageSource(item) {
    if (item?.image && typeof item.image === 'string' && item.image.trim()) {
      return item.image;
    }
    return buildGalleryPlaceholderImage(item);
  }

  function attachGalleryImageFallback(img, item) {
    if (!img) return;
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied === 'true') return;
      img.dataset.fallbackApplied = 'true';
      img.src = buildGalleryPlaceholderImage(item);
    }, { once: true });
  }

  function getPublicGalleryItems() {
    const baseGalleryItems = galleryItems.map((item) => ({ ...item }));
    const adminGalleryItems = (adminData.gallery || []).map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date,
      category: item.category,
      ratio: 'landscape',
      image: item.images?.[0]?.dataUrl || item.images?.[0]?.url || buildGalleryPlaceholderImage({ title: item.title, category: item.category, date: item.date }),
      description: item.description || 'Registro administrativo da igreja.'
    }));

    return [...baseGalleryItems, ...adminGalleryItems];
  }

  function renderAdminView() {
    const loginView = document.getElementById('adminLoginView');
    const dashboardView = document.getElementById('adminDashboardView');
    if (!loginView || !dashboardView) return;

    switchTab('admin-dashboard');

    if (!adminAuthenticated) {
      loginView.classList.remove('hidden');
      dashboardView.classList.add('hidden');
      return;
    }

    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    renderAdminModuleContent();
    updateAdminNav();
  }

  function updateAdminNav() {
    document.querySelectorAll('.admin-nav-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.adminModule === adminActiveModule);
    });
  }

  function bindAdminEvents() {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleAdminLogin);
    }

    document.querySelectorAll('.admin-nav-btn').forEach((button) => {
      button.addEventListener('click', () => {
        adminActiveModule = button.dataset.adminModule;
        localStorage.setItem('churchAdminModule', adminActiveModule);
        updateAdminNav();
        renderAdminModuleContent();
      });
    });

    const logoutBtns = [
      document.getElementById('adminLogoutSidebarBtn'),
      document.getElementById('adminLogoutTopBtn')
    ];
    logoutBtns.forEach((button) => {
      if (button) {
        button.addEventListener('click', handleAdminLogout);
      }
    });
  }

  function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (email === adminDemoCredentials.email && password === adminDemoCredentials.password) {
      adminAuthenticated = true;
      localStorage.setItem('churchAdminAuth', 'true');
      openNotificationToast('Login realizado com sucesso!');
      renderAdminView();
    } else {
      openNotificationToast('Erro ao entrar. Verifique e-mail e senha.');
    }
  }

  function handleAdminLogout() {
    adminAuthenticated = false;
    localStorage.removeItem('churchAdminAuth');
    adminActiveModule = 'gallery';
    localStorage.setItem('churchAdminModule', adminActiveModule);
    adminEditing = { gallery: null, events: null, members: null, books: null };
    renderAdminView();
    openNotificationToast('Sessão encerrada com sucesso.');
  }

  function renderAdminModuleContent() {
    const container = document.getElementById('adminModuleContent');
    if (!container) return;

    if (adminActiveModule === 'gallery') {
      renderGalleryAdminModule(container);
    } else if (adminActiveModule === 'events') {
      renderEventsAdminModule(container);
    } else if (adminActiveModule === 'members') {
      renderMembersAdminModule(container);
    } else if (adminActiveModule === 'books') {
      renderBooksAdminModule(container);
    }
  }

  function renderGalleryAdminModule(container) {
    const editingItem = adminEditing.gallery;
    const formHtml = `
      <div class="admin-card">
        <div class="admin-card__header">
          <div>
            <p class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Upload múltiplo</p>
            <h4 class="text-lg font-semibold text-slate-100">${editingItem ? 'Editar foto da galeria' : 'Adicionar nova foto'}</h4>
          </div>
          ${editingItem ? '<span class="admin-pill">Editando</span>' : ''}
        </div>
        <form id="galleryAdminForm" class="space-y-3">
          <div class="admin-grid">
            <label class="admin-field">
              <span>Título</span>
              <input id="galleryTitle" name="title" required value="${editingItem ? editingItem.title : ''}">
            </label>
            <label class="admin-field">
              <span>Data</span>
              <input id="galleryDate" name="date" type="date" required value="${editingItem ? editingItem.date : ''}">
            </label>
            <label class="admin-field">
              <span>Categoria</span>
              <select id="galleryCategory" name="category" required>
                ${['Batismo','Culto de Ensino','Louvorzão','Construção','Reuniões','Culto de Ação de Graças','Congressos','Santa Ceia','Eventos Especiais'].map((category) => `<option value="${category}" ${editingItem && editingItem.category === category ? 'selected' : ''}>${category}</option>`).join('')}
              </select>
            </label>
            <label class="admin-field">
              <span>Arquivos</span>
              <input id="galleryFiles" name="files" type="file" accept="image/*" multiple>
            </label>
          </div>
          <label class="admin-field">
            <span>Descrição</span>
            <textarea id="galleryDescription" name="description" required>${editingItem ? editingItem.description : ''}</textarea>
          </label>
          <div class="admin-actions">
            <button type="submit" class="admin-submit-btn">${editingItem ? 'Salvar alterações' : 'Salvar foto'}</button>
            <button type="button" id="galleryCancelEdit" class="admin-ghost-btn">Cancelar</button>
          </div>
        </form>
      </div>
      <div class="admin-card">
        <div class="admin-card__header">
          <div>
            <p class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Listagem</p>
            <h4 class="text-lg font-semibold text-slate-100">Fotos cadastradas</h4>
          </div>
        </div>
        <div class="admin-list-stack">
          ${adminData.gallery.length ? adminData.gallery.map((item) => `
            <div class="admin-list-item">
              <div class="flex items-center gap-3">
                <img class="admin-thumb" src="${resolveGalleryImageSource({ title: item.title, category: item.category, date: item.date, image: item.images?.[0]?.dataUrl || item.images?.[0]?.url })}" alt="${item.title}">
                <div class="admin-list-item__info">
                  <p class="admin-list-item__title">${item.title}</p>
                  <p class="admin-list-item__meta">${item.category} · ${item.date}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="admin-ghost-btn" data-edit-gallery="${item.id}">Editar</button>
                <button type="button" class="admin-ghost-btn" data-delete-gallery="${item.id}">Excluir</button>
              </div>
            </div>
          `).join('') : '<div class="admin-empty">Nenhuma foto cadastrada ainda.</div>'}
        </div>
      </div>
    `;
    container.innerHTML = formHtml;

    document.getElementById('galleryAdminForm').addEventListener('submit', handleGallerySubmit);
    document.getElementById('galleryCancelEdit').addEventListener('click', () => {
      adminEditing.gallery = null;
      renderAdminModuleContent();
    });

    container.querySelectorAll('[data-edit-gallery]').forEach((button) => {
      button.addEventListener('click', () => {
        adminEditing.gallery = adminData.gallery.find((item) => item.id === Number(button.dataset.editGallery));
        renderAdminModuleContent();
      });
    });

    container.querySelectorAll('[data-delete-gallery]').forEach((button) => {
      button.addEventListener('click', () => {
        adminData.gallery = adminData.gallery.filter((item) => item.id !== Number(button.dataset.deleteGallery));
        saveAdminData();
        renderAdminModuleContent();
        openNotificationToast('Foto removida com sucesso.');
      });
    });
  }

  function handleGallerySubmit(event) {
    event.preventDefault();
    const title = document.getElementById('galleryTitle').value.trim();
    const date = document.getElementById('galleryDate').value;
    const category = document.getElementById('galleryCategory').value;
    const description = document.getElementById('galleryDescription').value.trim();
    const files = Array.from(document.getElementById('galleryFiles').files || []);

    if (!title || !date || !category || !description) {
      openNotificationToast('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!adminEditing.gallery && !files.length) {
      openNotificationToast('Selecione pelo menos uma imagem para salvar.');
      return;
    }

    const isEditing = Boolean(adminEditing.gallery);
    const readFiles = files.length ? Promise.all(files.map((file) => readFileAsDataUrl(file))) : Promise.resolve([]);
    readFiles.then((images) => {
      if (adminEditing.gallery) {
        adminEditing.gallery.title = title;
        adminEditing.gallery.date = date;
        adminEditing.gallery.category = category;
        adminEditing.gallery.description = description;
        if (images.length) {
          adminEditing.gallery.images = images;
        }
      } else {
        const newItem = {
          id: Date.now(),
          title,
          date,
          category,
          description,
          images
        };
        adminData.gallery.unshift(newItem);
      }

      adminEditing.gallery = null;
      saveAdminData();
      renderAdminModuleContent();
      openNotificationToast(isEditing ? 'Alterações salvas com sucesso!' : 'Foto adicionada com sucesso!');
    });
  }

  function renderEventsAdminModule(container) {
    const editingItem = adminEditing.events;
    const formHtml = `
      <div class="admin-card">
        <div class="admin-card__header">
          <div>
            <p class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Agenda</p>
            <h4 class="text-lg font-semibold text-slate-100">${editingItem ? 'Editar culto ou evento' : 'Adicionar culto ou evento'}</h4>
          </div>
          ${editingItem ? '<span class="admin-pill">Editando</span>' : ''}
        </div>
        <form id="eventsAdminForm" class="space-y-3">
          <div class="admin-grid">
            <label class="admin-field"><span>Título</span><input id="eventTitle" required value="${editingItem ? editingItem.title : ''}"></label>
            <label class="admin-field"><span>Data</span><input id="eventDate" type="date" required value="${editingItem ? editingItem.date : ''}"></label>
            <label class="admin-field"><span>Horário</span><input id="eventTime" type="time" required value="${editingItem ? editingItem.time : ''}"></label>
            <label class="admin-field"><span>Preletor / Dirigente</span><input id="eventPreacher" value="${editingItem ? editingItem.preacher : ''}"></label>
          </div>
          <label class="admin-field"><span>Tema</span><input id="eventTheme" value="${editingItem ? editingItem.theme : ''}"></label>
          <label class="admin-field"><span>Observações</span><textarea id="eventObservations">${editingItem ? editingItem.observations : ''}</textarea></label>
          <div class="admin-actions">
            <button type="submit" class="admin-submit-btn">${editingItem ? 'Salvar alterações' : 'Salvar evento'}</button>
            <button type="button" id="eventsCancelEdit" class="admin-ghost-btn">Cancelar</button>
          </div>
        </form>
      </div>
      <div class="admin-card">
        <div class="admin-card__header">
          <div>
            <p class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Cronograma</p>
            <h4 class="text-lg font-semibold text-slate-100">Próximos encontros</h4>
          </div>
        </div>
        <div class="admin-list-stack">
          ${adminData.events.slice().sort((a, b) => a.date.localeCompare(b.date)).map((item) => `
            <div class="admin-list-item">
              <div class="admin-list-item__info">
                <p class="admin-list-item__title">${item.title}</p>
                <p class="admin-list-item__meta">${item.date} · ${item.time} · ${item.preacher || 'Sem dirigente'}</p>
                <p class="admin-list-item__meta">Tema: ${item.theme || 'Em definição'}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="admin-ghost-btn" data-edit-event="${item.id}">Editar</button>
                <button type="button" class="admin-ghost-btn" data-delete-event="${item.id}">Excluir</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    container.innerHTML = formHtml;

    document.getElementById('eventsAdminForm').addEventListener('submit', handleEventsSubmit);
    document.getElementById('eventsCancelEdit').addEventListener('click', () => {
      adminEditing.events = null;
      renderAdminModuleContent();
    });

    container.querySelectorAll('[data-edit-event]').forEach((button) => {
      button.addEventListener('click', () => {
        adminEditing.events = adminData.events.find((item) => item.id === Number(button.dataset.editEvent));
        renderAdminModuleContent();
      });
    });

    container.querySelectorAll('[data-delete-event]').forEach((button) => {
      button.addEventListener('click', () => {
        adminData.events = adminData.events.filter((item) => item.id !== Number(button.dataset.deleteEvent));
        saveAdminData();
        renderAdminModuleContent();
        openNotificationToast('Evento removido com sucesso.');
      });
    });
  }

  function handleEventsSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const preacher = document.getElementById('eventPreacher').value.trim();
    const theme = document.getElementById('eventTheme').value.trim();
    const observations = document.getElementById('eventObservations').value.trim();

    if (!title || !date || !time) {
      openNotificationToast('Título, data e horário são obrigatórios.');
      return;
    }

    if (adminEditing.events) {
      adminEditing.events.title = title;
      adminEditing.events.date = date;
      adminEditing.events.time = time;
      adminEditing.events.preacher = preacher;
      adminEditing.events.theme = theme;
      adminEditing.events.observations = observations;
    } else {
      adminData.events.unshift({ id: Date.now(), title, date, time, preacher, theme, observations });
    }

    adminEditing.events = null;
    saveAdminData();
    renderAdminModuleContent();
    openNotificationToast('Evento salvo com sucesso!');
  }

  function renderMembersAdminModule(container) {
    const editingItem = adminEditing.members;
    const formHtml = `
      <div class="admin-card">
        <div class="admin-card__header">
          <div>
            <p class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Cadastro</p>
            <h4 class="text-lg font-semibold text-slate-100">${editingItem ? 'Editar membro' : 'Adicionar membro'}</h4>
          </div>
          ${editingItem ? '<span class="admin-pill">Editando</span>' : ''}
        </div>
        <form id="membersAdminForm" class="space-y-3">
          <div class="admin-grid">
            <label class="admin-field"><span>Nome completo</span><input id="memberName" required value="${editingItem ? editingItem.fullName : ''}"></label>
            <label class="admin-field"><span>Telefone/WhatsApp</span><input id="memberPhone" value="${editingItem ? editingItem.phone : ''}"></label>
            <label class="admin-field"><span>E-mail</span><input id="memberEmail" type="email" value="${editingItem ? editingItem.email : ''}"></label>
            <label class="admin-field"><span>Data de nascimento</span><input id="memberBirthDate" type="date" value="${editingItem ? editingItem.birthDate : ''}"></label>
            <label class="admin-field"><span>Endereço</span><input id="memberAddress" value="${editingItem ? editingItem.address : ''}"></label>
            <label class="admin-field"><span>Ministério / Cargo</span><input id="memberMinistry" value="${editingItem ? editingItem.ministry : ''}"></label>
            <label class="admin-field"><span>Status</span><select id="memberStatus"><option value="Ativo" ${editingItem && editingItem.status === 'Ativo' ? 'selected' : ''}>Ativo</option><option value="Inativo" ${editingItem && editingItem.status === 'Inativo' ? 'selected' : ''}>Inativo</option></select></label>
          </div>
          <div class="admin-actions">
            <button type="submit" class="admin-submit-btn">${editingItem ? 'Salvar alterações' : 'Salvar membro'}</button>
            <button type="button" id="membersCancelEdit" class="admin-ghost-btn">Cancelar</button>
          </div>
        </form>
      </div>
      <div class="admin-card">
        <div class="admin-card__header">
          <div>
            <p class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Listagem</p>
            <h4 class="text-lg font-semibold text-slate-100">Membros cadastrados</h4>
          </div>
        </div>
        <div class="admin-grid mb-3">
          <label class="admin-field"><span>Buscar por nome</span><input id="memberSearchInput" placeholder="Digite o nome"></label>
          <label class="admin-field"><span>Filtrar por ministério</span><select id="memberMinistryFilter"><option value="Todos">Todos</option>${['Louvor','EBD','Diaconia','Intercessão','Ação Social','Liderança'].map((name) => `<option value="${name}">${name}</option>`).join('')}</select></label>
        </div>
        <div class="overflow-x-auto">
          <table class="admin-table">
            <thead>
              <tr><th>Nome</th><th>Telefone</th><th>Ministério</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody id="membersTableBody"></tbody>
          </table>
        </div>
      </div>
    `;
    container.innerHTML = formHtml;

    document.getElementById('membersAdminForm').addEventListener('submit', handleMembersSubmit);
    document.getElementById('membersCancelEdit').addEventListener('click', () => {
      adminEditing.members = null;
      renderAdminModuleContent();
    });

    const searchInput = document.getElementById('memberSearchInput');
    const filterSelect = document.getElementById('memberMinistryFilter');
    const renderRows = () => {
      const query = searchInput.value.trim().toLowerCase();
      const ministry = filterSelect.value;
      const filtered = adminData.members.filter((member) => {
        const matchesQuery = !query || member.fullName.toLowerCase().includes(query);
        const matchesMinistry = ministry === 'Todos' || member.ministry === ministry;
        return matchesQuery && matchesMinistry;
      });

      const rows = document.getElementById('membersTableBody');
      if (!rows) return;
      rows.innerHTML = filtered.length ? filtered.map((member) => `
        <tr>
          <td>${member.fullName}</td>
          <td>${member.phone}</td>
          <td>${member.ministry}</td>
          <td><span class="admin-badge">${member.status}</span></td>
          <td>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="admin-ghost-btn" data-edit-member="${member.id}">Editar</button>
              <button type="button" class="admin-ghost-btn" data-delete-member="${member.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `).join('') : '<tr><td colspan="5" class="admin-empty">Nenhum membro encontrado.</td></tr>';

      rows.querySelectorAll('[data-edit-member]').forEach((button) => {
        button.addEventListener('click', () => {
          adminEditing.members = adminData.members.find((item) => item.id === Number(button.dataset.editMember));
          renderAdminModuleContent();
        });
      });

      rows.querySelectorAll('[data-delete-member]').forEach((button) => {
        button.addEventListener('click', () => {
          adminData.members = adminData.members.filter((item) => item.id !== Number(button.dataset.deleteMember));
          saveAdminData();
          renderAdminModuleContent();
          openNotificationToast('Membro removido com sucesso.');
        });
      });
    };

    searchInput.addEventListener('input', renderRows);
    filterSelect.addEventListener('change', renderRows);
    renderRows();
  }

  function handleMembersSubmit(event) {
    event.preventDefault();
    const fullName = document.getElementById('memberName').value.trim();
    const phone = document.getElementById('memberPhone').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const birthDate = document.getElementById('memberBirthDate').value;
    const address = document.getElementById('memberAddress').value.trim();
    const ministry = document.getElementById('memberMinistry').value.trim();
    const status = document.getElementById('memberStatus').value;

    if (!fullName || !email) {
      openNotificationToast('Nome e e-mail são obrigatórios.');
      return;
    }

    if (adminEditing.members) {
      adminEditing.members.fullName = fullName;
      adminEditing.members.phone = phone;
      adminEditing.members.email = email;
      adminEditing.members.birthDate = birthDate;
      adminEditing.members.address = address;
      adminEditing.members.ministry = ministry;
      adminEditing.members.status = status;
    } else {
      adminData.members.unshift({ id: Date.now(), fullName, phone, email, birthDate, address, ministry, status });
    }

    adminEditing.members = null;
    saveAdminData();
    renderAdminModuleContent();
    openNotificationToast('Membro salvo com sucesso!');
  }

  function renderBooksAdminModule(container) {
    const editingItem = adminEditing.books;
    const formHtml = `
      <div class="admin-card">
        <div class="admin-card__header">
          <div>
            <p class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Biblioteca</p>
            <h4 class="text-lg font-semibold text-slate-100">${editingItem ? 'Editar livro' : 'Adicionar livro'}</h4>
          </div>
          ${editingItem ? '<span class="admin-pill">Editando</span>' : ''}
        </div>
        <form id="booksAdminForm" class="space-y-3">
          <div class="admin-grid">
            <label class="admin-field"><span>Título do livro</span><input id="bookTitle" required value="${editingItem ? editingItem.title : ''}"></label>
            <label class="admin-field"><span>Autor</span><input id="bookAuthor" required value="${editingItem ? editingItem.author : ''}"></label>
            <label class="admin-field"><span>Categoria</span><input id="bookCategory" value="${editingItem ? editingItem.category : ''}"></label>
            <label class="admin-field"><span>Status</span><select id="bookStatus"><option value="Disponível" ${editingItem && editingItem.status === 'Disponível' ? 'selected' : ''}>Disponível</option><option value="Emprestado" ${editingItem && editingItem.status === 'Emprestado' ? 'selected' : ''}>Emprestado</option></select></label>
          </div>
          <div class="admin-grid">
            <label class="admin-field"><span>URL da capa</span><input id="bookCoverUrl" value="${editingItem ? editingItem.cover : ''}"></label>
            <label class="admin-field"><span>Upload de capa</span><input id="bookCoverFile" type="file" accept="image/*"></label>
          </div>
          <div class="admin-actions">
            <button type="submit" class="admin-submit-btn">${editingItem ? 'Salvar alterações' : 'Salvar livro'}</button>
            <button type="button" id="booksCancelEdit" class="admin-ghost-btn">Cancelar</button>
          </div>
        </form>
      </div>
      <div class="admin-card">
        <div class="admin-card__header">
          <div>
            <p class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Acervo</p>
            <h4 class="text-lg font-semibold text-slate-100">Livros cadastrados</h4>
          </div>
        </div>
        <div class="admin-list-stack">
          ${adminData.books.length ? adminData.books.map((item) => `
            <div class="admin-list-item">
              <div class="flex items-center gap-3">
                <img class="admin-thumb" src="${item.cover || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=200&q=80'}" alt="${item.title}">
                <div class="admin-list-item__info">
                  <p class="admin-list-item__title">${item.title}</p>
                  <p class="admin-list-item__meta">${item.author} · ${item.category} · ${item.status}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="admin-ghost-btn" data-edit-book="${item.id}">Editar</button>
                <button type="button" class="admin-ghost-btn" data-delete-book="${item.id}">Excluir</button>
              </div>
            </div>
          `).join('') : '<div class="admin-empty">Nenhum livro cadastrado ainda.</div>'}
        </div>
      </div>
    `;
    container.innerHTML = formHtml;

    document.getElementById('booksAdminForm').addEventListener('submit', handleBooksSubmit);
    document.getElementById('booksCancelEdit').addEventListener('click', () => {
      adminEditing.books = null;
      renderAdminModuleContent();
    });

    container.querySelectorAll('[data-edit-book]').forEach((button) => {
      button.addEventListener('click', () => {
        adminEditing.books = adminData.books.find((item) => item.id === Number(button.dataset.editBook));
        renderAdminModuleContent();
      });
    });

    container.querySelectorAll('[data-delete-book]').forEach((button) => {
      button.addEventListener('click', () => {
        adminData.books = adminData.books.filter((item) => item.id !== Number(button.dataset.deleteBook));
        saveAdminData();
        renderAdminModuleContent();
        openNotificationToast('Livro removido com sucesso.');
      });
    });
  }

  function handleBooksSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const category = document.getElementById('bookCategory').value.trim();
    const status = document.getElementById('bookStatus').value;
    const coverUrl = document.getElementById('bookCoverUrl').value.trim();
    const coverFile = document.getElementById('bookCoverFile').files[0];

    if (!title || !author) {
      openNotificationToast('Título e autor são obrigatórios.');
      return;
    }

    const readCover = coverFile ? readFileAsDataUrl(coverFile) : Promise.resolve(coverUrl || '');
    readCover.then((cover) => {
      if (adminEditing.books) {
        adminEditing.books.title = title;
        adminEditing.books.author = author;
        adminEditing.books.category = category;
        adminEditing.books.status = status;
        if (cover) {
          adminEditing.books.cover = cover;
        }
      } else {
        adminData.books.unshift({ id: Date.now(), title, author, category, status, cover });
      }

      adminEditing.books = null;
      saveAdminData();
      renderAdminModuleContent();
      openNotificationToast('Livro salvo com sucesso!');
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, dataUrl: reader.result });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function applyTabSwitch(tabId) {
    if (typeof tabId !== 'string') return;
    switchNavigationTab(tabId);
    return;
  }

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

    const publicGalleryItems = getPublicGalleryItems();

    const filteredItems = activeGalleryFilter === 'Todos'
      ? publicGalleryItems
      : publicGalleryItems.filter((item) => item.category === activeGalleryFilter);

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
        const imageSource = resolveGalleryImageSource(item);
        card.innerHTML = `
          <div class="gallery-card__media">
            <img src="${imageSource}" alt="${item.title}" loading="lazy" decoding="async" />
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
        attachGalleryImageFallback(card.querySelector('img'), item);

        window.setTimeout(() => {
          card.classList.add('is-visible');
        }, index * 80);
      });

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 260);
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
    const publicGalleryItems = getPublicGalleryItems();
    const item = publicGalleryItems.find((entry) => entry.id === id);
    if (!item) return;

    currentGalleryCollection = activeGalleryFilter === 'Todos'
      ? publicGalleryItems
      : publicGalleryItems.filter((entry) => entry.category === activeGalleryFilter);

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
      image.src = resolveGalleryImageSource(item);
      image.alt = item.title;
      attachGalleryImageFallback(image, item);
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

  function filterSidebarNavigation(query) {
    const normalizedQuery = (query || '').trim().toLowerCase();
    const navButtons = Array.from(document.querySelectorAll('.tab-btn'));

    navButtons.forEach((button) => {
      const text = (button.textContent || '').toLowerCase();
      const matches = !normalizedQuery || text.includes(normalizedQuery);
      button.style.display = matches ? '' : 'none';
    });
  }

  function syncNavigationState(tabId) {
    const normalizedTabId = (tabId || '').replace(/^tab-/, '');
    const buttonId = `tab-btn-${normalizedTabId}`;
    const quickNavSelector = `.quick-nav-pill[data-quick-nav="${normalizedTabId}"]`;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-pressed', 'false');
      btn.className = 'tab-btn w-full justify-start px-3 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-slate-100 whitespace-nowrap';
    });

    const activeBtn = document.getElementById(buttonId) || document.querySelector(`[onclick*="switchTab('${tabId}')"]`);
    if (activeBtn) {
      activeBtn.classList.add('is-active');
      activeBtn.setAttribute('aria-pressed', 'true');
      activeBtn.className = 'tab-btn w-full justify-start px-3 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 whitespace-nowrap';
    }

    document.querySelectorAll('.quick-nav-pill').forEach((pill) => {
      pill.classList.toggle('is-active', pill.matches(quickNavSelector));
    });
  }

  function closeMobileNav() {
    const panel = document.getElementById('sidePanel');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (!panel || !backdrop) return;
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  }

  function toggleMobileNav(force) {
    const panel = document.getElementById('sidePanel');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (!panel || !backdrop) return;

    if (window.innerWidth >= 1024) {
      panel.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      return;
    }

    const shouldOpen = typeof force === 'boolean' ? force : !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', shouldOpen);
    backdrop.classList.toggle('is-open', shouldOpen);
    document.body.classList.toggle('nav-open', shouldOpen);
  }

  function switchNavigationTab(tabId) {
    if (!tabId || typeof tabId !== 'string') return;

    const normalizedTabId = tabId.replace(/^tab-/, '');
    const contentId = `tab-${normalizedTabId}`;
    const buttonId = `tab-btn-${normalizedTabId}`;

    document.querySelectorAll('.tab-content').forEach((el) => {
      el.classList.add('hidden');
      el.classList.remove('is-active');
      el.setAttribute('aria-hidden', 'true');
    });

    const content = document.getElementById(contentId) || document.getElementById(tabId);
    if (content) {
      content.classList.remove('hidden');
      content.classList.add('is-active');
      content.setAttribute('aria-hidden', 'false');
      window.requestAnimationFrame(() => {
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.scrollTo({ top: 0, behavior: window.innerWidth < 1024 ? 'auto' : 'smooth' });
        }
        resizeDashboardCharts();
      });
      window.setTimeout(() => {
        resizeDashboardCharts();
      }, 220);
    }

    syncNavigationState(normalizedTabId);

    if (window.innerWidth < 1024) {
      closeMobileNav();
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
    }, 2600);
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
    } else if (role === 'pastor') {
      switchTab('dashboard');
    } else {
      switchTab('admin-membros');
    }

    openNotificationToast(`Interface ajustada para: ${role.toUpperCase()}`);
  }

  function toggleTheme() {
    document.body.classList.toggle('theme-light');
    const icon = document.getElementById('themeToggleButton')?.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', document.body.classList.contains('theme-light') ? 'sun' : 'moon-star');
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  window.__appSwitchTab = switchNavigationTab;
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

  window.addEventListener('resize', () => {
    resizeDashboardCharts();
    if (window.innerWidth >= 1024) {
      closeMobileNav();
    }
  });

  window.addEventListener('orientationchange', () => {
    window.setTimeout(() => resizeDashboardCharts(), 180);
  });

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

  document.querySelectorAll('.quick-nav-pill').forEach((button) => {
    bindTouchFriendlyAction(button, () => {
      document.querySelectorAll('.quick-nav-pill').forEach((pill) => pill.classList.remove('is-active'));
      button.classList.add('is-active');
      switchTab(button.dataset.quickNav);
      closeMobileNav();
    });
  });

  document.querySelectorAll('.tab-btn').forEach((button) => {
    bindTouchFriendlyAction(button, () => {
      const target = button.dataset.tabTarget || button.id.replace('tab-btn-', '');
      switchTab(target);
    });
  });

  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenuOpenBtn = document.getElementById('mobileMenuOpenBtn');
  if (mobileMenuToggle) {
    bindTouchFriendlyAction(mobileMenuToggle, () => toggleMobileNav());
  }
  if (mobileMenuOpenBtn) {
    bindTouchFriendlyAction(mobileMenuOpenBtn, () => toggleMobileNav());
  }

  document.getElementById('mobileNavBackdrop')?.addEventListener('click', () => toggleMobileNav(false));

  const sidebarSearchInput = document.getElementById('sidebarSearchInput');
  if (sidebarSearchInput) {
    sidebarSearchInput.addEventListener('input', (event) => filterSidebarNavigation(event.target.value));
    sidebarSearchInput.addEventListener('focus', () => {
      if (window.innerWidth < 1024) {
        document.getElementById('sidePanel')?.classList.add('is-open');
        document.getElementById('mobileNavBackdrop')?.classList.add('is-open');
        document.body.classList.add('nav-open');
      }
    });
  }

  loadAdminData();
  bindAdminEvents();
  renderAdminView();
  initializeDashboardCharts();
  renderGalleryFilters();
  renderGalleryItems();
  renderMemberList();
  switchTab('dashboard');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

