document.addEventListener('keydown', function(event) {
    // 检查按下的是否是F12键
    if (event.key === 'F12') {
        // 显示提示框并添加动画
        var alertDiv = document.getElementById('agplAlert');
        alertDiv.style.display = 'block';
        alertDiv.classList.add('showAlert');
        setTimeout(function() {
            alertDiv.style.display = 'none';
            alertDiv.classList.remove('showAlert');
        }, 15000); // 15S
    }
});
