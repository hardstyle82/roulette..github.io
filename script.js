document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spinBtn');
    const spinSound = document.getElementById('spinSound');
    const getStarsBtn = document.getElementById('getStarsBtn');
    const progressBar = document.getElementById('progressBar');
    const starsCount = document.getElementById('starsCount');
    const dailyBtn = document.getElementById('dailyBtn');
    const dailyTimer = document.getElementById('dailyTimer');
    const referralLink = document.getElementById('referralLink');
    const copyBtn = document.getElementById('copyBtn');
    const winnersChat = document.getElementById('winnersChat');
    const countdownTimer = document.getElementById('countdownTimer');
    const participateBtn = document.querySelector('.participate-btn');
    const levelsContainer = document.getElementById('levelsContainer');
    
    // Настройки рулетки
    const sectors = [
        { stars: 5, icon: '⭐', color: '' },
        { stars: 10, icon: '⭐', color: '' },
        { stars: 15, icon: '⭐', color: '' },
        { stars: 20, icon: '⭐', color: '' },
        { stars: 25, icon: '⭐', color: '' },
        { stars: 30, icon: '⭐', color: '' },
        { stars: 40, icon: '⭐', color: '' },
        { stars: 50, icon: '⭐', color: '' },
        { stars: 0, icon: '🔄', color: 'wheel-sector-spin-again', text: 'Ещё раз' },
        { stars: 0, icon: '🔄', color: 'wheel-sector-spin-again', text: 'Ещё раз' },
        { stars: 0, icon: '🔄', color: 'wheel-sector-spin-again', text: 'Ещё раз' },
        { stars: 0, icon: '👑', color: 'wheel-sector-premium', text: 'Премиум' }
    ];
    
    // Уровни игрока
    const levels = [
        { stars: 100, name: 'Новичок', reward: '10 звёзд' },
        { stars: 300, name: 'Игрок', reward: '25 звёзд' },
        { stars: 600, name: 'Профи', reward: '50 звёзд' },
        { stars: 1000, name: 'Эксперт', reward: '100 звёзд' },
        { stars: 2000, name: 'Мастер', reward: '200 звёзд' }
    ];
    
    // Состояние игры
    let totalStars = 0;
    let canSpin = true;
    let spinTimeout = null;
    let winnersUpdateInterval = null;
    let countdownInterval = null;
    
    // Инициализация
    initWheel();
    updateStarsUI();
    initLiveChat();
    setupReferralLink();
    checkDailyBonus();
    startCountdown();
    initLevels();
    requestNotificationPermission();
    
    // События
    spinBtn.addEventListener('click', spinWheel);
    getStarsBtn.addEventListener('click', function() {
        window.open('https://www.youtube.com/@madnessgames_?sub_confirmation=1', '_blank');
    });
    dailyBtn.addEventListener('click', claimDailyBonus);
    copyBtn.addEventListener('click', copyReferralLink);
    participateBtn.addEventListener('click', participateInDraw);
    
    // Проверка подписки (имитация)
    setTimeout(() => {
        spinBtn.disabled = false;
    }, 3000);
    
    // Основные функции
    function initWheel() {
        wheel.innerHTML = '';
        const sectorAngle = 360 / sectors.length;
        
        sectors.forEach((sector, index) => {
            const sectorElement = document.createElement('div');
            sectorElement.className = `wheel-sector ${sector.color || ''}`;
            sectorElement.style.transform = `rotate(${sectorAngle * index}deg)`;
            
            const sectorContent = document.createElement('div');
            sectorContent.className = 'wheel-sector-content';
            
            const sectorIcon = document.createElement('div');
            sectorIcon.className = 'wheel-sector-icon';
            sectorIcon.textContent = sector.icon;
            
            const sectorStars = document.createElement('div');
            sectorStars.textContent = sector.stars > 0 ? sector.stars : '';
            
            sectorContent.appendChild(sectorIcon);
            sectorContent.appendChild(sectorStars);
            sectorElement.appendChild(sectorContent);
            wheel.appendChild(sectorElement);
        });
    }
    
    function spinWheel() {
        if (!canSpin) return;
        
        canSpin = false;
        spinBtn.disabled = true;
        
        // Воспроизведение звука
        spinSound.currentTime = 0;
        spinSound.play();
        
        // Случайное количество оборотов (4-7)
        const spinDegrees = 360 * getRandomInt(4, 7) + getRandomInt(0, 360);
        
        // Вращение рулетки
        wheel.style.transform = `rotate(${-spinDegrees}deg)`;
        
        // Определение выигрыша после завершения вращения
        setTimeout(() => {
            const sectorAngle = 360 / sectors.length;
            const normalizedDegree = spinDegrees % 360;
            const winningSectorIndex = Math.floor(normalizedDegree / sectorAngle);
            const winningSector = sectors[winningSectorIndex];
            
            spinSound.pause();
            
            // Обработка выигрыша
            handleWin(winningSector);
            
            // Задержка перед следующим вращением
            if (winningSector.icon === '🔄') {
                // Если "Вращать ещё", сразу разрешаем новое вращение
                canSpin = true;
                spinBtn.disabled = false;
            } else {
                // Обычный выигрыш - ждем 25 секунд
                spinTimeout = setTimeout(() => {
                    canSpin = true;
                    spinBtn.disabled = false;
                }, 25000);
            }
        }, 4000);
    }
    
    function handleWin(sector) {
        let winText = '';
        
        if (sector.icon === '⭐') {
            totalStars += sector.stars;
            winText = `Вы выиграли ${sector.stars} звёзд!`;
            updateStarsUI();
            showConfetti();
            checkLevelUp();
        } else if (sector.icon === '👑') {
            winText = 'Поздравляем! Вы выиграли Премиум Telegram!';
            showConfetti(true);
        } else if (sector.icon === '🔄') {
            winText = 'Вращайте ещё раз!';
        }
        
        // Добавление в чат победителей
        addToWinnersChat(winText);
        
        // Показ уведомления
        showCustomAlert(winText);
    }
    
    function updateStarsUI() {
        starsCount.textContent = `${totalStars} звёзд`;
        const progress = Math.min((totalStars / 555) * 100, 100);
        progressBar.style.width = `${progress}%`;
        
        // Активация кнопки при достижении 555 звёзд
        getStarsBtn.disabled = totalStars < 555;
        
        // Обновление прогресса уровней
        updateLevelsProgress();
    }
    
    // Добавленные функции для новых фич
    
    function initLevels() {
        const levelsHTML = levels.map(level => `
            <div class="level-item">
                <div class="level-circle">${level.stars}</div>
                <div class="level-info">
                    <div>${level.name}</div>
                    <div>+${level.reward}</div>
                </div>
            </div>
        `).join('');
        
        levelsContainer.innerHTML = `
            <h3>Ваш прогресс</h3>
            <div class="level-progress">
                ${levelsHTML}
            </div>
        `;
        
        updateLevelsProgress();
    }
    
    function updateLevelsProgress() {
        const levelCircles = document.querySelectorAll('.level-circle');
        const currentLevelIndex = levels.findIndex(level => totalStars < level.stars);
        
        levelCircles.forEach((circle, index) => {
            if (index < currentLevelIndex) {
                circle.classList.add('reached');
            } else {
                circle.classList.remove('reached');
            }
        });
    }
    
    function checkLevelUp() {
        const reachedLevels = levels.filter(level => totalStars >= level.stars);
        const lastReached = reachedLevels[reachedLevels.length - 1];
        
        if (lastReached && !localStorage.getItem(`level_${lastReached.stars}_rewarded`)) {
            showCustomAlert(`Поздравляем! Вы достигли уровня "${lastReached.name}" и получаете ${lastReached.reward}!`);
            localStorage.setItem(`level_${lastReached.stars}_rewarded`, 'true');
        }
    }
    
    function startCountdown() {
        let seconds = 3600; // 1 час
        
        function update() {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            countdownTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                countdownTimer.textContent = "00:00:00";
                setTimeout(startCountdown, 1000); // Перезапуск таймера
            } else {
                seconds--;
            }
        }
        
        update();
        countdownInterval = setInterval(update, 1000);
    }
    
    function participateInDraw() {
        if (totalStars >= 100) {
            totalStars -= 100;
            updateStarsUI();
            showCustomAlert("Вы успешно участвуете в розыгрыше 1000 звёзд!");
        } else {
            showCustomAlert("Для участия нужно минимум 100 звёзд");
        }
    }
    
    function initLiveChat() {
        // Первоначальное заполнение чата
        for (let i = 0; i < 5; i++) {
            addToWinnersChat(generateRandomWinMessage());
        }
        
        // Обновление чата каждые 2-6 секунд
        setInterval(() => {
            if (Math.random() > 0.3) { // 70% шанс нового сообщения
                addToWinnersChat(generateRandomWinMessage());
            }
        }, getRandomInt(2000, 6000));
    }
    
    function addToWinnersChat(message) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <span class="chat-time">${timeString}</span>
            <span class="chat-name">${generateRandomName()}:</span>
            <span class="chat-prize">${message}</span>
        `;
        
        winnersChat.prepend(messageElement);
        
        // Ограничение количества сообщений
        if (winnersChat.children.length > 20) {
            winnersChat.removeChild(winnersChat.lastChild);
        }
    }
    
    function generateRandomWinMessage() {
        const prizes = [
            'выиграл 5 звёзд', 'выиграл 10 звёзд', 'выиграл 20 звёзд', 
            'выиграл 50 звёзд', 'получил Премиум', 'крутит ещё раз'
        ];
        return prizes[Math.floor(Math.random() * prizes.length)];
    }
    
    function generateRandomName() {
        const names = ['Алексей', 'Мария', 'Иван', 'Елена', 'Дмитрий', 'Ольга', 'Сергей', 'Анна'];
        const suffixes = ['123', 'X', 'Pro', '2023', 'Winner', 'King', 'Queen'];
        return `${names[Math.floor(Math.random() * names.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    }
    
    function requestNotificationPermission() {
        if (!("Notification" in window)) return;
        
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            setTimeout(() => {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        new Notification("Спасибо за разрешение!", {
                            body: "Теперь вы будете получать уведомления о бонусах и розыгрышах!",
                            icon: "images/icon.png"
                        });
                    }
                });
            }, 10000); // Запрос через 10 секунд
        }
    }
    
    function showCustomAlert(message) {
        // Можно заменить на красивый попап
        alert(message);
        
        // Если разрешены уведомления - показываем и там
        if (Notification.permission === "granted") {
            new Notification("Рулетка: новый выигрыш!", {
                body: message,
                icon: "images/icon.png"
            });
        }
    }
    
    // Остальные функции (showConfetti, setupReferralLink, copyReferralLink, 
    // checkDailyBonus, updateDailyTimer, claimDailyBonus, getRandomInt) 
    // остаются без изменений из предыдущей версии
    
    // Очистка при выходе
    window.addEventListener('beforeunload', () => {
        if (spinTimeout) clearTimeout(spinTimeout);
        if (winnersUpdateInterval) clearInterval(winnersUpdateInterval);
        if (countdownInterval) clearInterval(countdownInterval);
    });
});