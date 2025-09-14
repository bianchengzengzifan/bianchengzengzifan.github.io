// 创建星空画布
const container = document.createElement('div');
container.id = 'starry-background';
document.body.appendChild(container);

// 创建Canvas元素
const canvas = document.createElement('canvas');
canvas.id = 'stars-canvas';
container.appendChild(canvas);

// 获取绘图上下文
const ctx = canvas.getContext('2d', { alpha: true });
let width = 0;
let height = 0;
let animationId = null;

// 星星和流星对象池
const stars = [];
const meteors = [];
const TOTAL_STARS = 300; // 保持星星数量稳定
const MAX_METEORS = 3; // 同时存在的最大流星数量

// 星星类 - 强化纯闪烁效果
class Star {
    constructor() {
        this.reset();
    }
    
    reset() {
        // 随机位置
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // 随机大小 - 减小星星尺寸
        this.size = Math.random() * 1.8 + 0.4; // 改为更小的尺寸范围
        // 基础亮度 - 更大亮度范围
        this.baseAlpha = Math.random() * 0.7 + 0.2;
        this.alpha = this.baseAlpha;
        
        // 闪烁效果参数 - 大幅增强闪烁效果
        this.twinkleMode = Math.floor(Math.random() * 3); // 0: 慢闪, 1: 中闪, 2: 快闪
        // 根据模式设置速度
        switch(this.twinkleMode) {
            case 0: // 慢闪
                this.twinkleSpeed = Math.random() * 0.007 + 0.003;
                this.twinkleDepth = Math.random() * 0.3 + 0.2; // 深度闪烁
                break;
            case 1: // 中闪
                this.twinkleSpeed = Math.random() * 0.02 + 0.01;
                this.twinkleDepth = Math.random() * 0.25 + 0.15; // 中等闪烁
                break;
            case 2: // 快闪
                this.twinkleSpeed = Math.random() * 0.04 + 0.02;
                this.twinkleDepth = Math.random() * 0.2 + 0.1; // 轻微闪烁
                break;
        }
        
        this.twinkleFactor = Math.random() * Math.PI * 2; // 随机起始相位
        // 生命周期 (15-25秒)
        this.lifespan = Math.random() * 10000 + 15000;
        this.birth = Date.now();
        // 是否处于消失状态
        this.dying = false;
        // 随机星星颜色
        this.colorType = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : -1;
        
        // 添加额外的闪烁效果 - 偶尔的亮闪
        this.flashInterval = Math.random() * 5000 + 3000; // 每3-8秒闪烁一次
        this.lastFlash = Date.now() - Math.random() * this.flashInterval;
        this.flashing = false;
        this.flashDuration = 300; // 闪烁持续300毫秒
    }
    
    update(timestamp) {
        const now = timestamp || Date.now();
        const age = now - this.birth;
        
        // 生命周期管理
        if (age > this.lifespan && !this.dying) {
            this.dying = true;
        }
        
        // 处理消失和出现的动画
        if (this.dying) {
            this.alpha -= 0.02; // 更快消失
            if (this.alpha <= 0) {
                this.reset();
                this.dying = false;
            }
            return;
        } else if (age < 1000) {
            // 出生后1秒内渐变出现
            this.alpha = Math.min(this.baseAlpha, age / 1000 * this.baseAlpha);
        }
        
        // 检查是否应该触发亮闪效果
        if (!this.flashing && now - this.lastFlash > this.flashInterval) {
            this.flashing = true;
            this.flashStart = now;
            this.lastFlash = now;
        }
        
        // 处理亮闪状态
        if (this.flashing) {
            const flashAge = now - this.flashStart;
            if (flashAge < this.flashDuration) {
                // 亮闪效果 - 快速变亮再变暗
                const flashProgress = flashAge / this.flashDuration;
                const flashBrightness = Math.sin(flashProgress * Math.PI) * 0.7;
                this.alpha = Math.min(1, this.baseAlpha + flashBrightness);
            } else {
                this.flashing = false;
            }
        } else {
            // 正常闪烁 - 使用不同模式的闪烁效果
            this.twinkleFactor += this.twinkleSpeed;
            const twinkle = Math.sin(this.twinkleFactor) * this.twinkleDepth;
            this.alpha = Math.max(0.05, Math.min(0.95, this.baseAlpha + twinkle));
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // 根据星星类型设置不同的颜色
        let color;
        switch(this.colorType) {
            case 0: // 淡蓝色星星
                color = `rgba(200, 220, 255, ${this.alpha})`;
                break;
            case 1: // 淡黄色星星
                color = `rgba(255, 250, 220, ${this.alpha})`;
                break;
            case 2: // 淡红色星星
                color = `rgba(255, 220, 220, ${this.alpha})`;
                break;
            default: // 普通白色星星
                color = `rgba(255, 255, 255, ${this.alpha})`;
        }
        
        ctx.fillStyle = color;
        ctx.fill();
        
        // 为较大的星星添加更明显的光晕效果 - 调整光晕尺寸
        if (this.size > 1.2) { // 降低光晕阈值以匹配更小的星星
            // 内光晕 - 减小光晕大小
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.8, 0, Math.PI * 2);
            ctx.fillStyle = color.replace(`, ${this.alpha})`, `, ${this.alpha * 0.18})`);
            ctx.fill();
            
            // 外光晕 - 仅适用于较大星星和闪烁状态
            if (this.size > 1.5 || this.flashing) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = color.replace(`, ${this.alpha})`, `, ${this.alpha * 0.08})`);
                ctx.fill();
            }
        }
    }
}

// 流星类
class Meteor {
    constructor() {
        this.reset();
    }
    
    reset() {
        // 起始位置 - 从屏幕上方随机位置开始
        this.x = Math.random() * width;
        this.y = -20; // 稍微在屏幕外开始
        // 速度和方向
        const angle = Math.PI / 4 + (Math.random() * Math.PI / 4); // 60-90度角
        const speed = 5 + Math.random() * 10; // 速度随机
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        // 尺寸和亮度
        this.size = Math.random() * 2 + 1;
        this.alpha = 0.7 + Math.random() * 0.3;
        // 尾巴长度
        this.tailLength = 80 + Math.random() * 60;
        // 是否激活
        this.active = true;
        // 历史位置 - 用于绘制尾巴
        this.positions = [];
        // 消失状态
        this.exiting = false;
        this.exitStartIndex = 0; // 从哪个索引开始消失
        this.exitSpeed = 2; // 每帧消失的段数
    }
    
    update() {
        // 移动流星
        this.x += this.vx;
        this.y += this.vy;
        
        // 如果流星还在活动状态，记录当前位置
        if (!this.exiting) {
            this.positions.unshift({ x: this.x, y: this.y, alpha: this.alpha });
            
            // 只保留尾巴最近的部分
            if (this.positions.length > this.tailLength) {
                this.positions.pop();
            }
            
            // 检查流星是否离开屏幕 - 只有头部离开才开始消失
            if (this.x > width || this.x < 0 || this.y > height || this.y < -50) {
                this.exiting = true;
                this.exitStartIndex = 0; // 从尾巴尖开始消失
            }
        } else {
            // 流星已经开始消失过程
            // 不再添加新的位置，只是让尾巴逐渐缩短
            if (this.positions.length > 0) {
                // 从尾巴尖开始逐渐删除段
                this.exitStartIndex += this.exitSpeed;
                // 删除应该消失的部分
                while (this.positions.length > 0 && 
                       this.positions.length - this.exitStartIndex <= 0) {
                    this.positions.pop(); // 从尾部删除
                }
            } else {
                // 尾巴完全消失了，标记为不活跃
                this.active = false;
            }
        }
    }
    
    draw() {
        // 如果已经开始退出且没有尾巴，不绘制
        if (this.exiting && this.positions.length === 0) {
            return;
        }
        
        // 如果还没开始退出，绘制流星头部
        if (!this.exiting) {
            // 绘制流星头部
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.fill();
            
            // 绘制流星外部光晕
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.3})`;
            ctx.fill();
        }
        
        // 绘制流星尾巴
        for (let i = 1; i < this.positions.length; i++) {
            const prev = this.positions[i-1];
            const current = this.positions[i];
            
            // 如果在退出状态，计算相对消失位置
            let segmentAlpha;
            if (this.exiting) {
                // 计算这段是否需要消失
                const relativeIndex = this.positions.length - i;
                // 如果这段在消失范围内，减少它的透明度
                if (relativeIndex <= this.exitStartIndex) {
                    // 已经完全消失的段
                    continue;
                } else if (relativeIndex <= this.exitStartIndex + 10) {
                    // 正在消失的段 - 根据距离渐变
                    const fadeProgress = (relativeIndex - this.exitStartIndex) / 10;
                    segmentAlpha = fadeProgress * (1 - i / this.positions.length) * this.alpha * 0.8;
                } else {
                    // 正常显示的段
                    segmentAlpha = (1 - i / this.positions.length) * this.alpha * 0.8;
                }
            } else {
                // 正常状态下的透明度计算
                segmentAlpha = (1 - i / this.positions.length) * this.alpha * 0.8;
            }
            
            // 绘制尾巴段
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(current.x, current.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${segmentAlpha})`;
            ctx.lineWidth = this.size * (1 - i / this.positions.length) * 1.2;
            ctx.stroke();
        }
    }
}

// 初始化画布大小
function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    // 调整现有星星位置
    if (stars.length > 0) {
        for (let star of stars) {
            if (star.x > width || star.y > height) {
                star.x = Math.random() * width;
                star.y = Math.random() * height;
            }
        }
    }
}

// 创建星星
function initStars() {
    for (let i = 0; i < TOTAL_STARS; i++) {
        const star = new Star();
        // 初始化时分布在各个生命周期
        star.birth = Date.now() - Math.random() * star.lifespan;
        stars.push(star);
    }
}

// 可能创建新流星 - 增加出现频率
function createMeteorIfNeeded() {
    // 检查流星数量
    const activeMeteors = meteors.filter(meteor => meteor.active).length;
    
    // 随机决定是否创建新流星 (增加概率到0.5%)
    if (activeMeteors < MAX_METEORS && Math.random() < 0.005) {
        meteors.push(new Meteor());
    }
    
    // 移除不活跃的流星
    for (let i = meteors.length - 1; i >= 0; i--) {
        if (!meteors[i].active) {
            meteors.splice(i, 1);
        }
    }
}

// 动画循环
function animate(timestamp) {
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 更新并绘制星星
    for (let star of stars) {
        star.update(timestamp);
        star.draw();
    }
    
    // 可能创建新流星
    createMeteorIfNeeded();
    
    // 更新并绘制流星
    for (let meteor of meteors) {
        meteor.update();
        meteor.draw();
    }
    
    animationId = requestAnimationFrame(animate);
}

// 性能优化：使用节流函数限制窗口大小调整的频率
function throttle(callback, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            callback(...args);
        }
    };
}

// 初始化
window.addEventListener('resize', throttle(resizeCanvas, 200));

// 页面可见性变化时优化性能
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
    } else {
        animationId = requestAnimationFrame(animate);
    }
});

// 启动
resizeCanvas();
initStars();
animationId = requestAnimationFrame(animate);