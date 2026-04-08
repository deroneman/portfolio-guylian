// ===== STAT MANAGEMENT SYSTEM =====
let playerStats = {
    health: 100,
    maxHealth: 100,
    mana: 100,
    maxMana: 100
};

let manaRegenTimeout = null;

function updateHealthDisplay() {
    const healthFill = document.getElementById('health-fill');
    const healthText = document.getElementById('health-text');
    const healthPercent = (playerStats.health / playerStats.maxHealth) * 100;
    
    healthFill.style.width = healthPercent + '%';
    healthText.textContent = playerStats.health + '/' + playerStats.maxHealth;
    
    // Change color based on health
    if (healthPercent > 66) {
        healthFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
    } else if (healthPercent > 33) {
        healthFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    } else {
        healthFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    }
    
    // Check if dead
    if (playerStats.health <= 0) {
        playerStats.health = 0;
        healthFill.style.width = '0%';
        healthText.textContent = '0/' + playerStats.maxHealth;
        triggerGameOver();
    }
}

function updateManaDisplay() {
    const manaFill = document.getElementById('mana-fill');
    const manaText = document.getElementById('mana-text');
    const manaPercent = (playerStats.mana / playerStats.maxMana) * 100;
    
    manaFill.style.width = manaPercent + '%';
    manaText.textContent = playerStats.mana + '/' + playerStats.maxMana;
    
    // Change color based on mana
    if (manaPercent > 50) {
        manaFill.style.background = 'linear-gradient(90deg, #8b5cf6, #a78bfa)';
    } else if (manaPercent > 25) {
        manaFill.style.background = 'linear-gradient(90deg, #06b6d4, #22d3ee)';
    } else {
        manaFill.style.background = 'linear-gradient(90deg, #6b7280, #9ca3af)';
    }
}

function damageHealth(amount) {
    playerStats.health -= amount;
    if (playerStats.health < 0) playerStats.health = 0;
    updateHealthDisplay();
}

function useMana(amount = 10) {
    if (!canUseMana(amount)) {
        showManaWarning();
        return false;
    }
    
    playerStats.mana -= amount;
    if (playerStats.mana < 0) playerStats.mana = 0;
    updateManaDisplay();
    
    // Clear existing regen timeout
    if (manaRegenTimeout) clearTimeout(manaRegenTimeout);
    
    // Start mana regeneration after 15 seconds
    manaRegenTimeout = setTimeout(() => {
        regenerateMana();
    }, 15000);
    
    return true;
}

function canUseMana(amount = 10) {
    return playerStats.mana >= amount;
}

function showManaWarning() {
    const hubStats = document.querySelector('.hub-stats');
    hubStats.style.animation = 'none';
    setTimeout(() => {
        hubStats.style.animation = 'manaWarning 0.6s ease-in-out';
    }, 10);
}

function regenerateMana() {
    const regenAmount = 20;
    playerStats.mana = Math.min(playerStats.mana + regenAmount, playerStats.maxMana);
    updateManaDisplay();
    
    // Continue regenerating if not at max
    if (playerStats.mana < playerStats.maxMana) {
        manaRegenTimeout = setTimeout(() => {
            regenerateMana();
        }, 15000);
    }
}

function triggerGameOver() {
    // Disable all interactions
    document.querySelectorAll('.menu-btn, .panel-close, #contactForm, .captcha-input').forEach(el => {
        el.disabled = true;
        el.style.opacity = '0.5';
        el.style.pointerEvents = 'none';
    });
    
    // Show game over message and redirect
    const gameOverMsg = document.createElement('div');
    gameOverMsg.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        flex-direction: column;
        gap: 20px;
    `;
    
    gameOverMsg.innerHTML = `
        <div style="
            text-align: center;
            color: #ef4444;
            font-family: 'Orbitron', sans-serif;
            font-size: 48px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 3px;
            animation: glitchFlicker 1s ease-in-out;
        ">⚰️ GAME OVER ⚰️</div>
        <div style="
            color: #e5e7eb;
            font-family: 'Rajdhani', monospace;
            font-size: 18px;
            letter-spacing: 2px;
        ">VOUS AVEZ ÉCHOUÉ TROP DE FOIS...</div>
        <div style="
            color: #9ca3af;
            font-size: 14px;
            margin-top: 20px;
        ">Redirection en cours...</div>
    `;
    
    document.body.appendChild(gameOverMsg);
    
    // Redirect after 3 seconds
    setTimeout(() => {
        window.location.href = window.location.href.split('?')[0];
    }, 3000);
}

// ===== POTION SYSTEM =====
let healthPotionCooldown = false;
let manaPotionCooldown = false;
const HEALTH_POTION_AMOUNT = 30;
const MANA_POTION_AMOUNT = 40;
const HEALTH_POTION_COOLDOWN = 15000; // 15 seconds between life potion uses
const MANA_POTION_COOLDOWN = 10000; // 10 seconds between mana potion uses

function useHealthPotion() {
    if (healthPotionCooldown) {
        showPotionMessage('Potion de vie en cooldown...', 'cooldown');
        return;
    }
    
    playerStats.health = Math.min(playerStats.health + HEALTH_POTION_AMOUNT, playerStats.maxHealth);
    updateHealthDisplay();
    showPotionMessage(`+${HEALTH_POTION_AMOUNT} SANTÉ ⬆️`, 'health');
    startHealthPotionCooldown();
}

function useManaPotion() {
    if (manaPotionCooldown) {
        showPotionMessage('Potion de mana en cooldown...', 'cooldown');
        return;
    }
    
    playerStats.mana = Math.min(playerStats.mana + MANA_POTION_AMOUNT, playerStats.maxMana);
    updateManaDisplay();
    showPotionMessage(`+${MANA_POTION_AMOUNT} MANA ⬆️`, 'mana');
    startManaPotionCooldown();
}

function startHealthPotionCooldown() {
    healthPotionCooldown = true;
    setTimeout(() => {
        healthPotionCooldown = false;
    }, HEALTH_POTION_COOLDOWN);
}

function startManaPotionCooldown() {
    manaPotionCooldown = true;
    setTimeout(() => {
        manaPotionCooldown = false;
    }, MANA_POTION_COOLDOWN);
}

function showPotionMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'health' ? 'rgba(16, 185, 129, 0.9)' : type === 'mana' ? 'rgba(139, 92, 246, 0.9)' : 'rgba(100, 100, 100, 0.9)'};
        border: 2px solid ${type === 'health' ? '#10b981' : type === 'mana' ? '#8b5cf6' : '#6b7280'};
        color: #e5e7eb;
        font-family: 'Rajdhani', monospace;
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 1px;
        border-radius: 6px;
        z-index: 5000;
        animation: potionPop 2s ease-out forwards;
    `;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 2000);
}

// ===== SOLO LEVELING INTERFACE LOGIC =====

// Charger et afficher les articles de veille technologique depuis JSON
let veilleData = null;

// Fonction pour nettoyer le HTML
function stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

async function loadVeilleArticles() {
    try {
        const response = await fetch('veille-articles.json');
        veilleData = await response.json();
        
        // Afficher les articles
        displayVeilleArticles();
    } catch (error) {
        console.error('Failed to load veille articles');
    }
}

// État de pagination pour la veille
let veillePaginationState = {};

function parseRSSDate(dateStr) {
    const time = new Date(dateStr).getTime();
    return isNaN(time) ? 0 : time;
}

function displayVeilleArticles() {
    if (!veilleData) return;
    
    // Créer un map catégorie -> icône pour accès rapide
    const categoryIcons = {};
    for (const [catKey, catData] of Object.entries(veilleData.articles)) {
        if (catKey !== 'recents') {
            categoryIcons[catData.articles?.[0]?.category] = catData.icon || '📌';
        }
    }
    
    // Afficher les articles par catégorie/tab
    for (const [tabId, categoryData] of Object.entries(veilleData.articles)) {
        const tabContent = document.getElementById(`${tabId}-tab`);
        
        if (tabContent) {
            let articlesToDisplay = [];
            
            // Pour "recents", combiner et trier tous les articles de toutes les catégories
            if (tabId === 'recents') {
                for (const [catKey, catData] of Object.entries(veilleData.articles)) {
                    if (catKey !== 'recents' && catData.articles && Array.isArray(catData.articles)) {
                        articlesToDisplay = articlesToDisplay.concat(catData.articles);
                    }
                }
                // Trier par date (du plus récent au plus ancien)
                articlesToDisplay.sort((a, b) => {
                    const timeA = parseRSSDate(a.published);
                    const timeB = parseRSSDate(b.published);
                    return timeB - timeA;
                });
            } else if (categoryData.articles && categoryData.articles.length > 0) {
                // Pour les autres catégories, utiliser les articles existants
                articlesToDisplay = categoryData.articles;
                // Trier par date (du plus récent au plus ancien)
                articlesToDisplay.sort((a, b) => {
                    const timeA = parseRSSDate(a.published);
                    const timeB = parseRSSDate(b.published);
                    return timeB - timeA;
                });
            }
            
            if (articlesToDisplay.length > 0) {
                // Initialiser l'état de pagination pour ce tab
                if (!veillePaginationState[tabId]) {
                    veillePaginationState[tabId] = {
                        currentPage: 1,
                        itemsPerPage: 5,
                        totalArticles: articlesToDisplay.length
                    };
                }
                
                const state = veillePaginationState[tabId];
                state.totalArticles = articlesToDisplay.length;
                state.totalPages = Math.ceil(state.totalArticles / state.itemsPerPage);
                
                // Calculer l'index de début et fin pour une page
                const startIdx = (state.currentPage - 1) * state.itemsPerPage;
                const endIdx = startIdx + state.itemsPerPage;
                const paginatedArticles = articlesToDisplay.slice(startIdx, endIdx);
                
                // Créer les éléments HTML pour les articles
                const articlesHTML = paginatedArticles.map(article => {
                    let icon = categoryIcons[article.category] || '📌';
                    
                    return `
                    <div class="veille-item">
                        <div class="veille-badge">${new Date(article.published).toLocaleDateString('fr-FR')}</div>
                        <div class="veille-category">${icon} ${article.category}</div>
                        <div class="veille-title">${article.title}</div>
                        <div class="veille-description">${stripHTML(article.description)}</div>
                        <a href="${article.link}" target="_blank" class="veille-source">📌 ${article.source}</a>
                    </div>
                `;
                }).join('');
                
                // Créer les contrôles de pagination
                const paginationHTML = `
                    <div class="veille-pagination">
                        <div class="pagination-controls">
                            <button class="pagination-btn" onclick="changeVeillePage('${tabId}', -1)" ${state.currentPage === 1 ? 'disabled' : ''}>← Précédent</button>
                            <span class="pagination-info">${state.currentPage} / ${state.totalPages}</span>
                            <button class="pagination-btn" onclick="changeVeillePage('${tabId}', 1)" ${state.currentPage === state.totalPages ? 'disabled' : ''}>Suivant →</button>
                        </div>
                    </div>
                `;
                
                // Injecter dans la page avec une grille
                tabContent.innerHTML = `<div class="veille-grid">${articlesHTML}</div>${paginationHTML}`;
            }
        }
    }
}


function changeVeillePage(tabId, direction) {
    if (veillePaginationState[tabId]) {
        const newPage = veillePaginationState[tabId].currentPage + direction;
        if (newPage >= 1 && newPage <= veillePaginationState[tabId].totalPages) {
            veillePaginationState[tabId].currentPage = newPage;
            displayVeilleArticles();
        }
    }
}

function setupVeilleTabs() {
    const veilleTabs = document.querySelectorAll('.veille-tab-btn');
    
    veilleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.veille-tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.veille-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const content = document.getElementById(`${tabName}-tab`);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

function setupHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const hubMenu = document.querySelector('.hub-menu');
    const menuBtns = document.querySelectorAll('.menu-btn');
    
    if (!hamburgerBtn) return;
    
    // Toggle menu on hamburger click
    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        hubMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a menu item
    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            hubMenu.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sl-hub')) {
            hamburgerBtn.classList.remove('active');
            hubMenu.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize stats display
    updateHealthDisplay();
    updateManaDisplay();
    
    initInterface();
    setupMenuButtons();
    setupPanelClosing();
    setupPanelDragging();
    setupFormSubmission();
    setupPotionKeybinds();
    setupCheatCode();
    setupVeilleTabs();
    setupHamburgerMenu();
    loadVeilleArticles();
});

function setupPotionKeybinds() {
    document.addEventListener('keydown', (e) => {
        // Check if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // ² key for health potion (AltGr + ² on AZERTY)
        if (e.key === '²' || e.key === '~') {
            e.preventDefault();
            useHealthPotion();
        }
        
        // $ key for mana potion (Shift + 4 on AZERTY, or direct $ on QWERTY)
        if (e.key === '$' || (e.shiftKey && e.key === '4')) {
            e.preventDefault();
            useManaPotionPotion();
        }
    });
}

// ===== CHEAT CODE SYSTEM =====
let cheatBuffer = [];
// Sequence: UP, UP, DOWN, DOWN, LEFT, RIGHT, LEFT, RIGHT (Classic Konami Code)
const CHEAT_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight']; 
const CHEAT_TIMEOUT = 5000; // 5 seconds to complete the code
let cheatTimer = null;

function setupCheatCode() {
    document.addEventListener('keydown', (e) => {
        // Arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            cheatBuffer.push(e.key);
            
            checkCheatCode();
            
            clearTimeout(cheatTimer);
            cheatTimer = setTimeout(() => {
                cheatBuffer = [];
            }, CHEAT_TIMEOUT);
        }
    });
}

function checkCheatCode() {
    if (cheatBuffer.length === CHEAT_CODE.length) {
        const isMatch = cheatBuffer.every((key, index) => key === CHEAT_CODE[index]);
        if (isMatch) {
            activateCheatCode();
            cheatBuffer = [];
        }
    }
}

function activateCheatCode() {
    const secretMsg = document.createElement('div');
    secretMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 40px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(26, 26, 46, 0.95));
        border: 3px solid #fbbf24;
        border-radius: 12px;
        z-index: 9998;
        animation: secretAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-width: 500px;
        box-shadow: 0 0 50px rgba(251, 191, 36, 0.4), inset 0 0 30px rgba(139, 92, 246, 0.2);
        font-family: 'Rajdhani', monospace;
        text-align: center;
    `;
    
    secretMsg.innerHTML = `
        <div style="color: #fbbf24; font-size: 36px; font-weight: 900; margin-bottom: 20px; letter-spacing: 3px; text-transform: uppercase;">⚡ SHADOW ABILITIES ACTIVATED ⚡</div>
        <div style="color: #e5e7eb; font-size: 14px; line-height: 1.8; margin-bottom: 15px;">
            <div style="margin-bottom: 10px;">🌑 <strong>Progression cachée activée</strong></div>
            <div style="margin-bottom: 10px;">📧 Email: guylian.dupuy@hotmail.fr</div>
            <div style="margin-bottom: 10px;">💼 LinkedIn: https://www.linkedin.com/in/guylian-dupuy-012294269/</div>
            <div style="color: #9ca3af; font-size: 12px; margin-top: 15px;">« Vous avez découvert le secret... »</div>
        </div>
        <button id="closeSecret" style="
            margin-top: 20px;
            padding: 10px 20px;
            background: linear-gradient(90deg, #8b5cf6, #fbbf24);
            border: none;
            color: #0f0f1e;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Rajdhani', monospace;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
        ">Fermer</button>
    `;
    
    document.body.appendChild(secretMsg);
    
    // Add animation style to document
    if (!document.getElementById('cheatCodeStyle')) {
        const style = document.createElement('style');
        style.id = 'cheatCodeStyle';
        style.textContent = `
            @keyframes secretAppear {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) rotateY(-90deg); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.getElementById('closeSecret').addEventListener('click', () => {
        secretMsg.style.animation = 'secretAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) reverse';
        setTimeout(() => {
            secretMsg.remove();
        }, 400);
    });
    
    // Click outside to close
    secretMsg.addEventListener('click', (e) => {
        if (e.target === secretMsg) {
            secretMsg.style.animation = 'secretAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) reverse';
            setTimeout(() => {
                secretMsg.remove();
            }, 400);
        }
    });
}

// Initialize interface
function initInterface() {
    // Restore saved section from localStorage
    const savedSection = localStorage.getItem('currentSection') || 'profil';
    
    // Restore active button state immediately (no delay)
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-section="${savedSection}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Show the panel with a small delay for animation
    setTimeout(() => {
        showPanel(savedSection);
    }, 500);
}

function setupMenuButtons() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    
    menuButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const manaRequired = 10;
            
            // Check if enough mana
            if (!canUseMana(manaRequired)) {
                showManaWarning();
                return;
            }
            
            // Use mana on action
            useMana(manaRequired);
            
            // Remove active class from all buttons
            menuButtons.forEach(b => b.classList.remove('active'));
            // Add active to clicked button
            btn.classList.add('active');
            
            // Get section data attribute
            const section = btn.getAttribute('data-section');
            showPanel(section);
        });
    });
}

// Show panel with animation
function showPanel(section) {
    // Hide all panels with fade animation
    const allPanels = document.querySelectorAll('.sl-panel');
    allPanels.forEach(panel => {
        if (panel.classList.contains('active')) {
            panel.style.animation = 'panelFadeOut 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
            setTimeout(() => {
                panel.classList.remove('active');
                panel.style.animation = '';
            }, 400);
        }
    });

    // Show the requested panel
    setTimeout(() => {
        // Map sections to panels
        const panelMap = {
            'profil': ['profil-panel', 'spec-panel', 'formation-panel', 'langues-panel', 'objectifs-panel', 'motivations-panel'],
            'competences': ['competences-panel'],
            'experience': ['experience-panel'],
            'organisation': ['organisation-panel'],
            'projets': ['projets-panel'],
            'veille': ['veille-panel'],
            'contact': ['contact-panel']
        };

        if (panelMap[section]) {
            const panelsToShow = panelMap[section];
            
            // For profil section: arrange in cascade from top to bottom based on actual panel height
            if (section === 'profil') {
                const panelSpacing = 5; // Small gap between panels
                
                // First, activate all panels
                panelsToShow.forEach((panelId, index) => {
                    const panel = document.getElementById(panelId);
                    if (panel) {
                        panel.style.left = '0px';
                        panel.style.top = '0px';
                        panel.style.zIndex = (100 - index).toString();
                        
                        setTimeout(() => {
                            panel.classList.add('active');
                        }, index * 50);
                    }
                });
                
                // After all panels are visible, calculate their actual heights and reposition
                setTimeout(() => {
                    let currentTopPosition = 0;
                    panelsToShow.forEach((panelId) => {
                        const panel = document.getElementById(panelId);
                        if (panel && panel.classList.contains('active')) {
                            panel.style.top = currentTopPosition + 'px';
                            panelPositions[panelId] = { x: 0, y: currentTopPosition };
                            currentTopPosition += panel.offsetHeight + panelSpacing;
                        }
                    });
                }, 400); // Wait for animations to complete
            } else {
                // For other sections: single panel at top-left
                panelsToShow.forEach((panelId, index) => {
                    const panel = document.getElementById(panelId);
                    if (panel) {
                        panel.style.left = '0px';
                        panel.style.top = '0px';
                        panel.style.zIndex = (100 + (panelsToShow.length - index)).toString();
                        panelPositions[panelId] = {
                            x: 0,
                            y: 0
                        };
                        
                        setTimeout(() => {
                            panel.classList.add('active');
                        }, index * 100);
                    }
                });
            }
        }
        
        // Save the current section to localStorage
        localStorage.setItem('currentSection', section);
    }, 400);
}

// Function to recalculate profil panel positions after one closes
function recalculateProfilPanelPositions() {
    const activePanels = profilPanelIds.filter(panelId => {
        const panel = document.getElementById(panelId);
        return panel && panel.classList.contains('active');
    });
    
    let currentTopPosition = 0;
    const panelSpacing = 5; // Small gap between panels
    
    activePanels.forEach((panelId, index) => {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.style.top = currentTopPosition + 'px';
            panel.style.zIndex = (100 - index).toString();
            panelPositions[panelId] = {
                x: 0,
                y: currentTopPosition
            };
            currentTopPosition += panel.offsetHeight + panelSpacing;
        }
    });
}

// Panel drag and drop
let draggedPanel = null;
let offsetX = 0;
let offsetY = 0;
let panelPositions = {}; // Store positions for each panel

// Track profil panels for cascading layout
const profilPanelIds = ['profil-panel', 'spec-panel', 'formation-panel', 'langues-panel', 'objectifs-panel', 'motivations-panel'];

function setupPanelDragging() {
    const panels = document.querySelectorAll('.sl-panel');
    const contentArea = document.querySelector('.sl-content-area');
    
    panels.forEach((panel, index) => {
        const header = panel.querySelector('.panel-header');
        
        // Set initial positions at top-left
        panel.style.left = '0px';
        panel.style.top = '0px';
        
        // Store panel position
        panelPositions[panel.id] = {
            x: 0,
            y: 0
        };
        
        header.addEventListener('mousedown', (e) => {
            draggedPanel = panel;
            const rect = panel.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            panel.classList.add('dragging');
            
            document.addEventListener('mousemove', dragPanel);
            document.addEventListener('mouseup', stopDragPanel);
        });
    });
}

function dragPanel(e) {
    if (!draggedPanel) return;
    
    const contentArea = document.querySelector('.sl-content-area');
    const rect = contentArea.getBoundingClientRect();
    
    let x = e.clientX - rect.left - offsetX;
    let y = e.clientY - rect.top - offsetY;
    
    // Constrain panel within content area
    x = Math.max(0, Math.min(x, rect.width - draggedPanel.offsetWidth));
    y = Math.max(0, Math.min(y, rect.height - draggedPanel.offsetHeight));
    
    draggedPanel.style.left = x + 'px';
    draggedPanel.style.top = y + 'px';
}

function stopDragPanel() {
    if (draggedPanel) {
        draggedPanel.classList.remove('dragging');
        panelPositions[draggedPanel.id] = {
            x: parseInt(draggedPanel.style.left),
            y: parseInt(draggedPanel.style.top)
        };
        draggedPanel = null;
    }
    document.removeEventListener('mousemove', dragPanel);
    document.removeEventListener('mouseup', stopDragPanel);
}

// Setup panel closing
function setupPanelClosing() {
    const closeButtons = document.querySelectorAll('.panel-close');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const manaRequired = 5;
            
            // Check if enough mana
            if (!canUseMana(manaRequired)) {
                showManaWarning();
                return;
            }
            
            // Use mana on close
            useMana(manaRequired);
            
            const panel = btn.closest('.sl-panel');
            panel.style.animation = 'panelFadeOut 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
            setTimeout(() => {
                panel.classList.remove('active');
                panel.style.animation = '';
                
                // If this is a profil panel, recalculate positions of remaining panels
                if (profilPanelIds.includes(panel.id)) {
                    recalculateProfilPanelPositions();
                }
            }, 400);
        });
    });
}

// Captcha variables
let captchaAnswer = null;

function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    if (operator === '+') {
        captchaAnswer = num1 + num2;
    } else if (operator === '-') {
        captchaAnswer = num1 - num2;
    } else if (operator === '*') {
        captchaAnswer = num1 * num2;
    }
    
    const questionText = `${num1} ${operator} ${num2} = ?`;
    document.getElementById('captchaQuestion').textContent = questionText;
    document.getElementById('captchaInput').value = '';
    document.getElementById('captchaValidation').textContent = '';
    document.getElementById('captchaInput').className = 'captcha-input';
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Generate captcha on page load
    generateCaptcha();
    
    const captchaInput = document.getElementById('captchaInput');
    
    // Real-time captcha validation
    captchaInput.addEventListener('input', () => {
        const validation = document.getElementById('captchaValidation');
        if (captchaInput.value === '') {
            validation.textContent = '';
            captchaInput.className = 'captcha-input';
            return;
        }
        
        if (parseInt(captchaInput.value) === captchaAnswer) {
            validation.textContent = '✅ Vérification réussie !';
            validation.className = 'captcha-validation success';
            captchaInput.className = 'captcha-input correct';
        } else if (captchaInput.value.length > 0) {
            validation.textContent = '❌ Réponse incorrecte';
            validation.className = 'captcha-validation error';
            captchaInput.className = 'captcha-input incorrect';
            
            // Damage health on wrong answer
            damageHealth(Math.ceil(playerStats.maxHealth / 3));
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate captcha first
        if (parseInt(captchaInput.value) !== captchaAnswer) {
            showFormMessage('❌ Vérification CAPTCHA échouée !', 'error');
            damageHealth(Math.ceil(playerStats.maxHealth / 3));
            generateCaptcha();
            return;
        }

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Validate form
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            showFormMessage('Veuillez remplir tous les champs', 'error');
            return;
        }

        const manaRequired = 20;
        
        // Check if enough mana
        if (!canUseMana(manaRequired)) {
            showFormMessage('❌ Mana insuffisant !', 'error');
            showManaWarning();
            return;
        }

        try {
            // Show loading state
            showFormMessage('📤 Envoi du message en cours...', 'loading');

            // Envoyer via l'API Vercel (URL relative - fonctionne sur tous les domaines)
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de l\'envoi');
            }

            // Use mana on successful form submission
            useMana(manaRequired);
            
            showContactNotification('✅ Message envoyé avec succès !', 'success');
            
            // Reset form
            form.reset();
            generateCaptcha();
        } catch (error) {
            showFormMessage('❌ ' + error.message, 'error');
        }
    });
}

// Show form message
function showFormMessage(message, type) {
    const messageEl = document.getElementById('formMessage');
    messageEl.textContent = message;
    messageEl.classList.remove('success', 'error');
    messageEl.classList.add(type);
}

// Show contact notification popup (like potions)
function showContactNotification(message, type) {
    const notificationEl = document.createElement('div');
    notificationEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 20px 30px;
        background: ${type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)'};
        border: 2px solid ${type === 'success' ? '#10b981' : '#ef4444'};
        color: #ffffff;
        font-family: 'Rajdhani', monospace;
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 1px;
        border-radius: 6px;
        z-index: 5000;
        box-shadow: 0 0 30px ${type === 'success' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'};
        animation: notificationSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), notificationSlideOut 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 3.5s forwards;
    `;
    notificationEl.textContent = message;
    document.body.appendChild(notificationEl);
    
    setTimeout(() => {
        notificationEl.remove();
    }, 4000);
}

// Add animation for notifications
if (document.head) {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes notificationSlideIn {
            from {
                opacity: 0;
                transform: translateX(400px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes notificationSlideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(400px);
            }
        }
    `;
    if (!document.querySelector('style[data-notifications]')) {
        style.setAttribute('data-notifications', 'true');
        document.head.appendChild(style);
    }
}

// Utility: Add parallax effect to background particles
window.addEventListener('mousemove', (e) => {
    const particles = document.querySelector('.particles');
    if (particles) {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        particles.style.backgroundPosition = `${x}% ${y}%`;
    }
});

// Utility: Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close all open panels
        document.querySelectorAll('.sl-panel.active').forEach(panel => {
            panel.classList.remove('active');
        });
        // Reset menu button
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    }
});
