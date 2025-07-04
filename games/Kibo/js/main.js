/**
 * 🤖 로봇 프로그래밍 게임 - 메인 게임 모듈
 * 게임 초기화와 전체적인 흐름을 관리하는 모듈
 */

class RobotGame {
    constructor() {
        this.gameState = null;
        this.robotController = null;
        this.uiController = null;
        this.isInitialized = false;
        
        // 게임 설정
        this.config = {
            version: '2.0.0',
            debug: false,
            autoSave: true,
            saveKey: 'robotGameSave'
        };
    }
    
    /**
     * 게임 초기화
     */
    async initialize() {
        try {
            console.log('🤖 로봇 프로그래밍 게임 초기화 중...');
            
            // 모듈들 초기화
            this.gameState = new GameState();
            this.robotController = new RobotController(this.gameState);
            this.uiController = new UIController(this.gameState, this.robotController);
            
            // UI 초기화
            this.uiController.initialize();
            
            // 상점들 초기 랜덤 배치
            this.gameState.randomizeStores();
            this.uiController.updateStores();
            
            // 추가 이벤트 설정
            this.setupGameEvents();
            
            // 자동 저장 설정
            if (this.config.autoSave) {
                this.setupAutoSave();
            }
            
            // 저장된 게임 로드 시도 (임시 비활성화)
            // this.loadGame();
            
            // 임시: 이전 저장 데이터 제거 (깨끗한 시작을 위해)
            localStorage.removeItem(this.config.saveKey);
            
            // 키보드 단축키 설정
            this.setupKeyboardShortcuts();
            
            this.isInitialized = true;
            console.log('✅ 게임 초기화 완료!');
            
            if (this.config.debug) {
                this.enableDebugMode();
            }
            
        } catch (error) {
            console.error('❌ 게임 초기화 실패:', error);
            this.uiController?.updateStatus('게임 초기화에 실패했어요! 😵');
        }
    }
    
    /**
     * 게임 이벤트 설정
     */
    setupGameEvents() {
        // 로봇 컨트롤러 이벤트
        this.robotController.on('onMove', (data) => {
            if (this.config.debug) {
                console.log('🚶 로봇 이동:', data);
            }
        });
        
        this.robotController.on('onGameOver', (data) => {
            console.log('💀 게임 오버:', data);
            this.saveGame(); // 게임 오버 시 자동 저장
        });
        
        // 윈도우 이벤트
        window.addEventListener('beforeunload', () => {
            if (this.config.autoSave) {
                this.saveGame();
            }
        });
        
        // 게임 오버 버튼 이벤트 (HTML에서 onclick 대신)
        const gameOverBtn = document.querySelector('.game-over-content .btn');
        if (gameOverBtn) {
            gameOverBtn.onclick = () => this.resetGame();
        }
        
        // 도움말 버튼 이벤트
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }
    }
    
    /**
     * 자동 저장 설정
     */
    setupAutoSave() {
        // 5초마다 자동 저장
        setInterval(() => {
            if (this.isInitialized && !this.gameState.isRunning) {
                this.saveGame(false); // 조용히 저장
            }
        }, 5000);
    }
    
    /**
     * 키보드 단축키 설정
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 게임 실행 중이면 단축키 무시
            if (this.gameState?.isRunning) return;
            
            switch (e.key) {
                case ' ': // 스페이스바 - 실행
                    e.preventDefault();
                    this.runProgram();
                    break;
                    
                case 'r': // R - 리셋
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.resetGame();
                    }
                    break;
                    
                case 'c': // C - 클리어
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.clearCommands();
                    }
                    break;
                    
                case 's': // Ctrl+S - 저장
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.saveGame(true);
                    }
                    break;
                    
                case 'l': // Ctrl+L - 로드
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.loadGame(true);
                    }
                    break;
                    
                case 'F1': // F1 - 도움말
                    e.preventDefault();
                    this.showHelp();
                    break;
                    
                case 'F12': // F12 - 디버그 모드
                    e.preventDefault();
                    this.toggleDebugMode();
                    break;
            }
        });
    }
    
    /**
     * 프로그램 실행
     */
    async runProgram() {
        if (this.uiController) {
            await this.uiController.runProgram();
        }
    }
    
    /**
     * 게임 리셋
     */
    resetGame() {
        if (this.uiController) {
            this.uiController.resetGame();
        }
    }
    
    /**
     * 명령어 클리어
     */
    clearCommands() {
        if (this.uiController) {
            this.uiController.clearCommands();
        }
    }
    
    /**
     * 게임 저장
     */
    saveGame(showMessage = true) {
        try {
            const saveData = {
                gameState: this.gameState.saveState(),
                timestamp: new Date().toISOString(),
                version: this.config.version
            };
            
            localStorage.setItem(this.config.saveKey, JSON.stringify(saveData));
            
            if (showMessage) {
                this.uiController?.updateStatus('게임이 저장되었어요! 💾');
            }
            
            return true;
        } catch (error) {
            console.error('게임 저장 실패:', error);
            if (showMessage) {
                this.uiController?.updateStatus('게임 저장에 실패했어요! 😵');
            }
            return false;
        }
    }
    
    /**
     * 게임 로드
     */
    loadGame(showMessage = false) {
        try {
            const savedData = localStorage.getItem(this.config.saveKey);
            if (!savedData) {
                if (showMessage) {
                    this.uiController?.updateStatus('저장된 게임이 없어요! 🤷‍♂️');
                }
                return false;
            }
            
            const saveData = JSON.parse(savedData);
            
            // 버전 호환성 체크
            if (saveData.version !== this.config.version) {
                console.warn('저장된 게임의 버전이 다릅니다:', saveData.version);
            }
            
            // 게임 상태 복원
            if (this.gameState.loadState(saveData.gameState)) {
                this.uiController?.updateRobotPosition();
                
                if (showMessage) {
                    this.uiController?.updateStatus('게임이 로드되었어요! 📂');
                }
                return true;
            }
            
        } catch (error) {
            console.error('게임 로드 실패:', error);
            if (showMessage) {
                this.uiController?.updateStatus('게임 로드에 실패했어요! 😵');
            }
        }
        
        return false;
    }
    
    /**
     * 디버그 모드 토글
     */
    toggleDebugMode() {
        this.config.debug = !this.config.debug;
        
        if (this.config.debug) {
            this.enableDebugMode();
        } else {
            this.disableDebugMode();
        }
        
        this.uiController?.updateStatus(`디버그 모드: ${this.config.debug ? 'ON' : 'OFF'}`);
    }
    
    /**
     * 디버그 모드 활성화
     */
    enableDebugMode() {
        console.log('🔧 디버그 모드 활성화');
        
        // 전역 디버그 함수들 추가
        window.debugGame = () => this.uiController.showDebugInfo();
        window.setSpeed = (speed) => this.uiController.setAnimationSpeed(speed);
        window.teleportRobot = (x, y, dir) => this.robotController.setPosition(x, y, dir);
        
        // 디버그 패널 추가 (간단한 버전)
        this.createDebugPanel();
    }
    
    /**
     * 디버그 모드 비활성화
     */
    disableDebugMode() {
        console.log('🔧 디버그 모드 비활성화');
        
        // 전역 디버그 함수들 제거
        delete window.debugGame;
        delete window.setSpeed;
        delete window.teleportRobot;
        
        // 디버그 패널 제거
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            debugPanel.remove();
        }
    }
    
    /**
     * 간단한 디버그 패널 생성
     */
    createDebugPanel() {
        const existing = document.getElementById('debugPanel');
        if (existing) existing.remove();
        
        const panel = document.createElement('div');
        panel.id = 'debugPanel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 200px;
        `;
        
        panel.innerHTML = `
            <div><strong>🔧 디버그 모드</strong></div>
            <div>F12: 디버그 토글</div>
            <div>Space: 실행</div>
            <div>Ctrl+R: 리셋</div>
            <div>Ctrl+C: 클리어</div>
            <div>Ctrl+S: 저장</div>
            <div>Ctrl+L: 로드</div>
        `;
        
        document.body.appendChild(panel);
    }
    
    /**
     * 도움말 표시
     */
    showHelp() {
        const helpText = `
🤖 로봇 프로그래밍 게임 도움말

📋 게임 방법:
• 오른쪽 카드들을 클릭해서 로봇을 즉시 조종하세요
• 각 카드를 클릭하면 로봇이 바로 움직입니다
• 로봇이 맵 밖으로 나가면 게임 오버입니다

🎮 조작법:
• Ctrl+R: 게임 리셋
• F1: 도움말
• F12: 디버그 모드

🃏 카드 종류:
• ⬆️ 전진: 현재 방향으로 한 칸 이동
• ⬇️ 후진: 현재 방향의 반대로 한 칸 이동
• ↪️ 우회전: 시계방향으로 90도 회전
• ↩️ 좌회전: 반시계방향으로 90도 회전
• GO: 인사말 (클릭해보세요!)
        `;
        
        alert(helpText);
    }
    
    /**
     * 게임 정보 반환
     */
    getGameInfo() {
        return {
            version: this.config.version,
            isInitialized: this.isInitialized,
            debug: this.config.debug,
            modules: {
                gameState: !!this.gameState,
                robotController: !!this.robotController,
                uiController: !!this.uiController
            }
        };
    }
}

// 게임 인스턴스 생성 및 전역 변수 설정
window.robotGame = new RobotGame();

// DOM 로드 완료 시 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    window.robotGame.initialize();
});

// 전역에서 접근 가능하도록 설정
window.RobotGame = RobotGame;

// 홈으로 이동하는 함수
function goHome() {
    // 부드러운 페이지 전환 효과
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = '../../index.html';
    }, 300);
}

// 게임 재시작 함수
function restartGame() {
    console.log('🔄 게임 재시작');
    
    // 게임 리셋 (모달 숨김은 resetGame에서 처리)
    if (window.robotGame && window.robotGame.uiController) {
        window.robotGame.resetGame();
    }
}

