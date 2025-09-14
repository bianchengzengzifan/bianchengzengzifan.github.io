document.addEventListener('DOMContentLoaded', function() {
    console.log('搜索模块初始化开始');
    
    // 检查DOM元素是否存在
    const searchToggleBtn = document.querySelector('.search-toggle-btn');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchCloseBtn = document.querySelector('.search-close-btn');
    const searchResults = document.getElementById('search-results');
    
    console.log('DOM元素检查:', {
        searchToggleBtn: !!searchToggleBtn,
        searchModal: !!searchModal,
        searchInput: !!searchInput,
        searchCloseBtn: !!searchCloseBtn,
        searchResults: !!searchResults
    });
    
    if (!searchModal || !searchInput || !searchResults) {
        console.error('搜索所需DOM元素不存在，请检查HTML结构');
        return; // 如果关键元素不存在就退出
    }
    
    // 配置参数
    const CONFIG = {
        path: '/search.xml',
        top_n_per_article: 3,
        unescape: false,
    };
    
    // 获取翻译文本
    const i18n = (window.WANG_THEME && window.WANG_THEME.i18n && window.WANG_THEME.i18n.search) || {
        noResults: 'No results found',
        loading: 'Loading...',
        placeholder: 'Search articles...',
        close: 'Close',
        shortcut_tip: 'Press ESC to close',
        error_loading: 'Failed to load search data'
    };
    
    console.log('搜索国际化配置:', i18n);
    
    // 定义 debounce 函数
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // 初次加载搜索数据
    let searchData = null;
    let isSearchDataLoading = false;
    
    // 打开搜索模态窗口
    function openSearchModal() {
        console.log('打开搜索模态框');
        if (searchModal) {
            // 设置显示样式
            searchModal.style.display = 'block';
            setTimeout(() => {
                searchModal.classList.add('active');
            }, 10);
            
            document.body.style.overflow = 'hidden'; // 防止背景滚动
            
            if (searchInput) {
                setTimeout(() => {
                    searchInput.focus();
                    
                    // 立即加载搜索数据
                    loadSearchData().then(data => {
                        const keyword = searchInput.value.trim();
                        if (keyword) performSearch(keyword);
                    });
                }, 300);
            }
        }
    }

    // 关闭搜索模态窗口
    function closeSearchModal() {
        console.log('关闭搜索模态框');
        if (searchModal) {
            searchModal.classList.remove('active');
            setTimeout(() => {
                searchModal.style.display = 'none';
            }, 300);
            
            document.body.style.overflow = ''; // 恢复背景滚动
            
            // 清空搜索内容和结果
            if (searchInput) {
                searchInput.value = '';
            }
            if (searchResults) {
                searchResults.innerHTML = '';
            }
        }
    }

    // 绑定事件
    if (searchToggleBtn) {
        searchToggleBtn.addEventListener('click', function(e) {
            console.log('搜索按钮点击');
            e.preventDefault();
            openSearchModal();
        });
    }

    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeSearchModal();
        });
    }

    // ESC键关闭搜索
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
            closeSearchModal();
        }
    });

    // 点击模态窗口背景关闭
    if (searchModal) {
        searchModal.addEventListener('click', function(e) {
            if (e.target === searchModal) {
                closeSearchModal();
            }
        });
    }

    // 加载搜索数据 - 使用最简单的方式，避免复杂解析可能导致的问题
    async function loadSearchData() {
        if (searchData) {
            console.log('使用缓存的搜索数据');
            return searchData;
        }
        
        if (isSearchDataLoading) {
            console.log('搜索数据正在加载中...');
            return new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (searchData) {
                        clearInterval(checkInterval);
                        resolve(searchData);
                    }
                }, 100);
            });
        }
        
        isSearchDataLoading = true;
        
        try {
            // 显示加载中
            searchResults.innerHTML = `
                <div class="search-loading">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${i18n.loading}</div>
                </div>
            `;
            
            console.log('开始加载搜索数据:', CONFIG.path);
            const response = await fetch(CONFIG.path);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // 获取XML文本
            const xmlText = await response.text();
            console.log('搜索数据加载成功，数据长度:', xmlText.length);
            
            // 解析XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // 检查解析错误
            const parseError = xmlDoc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                throw new Error('XML解析错误: ' + parseError[0].textContent);
            }
            
            // 提取搜索数据
            const entries = xmlDoc.getElementsByTagName('entry');
            console.log('找到文章条目:', entries.length);
            
            const data = [];
            
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                
                try {
                    const title = entry.getElementsByTagName('title')[0]?.textContent || '';
                    const content = entry.getElementsByTagName('content')[0]?.textContent || '';
                    const url = entry.getElementsByTagName('url')[0]?.textContent || '';
                    
                    // 提取标签
                    const tags = [];
                    const tagElements = entry.getElementsByTagName('tag');
                    for (let j = 0; j < tagElements.length; j++) {
                        tags.push(tagElements[j].textContent);
                    }
                    
                    data.push({
                        title, 
                        content, 
                        url,
                        tags
                    });
                } catch (err) {
                    console.error('处理文章条目错误:', err);
                }
            }
            
            console.log('搜索数据处理完成, 共', data.length, '条记录');
            searchData = data;
            
            // 清空加载提示
            searchResults.innerHTML = '';
            
            isSearchDataLoading = false;
            return data;
        } catch (error) {
            console.error('搜索数据加载失败:', error);
            searchResults.innerHTML = `
                <div class="error-message">
                    ${i18n.error_loading}<br>
                    <small>${error.message}</small><br>
                    <small>提示：请确认已安装 hexo-generator-searchdb 插件，并在站点配置文件中正确配置</small>
                </div>`;
                
            isSearchDataLoading = false;
            return null;
        }
    }
    
    // 简化的搜索匹配功能
    function simpleSearch(keyword, data) {
        console.log('执行搜索:', keyword);
        if (!data || !data.length) return [];
        
        const keywords = keyword.trim().toLowerCase().split(/\s+/);
        return data.filter(item => {
            return keywords.some(word => {
                if (word.length === 0) return false;
                return (
                    item.title.toLowerCase().includes(word) || 
                    item.content.toLowerCase().includes(word) ||
                    item.tags.some(tag => tag.toLowerCase().includes(word))
                );
            });
        });
    }

    // 高亮显示搜索结果中的关键字
    function highlightKeyword(text, keyword) {
        if (!text || !keyword) return text;
        
        const keywords = keyword.trim().toLowerCase().split(/\s+/);
        let result = text;
        
        keywords.forEach(word => {
            if (word.length > 0) {
                const regex = new RegExp(word, 'gi');
                result = result.replace(regex, match => `<mark>${match}</mark>`);
            }
        });
        
        return result;
    }
    
    // 显示搜索结果
    function displayResults(results, keyword) {
        console.log('显示搜索结果:', results.length, '条');
        
        // 确保搜索结果区域可见
        searchResults.style.display = 'block';
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">${i18n.noResults}</div>
                <div class="search-shortcut-tips">
                    <span class="key">ESC</span> ${i18n.shortcut_tip}
                </div>
            `;
            return;
        }
        
        // 创建结果列表HTML
        let resultsHTML = '<div class="search-results-list">';
        
        results.forEach(post => {
            // 提取关键词上下文
            let excerpt = '';
            const position = post.content.toLowerCase().indexOf(keyword.toLowerCase());
            
            if (position !== -1) {
                const start = Math.max(position - 100, 0);
                const end = Math.min(position + 100, post.content.length);
                excerpt = (start > 0 ? '...' : '') + post.content.substring(start, end) + (end < post.content.length ? '...' : '');
            } else {
                excerpt = post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content;
            }
            
            // 高亮处理
            const highlightedTitle = highlightKeyword(post.title, keyword);
            const highlightedExcerpt = highlightKeyword(excerpt, keyword);
            
            // 构建标签HTML
            let tagsHTML = '';
            if (post.tags && post.tags.length > 0) {
                post.tags.forEach(tag => {
                    tagsHTML += `<a href="/tags/${encodeURIComponent(tag)}" class="tag">${highlightKeyword(tag, keyword)}</a>`;
                });
            }
            
            // 添加结果项
            resultsHTML += `
                <article class="search-result-item">
                    <h2 class="result-title">
                        <a href="${post.url}">${highlightedTitle}</a>
                    </h2>
                    <div class="result-meta">
                        <span class="result-date">
                            <img src="/images/calendar.svg" alt="calendar">
                            ${new Date().toLocaleDateString()}
                        </span>
                    </div>
                    <div class="result-excerpt">${highlightedExcerpt}</div>
                    <div class="result-tags">${tagsHTML}</div>
                </article>
            `;
        });
        
        resultsHTML += '</div>';
        
        // 添加统计和提示信息
        resultsHTML += `
            <div class="search-stats">找到 ${results.length} 条结果</div>
            <div class="search-shortcut-tips">
                <span class="key">ESC</span> ${i18n.shortcut_tip}
            </div>
        `;
        
        searchResults.innerHTML = resultsHTML;
    }

    // 执行搜索
    function performSearch(keyword) {
        if (!keyword) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }
        
        if (!searchData) {
            loadSearchData().then(data => {
                if (data) {
                    const results = simpleSearch(keyword, data);
                    displayResults(results, keyword);
                }
            });
            return;
        }
        
        const results = simpleSearch(keyword, searchData);
        displayResults(results, keyword);
    }

    // 绑定搜索输入框事件 - 减少延迟
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            const keyword = this.value.trim();
            performSearch(keyword);
        }, 100));
        
        // 添加提交表单事件处理
        const form = searchInput.closest('form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const keyword = searchInput.value.trim();
                performSearch(keyword);
            });
        }
    }

    // "/"键快捷打开搜索
    document.addEventListener('keydown', function(e) {
        if (e.key === "/" && 
            document.activeElement.tagName !== "INPUT" && 
            document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault();
            openSearchModal();
        }
    });
    
    // 如果URL中有搜索参数，自动打开搜索
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        if (searchQuery) {
            setTimeout(() => {
                openSearchModal();
                if (searchInput) {
                    searchInput.value = searchQuery;
                    performSearch(searchQuery);
                }
            }, 500);
        }
    } catch (e) {
        console.error('处理URL搜索参数错误:', e);
    }
    
    console.log('搜索模块初始化完成');
});
