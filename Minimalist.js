let currentEngine = SyncStorage.getItem('searchEngine', 'bing');
let searchHistory = SyncStorage.getItem('searchHistory', []);
let isDarkMode = SyncStorage.getItem('selectedTheme', 'default') === 'dark';
let customBackground = SyncStorage.getItem('customBackground', '');
let customLinks = SyncStorage.getItem('customLinks', []);
let expandDir = SyncStorage.getItem('expandDir', 'Expand');
let extensions = SyncStorage.getItem('extensions', []);
let loadedExtensions = [];

function onCustomQuickEngineClick() {
    var customEngines = SyncStorage.getItem('customEngines', []);
    if (customEngines.length === 0) {
        var settingsBtn = document.getElementById('settingsBtn');
        if(settingsBtn) settingsBtn.click();
        setTimeout(function() {
            var sidebar = document.querySelector('.settings-sidebar ul');
            if(sidebar) {
                var engineLi = sidebar.querySelector('li[data-section="engine"]');
                if(engineLi) engineLi.click();
            }
            var customBtn = document.getElementById('customEngineBtn');
            if(customBtn) customBtn.click();
            var addBtn = document.getElementById('addCustomEngineBtn');
            if(addBtn) {
                var handler = function() {
                    setTimeout(function() {
                        var arr = SyncStorage.getItem('customEngines', []);
                        if(arr.length>0) {
                            SyncStorage.setItem('searchEngine','custom_0');
                            if(typeof setSearchEngine==='function') setSearchEngine('custom_0');
                            var settingsModal = document.getElementById('settingsModal');
                            if(settingsModal) settingsModal.style.display='none';
                        }
                    }, 200);
                    addBtn.removeEventListener('click', handler);
                };
                addBtn.addEventListener('click', handler);
            }
        }, 200);
    } else {
        SyncStorage.setItem('searchEngine','custom_0');
        if(typeof setSearchEngine==='function') setSearchEngine('custom_0');
        var options = document.querySelectorAll('.search-option');
        options.forEach(function(opt){opt.classList.remove('active');});
        var customQuick = document.getElementById('customQuickEngine');
        if(customQuick) customQuick.classList.add('active');
    }}
document.addEventListener('DOMContentLoaded', function() {
        function updateThemeSelection() {
            var themeImgs = document.querySelectorAll('.theme-option[data-theme="default"], .theme-option[data-theme="dark"]');
            themeImgs.forEach(function(img) {
                img.classList.remove('selected');
                if ((isDarkMode && img.dataset.theme === 'dark') || (!isDarkMode && img.dataset.theme === 'default')) {
                    img.classList.add('selected');
                }
            });
        }
        function updateUiSelection() {
            var uiImgs = document.querySelectorAll('.theme-option[data-theme="classic"], .theme-option[data-theme="modern"]');
            var isModernUi = SyncStorage.getItem('modernUiEnabled', false);
            uiImgs.forEach(function(img) {
                img.classList.remove('selected');
                if ((isModernUi && img.dataset.theme === 'modern') || (!isModernUi && img.dataset.theme === 'classic')) {
                    img.classList.add('selected');
                }
            });
        }
        function setCookie(name, value, days) {
            var d = new Date();
            d.setTime(d.getTime() + (days*24*60*60*1000));
            document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/";
        }
        function getCookie(name) {
            var arr = document.cookie.match(new RegExp('(^| )'+name+'=([^;]+)'));
            return arr ? arr[2] : null;
        }
        updateThemeSelection();
        updateUiSelection();
        document.querySelectorAll('.theme-option').forEach(function(img) {
            img.onclick = function() {
                var theme = img.dataset.theme;
                if (theme === 'classic' || theme === 'modern') {
                    var isModernUi = (theme === 'modern');
                    SyncStorage.setItem('modernUiEnabled', isModernUi);
                    if (isModernUi) {
                        document.body.classList.add('modern-ui');
                        if (typeof initModernUi === 'function') initModernUi();
                    } else {
                        document.body.classList.remove('modern-ui');
                    }
                    updateUiSelection();
                } else if (theme === 'dark') {
                    if (!isDarkMode) {
                        toggleTheme();
                    }
                    updateThemeSelection();
                } else {
                    if (isDarkMode) {
                        toggleTheme();
                    }
                    updateThemeSelection();
                }
            };
        });
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    const segGroup = document.getElementById('engineSegGroup');
    const customInputs = document.getElementById('customEngineInputs');
    const customList = document.getElementById('customEngineList');
    const customBtn = document.getElementById('customEngineBtn');
    const nameInput = document.getElementById('customEngineName');
    const urlInput = document.getElementById('customEngineUrl');
    const addBtn = document.getElementById('addCustomEngineBtn');
    if (!segGroup) return;
    function getCustomEngines() {
        try {
            return SyncStorage.getItem('customEngines', []);
        } catch { return []; }
    }
    function setCustomEngines(list) {
        SyncStorage.setItem('customEngines', list);
    }
    function renderCustomList() {
        const list = getCustomEngines();
        customList.innerHTML = '';
        list.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'custom-engine-item';
            div.innerHTML = `<span class="custom-engine-name">${item.name}</span><span class="custom-engine-url">${item.url}</span>`;
            const del = document.createElement('button');
            del.className = 'custom-engine-delete';
            del.textContent = '删除';
            del.onclick = function() {
                const arr = getCustomEngines();
                arr.splice(idx,1);
                setCustomEngines(arr);
                renderCustomList();
                if(SyncStorage.getItem('searchEngine') === 'custom_'+idx) {
                    SyncStorage.setItem('searchEngine','bing');
                    if(typeof setSearchEngine==='function') setSearchEngine('bing');
                    Array.from(segGroup.children).forEach(b=>b.classList.remove('active'));
                    segGroup.querySelector('[data-engine="bing"]').classList.add('active');
                }
            };
            div.appendChild(del);
            div.onclick = function(e) {
                if(e.target!==del) {
                    Array.from(segGroup.children).forEach(b=>b.classList.remove('active'));
                    customBtn.classList.add('active');
                    SyncStorage.setItem('searchEngine','custom_'+idx);
                    if(typeof setSearchEngine==='function') setSearchEngine('custom_'+idx);
                }
            };
            customList.appendChild(div);
        });
    }
    let current = SyncStorage.getItem('searchEngine', 'bing');
    Array.from(segGroup.children).forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.engine === current) btn.classList.add('active');
    });
    if(current.startsWith('custom_')) customBtn.classList.add('active');
    Array.from(segGroup.children).forEach(btn => {
        btn.addEventListener('click', function() {
            Array.from(segGroup.children).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            SyncStorage.setItem('searchEngine', btn.dataset.engine);
            if(btn.dataset.engine==='custom') {
                customInputs.style.display='block';
            } else {
                customInputs.style.display='none';
            }
            if(typeof setSearchEngine==='function') setSearchEngine(btn.dataset.engine);
        });
    });
    if(current.startsWith('custom_')) customInputs.style.display='block';
    else customInputs.style.display='none';
    if(addBtn) addBtn.onclick = function() {
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        if(!name||!url) { alert('请填写名称和地址'); return; }
        let arr = getCustomEngines();
        arr.push({name,url});
        setCustomEngines(arr);
        renderCustomList();
        nameInput.value = '';
        urlInput.value = '';
    };
    renderCustomList();
});
document.addEventListener('DOMContentLoaded', function() {
    function setDevOptionVisible(visible) {
        var sidebar = document.querySelector('.settings-sidebar ul');
        var devLi = sidebar ? sidebar.querySelector('li[data-section="kfzxx"]') : null;
        if (devLi) devLi.style.display = visible ? '' : 'none';
    }
    function setCookie(name, value, days) {
        var d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/";
    }
    function getCookie(name) {
        var arr = document.cookie.match(new RegExp('(^| )'+name+'=([^;]+)'));
        return arr ? arr[2] : null;
    }
    if (getCookie('devOption') !== '1') setDevOptionVisible(false);
    else setDevOptionVisible(true);
    var aboutSection = document.querySelector('.modal-body.settings-section[data-section="about"]');
    if (aboutSection) {
        var versionLabel = Array.from(aboutSection.querySelectorAll('label')).find(lab => /\d+\.\d+\.\d+/.test(lab.textContent) || /^\d+\.\d+$/.test(lab.textContent));
        if (versionLabel) {
            let clickCount = 0;
            versionLabel.addEventListener('click', function() {
                clickCount++;
                if (clickCount >= 7) {
                    setDevOptionVisible(true);
                    setCookie('devOption', '1', 365);
                }
                setTimeout(() => { clickCount = 0; }, 1500);
            });
        }
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const systemThemeBtn = document.getElementById('systemThemeBtn');
    if (systemThemeBtn) {
        systemThemeBtn.addEventListener('click', function() {
            systemThemeBtn.classList.toggle('active');
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.settings-sidebar');
    const sections = document.querySelectorAll('.settings-section');
    const mainTitle = document.getElementById('settingsMainTitle');
    const sectionTitles = {
        general: '界面设置',
        engine: '搜索引擎',
        nav: '快捷导航',
        cgsz: '常规设置',
        appearance: '主题设置',
        qtapp: '其他项目',
        sygxing: '首页更新',
        about: '关于首页',
        kfzxx: '开发者选项',
        expand: '管理扩展'
    };
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            if (e.target.tagName === 'LI') {
                sidebar.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                e.target.classList.add('active');
                const section = e.target.getAttribute('data-section');
                sections.forEach(sec => {
                    if (sec.getAttribute('data-section') === section) {
                        sec.style.display = '';
                    } else {
                        sec.style.display = 'none';
                    }
                });
                if (mainTitle && sectionTitles[section]) {
                    mainTitle.textContent = sectionTitles[section];
                }
                if (section === 'expand') {
                    const expandDirInput = document.getElementById('expandDirInput');
                    if (expandDirInput) {
                        expandDirInput.value = expandDir;
                    }
                }
            }
        });
    }
});

const engineNames = {
    'bing': '必应',
    'baidu': '百度',
    'google': 'Google',
    'duckduckgo': 'DuckDuckGo',
    'github': 'GitHub'
};
function getCustomEngines() {
    try { return SyncStorage.getItem('customEngines', []); } catch { return []; }
}

function updateRealTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN');
    const el = document.getElementById('realTime');
    if (el) el.textContent = timeString;
}

function updatePlaceholder() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    let engineName = engineNames[currentEngine];
    if(!engineName && currentEngine.startsWith('custom_')) {
        const idx = parseInt(currentEngine.replace('custom_',''));
        const arr = getCustomEngines();
        if(arr[idx]) engineName = arr[idx].name;
    }
    input.placeholder = `在${engineName||'搜索引擎'}中搜索...`;
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
        emptyLi.textContent = '无快捷导航，请点击“添加”按钮添加。';
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
    SyncStorage.setItem('customLinks', customLinks);
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
        showToast('快捷导航已删除');
    }
}

let modal, modalTitle, linkForm, editIndexInput, linkNameInput, linkUrlInput;

function openAddModal() {
    if (!modal || !modalTitle || !linkForm || !editIndexInput) return;
    modalTitle.textContent = "添加快捷导航";
    linkForm.reset();
    editIndexInput.value = "";
    modal.style.display = "block";
    modal.classList.remove('closing');
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

function openEditModal(index) {
    const link = customLinks[index];
    if (link && modal && modalTitle && linkNameInput && linkUrlInput && editIndexInput) {
        modalTitle.textContent = "编辑快捷导航";
        linkNameInput.value = link.name;
        linkUrlInput.value = link.url;
        editIndexInput.value = index;
        modal.style.display = "block";
        modal.classList.remove('closing');
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
    modal.classList.add('closing');
    setTimeout(() => {
        modal.style.display = "none";
        modal.classList.remove('closing');
    }, 200);
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
    const clearBtn = document.querySelector('.clear-history');
    if (clearBtn) {
        clearBtn.onclick = function(e) {
            e.stopPropagation();
            clearHistory();
        };
    }
}

function addToHistory(query) {
    searchHistory = searchHistory.filter(item => item !== query);
    searchHistory.push(query);
    if (searchHistory.length > 5) {
        searchHistory = searchHistory.slice(-5);
    }
    SyncStorage.setItem('searchHistory', searchHistory);
    renderSearchHistory();
}

function clearHistory() {
    searchHistory = [];
    SyncStorage.removeItem('searchHistory');
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
    if(currentEngine.startsWith('custom_')) {
        const idx = parseInt(currentEngine.replace('custom_',''));
        const arr = getCustomEngines();
        if(arr[idx] && arr[idx].url) {
            searchUrl = arr[idx].url.replace(/%s/g, encodeURIComponent(query));
        } else {
            searchUrl = `https://cn.bing.com/search?q=${encodeURIComponent(query)}`;
        }
    } else {
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
    }
    window.location.href = searchUrl;
}

function setSearchEngine(engine) {
    currentEngine = engine;
    const options = document.querySelectorAll('.search-option');
    options.forEach(option => option.classList.remove('active'));
    const target = document.querySelector(`.search-option[data-engine="${engine}"]`);
    if (target) target.classList.add('active');
    let engineName = engineNames[engine];
    if(!engineName && engine.startsWith('custom_')) {
        const idx = parseInt(engine.replace('custom_',''));
        let arr = [];
        try{arr=SyncStorage.getItem('customEngines',[]);}catch(e){}
        if(arr[idx]) engineName = arr[idx].name;
    }
    showToast(`已切换到${engineName||'未知引擎'}搜索`);
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
    SyncStorage.setItem('selectedTheme', isDarkMode ? 'dark' : 'default');
    
    if (window.updateModernUiBg) {
        window.updateModernUiBg();
    }
}
function applyCustomBackground(bg) {
  if (!bg) {
    document.body.style.background = '';
    document.documentElement.style.setProperty(
      '--bg-gradient',
      isDarkMode 
        ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    );
    return;
  }
  if (bg.startsWith('#') || bg.startsWith('rgb')) {
    document.body.style.background = bg;
    document.documentElement.style.setProperty('--bg-gradient', bg);
  } else if (bg.startsWith('http')) {
    document.body.style.background = `url(${bg}) center/cover no-repeat`;
    document.documentElement.style.setProperty('--bg-gradient', `url(${bg})`);
  } else {
    document.body.style.background = bg;
    document.documentElement.style.setProperty('--bg-gradient', bg);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const homeOptions = document.querySelectorAll('.search-option');
    if (homeOptions.length > 0) {
        homeOptions.forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.engine === currentEngine) opt.classList.add('active');
            opt.onclick = function() {
                homeOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                SyncStorage.setItem('searchEngine', opt.dataset.engine);
                setSearchEngine(opt.dataset.engine);
            };
        });
    }
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.onclick = function() {
            toggleTheme();
        };
        const icon = themeToggle.querySelector('i');
        if (isDarkMode) {
            if (icon && icon.classList.contains('fa-moon')) icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            if (icon && icon.classList.contains('fa-sun')) icon.classList.replace('fa-sun', 'fa-moon');
        }
    }
    const searchBtn = document.querySelector('.search-button');
    if (searchBtn) {
        searchBtn.onclick = function() { search(); };
    }
    setSearchEngine(currentEngine);
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
                    showToast('快捷导航已添加');
                } else {
                    updateLink(parseInt(index), name, fullUrl);
                    showToast('快捷导航已更新');
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

    renderSearchHistory();
    const clearBtn = document.querySelector('.clear-history');
    if (clearBtn) {
        clearBtn.onclick = function(e) {
            e.stopPropagation();
            clearHistory();
        };
    }
    updateRealTime();
    setInterval(updateRealTime, 1000);
    updatePlaceholder();
    populateQuickNav();
    const realTimeDiv = document.getElementById('realTime');
    const toggleShowTime = document.getElementById('toggleShowTime');
    let showTime = SyncStorage.getItem('showTimeOnHome', '1');
    if (showTime === null) showTime = '1';
    if (toggleShowTime) {
        toggleShowTime.checked = showTime === '1';
        toggleShowTime.addEventListener('change', function() {
            SyncStorage.setItem('showTimeOnHome', this.checked ? '1' : '0');
            if (realTimeDiv) realTimeDiv.style.display = this.checked ? '' : 'none';
        });
    }
    if (realTimeDiv) realTimeDiv.style.display = showTime === '1' ? '' : 'none';

    const quickNavSection = document.querySelector('.nav-section');
    const toggleShowQuickNav = document.getElementById('toggleShowQuickNav');
    let showQuickNav = SyncStorage.getItem('showQuickNav', '1');
    if (showQuickNav === null) showQuickNav = '1';
    if (toggleShowQuickNav) {
        toggleShowQuickNav.checked = showQuickNav === '1';
        toggleShowQuickNav.addEventListener('change', function() {
            SyncStorage.setItem('showQuickNav', this.checked ? '1' : '0');
            if (quickNavSection) quickNavSection.style.display = this.checked ? '' : 'none';
        });
    }
    if (quickNavSection) quickNavSection.style.display = showQuickNav === '1' ? '' : 'none';
    
const themeRadios = document.querySelectorAll('input[name="theme"]');
themeRadios.forEach(radio => {
  radio.checked = (radio.value === (isDarkMode ? 'dark' : 'light'));
});

const bgInput = document.getElementById('customBgInput');
if (bgInput) {
  bgInput.value = customBackground;
}
const applyBgBtn = document.getElementById('applyBgBtn');
if (applyBgBtn) {
  applyBgBtn.onclick = function() {
    const newBg = bgInput?.value.trim() || '';
    customBackground = newBg;
    SyncStorage.setItem('customBackground', customBackground);
    applyCustomBackground(customBackground);
    showToast('背景已更新');
  };
}
const resetBgBtn = document.getElementById('resetBgBtn');
if (resetBgBtn) {
  resetBgBtn.onclick = function() {
    customBackground = '';
    SyncStorage.removeItem('customBackground');
    if (bgInput) bgInput.value = '';
    applyCustomBackground('');
    showToast('已恢复默认背景');
  };
}

const settingsClose = document.querySelector('#settingsModal .close');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');

function openSettingsModal() {
    if (!settingsModal) return;
    settingsModal.style.display = 'block';
    settingsModal.classList.remove('closing');
    requestAnimationFrame(() => {
        settingsModal.classList.add('show');
    });
    const modalContent = settingsModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.top = '50%';
        modalContent.style.left = '50%';
        modalContent.style.transform = 'translate(-50%, -50%)';
    }
    const sidebar = settingsModal.querySelector('.settings-sidebar ul');
    const sections = settingsModal.querySelectorAll('.settings-section');
    const mainTitle = document.getElementById('settingsMainTitle');
    if (sidebar) {
        sidebar.querySelectorAll('li').forEach(li => {
            if (li.getAttribute('data-section') === 'cgsz') {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }
    if (sections) {
        sections.forEach(sec => {
            if (sec.getAttribute('data-section') === 'cgsz') {
                sec.style.display = '';
            } else {
                sec.style.display = 'none';
            }
        });
    }
    if (mainTitle) {
        mainTitle.textContent = '常规设置';
    }
}
function closeSettingsModal() {
    if (!settingsModal) return;
    settingsModal.classList.remove('show');
    settingsModal.classList.add('closing');
    setTimeout(() => {
        settingsModal.style.display = 'none';
        settingsModal.classList.remove('closing');
    }, 200);
}
if (settingsBtn) settingsBtn.onclick = openSettingsModal;
if (settingsClose) settingsClose.onclick = closeSettingsModal;
const modernUiSettingsBtn = document.getElementById('modernUiSettingsBtn');
if (modernUiSettingsBtn) modernUiSettingsBtn.onclick = openSettingsModal;
applyCustomBackground(customBackground);
    const CURRENT_VERSION = '11.3';
    const GITHUB_API = 'https://api.github.com/repos/itnproject/Minimalist-Homepage/releases/latest';
    const updateInfoDiv = document.getElementById('updateInfo');
    const checkUpdateBtn = document.getElementById('checkUpdateBtn');
    const downloadUpdateBtn = document.getElementById('downloadUpdateBtn');
    let latestRelease = null;

    function compareVersion(v1, v2) {
        const n1 = v1.match(/\d+(?:\.\d+)*/)?.[0] || '';
        const n2 = v2.match(/\d+(?:\.\d+)*/)?.[0] || '';
        const arr1 = n1.split('.').map(Number);
        const arr2 = n2.split('.').map(Number);
        for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
            const a = arr1[i] || 0, b = arr2[i] || 0;
            if (a > b) return 1;
            if (a < b) return -1;
        }
        return 0;
    }

    async function fetchLatestRelease() {

        updateInfoDiv.innerHTML = '正在检查更新...';
        try {
            const res = await fetch(GITHUB_API);
            if (!res.ok) throw new Error('网络错误');
            const data = await res.json();
            latestRelease = data;
            const latestVer = data.tag_name || data.name;
            const cmp = compareVersion(latestVer, CURRENT_VERSION);
            let html = `<b>最新版本:</b> ${latestVer}`;
            if (cmp > 0) {
                html += `<br><b style='color:#d85831;'>有新版本可用！</b>`;//有新版本！ヾ(≧▽≦*)o
                downloadUpdateBtn.style.display = '';
            } else {
                html += `<br>已是最新版本。`;
                downloadUpdateBtn.style.display = 'none';
            }
            if (data.body) {
                html += `<br><b>更新内容:</b><div class="update-content-wrapper">` + renderMarkdownToHtml(data.body) + `</div>`;
            }
            updateInfoDiv.innerHTML = html;
        } catch (e) {
            updateInfoDiv.innerHTML = '检查更新失败: ' + e.message;
            downloadUpdateBtn.style.display = 'none';
        }
    }
    function renderMarkdownToHtml(md) {
        if (!md) return '';
        let html = md
            .replace(/\r\n|\r|\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/__(.*?)__/g, '<b>$1</b>')
            .replace(/\*(.*?)\*/g, '<i>$1</i>')
            .replace(/_(.*?)_/g, '<i>$1</i>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/^\s*\- (.*?)(<br>|$)/gm, '<li>$1</li>')
            .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>');
        html = html.replace(/<\/ul><ul>/g, '');
        return `<div class='update-markdown'>${html}</div>`;
    }
    if (checkUpdateBtn) {
        checkUpdateBtn.onclick = fetchLatestRelease;
    }
    if (downloadUpdateBtn) {
        downloadUpdateBtn.onclick = async function() {
            if (!latestRelease) return;
            let asset = (latestRelease.assets||[]).find(a=>a.name.endsWith('.zip'));
            let url = asset ? asset.browser_download_url : latestRelease.zipball_url;
            if (!url) {
                showToast('未找到可用的下载链接');
                return;
            }
            showToast('正在下载更新包...');
            try {
                const a = document.createElement('a');
                a.href = url;
                a.download = '';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(()=>{
                    alert('请解压并覆盖原文件夹后，重启浏览器。');
                }, 800);
            } catch (e) {
                showToast('下载失败: '+e.message);//为什么会下载失败，好难猜啊~~~
            }
        };
    }
    if (updateInfoDiv) fetchLatestRelease();
});

function loadExtensions() {
    loadedExtensions.forEach(ext => {
        if (ext.type === 'css' && ext.element) {
            document.head.removeChild(ext.element);
        }
    });
    loadedExtensions = [];

    extensions.forEach(ext => {
        if (!ext.enabled) return;
        loadExtension(ext);
    });
}

function loadExtension(ext) {
    if (!ext.files) {
        const folder = ext.path;
        const files = [
            `${expandDir}/${folder}/index.itnproject`,
            `${expandDir}/${folder}/index.itnprojectcss`,
            `${expandDir}/${folder}/index.itnprojectjs`,
            `${expandDir}/${folder}/main.itnproject`,
            `${expandDir}/${folder}/main.itnprojectcss`,
            `${expandDir}/${folder}/main.itnprojectjs`
        ];

        files.forEach(filePath => {
            fetch(filePath)
                .then(response => {
                    if (!response.ok) return;
                    return response.text();
                })
                .then(content => {
                    if (!content) return;
                    const type = filePath.endsWith('.itnprojectjs') ? 'js' :
                                 filePath.endsWith('.itnprojectcss') ? 'css' : 'project';
                    if (type === 'js') {
                        try {
                            eval(content);
                            loadedExtensions.push({ ...ext, loaded: true, file: filePath });
                        } catch (e) {
                            console.error('Error loading JS extension:', ext.name, filePath, e);
                        }
                    } else if (type === 'css') {
                        const style = document.createElement('style');
                        style.textContent = content;
                        document.head.appendChild(style);
                        loadedExtensions.push({ ...ext, loaded: true, file: filePath, element: style });
                    } else if (type === 'project') {
                        const div = document.createElement('div');
                        div.innerHTML = content;
                        document.body.appendChild(div);
                        loadedExtensions.push({ ...ext, loaded: true, file: filePath, element: div });
                    }
                })
                .catch(e => {});
        });
        return;
    }
    Object.keys(ext.files).forEach(fileName => {
        const content = ext.files[fileName];
        const type = fileName.endsWith('.itnprojectjs') ? 'js' :
                     fileName.endsWith('.itnprojectcss') ? 'css' : 'project';
        if (type === 'js') {
            try {
                eval(content);
                loadedExtensions.push({ ...ext, loaded: true, file: fileName });
            } catch (e) {
                console.error('Error loading JS extension:', ext.name, fileName, e);
            }
        } else if (type === 'css') {
            const style = document.createElement('style');
            style.textContent = content;
            document.head.appendChild(style);
            loadedExtensions.push({ ...ext, loaded: true, file: fileName, element: style });
        } else if (type === 'project') {
            const div = document.createElement('div');
            div.innerHTML = content;
            document.body.appendChild(div);
            loadedExtensions.push({ ...ext, loaded: true, file: fileName, element: div });
        }
    });
}

function saveExtensions() {
    SyncStorage.setItem('extensions', extensions);
}

function renderExtensionList() {
    const listDiv = document.getElementById('extensionList');
    if (!listDiv) return;
    listDiv.innerHTML = '';
    if (extensions.length === 0) {
        listDiv.innerHTML = '<p>暂无安装的扩展。</p>';
        return;
    }
    extensions.forEach((ext, index) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';
        div.style.padding = '8px';
        div.style.border = '1px solid #ddd';
        div.style.borderRadius = '4px';
        div.style.marginBottom = '8px';

        const info = document.createElement('div');
        info.innerHTML = `<strong>${ext.name}</strong><br><small>${expandDir}/${ext.path}/</small>`;

        const controls = document.createElement('div');
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = ext.enabled ? '禁用' : '启用';
        toggleBtn.className = 'btn btn-secondary';
        toggleBtn.style.marginRight = '8px';
        toggleBtn.onclick = () => {
            ext.enabled = !ext.enabled;
            saveExtensions();
            renderExtensionList();
            loadExtensions(); 
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.className = 'btn btn-secondary';
        deleteBtn.onclick = () => {
            if (confirm('确定删除此扩展？')) {
                extensions.splice(index, 1);
                saveExtensions();
                renderExtensionList();
                loadExtensions();
            }
        };

        controls.appendChild(toggleBtn);
        controls.appendChild(deleteBtn);

        div.appendChild(info);
        div.appendChild(controls);
        listDiv.appendChild(div);
    });
}

function getFolderNameFromFiles(files) {
    const paths = Array.from(files).map(file => (file.webkitRelativePath || file.name).replace(/\\/g, '/'));
    if (paths.length === 0) return `extension-${Date.now()}`;
    const hasSlash = paths.some(p => p.includes('/'));
    if (!hasSlash) {
        return `extension-${Date.now()}`;
    }
    const firstSegments = paths.map(p => p.split('/')[0]);
    const commonFirst = firstSegments[0];
    const allSame = firstSegments.every(seg => seg === commonFirst);
    return allSame ? commonFirst : `extension-${Date.now()}`;
}

function isValidExtensionFiles(files) {
    const fileNames = files.map(file => file.name.toLowerCase());
    return fileNames.some(name => name.endsWith('.itnproject')) &&
           fileNames.some(name => name.endsWith('.itnprojectcss')) &&
           fileNames.some(name => name.endsWith('.itnprojectjs'));
}

function processAutoInstall(files) {
    const fileList = Array.from(files);
    if (fileList.length === 0) {
        showToast('未选择任何文件');
        return;
    }

    const folderMap = {};
    const hasSlash = fileList.some(file => file.webkitRelativePath && file.webkitRelativePath.includes('/'));
    if (!hasSlash) {
        folderMap[getFolderNameFromFiles(fileList)] = fileList;
    } else {
        fileList.forEach(file => {
            const pathParts = (file.webkitRelativePath || file.name).replace(/\\/g, '/').split('/');
            const folderName = pathParts[0] || `extension-${Date.now()}`;
            if (!folderMap[folderName]) {
                folderMap[folderName] = [];
            }
            folderMap[folderName].push(file);
        });
    }

    const validFolders = Object.keys(folderMap).filter(folderName => isValidExtensionFiles(folderMap[folderName]));
    if (validFolders.length === 0) {
        showToast('未找到有效的扩展文件夹，扩展文件夹需包含 .itnproject、.itnprojectcss 和 .itnprojectjs');
        return;
    }

    validFolders.forEach(folderName => {
        const folderFiles = folderMap[folderName];
        const extFiles = {};
        let loadedCount = 0;
        const extensionFileCount = folderFiles.filter(file =>
            file.name.endsWith('.itnproject') ||
            file.name.endsWith('.itnprojectcss') ||
            file.name.endsWith('.itnprojectjs')
        ).length;

        folderFiles.forEach(file => {
            if (file.name.endsWith('.itnproject') ||
                file.name.endsWith('.itnprojectcss') ||
                file.name.endsWith('.itnprojectjs')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    extFiles[file.name] = e.target.result;
                    loadedCount++;
                    if (loadedCount === extensionFileCount) {
                        installExtension(folderName, extFiles);
                    }
                };
                reader.readAsText(file);
            }
        });
    });

    showToast(`发现并安装了 ${validFolders.length} 个扩展`);
}

function processManualInstall(files) {
    const fileList = Array.from(files);
    if (!isValidExtensionFiles(fileList)) {
        showToast('所选文件夹不包含完整扩展文件，请确保包含 .itnproject、.itnprojectcss 和 .itnprojectjs');
        return;
    }

    const folderName = getFolderNameFromFiles(fileList);
    const extFiles = {};
    let loadedCount = 0;
    const extensionFileCount = fileList.filter(file =>
        file.name.endsWith('.itnproject') ||
        file.name.endsWith('.itnprojectcss') ||
        file.name.endsWith('.itnprojectjs')
    ).length;

    fileList.forEach(file => {
        if (file.name.endsWith('.itnproject') ||
            file.name.endsWith('.itnprojectcss') ||
            file.name.endsWith('.itnprojectjs')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                extFiles[file.name] = e.target.result;
                loadedCount++;
                if (loadedCount === extensionFileCount) {
                    installExtension(folderName, extFiles);
                }
            };
            reader.readAsText(file);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const expandDirInput = document.getElementById('expandDirInput');
    if (expandDirInput) {
        expandDirInput.value = expandDir;
    }
    const saveExpandDirBtn = document.getElementById('saveExpandDirBtn');
    if (saveExpandDirBtn && expandDirInput) {
        saveExpandDirBtn.onclick = () => {
            const newDir = expandDirInput.value.trim();
            if (!newDir) {
                showToast('请输入扩展目录路径');
                return;
            }
            expandDir = newDir;
            SyncStorage.setItem('expandDir', expandDir);
            showToast('扩展目录已保存');
            loadExtensions();
            renderExtensionList();
        };
    }

    loadExtensions();
    renderExtensionList();

    const refreshBtn = document.getElementById('refreshExtensionsBtn');
    if (refreshBtn) {
        refreshBtn.onclick = () => {
            loadExtensions();
            renderExtensionList();
            showToast('扩展已刷新');
        };
    }

    const autoInstallBtn = document.getElementById('autoInstallBtn');
    const autoInstallInput = document.getElementById('autoInstallInput');
    if (autoInstallBtn && autoInstallInput) {
        autoInstallBtn.onclick = () => {
            const files = autoInstallInput.files;
            if (files.length === 0) {
                showToast('请选择扩展根目录');
                return;
            }
            processAutoInstall(files);
            autoInstallInput.value = '';
        };
    }

    const manualInstallBtn = document.getElementById('manualInstallBtn');
    const manualInstallInput = document.getElementById('manualInstallInput');
    if (manualInstallBtn && manualInstallInput) {
        manualInstallBtn.onclick = () => {
            const files = manualInstallInput.files;
            if (files.length === 0) {
                showToast('请选择扩展文件夹');
                return;
            }
            processManualInstall(files);
            manualInstallInput.value = '';
        };
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const modernUiSwitch = document.getElementById('modernUiSwitch');
    const modernUiContainer = document.getElementById('modernUiContainer');
    const modernUiTime = document.getElementById('modernUiTime');
    const modernUiDate = document.getElementById('modernUiDate');
    const modernUiSearchInput = document.getElementById('modernUiSearchInput');
    const modernUiSearchBtn = document.getElementById('modernUiSearchBtn');
    const modernUiNav = document.getElementById('modernUiNav');
    const modernUiBg = document.getElementById('modernUiBg');
    const modernUiQuote = document.getElementById('modernUiQuote');
    const modernUiEngineSelector = document.getElementById('modernUiEngineSelector');

    const quotes = [
        "桃李不言，下自成蹊。",
        "路漫漫其修远兮，吾将上下而求索。",
        "千里之行，始于足下。",
        "学而不思则，思而不学则殆。",
        "知之为知之，不知为不知，是知也。",
        "三人行，必有我师焉。",
        "己所不欲，勿施于人。",
        "温故而知新，可以为师矣。",
        "逝者如斯夫，不舍昼夜。",
        "天行健，君子以自强不息。",
        "地势坤，君子以厚德载物。",
        "不积跬步，无以至千里。",
        "锲而不舍，金石可镂。",
        "宝剑锋从磨砺出，梅花香自苦寒来。",
        "书山有路勤为径，学海无涯苦作舟。"
    ];

    let isModernUi = SyncStorage.getItem('modernUiEnabled', false);

    function applyModernUiState() {
        if (isModernUi) {
            document.body.classList.add('modern-ui');
            if (modernUiSwitch) modernUiSwitch.checked = true;
        } else {
            document.body.classList.remove('modern-ui');
            if (modernUiSwitch) modernUiSwitch.checked = false;
        }
    }

    function updateModernUiTime() {
        if (!modernUiTime || !modernUiDate) return;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        modernUiTime.textContent = `${hours}:${minutes}`;

        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        modernUiDate.textContent = now.toLocaleDateString('zh-CN', options);
    }

    function updateModernUiBg() {
        if (!modernUiBg) return;
        const bg = SyncStorage.getItem('customBackground', '');
        if (bg) {
            if (bg.startsWith('#') || bg.startsWith('rgb')) {
                modernUiBg.style.background = bg;
            } else if (bg.startsWith('http')) {
                modernUiBg.style.backgroundImage = `url(${bg})`;
            } else {
                modernUiBg.style.background = bg;
            }
        } else {
            const defaultBg = isDarkMode 
                ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
                : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
            modernUiBg.style.background = defaultBg;
        }
    }

    window.updateModernUiBg = updateModernUiBg;

    function showRandomQuote() {
        if (!modernUiQuote) return;
        fetch('https://v2.jinrishici.com/one.json')
            .then(response => response.json())
            .then(data => {
                if (data.data && data.data.content) {
                    const content = data.data.content;
                    modernUiQuote.textContent = `「 ${content} 」`;
                } else {
                    const fallbackQuotes = [
                        "桃李不言，下自成蹊。",
                        "路漫漫其修远兮，吾将上下而求索。",
                        "千里之行，始于足下。",
                        "学而不思则罔，思而不学则殆。",
                        "知之为知之，不知为不知，是知也。",
                        "三人行，必有我师焉。",
                        "己所不欲，勿施于人。",
                        "温故而知新，可以为师矣。",
                        "逝者如斯夫，不舍昼夜。",
                        "天行健，君子以自强不息。",
                        "地势坤，君子以厚德载物。",
                        "不积跬步，无以至千里。",
                        "锲而不舍，金石可镂。",
                        "宝剑锋从磨砺出，梅花香自苦寒来。",
                        "书山有路勤为径，学海无涯苦作舟。"
                    ];
                    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
                    modernUiQuote.textContent = `「 ${fallbackQuotes[randomIndex]} 」`;
                }
            })
            .catch(error => {
                console.log('诗词 API 加载失败，使用备用名言:', error);
                const fallbackQuotes = [
                    "桃李不言，下自成蹊。",
                    "路漫漫其修远兮，吾将上下而求索。",
                    "千里之行，始于足下。",
                    "学而不思则罔，思而不学则殆。",
                    "知之为知之，不知为不知，是知也。",
                    "三人行，必有我师焉。",
                    "己所不欲，勿施于人。",
                    "温故而知新，可以为师矣。",
                    "逝者如斯夫，不舍昼夜。",
                    "天行健，君子以自强不息。",
                    "地势坤，君子以厚德载物。",
                    "不积跬步，无以至千里。",
                    "锲而不舍，金石可镂。",
                    "宝剑锋从磨砺出，梅花香自苦寒来。",
                    "书山有路勤为径，学海无涯苦作舟。"
                ];
                const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
                modernUiQuote.textContent = `「 ${fallbackQuotes[randomIndex]} 」`;
            });
    }

    function renderModernUiNav() {
        if (!modernUiNav) return;
        modernUiNav.innerHTML = '';

        const links = SyncStorage.getItem('customLinks', []);

        const iconMap = {
            'bilibili': 'fa-brands fa-bilibili',
            '哔哩哔哩': 'fa-brands fa-bilibili',
            'youtube': 'fa-brands fa-youtube',
            '谷歌': 'fa-brands fa-google',
            'google': 'fa-brands fa-google',
            'github': 'fa-brands fa-github',
            '微博': 'fa-brands fa-weibo',
            '微信': 'fa-brands fa-weixin',
            '知乎': 'fa-brands fa-zhihu',
            'twitter': 'fa-brands fa-twitter',
            'x': 'fa-brands fa-x-twitter',
            'facebook': 'fa-brands fa-facebook',
            'instagram': 'fa-brands fa-instagram',
            'tiktok': 'fa-brands fa-tiktok',
            '抖音': 'fa-brands fa-tiktok',
            '百度': 'fa-solid fa-paw',
            '必应': 'fa-solid fa-magnifying-glass',
            'bing': 'fa-solid fa-magnifying-glass',
            '邮箱': 'fa-solid fa-envelope',
            '邮件': 'fa-solid fa-envelope',
            '音乐': 'fa-solid fa-music',
            '视频': 'fa-solid fa-video',
            '图片': 'fa-solid fa-image',
            '文档': 'fa-solid fa-file',
            '云盘': 'fa-solid fa-cloud',
            '网盘': 'fa-solid fa-cloud',
        };

        links.forEach((link, index) => {
            const item = document.createElement('a');
            item.className = 'modern-ui-nav-item';
            item.href = link.url;
            item.target = '_blank';
            item.dataset.index = index;

            let iconClass = 'fa-solid fa-link';
            const lowerName = link.name.toLowerCase();
            for (const [key, icon] of Object.entries(iconMap)) {
                if (lowerName.includes(key)) {
                    iconClass = icon;
                    break;
                }
            }

            item.innerHTML = `
                <i class="${iconClass}"></i>
                <span class="nav-tooltip">${link.name}</span>
            `;
            modernUiNav.appendChild(item);
        });

        const addBtn = document.createElement('div');
        addBtn.className = 'modern-ui-nav-add';
        addBtn.innerHTML = '<i class="fas fa-plus"></i>';
        addBtn.onclick = function() {
            openAddModal();
        };
        modernUiNav.appendChild(addBtn);
    }

    function modernUiSearch() {
        const query = modernUiSearchInput.value.trim();
        if (!query) return;

        let searchUrl;
        const engine = SyncStorage.getItem('searchEngine', 'bing');

        switch (engine) {
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

    function updateModernUiEngineSelector() {
        if (!modernUiEngineSelector) return;
        const currentEngine = SyncStorage.getItem('searchEngine', 'bing');
        const buttons = modernUiEngineSelector.querySelectorAll('.modern-ui-engine-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.engine === currentEngine) {
                btn.classList.add('active');
            }
        });
    }

    function initModernUi() {
        applyModernUiState();
        updateModernUiTime();
        updateModernUiBg();
        showRandomQuote();
        renderModernUiNav();
        updateModernUiEngineSelector();

        setInterval(updateModernUiTime, 1000);

        setInterval(showRandomQuote, 60000);
    }

    if (modernUiSwitch) {
        modernUiSwitch.addEventListener('change', function() {
            isModernUi = this.checked;
            SyncStorage.setItem('modernUiEnabled', isModernUi);
            applyModernUiState();
            if (isModernUi) {
                initModernUi();
            }
        });
    }

    if (modernUiSearchInput) {
        modernUiSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                modernUiSearch();
            }
        });
    }

    if (modernUiSearchBtn) {
        modernUiSearchBtn.addEventListener('click', modernUiSearch);
    }

    const modernUiSettingsBtn = document.getElementById('modernUiSettingsBtn');
    if (modernUiSettingsBtn) {
        modernUiSettingsBtn.addEventListener('click', function() {
            const settingsModal = document.getElementById('settingsModal');
            if (!settingsModal) return;
            
            settingsModal.style.display = 'block';
            const modalContent = settingsModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.opacity = '0';
                modalContent.style.transform = 'translate(-50%, -50%) scale(0.8)';
                modalContent.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        modalContent.style.opacity = '1';
                        modalContent.style.transform = 'translate(-50%, -50%) scale(1)';
                    });
                });
            }
            
            const sidebar = settingsModal.querySelector('.settings-sidebar ul');
            if (sidebar) {
                const firstItem = sidebar.querySelector('li');
                if (firstItem) firstItem.click();
            }
        });
    }

    if (modernUiEngineSelector) {
        modernUiEngineSelector.addEventListener('click', function(e) {
            if (e.target.classList.contains('modern-ui-engine-btn')) {
                const engine = e.target.dataset.engine;
                SyncStorage.setItem('searchEngine', engine);
                currentEngine = engine;
                updateModernUiEngineSelector();
                showToast(`已切换到${engineNames[engine] || engine}搜索`);
            }
        });
    }

    if (isModernUi) {
        initModernUi();
    }

    const applyBgBtn = document.getElementById('applyBgBtn');
    if (applyBgBtn) {
        const originalOnclick = applyBgBtn.onclick;
        applyBgBtn.onclick = function() {
            if (originalOnclick) originalOnclick();
            if (isModernUi) {
                setTimeout(updateModernUiBg, 100);
            }
        };
    }

    const originalSaveLinks = saveLinks;
    saveLinks = function() {
        originalSaveLinks();
        if (isModernUi) {
            setTimeout(renderModernUiNav, 100);
        }
    };

    const customContextMenu = document.getElementById('customContextMenu');
    if (customContextMenu) {
        let currentNavIndex = -1;

        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            
            let x = e.clientX;
            let y = e.clientY;
            
            const navItem = e.target.closest('.modern-ui-nav-item');
            if (navItem && navItem.dataset.index !== undefined) {
                currentNavIndex = parseInt(navItem.dataset.index);
                customContextMenu.innerHTML = `
                    <div class="context-menu-item" data-action="edit">
                        <i class="fas fa-edit"></i>
                        <span>编辑</span>
                    </div>
                    <div class="context-menu-divider"></div>
                    <div class="context-menu-item context-menu-item-danger" data-action="delete">
                        <i class="fas fa-trash-alt"></i>
                        <span>删除</span>
                    </div>
                `;
            } else {
                currentNavIndex = -1;
                customContextMenu.innerHTML = `
                    <div class="context-menu-item" data-action="refresh">
                        <i class="fas fa-sync-alt"></i>
                        <span>刷新</span>
                    </div>
                    <div class="context-menu-divider"></div>
                    <div class="context-menu-item" data-action="cut">
                        <i class="fas fa-cut"></i>
                        <span>剪切</span>
                    </div>
                    <div class="context-menu-item" data-action="copy">
                        <i class="fas fa-copy"></i>
                        <span>复制</span>
                    </div>
                    <div class="context-menu-item" data-action="paste">
                        <i class="fas fa-paste"></i>
                        <span>粘贴</span>
                    </div>
                `;
            }
            
            customContextMenu.classList.add('show');
            
            const menuRect = customContextMenu.getBoundingClientRect();
            if (y + menuRect.height > window.innerHeight) {
                y = y - menuRect.height;
            }
            if (x + menuRect.width > window.innerWidth) {
                x = x - menuRect.width;
            }
            
            customContextMenu.style.left = x + 'px';
            customContextMenu.style.top = y + 'px';
            
            bindContextMenuEvents();
        });

        function bindContextMenuEvents() {
            customContextMenu.querySelectorAll('.context-menu-item').forEach(item => {
                item.addEventListener('click', function() {
                    const action = this.dataset.action;
                    
                    switch(action) {
                        case 'refresh':
                            location.reload();
                            break;
                        case 'cut':
                            document.execCommand('cut');
                            break;
                        case 'copy':
                            document.execCommand('copy');
                            break;
                        case 'paste':
                            navigator.clipboard.readText().then(text => {
                                const activeElement = document.activeElement;
                                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                                    const start = activeElement.selectionStart;
                                    const end = activeElement.selectionEnd;
                                    const value = activeElement.value;
                                    activeElement.value = value.substring(0, start) + text + value.substring(end);
                                    activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
                                    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                            }).catch(err => {
                                console.log('粘贴失败:', err);
                            });
                            break;
                        case 'edit':
                            if (currentNavIndex >= 0) {
                                openEditModal(currentNavIndex);
                            }
                            break;
                        case 'delete':
                            if (currentNavIndex >= 0) {
                                removeLink(currentNavIndex);
                            }
                            break;
                    }
                    
                    customContextMenu.classList.remove('show');
                });
            });
        }

        document.addEventListener('click', function() {
            customContextMenu.classList.remove('show');
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                customContextMenu.classList.remove('show');
            }
        });
    }
});