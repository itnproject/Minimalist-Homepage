(function() {
    try {
        var theme = localStorage.getItem('selectedTheme');
        var modern = localStorage.getItem('modernUiEnabled');
        var isDark = (theme === '"dark"');
        var isModern = (modern === null || modern === 'true');
        
        if (isDark) document.documentElement.classList.add('dark-mode');
        if (isModern) document.documentElement.classList.add('modern-ui');
        
        var observer = new MutationObserver(function() {
            if (document.body) {
                observer.disconnect();
                if (isDark) document.body.classList.add('dark-mode');
                if (isModern) document.body.classList.add('modern-ui');
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    } catch(e) {}
})();