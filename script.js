document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.querySelector('#landing-page');
    const mainContent = document.querySelector('#main-content');
    const enterBtn = document.querySelector('#enter-btn');
    const showcaseContainer = document.querySelector('#showcase-container');
    const searchInput = document.querySelector('#search-input');
    const filterContainer = document.querySelector('#filter-container');
    let allStandData = [];
    let filteredData = [];

    // ===== MUSIC PLAYER =====
    const audio = document.getElementById('audio-element');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressFill = document.getElementById('progress-fill');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationTimeDisplay = document.getElementById('duration-time');
    const playIcon = playPauseBtn?.querySelector('.play-icon');
    const pauseIcon = playPauseBtn?.querySelector('.pause-icon');
    const volumeIcon = volumeBtn?.querySelector('.volume-icon');

    // Configurar volume inicial
    if (audio) {
        audio.volume = 0.5;

        // Play/Pause
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
            } else {
                audio.pause();
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
            }
        });

        // Controle de volume
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            audio.volume = volume;
            updateVolumeIcon(volume);
        });

        volumeBtn.addEventListener('click', () => {
            if (audio.volume > 0) {
                audio.volume = 0;
                volumeSlider.value = 0;
            } else {
                audio.volume = 0.5;
                volumeSlider.value = 50;
            }
            updateVolumeIcon(audio.volume);
        });

        function updateVolumeIcon(volume) {
            if (volume === 0) {
                volumeIcon.textContent = '🔇';
            } else if (volume < 0.5) {
                volumeIcon.textContent = '🔉';
            } else {
                volumeIcon.textContent = '🔊';
            }
        }

        // Atualizar barra de progresso
        audio.addEventListener('timeupdate', () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = `${progress}%`;
            currentTimeDisplay.textContent = formatTime(audio.currentTime);
        });

        audio.addEventListener('loadedmetadata', () => {
            durationTimeDisplay.textContent = formatTime(audio.duration);
        });

        function formatTime(seconds) {
            if (isNaN(seconds)) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // ===== BOTÃO DE ENTRADA =====
    enterBtn.addEventListener('click', () => {
        landingPage.style.opacity = '0';
        setTimeout(() => {
            landingPage.classList.add('hidden');
            mainContent.classList.remove('hidden');
            setTimeout(() => {
                mainContent.style.opacity = '1';
                // Tocar música ao entrar
                if (audio) {
                    audio.play().catch(err => console.log('Autoplay bloqueado:', err));
                    playIcon.classList.add('hidden');
                    pauseIcon.classList.remove('hidden');
                }
            }, 50);
        }, 500);
    });

    // ===== FILTROS E SISTEMA DE STANDS =====
    const rankMap = {
        "A": "A", "B": "B", "C": "C", "D": "D", "E": "E",
        "Infinito": "Infinito", "Nenhum": "Nenhum", "Nula": "Nula"
    };

    function createFilterButtons(data) {
        const parts = ['Todas', ...new Set(data.map(item => item.temporada).sort())];
        filterContainer.innerHTML = parts.map(part => 
            `<button class="filter-btn" data-part="${part}">${part}</button>`
        ).join('');

        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterAndDisplay();
            });
        });
        filterButtons[0].classList.add('active');
    }

    function filterAndDisplay() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.part;

        filteredData = allStandData.filter(stand => {
            const matchesSearch = 
                stand.nome.toLowerCase().includes(searchTerm) ||
                stand.criador.toLowerCase().includes(searchTerm) ||
                stand.descricao.toLowerCase().includes(searchTerm);

            const matchesFilter = 
                activeFilter === 'Todas' || stand.temporada === activeFilter;

            return matchesSearch && matchesFilter;
        });

        renderShowcase(filteredData);
    }

    function renderShowcase(dataToRender) {
        showcaseContainer.innerHTML = '';

        if (dataToRender.length === 0) {
            showcaseContainer.innerHTML = '<p class="no-results">「 NENHUM STAND ENCONTRADO 」</p>';
            return;
        }

        dataToRender.forEach((stand) => {
            const section = document.createElement('section');
            section.classList.add('stand-section');

            const statsHTML = Object.entries(stand.status).map(([stat, value]) => {
                const rankClass = rankMap[value] || 'Nenhum';
                return `
                    <div class="stat">
                        <div class="stat-name">
                            <span>${stat}</span>
                            <span>${value}</span>
                        </div>
                        <div class="stat-bar">
                            <div class="stat-value width-${rankClass}"></div>
                        </div>
                    </div>
                `;
            }).join('');

            const abilitiesHTML = stand.habilidades
                .map(hab => `<li>${hab}</li>`)
                .join('');

            section.innerHTML = `
                <img src="${stand.imagem_stand}" alt="${stand.nome}" class="stand-background">
                <div class="stand-content">
                    <div class="user-container">
                        <div class="images-wrapper">
                            <img src="${stand.imagem_stand}" alt="${stand.nome}" class="stand-image" onerror="this.style.display='none'">
                            <img src="${stand.imagem_usuario}" alt="${stand.criador}" class="user-image" onerror="this.style.display='none'">
                        </div>
                        <h3 class="user-name">${stand.criador}</h3>
                        <div class="info-badges">
                            ${stand.curiosidades ? `
                                <div class="info-badge">
                                    <strong>💡 Curiosidade</strong>
                                    ${stand.curiosidades}
                                </div>
                            ` : ''}
                            ${stand.primeira_aparicao ? `
                                <div class="info-badge">
                                    <strong>📺 Primeira Aparição</strong>
                                    ${stand.primeira_aparicao}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="stand-details">
                        <h2 class="stand-title">${stand.nome}</h2>
                        <div class="stand-tags">
                            <span class="tag">⭐ ${stand.temporada}</span>
                            <span class="tag">🎯 ${stand.tipo}</span>
                            <span class="tag">📖 ${stand.aparicao}</span>
                        </div>
                        <blockquote class="stand-quote">"${stand.frase}"</blockquote>
                        <div class="stand-description">
                            <p>${stand.descricao}</p>
                        </div>
                        <div class="abilities-section">
                            <h4>⚡ Habilidades Notáveis</h4>
                            <ul class="abilities-list">
                                ${abilitiesHTML}
                            </ul>
                        </div>
                        <div class="stats-grid">
                            ${statsHTML}
                        </div>
                    </div>
                </div>
            `;

            showcaseContainer.appendChild(section);
        });

        setupScrollAnimations();
    }

    function setupScrollAnimations() {
        const sections = document.querySelectorAll('.stand-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.2
        });

        sections.forEach(section => observer.observe(section));
    }

    async function initializeApp() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            allStandData = await response.json();
            
            searchInput.value = '';
            createFilterButtons(allStandData);
            renderShowcase(allStandData);

            searchInput.addEventListener('input', filterAndDisplay);

        } catch (error) {
            console.error('Erro ao carregar data.json:', error);
            showcaseContainer.innerHTML = '<p class="no-results">「 ERRO AO CARREGAR DADOS 」</p>';
        }
    }

    initializeApp();
});