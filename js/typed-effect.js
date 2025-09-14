document.addEventListener('DOMContentLoaded', function() {
  const typedOutput = document.getElementById('typed-output');

  // 支持多行文本，使用"|"分隔不同行
  const textArray = typedOutput ? typedOutput.getAttribute('data-text').split('|') : [];
  if (!textArray.length) return;

  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  // 改进速度设置，更接近自然打字节奏
  const baseTypeSpeed = 80;       // 降低基础打字速度，更自然
  const baseDeleteSpeed = 30;     // 加快删除速度
  const pauseBeforeDelete = 2000; // 延长读取时间
  const pauseBeforeType = 300;    // 缩短准备时间
  const pauseAfterPunctuation = 150; // 标点符号后额外暂停

  // 需要额外暂停的标点符号
  const punctuations = [',', '.', '!', '?', ';', ':', '，', '。', '！', '？', '；', '：'];

  function getRandomSpeed(baseSpeed) {
    // 更自然的随机速度变化，不同字符有不同的输入速度
    return Math.floor(baseSpeed * (0.7 + Math.random() * 0.6));
  }

  function type() {
    // 获取当前应该显示的文本行
    const currentText = textArray[lineIndex];

    // 根据当前状态截取要显示的文本
    const displayText = currentText.substring(0, charIndex);
    typedOutput.innerHTML = displayText + '<span class="cursor">|</span>';

    // 计算下一步的速度
    let speed;

    if (!isDeleting && charIndex < currentText.length) {
      // 正在打字
      const nextChar = currentText[charIndex];
      charIndex++;

      // 如果是标点符号，适当延长暂停时间
      if (punctuations.includes(nextChar)) {
        speed = getRandomSpeed(baseTypeSpeed) + pauseAfterPunctuation;
      } else {
        speed = getRandomSpeed(baseTypeSpeed);
      }
    } else if (isDeleting && charIndex > 0) {
      // 正在删除
      charIndex--;
      speed = getRandomSpeed(baseDeleteSpeed);
    } else if (!isDeleting && charIndex === currentText.length) {
      // 完成一行打字，准备删除
      isDeleting = true;
      speed = pauseBeforeDelete;
    } else if (isDeleting && charIndex === 0) {
      // 完成删除，准备下一行
      isDeleting = false;
      lineIndex = (lineIndex + 1) % textArray.length;
      speed = pauseBeforeType;
    }

    setTimeout(type, speed);
  }

  // 添加初始延迟，让页面加载完全后再开始打字
  setTimeout(type, 800);
});
