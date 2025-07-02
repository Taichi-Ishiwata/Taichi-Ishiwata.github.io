// タブ機能
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const hamburger = document.getElementById('hamburger');
    const navList = document.querySelector('.nav-list');

    // タブ切り替え機能
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // すべてのタブボタンからactiveクラスを削除
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // すべてのタブパネルからactiveクラスを削除
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // クリックされたタブボタンにactiveクラスを追加
            button.classList.add('active');
            // 対応するタブパネルにactiveクラスを追加
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // ハンバーガーメニュー
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navList.classList.toggle('active');
    });

    // スムーススクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // スクロール時のヘッダー効果
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // 数字のカウントアップアニメーション
    const observerOptions = {
        threshold: 0.7,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const finalNumber = stat.textContent;
                    const isKFormat = finalNumber.includes('K+');
                    const numericValue = isKFormat ? 
                        parseInt(finalNumber.replace('K+', '')) : 
                        parseFloat(finalNumber);
                    
                    animateNumber(stat, 0, numericValue, isKFormat);
                });
            }
        });
    }, observerOptions);

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        observer.observe(heroStats);
    }

    function animateNumber(element, start, end, isKFormat) {
        const duration = 2000;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = start + (end - start) * easeOutQuart(progress);
            
            if (isKFormat) {
                element.textContent = Math.floor(currentValue) + 'K+';
            } else if (end % 1 !== 0) {
                element.textContent = currentValue.toFixed(1);
            } else {
                element.textContent = Math.floor(currentValue);
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
});