/**
 * 🤖 로봇 프로그래밍 게임 - 로봇 제어 모듈
 * 로봇의 움직임과 명령 실행을 담당하는 모듈
 */

class RobotController {
    constructor(gameState) {
        this.gameState = gameState;
        this.eventCallbacks = {
            onMove: [],
            onRotate: [],
            onGameOver: [],
            onCommandExecute: [],
            onBoundaryMove: [] // 경계 넘어가는 이벤트 추가
        };
    }
    
    /**
     * 이벤트 리스너 등록
     */
    on(event, callback) {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event].push(callback);
        }
    }
    
    /**
     * 이벤트 발생
     */
    emit(event, data) {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event].forEach(callback => callback(data));
        }
    }
    
    /**
     * 로봇 전진
     */
    moveForward() {
        const direction = this.gameState.getCurrentDirection();
        const newX = this.gameState.robot.x + direction.x;
        const newY = this.gameState.robot.y + direction.y;
        
        if (this.gameState.isInBounds(newX, newY)) {
            this.gameState.robot.x = newX;
            this.gameState.robot.y = newY;
            this.emit('onMove', { 
                x: newX, 
                y: newY, 
                direction: this.gameState.robot.direction,
                command: 'forward'
            });
            return true;
        } else {
            // 경계를 넘어가는 애니메이션 먼저 실행
            this.emit('onBoundaryMove', {
                targetX: newX,
                targetY: newY,
                direction: this.gameState.robot.direction,
                command: 'forward'
            });
            return false;
        }
    }
    
    /**
     * 로봇 후진
     */
    moveBackward() {
        const direction = this.gameState.getCurrentDirection();
        const newX = this.gameState.robot.x - direction.x;
        const newY = this.gameState.robot.y - direction.y;
        
        if (this.gameState.isInBounds(newX, newY)) {
            this.gameState.robot.x = newX;
            this.gameState.robot.y = newY;
            this.emit('onMove', { 
                x: newX, 
                y: newY, 
                direction: this.gameState.robot.direction,
                command: 'backward'
            });
            return true;
        } else {
            // 경계를 넘어가는 애니메이션 먼저 실행
            this.emit('onBoundaryMove', {
                targetX: newX,
                targetY: newY,
                direction: this.gameState.robot.direction,
                command: 'backward'
            });
            return false;
        }
    }
    
    /**
     * 로봇 우회전
     */
    turnRight() {
        this.gameState.robot.direction = (this.gameState.robot.direction + 1) % 4;
        this.emit('onRotate', { 
            direction: this.gameState.robot.direction,
            command: 'right'
        });
        return true;
    }
    
    /**
     * 로봇 좌회전
     */
    turnLeft() {
        this.gameState.robot.direction = (this.gameState.robot.direction + 3) % 4;
        this.emit('onRotate', { 
            direction: this.gameState.robot.direction,
            command: 'left'
        });
        return true;
    }
    
    /**
     * 명령 실행 (동기)
     */
    executeCommand(command) {
        this.emit('onCommandExecute', { command });
        
        switch (command) {
            case 'forward':
                return this.moveForward();
            case 'backward':
                return this.moveBackward();
            case 'right':
                return this.turnRight();
            case 'left':
                return this.turnLeft();
            default:
                console.warn('알 수 없는 명령:', command);
                return true;
        }
    }
    
    /**
     * 명령 실행 (비동기, 애니메이션 포함)
     */
    async executeCommandAsync(command) {
        const success = this.executeCommand(command);
        
        if (success) {
            // 정상 이동 시 UI 애니메이션이 완료될 때까지 대기
            await this.sleep(1200);
        } else {
            // 경계 넘어가는 경우 애니메이션 시간 대기
            await this.sleep(600);
        }
        
        return success;
    }
    
    /**
     * 프로그램 실행 (비동기)
     */
    async executeProgram(commands = this.gameState.commands) {
        if (this.gameState.isRunning || commands.length === 0) {
            return false;
        }
        
        this.gameState.isRunning = true;
        this.gameState.currentStep = 0;
        
        try {
            for (let i = 0; i < commands.length; i++) {
                this.gameState.currentStep = i;
                const command = commands[i];
                
                const success = this.executeCommand(command);
                
                if (!success) {
                    break; // 게임 오버
                }
                
                // 애니메이션 대기
                await this.sleep(this.gameState.config.animationSpeed);
            }
        } catch (error) {
            console.error('프로그램 실행 중 오류:', error);
        } finally {
            this.gameState.isRunning = false;
            this.gameState.currentStep = 0;
        }
        
        return true;
    }
    
    /**
     * 프로그램 실행 중지
     */
    stopProgram() {
        this.gameState.isRunning = false;
    }
    
    /**
     * 대기 함수
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 로봇의 현재 위치 정보 반환
     */
    getRobotInfo() {
        return {
            position: { x: this.gameState.robot.x, y: this.gameState.robot.y },
            direction: this.gameState.robot.direction,
            directionName: this.gameState.directions[this.gameState.robot.direction].name,
            isRunning: this.gameState.isRunning,
            currentStep: this.gameState.currentStep
        };
    }
    
    /**
     * 로봇을 특정 위치로 직접 이동 (디버그/테스트용)
     */
    setPosition(x, y, direction = null) {
        if (this.gameState.isInBounds(x, y)) {
            this.gameState.robot.x = x;
            this.gameState.robot.y = y;
            if (direction !== null) {
                this.gameState.robot.direction = direction % 4;
            }
            this.emit('onMove', { 
                x: x, 
                y: y, 
                direction: this.gameState.robot.direction,
                command: 'teleport'
            });
            return true;
        }
        return false;
    }
}

// 전역 로봇 컨트롤러 인스턴스
window.robotController = new RobotController(window.gameState);