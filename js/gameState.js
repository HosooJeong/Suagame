/**
 * 🤖 로봇 프로그래밍 게임 - 게임 상태 관리
 * 로봇의 위치, 방향, 명령어 등 게임 상태를 관리하는 모듈
 */

class GameState {
    constructor() {
        this.robot = {
            x: 2,           // 가운데 (0-4)
            y: 4,           // 맨 아래
            direction: 0    // 0:위, 1:오른쪽, 2:아래, 3:왼쪽
        };
        
        // 상점 위치 정보
        this.stores = {
            clothstore: { x: -1, y: -1 }, // 초기에는 비활성
            toystore: { x: -1, y: -1 }
        };
        
        this.commands = [];
        this.isRunning = false;
        this.currentStep = 0;
        this.score = 0;
        this.level = 1;
        
        // 방향 벡터 (위, 오른쪽, 아래, 왼쪽)
        this.directions = [
            {x: 0, y: -1, name: 'up'},
            {x: 1, y: 0, name: 'right'},
            {x: 0, y: 1, name: 'down'},
            {x: -1, y: 0, name: 'left'}
        ];
        
        // 게임 설정
        this.config = {
            gridWidth: 5,
            gridHeight: 5,
            maxCommands: 10,
            animationSpeed: 2400
        };
        
        // 초기 위치 저장 (리셋용)
        this.initialRobot = { ...this.robot };
    }
    
    /**
     * 로봇의 현재 방향 벡터 반환
     */
    getCurrentDirection() {
        return this.directions[this.robot.direction];
    }
    
    /**
     * 로봇이 맵 경계 내에 있는지 확인
     */
    isInBounds(x = this.robot.x, y = this.robot.y) {
        return x >= 0 && x < this.config.gridWidth && 
               y >= 0 && y < this.config.gridHeight;
    }
    
    /**
     * 명령어 추가
     */
    addCommand(command) {
        if (this.commands.length < this.config.maxCommands) {
            this.commands.push(command);
            return true;
        }
        return false;
    }
    
    /**
     * 명령어 제거
     */
    removeCommand(index) {
        if (index >= 0 && index < this.commands.length) {
            this.commands.splice(index, 1);
        }
    }
    
    /**
     * 모든 명령어 클리어
     */
    clearCommands() {
        this.commands = [];
    }
    
    /**
     * 로봇을 초기 위치로 리셋
     */
    resetRobot() {
        this.robot = { ...this.initialRobot };
        this.isRunning = false;
        this.currentStep = 0;
    }
    
    /**
     * 상점들을 랜덤 위치에 배치
     */
    randomizeStores() {
        const availablePositions = [];
        
        // 로봇 위치를 제외한 모든 위치 수집
        for (let x = 0; x < this.config.gridWidth; x++) {
            for (let y = 0; y < this.config.gridHeight; y++) {
                if (!(x === this.robot.x && y === this.robot.y)) {
                    availablePositions.push({ x, y });
                }
            }
        }
        
        // 상점들을 랜덤 위치에 배치
        const storeTypes = Object.keys(this.stores);
        
        for (const storeType of storeTypes) {
            if (availablePositions.length > 0) {
                const randomIndex = Math.floor(Math.random() * availablePositions.length);
                const position = availablePositions.splice(randomIndex, 1)[0];
                this.stores[storeType] = position;
            }
        }
        
        console.log('상점 배치 완료:', this.stores);
    }
    
    /**
     * 게임 완전 리셋
     */
    resetGame() {
        this.resetRobot();
        this.randomizeStores(); // 리셋할 때 상점도 다시 랜덤 배치
        // 명령어는 유지 (사용자가 다시 배치할 필요 없음)
    }
    
    /**
     * 게임 상태를 JSON으로 저장
     */
    saveState() {
        return JSON.stringify({
            robot: this.robot,
            commands: this.commands,
            score: this.score,
            level: this.level
        });
    }
    
    /**
     * JSON에서 게임 상태 복원
     */
    loadState(jsonState) {
        try {
            const state = JSON.parse(jsonState);
            this.robot = state.robot || this.initialRobot;
            this.commands = state.commands || [];
            this.score = state.score || 0;
            this.level = state.level || 1;
            return true;
        } catch (error) {
            console.error('게임 상태 로딩 실패:', error);
            return false;
        }
    }
    
    /**
     * 디버그 정보 출력
     */
    getDebugInfo() {
        return {
            robot: this.robot,
            commands: this.commands,
            isRunning: this.isRunning,
            currentStep: this.currentStep,
            direction: this.directions[this.robot.direction].name
        };
    }
}

// 전역 게임 상태 인스턴스
window.gameState = new GameState();