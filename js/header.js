document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');

    // 添加汉堡菜单
    function setupMobileMenu() {
        if (!header) return;

        // 检查是否已经存在汉堡菜单
        if (header.querySelector('.hamburger')) return;

        // 创建汉堡菜单按钮
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.setAttribute('aria-label', '菜单'); // 添加无障碍标签
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        // 添加到header
        header.appendChild(hamburger);

        // 获取菜单列表
        const menuList = header.querySelector('ul');

        // 汉堡菜单点击事件
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            menuList.classList.toggle('active');

            // 切换无障碍属性
            const expanded = this.classList.contains('active');
            this.setAttribute('aria-expanded', expanded);
        });

        // 点击链接后关闭菜单
        const menuLinks = menuList.querySelectorAll('a, button');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                menuList.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 高亮当前页面
    function highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const menuLinks = document.querySelectorAll('header a');

        menuLinks.forEach(link => {
            const href = link.getAttribute('href');

            // 处理首页特殊情况
            if (href === '/' && (currentPath === '/' || currentPath === '/index.html')) {
                link.classList.add('active');
            }
            // 处理其他页面
            else if (href !== '/' && currentPath.startsWith(href)) {
                link.classList.add('active');
            }
        });
    }

    // 滚动隐藏/显示导航
    function setupScrollBehavior() {
        let lastScrollTop = 0;

        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // 向下滚动超过100px时隐藏导航
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.classList.add('scroll-down');
            }
            // 向上滚动时显示导航
            else if (scrollTop < lastScrollTop) {
                header.classList.remove('scroll-down');
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    }

    // 初始化
    setupMobileMenu();
    highlightCurrentPage();
    setupScrollBehavior();

    // 确保汉堡菜单在窗口调整大小时正常显示
    window.addEventListener('resize', function() {
        setupMobileMenu(); // 每次调整大小都检查汉堡菜单
    });
});
