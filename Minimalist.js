let currentEngine = 'bing';
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let customLinks = JSON.parse(localStorage.getItem('customLinks')) || [];

const engineNames = {
    'bing': '必应',
    'baidu': '百度',
    'google': 'Google',
    'duckduckgo': 'DuckDuckGo',
    'github': 'GitHub'
};

function updateRealTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN');
    const el = document.getElementById('realTime');
    if (el) el.textContent = timeString;
}

function updatePlaceholder() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const engineName = engineNames[currentEngine] || '搜索引擎';
    input.placeholder = `在${engineName}中搜索...`;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
    }, 2000);
}

function populateQuickNav() {
    const navList = document.getElementById('quickNavLinks');
    if (!navList) return;
    navList.innerHTML = '';

    if (customLinks.length === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.className = 'nav-empty';
        emptyLi.id = 'navEmptyMessage';
        emptyLi.textContent = '暂无快捷链接，请点击“添加”按钮。';
        navList.appendChild(emptyLi);
        return;
    }

    customLinks.forEach((link, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'nav-link';

        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.textContent = link.name;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'link-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-link-btn';
        editBtn.title = '编辑';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.onclick = () => openEditModal(index);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-link-btn';
        deleteBtn.title = '删除';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => removeLink(index);

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        listItem.appendChild(anchor);
        listItem.appendChild(actionsDiv);

        navList.appendChild(listItem);
    });
}

function saveLinks() {
    localStorage.setItem('customLinks', JSON.stringify(customLinks));
    populateQuickNav();
}

function addLink(name, url) {
    customLinks.push({ name: name, url: url });
    saveLinks();
}

function updateLink(index, name, url) {
    if (index >= 0 && index < customLinks.length) {
        customLinks[index] = { name: name, url: url };
        saveLinks();
    }
}

function removeLink(index) {
    if (index >= 0 && index < customLinks.length) {
        customLinks.splice(index, 1);
        saveLinks();
        showToast('链接已删除');
    }
}

// DOM elements (assigned after DOMContentLoaded)
let modal, modalTitle, linkForm, editIndexInput, linkNameInput, linkUrlInput;

function openAddModal() {
    if (!modal || !modalTitle || !linkForm || !editIndexInput) return;
    modalTitle.textContent = "添加快捷链接";
    linkForm.reset();
    editIndexInput.value = "";
    modal.style.display = "block";
}

function openEditModal(index) {
    const link = customLinks[index];
    if (link && modal && modalTitle && linkNameInput && linkUrlInput && editIndexInput) {
        modalTitle.textContent = "编辑快捷链接";
        linkNameInput.value = link.name;
        linkUrlInput.value = link.url;
        editIndexInput.value = index;
        modal.style.display = "block";
    }
}

function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
}

function renderSearchHistory() {
    const historyContainer = document.getElementById('historyItems');
    const searchHistoryElem = document.getElementById('searchHistory');
    if (!historyContainer || !searchHistoryElem) return;

    if (searchHistory.length > 0) {
        historyContainer.innerHTML = '';
        searchHistory.slice().reverse().forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = item;
            historyItem.onclick = () => {
                const input = document.getElementById('searchInput');
                if (input) input.value = item;
                search();
            };
            historyContainer.appendChild(historyItem);
        });
        searchHistoryElem.classList.add('visible');
    } else {
        searchHistoryElem.classList.remove('visible');
    }
}

function addToHistory(query) {
    searchHistory = searchHistory.filter(item => item !== query);
    searchHistory.push(query);
    if (searchHistory.length > 5) {
        searchHistory = searchHistory.slice(-5);
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    renderSearchHistory();
}

function clearHistory() {
    searchHistory = [];
    localStorage.removeItem('searchHistory');
    renderSearchHistory();
    showToast('搜索历史已清空');
}

function search() {
    const input = document.getElementById('searchInput');
    const query = input ? input.value.trim() : '';
    if (query === '') {
        showToast('请输入搜索内容');
        return;
    }

    addToHistory(query);

    let searchUrl;
    switch (currentEngine) {
        case 'baidu':
            searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
            break;
        case 'google':
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            break;
        case 'duckduckgo':
            searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
            break;
        case 'github':
            searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}`;
            break;
        default:
            searchUrl = `https://cn.bing.com/search?q=${encodeURIComponent(query)}`;
    }

    window.location.href = searchUrl;
}

function setSearchEngine(engine) {
    currentEngine = engine;
    const options = document.querySelectorAll('.search-option');
    options.forEach(option => option.classList.remove('active'));
    const target = document.querySelector(`.search-option[data-engine="${engine}"]`);
    if (target) target.classList.add('active');
    const engineName = engineNames[engine] || '未知引擎';
    showToast(`已切换到${engineName}搜索`);
    updatePlaceholder();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        if (isDarkMode) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }
    localStorage.setItem('darkMode', isDarkMode);
}

// Bind DOM-dependent elements and handlers after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById("linkModal");
    modalTitle = document.getElementById("modalTitle");
    linkForm = document.getElementById("linkForm");
    editIndexInput = document.getElementById("editIndex");
    linkNameInput = document.getElementById("linkName");
    linkUrlInput = document.getElementById("linkUrl");

    const addBtn = document.getElementById("addLinkBtn");
    const closeBtn = document.querySelector(".close");
    const cancelBtn = document.getElementById("cancelBtn");
    const saveBtn = document.getElementById("saveLinkBtn");
    const searchInput = document.getElementById('searchInput');

    if (addBtn) addBtn.onclick = openAddModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    window.onclick = function (event) {
        if (modal && event.target == modal) {
            closeModal();
        }
    };

    if (saveBtn) {
        saveBtn.onclick = function () {
            if (!linkForm) return;
            if (linkForm.checkValidity()) {
                const name = linkNameInput.value.trim();
                const url = linkUrlInput.value.trim();
                const index = editIndexInput.value;

                let fullUrl = url;
                if (!/^https?:\/\//i.test(url)) {
                    fullUrl = 'https://' + url;
                }

                if (index === "") {
                    addLink(name, fullUrl);
                    showToast('链接已添加');
                } else {
                    updateLink(parseInt(index), name, fullUrl);
                    showToast('链接已更新');
                }
                closeModal();
            } else {
                linkForm.reportValidity();
            }
        };
    }

    if (searchInput) {
        searchInput.focus();
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                search();
            }
        });
    }

    // Initial UI setup
    renderSearchHistory();
    updateRealTime();
    setInterval(updateRealTime, 1000);
    updatePlaceholder();
    populateQuickNav();

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.theme-toggle i');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
});
