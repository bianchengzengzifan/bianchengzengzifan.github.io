// 添加代码复制功能
document.addEventListener('DOMContentLoaded', () => {
  // 获取所有带有highlight类名的代码块
  const codeBlocks = document.querySelectorAll('.highlight');

  codeBlocks.forEach(block => {
    // 创建复制按钮
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.className = 'copy-btn';

    // 创建按钮容器
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'copy-btn-wrapper';
    buttonWrapper.appendChild(copyButton);

    // 从代码块类名中提取语言
    const classes = block.className.split(' ');
    let lang = '';
    for (const cls of classes) {
      if (cls.startsWith('language-')) {
        lang = cls.replace('language-', '');
        break;
      }
    }

    // 设置语言标签
    if (lang) {
      block.setAttribute('data-lang', lang);
    }

    // 将按钮容器添加到代码块
    block.appendChild(buttonWrapper);

    // 为按钮添加点击事件
    copyButton.addEventListener('click', () => {
      // 获取代码块中的代码内容，不包括行号
      const codeLines = block.querySelectorAll('.code .line');
      let codeText = '';

      codeLines.forEach(line => {
        codeText += line.textContent + '\n';
      });

      // 将文本复制到剪贴板
      navigator.clipboard.writeText(codeText.trim()).then(() => {
        // 替换为优雅的提示
        const originalText = copyButton.textContent;
        copyButton.innerHTML = '✓ Copied';
        copyButton.style.background = 'rgba(80, 200, 120, 0.5)';
        copyButton.style.borderColor = 'rgba(80, 200, 120, 0.7)';

        setTimeout(() => {
          copyButton.textContent = originalText;
          copyButton.style.background = '';
          copyButton.style.borderColor = '';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  });
});
