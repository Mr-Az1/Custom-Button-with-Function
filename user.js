// ==UserScript==
// @name         Custom  Button with Function
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  Custom  Button with Function
// @author       Mr.Az
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // 全局变量
    const HOVER_TIME = 2000; // 悬停时间（毫秒）
    const MESSAGE_BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.75)'; // 消息框背景颜色

    // 定义组别和颜色主题
    const THEMES = {
        blue_dark: {
            bigBall: '#648bb8',
            bigBallActive: '#4f7ab5',
            bigBallText: 'white',
            smallBall: '#a2bbd8',
            smallBallText: 'white',
            hover: '#8a97c2',
            hoverText: 'white'
        },
        blue: {
            bigBall: '#84adea',
            bigBallActive: '#6c98d8',
            bigBallText: 'white',
            smallBall: '#cbdcf7',
            smallBallText: 'white',
            hover: '#a4b3e0',
            hoverText: 'white'
        },
        purple: {
            bigBall: '#bfa6d3',
            bigBallActive: '#9d7bb1',
            bigBallText: 'white',
            smallBall: '#cab9dc',
            smallBallText: 'white',
            hover: '#AD92CD',
            hoverText: 'white'
        },
        pink: {
            bigBall: '#BF265E',
            bigBallActive: '#9E1F49',
            bigBallText: 'white',
            smallBall: '#BF548F',
            smallBallText: 'white',
            hover: '#9D3E5D',
            hoverText: 'white'
        },
        green: {
            bigBall: '#02746f',
            bigBallActive: '#02605c',
            bigBallText: 'white',
            smallBall: '#009f93',
            smallBallText: 'white',
            hover: '#008e80',
            hoverText: 'white'
        },
        teal: {
            bigBall: '#4FB2B2',
            bigBallActive: '#3E99A3',
            bigBallText: 'white',
            smallBall: '#72C8C8',
            smallBallText: 'white',
            hover: '#5A9D9D',
            hoverText: 'white'
        }
    };

    // 定义组别
    const GROUPS = {
        blue_dark: {
            pages: [
                'https://www.luogu.com.cn/team/93863',
                'https://www.luogu.com.cn/team/90038',
                'https://www.luogu.com.cn/team/50545',
                'https://vjudge.net/group/shuangshi'
            ],
            labels: ['偷圈小分队', 'PumpkinOI', 'DTOJ', 'DTOJ - Vjudge'],
            theme: THEMES['blue_dark'],  // 选择对应的颜色主题
            name: 'OI 团队组'
        },
        blue: {
            pages: [
                'https://www.luogu.com.cn/team/93863',
                'https://www.luogu.com.cn/team/90038',
                'https://www.luogu.com.cn/team/50545'
            ],
            labels: ['偷圈小分队', 'PumpkinOI', 'DTOJ'],
            theme: THEMES['blue'],  // 选择对应的颜色主题
            name: 'OI 团队组'
        },
        purple: {
            pages: [
                'https://vjudge.net/article/7481',
                'https://www.luogu.com.cn/training/682590#problems',
                'https://www.luogu.com.cn/training/5035'
            ],
            labels: ['代码源题单', '网络流24题', '整体二分'],
            theme: THEMES['purple'],  // 选择对应的颜色主题
            name: '题单组'
        },
        pink: {
            pages: ['https://example.com/page1', 'https://example.com/page2', 'https://example.com/page3'],
            labels: ['Group 1', 'Group 2', 'Group 3'],
            theme: THEMES['pink'],  // 选择对应的颜色主题
            name: 'Pink Theme'
        },
        green: {
            pages: [
                'https://www.luogu.com.cn',
                'https://www.codeforces.com',
                'https://www.atcoder.jp',
                'https://www.daimayuan.top',
                'https://alg.tdogcode.com'
            ],
            labels: ['洛谷', 'Codeforces', 'atcoder', '代码源', 'TDOG'],
            theme: THEMES['green'],  // 选择对应的颜色主题
            name: 'OJ 组'
        },
        teal: {
            pages: [
                'https://www.luogu.com.cn',
                'https://www.codeforces.com',
                'https://www.atcoder.jp',
                'https://www.daimayuan.top',
                'https://alg.tdogcode.com'
            ],
            labels: ['洛谷', 'Codeforces', 'atcoder', '代码源', 'TDOG'],
            theme: THEMES['teal'],  // 选择对应的颜色主题
            name: 'OJ 组'
        }
    };

    // 获取用户上次选择的组别，默认为 "blue"
    let currentGroup = GM_getValue('selectedGroup', 'blue_dark');

    // 存储颜色主题变化的顺序
    const colorSequence = ['blue_dark', 'purple', 'teal'];

    // 应用主题样式
    function applyTheme(groupKey) {
        const group = GROUPS[groupKey];

        GM_addStyle(`
            #floatingButton {
                background-color: ${group.theme.bigBall};
                color: ${group.theme.bigBallText};
                transition: background-color 0.5s ease, color 0.5s ease;
                z-index: 9999;
            }
            #floatingButton.expanded {
                background-color: ${group.theme.bigBallActive};
            }
            .smallBall {
                background-color: ${group.theme.smallBall};
                color: ${group.theme.smallBallText};
                z-index: 9998;
            }
            .smallBall:hover {
                background-color: ${group.theme.hover};
                color: ${group.theme.hoverText};
            }
        `);
    }

    applyTheme(currentGroup);

    // 获取当前组别的页面和标签
    let pages = GROUPS[currentGroup].pages;
    let labels = GROUPS[currentGroup].labels;

    if (labels.length !== pages.length) {
        console.error('Error: labels 数组和 pages 数量不匹配！');
        return;
    }

    // 检查页面是否已存在按钮，如果存在，则删除旧按钮
    const existingButton = document.getElementById('floatingButton');
    if (existingButton) {
        existingButton.remove();
    }

    // 添加样式
    GM_addStyle(`
        #floatingButton {
            position: fixed;
            bottom: 30px;
            left: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            font-size: 20px;
            text-align: center;
            line-height: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 9999;
            user-select: none;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        #floatingButton .hamburger {
            width: 25px;
            height: 3px;
            background-color: white;
            position: relative;
            display: block;
        }

        #floatingButton .hamburger::before,
        #floatingButton .hamburger::after {
            content: '';
            width: 25px;
            height: 3px;
            background-color: white;
            position: absolute;
            left: 0;
            transition: all 0.3s ease;
        }

        #floatingButton .hamburger::before {
            top: -8px;
        }

        #floatingButton .hamburger::after {
            bottom: -8px;
        }

        #floatingButton.expanded .hamburger {
            background-color: transparent;
        }

        #floatingButton.expanded .hamburger::before {
            transform: rotate(45deg);
            top: 0;
        }

        #floatingButton.expanded .hamburger::after {
            transform: rotate(-45deg);
            bottom: 0;
        }

        #smallBallsContainer {
            position: fixed;
            bottom: 30px;
            left: 90px;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            opacity: 0;
            visibility: hidden;
            transform: translateX(-10px);
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
            z-index: 9998;
        }

        .smallBall {
            border-radius: 15px;
            padding: 5px 15px;
            min-width: 30px;
            height: 30px;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
            margin: 0 5px;
            transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
        }

        .smallBall:hover {
            transform: translateY(-5px);
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
        }

        #smallBallsContainer.show {
            opacity: 1;
            visibility: visible;
            transform: translateX(0);
        }

        #smallBallsContainer.hide {
            opacity: 0;
            visibility: hidden;
            transform: translateX(-10px);
        }

        #themeMessage {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            background-color: ${MESSAGE_BACKGROUND_COLOR}; /* 使用全局变量设置背景颜色 */
            color: white;
            border-radius: 8px;
            font-size: 16px;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.5s ease, visibility 0.5s ease;
            z-index: 9999;
        }

        #arrowToggle {
            position: fixed;
            bottom: 90px;
            left: 40px;
            width: 30px;
            height: 30px;
            background-color: #333;
            color: white;
            font-size: 20px;
            line-height: 30px;
            text-align: center;
            cursor: pointer;
            border-radius: 50%;
            z-index: 9999;
            opacity: 0.2;
            user-select: none;
            transition: opacity 0.3s ease;
        }

        #arrowToggle:hover {
            opacity: 1;
        }
    `);

    // 创建大球元素
    const bigBall = document.createElement('div');
    bigBall.id = 'floatingButton';

    // 创建汉堡菜单图标
    const hamburger = document.createElement('div');
    hamburger.classList.add('hamburger');
    bigBall.appendChild(hamburger);

    document.body.appendChild(bigBall);

    // 创建小球容器
    const smallBallsContainer = document.createElement('div');
    smallBallsContainer.id = 'smallBallsContainer';
    document.body.appendChild(smallBallsContainer);

    // 创建主题名称的弹出框
    const themeMessage = document.createElement('div');
    themeMessage.id = 'themeMessage';
    document.body.appendChild(themeMessage);

    const arrowToggle = document.createElement('div');
    arrowToggle.id = 'arrowToggle';
    arrowToggle.textContent = '←';
    document.body.appendChild(arrowToggle);

    let isArrowLeft = true;

    // 遍历 `pages` 和 `labels` 数组，创建小球
    function createSmallBalls(pages, labels, immediateUpdate = false) {
        smallBallsContainer.innerHTML = '';  // 清空容器
        pages.forEach((page, index) => {
            const smallBall = document.createElement('div');
            smallBall.classList.add('smallBall');
            smallBall.textContent = labels[index];
            smallBall.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(page, '_blank');
            });

            if (immediateUpdate) {
                smallBall.style.transition = 'none';  // 关闭过渡效果，立即更新
            }

            smallBallsContainer.appendChild(smallBall);
        });
    }

    createSmallBalls(pages, labels);

    // 显示主题消息
    function showThemeMessage(groupName) {
        themeMessage.textContent = `${groupName}`;
        themeMessage.style.opacity = 1;
        themeMessage.style.visibility = 'visible';

        setTimeout(() => {
            themeMessage.style.opacity = 0;
            themeMessage.style.visibility = 'hidden';
        }, HOVER_TIME); // 使用全局变量设置悬停时间
    }

    // 悬停时显示主题名称，持续设定的时间
    let hoverTimeout;
    bigBall.addEventListener('mouseenter', () => {
        themeMessage.textContent = GROUPS[currentGroup].name;
        themeMessage.style.opacity = 1;
        themeMessage.style.visibility = 'visible';

        // 清除之前的定时器，避免重复定时隐藏
        clearTimeout(hoverTimeout);

        hoverTimeout = setTimeout(() => {
            themeMessage.style.opacity = 0;
            themeMessage.style.visibility = 'hidden';
        }, HOVER_TIME); // 使用全局变量设置悬停时间
    });

    bigBall.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout); // 悬停离开时清除定时器
        themeMessage.style.opacity = 0;
        themeMessage.style.visibility = 'hidden';
    });

    // 监听大球左键点击事件，切换展开状态
    let isExpanded = false;
    let isAnimating = false;

    bigBall.addEventListener('click', (e) => {
        e.stopPropagation();

        // 如果正在动画，禁止重复点击
        if (isAnimating) return;

        isAnimating = true;
        if (isExpanded) {
            smallBallsContainer.classList.remove('show');
            bigBall.classList.remove('expanded');
        } else {
            smallBallsContainer.classList.add('show');
            bigBall.classList.add('expanded');
        }

        isExpanded = !isExpanded;

        // 设置动画完成后的回调
        setTimeout(() => {
            isAnimating = false;
        }, 500);  // 保证按钮和标题动画同步
    });

    // 监听右键点击事件，切换组别并更新目录
    bigBall.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        // 切换组别和颜色
        const previousExpandedState = isExpanded;
        smallBallsContainer.classList.remove('show');

        // 延迟切换颜色和更新小球内容
        setTimeout(() => {
            const currentIndex = colorSequence.indexOf(currentGroup);
            currentGroup = colorSequence[(currentIndex + 1) % colorSequence.length];
            GM_setValue('selectedGroup', currentGroup);
            applyTheme(currentGroup);

            const newPages = GROUPS[currentGroup].pages;
            const newLabels = GROUPS[currentGroup].labels;

            // 更新主题名称框
            showThemeMessage(GROUPS[currentGroup].name);

            // 创建新小球
            createSmallBalls(newPages, newLabels);

            if (previousExpandedState) {
                smallBallsContainer.classList.add('show');
            }
        }, 250);
    });

    // 点击页面空白处收起小球
    document.addEventListener('click', (e) => {
        if (!smallBallsContainer.contains(e.target) && !bigBall.contains(e.target)) {
            isExpanded = false;
            smallBallsContainer.classList.remove('show');
            bigBall.classList.remove('expanded');
        }
    });

    arrowToggle.addEventListener('click', () => {
        if (isArrowLeft) {
            bigBall.style.left = '-60px'; // 隐藏大球
            arrowToggle.textContent = '→';
        } else {
            bigBall.style.left = '30px'; // 显示大球
            arrowToggle.textContent = '←';
        }
        isArrowLeft = !isArrowLeft;
    });
})();
