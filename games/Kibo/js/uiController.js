/**
 * 🤖 로봇 프로그래밍 게임 - UI 컨트롤러
 * 드래그앤드롭, DOM 조작, 시각적 피드백을 담당하는 모듈
 */

class UIController {
    constructor(gameState, robotController) {
        this.gameState = gameState;
        this.robotController = robotController;
        this.elements = {};
        this.currentHighlight = -1;
        this.sparkleInterval = null; // 반짝반짝 효과 인터벌
        this.particlesContainer = null;
        this.isOnStore = false; // 상점 위 상태 추적
        this.programExecuted = false; // 프로그램 실행 여부 추적
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeParticles();
    }
    
    /**
     * DOM 요소들 초기화
     */
    initializeElements() {
        this.elements = {
            grid: document.getElementById('grid'),
            cardDeck: document.getElementById('cardDeck'),
            gameOver: document.getElementById('gameOver'),
            quickResetBtn: document.getElementById('quickResetBtn')
        };
    }
    
    /**
     * 파티클 시스템 초기화
     */
    initializeParticles() {
        this.particlesContainer = document.getElementById('particlesContainer');
        if (!this.particlesContainer) {
            console.error('파티클 컨테이너를 찾을 수 없습니다!');
        }
    }
    
    /**
     * 반짝반짝 효과 생성
     */
    createSparklesAtPosition(x, y, count = 6) {
        if (!this.particlesContainer) return;
        
        const colors = ['gold', 'pink', 'blue', 'purple', 'green'];
        const sizes = ['small', '', 'large'];
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                
                // 랜덤 색상과 크기 적용
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
                
                sparkle.classList.add(randomColor);
                if (randomSize) {
                    sparkle.classList.add(randomSize);
                }
                
                // 위치 주변에 랜덤하게 배치
                const offsetX = (Math.random() - 0.5) * 40;
                const offsetY = (Math.random() - 0.5) * 40;
                
                sparkle.style.left = (x + offsetX) + 'px';
                sparkle.style.top = (y + offsetY) + 'px';
                
                // 랜덤 애니메이션 지연
                sparkle.style.animationDelay = Math.random() * 0.3 + 's';
                
                this.particlesContainer.appendChild(sparkle);
                
                // 애니메이션 끝나면 제거
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1500);
            }, i * 100); // 각 반짝이마다 약간의 시간차
        }
    }
    
    /**
     * 로봇 위치에서 반짝반짝 효과 생성
     */
    createSparklesAtRobot() {
        const robotElement = document.querySelector('.robot');
        if (!robotElement) return;
        
        const robotRect = robotElement.getBoundingClientRect();
        const centerX = robotRect.left + robotRect.width / 2;
        const centerY = robotRect.top + robotRect.height / 2;
        
        this.createSparklesAtPosition(centerX, centerY, 4);
    }
    
    /**
     * 상점 위 로봇 감지 및 반짝반짝 효과 시작/중지
     */
    checkRobotOnStore() {
        const robotX = this.gameState.robot.x;
        const robotY = this.gameState.robot.y;
        
        // 로봇이 상점 위에 있는지 확인
        const isOnStore = Object.values(this.gameState.stores).some(store => 
            store.x === robotX && store.y === robotY
        );
        
        // 상태 변화 감지
        if (isOnStore && !this.isOnStore) {
            // 상점에 처음 도착
            this.startStoreSparkles();
            this.addStoreCellEffect();
            console.log('로봇이 상점에 도착! 반짝반짝 시작! ✨');
        } else if (!isOnStore && this.isOnStore) {
            // 상점에서 떠남
            this.stopStoreSparkles();
            this.removeStoreCellEffect();
            console.log('로봇이 상점에서 떠남. 반짝반짝 중지.');
        }
        
        this.isOnStore = isOnStore;
    }
    
    /**
     * 상점 반짝반짝 효과 시작
     */
    startStoreSparkles() {
        if (this.sparkleInterval) {
            clearInterval(this.sparkleInterval);
        }
        
        // 즉시 한 번 실행
        this.createSparklesAtRobot();
        
        // 800ms마다 반짝반짝 효과 반복
        this.sparkleInterval = setInterval(() => {
            if (this.isOnStore) {
                this.createSparklesAtRobot();
            }
        }, 800);
    }
    
    /**
     * 상점 반짝반짝 효과 중지
     */
    stopStoreSparkles() {
        if (this.sparkleInterval) {
            clearInterval(this.sparkleInterval);
            this.sparkleInterval = null;
        }
    }
    
    /**
     * 상점 셀 강조 효과 추가
     */
    addStoreCellEffect() {
        const robotX = this.gameState.robot.x;
        const robotY = this.gameState.robot.y;
        const cell = document.querySelector(`[data-x="${robotX}"][data-y="${robotY}"]`);
        
        if (cell) {
            cell.classList.add('robot-on-store');
        }
    }
    
    /**
     * 상점 셀 강조 효과 제거
     */
    removeStoreCellEffect() {
        const cells = document.querySelectorAll('.cell.robot-on-store');
        cells.forEach(cell => {
            cell.classList.remove('robot-on-store');
        });
    }
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 로봇 컨트롤러 이벤트
        this.robotController.on('onMove', (data) => {
            this.updateRobotPosition();
            this.checkRobotOnStore(); // 상점 위 로봇 확인
        });
        this.robotController.on('onRotate', (data) => this.updateRobotPosition());
        this.robotController.on('onGameOver', (data) => this.showGameOver(data));
        this.robotController.on('onBoundaryMove', (data) => this.handleBoundaryMove(data)); // 경계 넘어가는 이벤트
        
        // 리셋 버튼 이벤트
        if (this.elements.quickResetBtn) {
            this.elements.quickResetBtn.addEventListener('click', () => this.resetGame());
        }
    }
    
    /**
     * 게임 초기화
     */
    initialize() {
        this.createGrid();
        this.setupCardEvents();
        this.updateRobotPosition();
        this.updateStores(); // 상점 표시 초기화
        
        // 초기화 후 상점 확인
        setTimeout(() => {
            this.checkRobotOnStore();
        }, 100);
    }
    
    /**
     * 격자 생성
     */
    createGrid() {
        this.elements.grid.innerHTML = '';
        
        for (let y = 0; y < this.gameState.config.gridHeight; y++) {
            for (let x = 0; x < this.gameState.config.gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                this.elements.grid.appendChild(cell);
            }
        }
    }
    
    /**
     * 카드 이벤트 설정
     */
    setupCardEvents() {
        const cards = this.elements.cardDeck.querySelectorAll('.card[draggable="true"]');
        const goCard = this.elements.cardDeck.querySelector('.go-card');
        const slots = document.querySelectorAll('.slot');
        
        // 명령 카드 드래그 이벤트
        cards.forEach(card => {
            // 드래그 시작
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.dataset.command);
                e.dataTransfer.setData('text/html', card.outerHTML);
                card.classList.add('dragging');
            });
            
            // 드래그 끝
            card.addEventListener('dragend', (e) => {
                card.classList.remove('dragging');
            });
            
            // 직접 클릭 이벤트 (슬롯에 추가하도록 변경)
            card.addEventListener('click', () => {
                const command = card.dataset.command;
                const nextAvailableSlot = this.getNextAvailableSlot();
                
                if (nextAvailableSlot) {
                    this.addCommandToSlot(nextAvailableSlot, command, card.outerHTML);
                } else {
                    console.log('슬롯이 가득 찼어요! 🚫');
                }
            });
        });
        
        // 슬롯 드롭 이벤트
        slots.forEach(slot => {
            // 드래그 오버
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation(); // 이벤트 버블링 방지
                const nextAvailableSlot = this.getNextAvailableSlot();
                
                // 모든 슬롯에서 기존 drop-target 제거
                document.querySelectorAll('.slot.drop-target').forEach(s => {
                    s.classList.remove('drop-target');
                });
                
                // 다음 사용 가능한 슬롯에만 drop-target 추가
                if (nextAvailableSlot) {
                    nextAvailableSlot.classList.add('drop-target');
                }
            });
            
            // 드래그 리브
            slot.addEventListener('dragleave', (e) => {
                e.stopPropagation(); // 이벤트 버블링 방지
                // 전체 슬롯 영역을 벗어났을 때만 제거
                const rect = document.querySelector('.programming-slots').getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                
                if (x < rect.left - 20 || x > rect.right + 20 || 
                    y < rect.top - 20 || y > rect.bottom + 20) {
                    document.querySelectorAll('.slot.drop-target').forEach(s => {
                        s.classList.remove('drop-target');
                    });
                }
            });
            
            // 드롭 - 이것은 제거하고 전체 영역에서만 처리
            // slot.addEventListener('drop', (e) => {
            //     이 드롭 이벤트를 제거해서 중복 실행 방지
            // });
            
            // 슬롯 클릭으로 제거
            slot.addEventListener('click', () => {
                if (slot.classList.contains('filled')) {
                    this.removeCommandFromSlot(slot);
                }
            });
        });
        
        // GO 카드 클릭 이벤트
        if (goCard) {
            goCard.addEventListener('click', () => {
                this.runProgramFromSlots();
            });
        }
        
        // 전체 슬롯 영역에서도 드롭 처리 (드롭 범위 확장)
        const programmingSlots = document.querySelector('.programming-slots');
        if (programmingSlots) {
            programmingSlots.addEventListener('dragover', (e) => {
                e.preventDefault();
                const nextAvailableSlot = this.getNextAvailableSlot();
                
                // 모든 슬롯에서 기존 drop-target 제거
                document.querySelectorAll('.slot.drop-target').forEach(s => {
                    s.classList.remove('drop-target');
                });
                
                // 다음 사용 가능한 슬롯에만 drop-target 추가
                if (nextAvailableSlot) {
                    nextAvailableSlot.classList.add('drop-target');
                }
            });
            
            programmingSlots.addEventListener('drop', (e) => {
                e.preventDefault();
                document.querySelectorAll('.slot.drop-target').forEach(s => {
                    s.classList.remove('drop-target');
                });
                
                const nextAvailableSlot = this.getNextAvailableSlot();
                
                if (nextAvailableSlot) {
                    const command = e.dataTransfer.getData('text/plain');
                    const cardHtml = e.dataTransfer.getData('text/html');
                    
                    this.addCommandToSlot(nextAvailableSlot, command, cardHtml);
                }
            });
        }
    }
    
    /**
     * 로봇 위치 업데이트 (부드러운 애니메이션 포함)
     */
    updateRobotPosition() {
        const cells = document.querySelectorAll('.cell');
        const targetCell = Array.from(cells).find(cell => 
            parseInt(cell.dataset.x) === this.gameState.robot.x && 
            parseInt(cell.dataset.y) === this.gameState.robot.y
        );
        
        let robotElement = document.querySelector('.robot');
        
        // 로봇이 처음 생성되는 경우
        if (!robotElement && targetCell) {
            robotElement = document.createElement('div');
            robotElement.className = `robot direction-${this.gameState.robot.direction}`;
            robotElement.dataset.currentAngle = '0'; // 초기 각도 저장
            
            // 로봇 이미지 추가
            const robotImg = document.createElement('img');
            robotImg.src = 'img/친근한 로봇 캐릭터.png';
            robotImg.alt = '로봇';
            robotImg.style.transform = 'rotate(0deg)'; // 초기 회전
            robotElement.appendChild(robotImg);
            
            targetCell.appendChild(robotElement);
            return;
        }
        
        // 로봇이 이미 존재하는 경우 부드럽게 이동
        if (robotElement && targetCell) {
            // 리셋 시 로봇 스타일 완전 초기화
            this.resetRobotStyles(robotElement);
            this.animateRobotMovement(robotElement, targetCell);
        }
    }
    
    /**
     * 로봇 스타일 완전 초기화
     */
    resetRobotStyles(robotElement) {
        // 모든 애니메이션 관련 스타일 제거
        robotElement.style.position = '';
        robotElement.style.left = '';
        robotElement.style.top = '';
        robotElement.style.zIndex = '';
        robotElement.style.transition = '';
        robotElement.style.opacity = ''; // 투명도 초기화
        
        console.log('로봇 스타일 초기화 완료');
    }
    async animateRobotMovement(robotElement, targetCell) {
        const currentCell = robotElement.parentElement;
        const currentRect = currentCell.getBoundingClientRect();
        const targetRect = targetCell.getBoundingClientRect();
        
        // 이동 거리 계산
        const deltaX = targetRect.left - currentRect.left;
        const deltaY = targetRect.top - currentRect.top;
        
        // 발자국 효과 생성
        this.createFootprint(currentCell);
        
        // 스마트 회전: 방향 전환시 90도씩만 회전하도록 제어
        this.updateRobotDirection(robotElement);
        
        // 이동이 있는 경우에만 애니메이션
        if (deltaX !== 0 || deltaY !== 0) {
            // 로봇 움직임 애니메이션 클래스 추가
            robotElement.classList.add('moving');
            
            // 로봇을 grid 컨테이너에 절대 위치로 이동 (애니메이션 위해)
            const gridContainer = document.querySelector('.grid');
            const gridRect = gridContainer.getBoundingClientRect();
            const robotRect = robotElement.getBoundingClientRect();
            
            // 현재 위치를 절대 좌표로 설정
            robotElement.style.position = 'absolute';
            robotElement.style.left = (robotRect.left - gridRect.left) + 'px';
            robotElement.style.top = (robotRect.top - gridRect.top) + 'px';
            robotElement.style.zIndex = '1000';
            
            // grid 컨테이너에 로봇 추가
            gridContainer.appendChild(robotElement);
            
            // 강제로 스타일 적용
            robotElement.offsetHeight;
            
            // 애니메이션으로 새 위치로 이동
            robotElement.style.transition = 'left 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            robotElement.style.left = (targetRect.left - gridRect.left) + 'px';
            robotElement.style.top = (targetRect.top - gridRect.top) + 'px';
            
            // 애니메이션 완료 대기
            await new Promise(resolve => {
                setTimeout(() => {
                    // 애니메이션 후 원래 방식으로 복구
                    robotElement.style.position = '';
                    robotElement.style.left = '';
                    robotElement.style.top = '';
                    robotElement.style.zIndex = '';
                    robotElement.style.transition = '';
                    robotElement.classList.remove('moving');
                    
                    // 타겟 셀에 로봇 추가
                    targetCell.appendChild(robotElement);
                    
                    // 상점 도달 체크
                    this.checkStoreArrival(targetCell, robotElement);
                    
                    resolve();
                }, 1200); // 애니메이션 시간과 맞춤
            });
        }
    }
    
    /**
     * 상점들 표시 업데이트
     */
    updateStores() {
        // 기존 상점 이미지 제거
        document.querySelectorAll('.store').forEach(store => store.remove());
        
        // 새로운 상점 이미지 추가
        Object.entries(this.gameState.stores).forEach(([storeType, position]) => {
            if (position.x >= 0 && position.y >= 0) {
                const targetCell = document.querySelector(`[data-x="${position.x}"][data-y="${position.y}"]`);
                
                if (targetCell) {
                    const storeElement = document.createElement('div');
                    storeElement.className = 'store';
                    storeElement.dataset.storeType = storeType;
                    
                    const storeImg = document.createElement('img');
                    storeImg.src = `img/${storeType}.png`;
                    storeImg.alt = storeType;
                    
                    storeElement.appendChild(storeImg);
                    targetCell.appendChild(storeElement);
                }
            }
        });
    }
    /**
     * 발자국 효과 생성
     */
    createFootprint(cell) {
        const footprint = document.createElement('div');
        footprint.className = 'footprint';
        
        // 셀 중앙에 위치
        footprint.style.left = '50%';
        footprint.style.top = '50%';
        footprint.style.transform = 'translate(-50%, -50%)';
        
        cell.appendChild(footprint);
        
        // 애니메이션 완료 후 제거
        setTimeout(() => {
            if (footprint.parentNode) {
                footprint.parentNode.removeChild(footprint);
            }
        }, 2000);
    }
    
    /**
     * 상점 도달 체크 및 축하 애니메이션
     */
    checkStoreArrival(targetCell, robotElement) {
        const storeElement = targetCell.querySelector('.store');
        if (storeElement) {
            // 축하 애니메이션 실행
            robotElement.classList.add('celebrating');
            
            // 상점 위치에서 반짝이 효과
            this.createSparklesAtRobot();
            
            // 축하 애니메이션 완료 후 클래스 제거
            setTimeout(() => {
                robotElement.classList.remove('celebrating');
            }, 2000);
        }
    }
    
    updateRobotDirection(robotElement) {
        const img = robotElement.querySelector('img');
        
        // 회전 애니메이션 클래스 추가
        robotElement.classList.add('rotating');
        
        // 현재 저장된 각도 가져오기 (없으면 0)
        let currentAngle = parseInt(robotElement.dataset.currentAngle || '0');
        const targetAngle = this.gameState.robot.direction * 90;
        
        // 각도 차이 계산
        let angleDiff = targetAngle - currentAngle;
        
        // 회전 애니메이션 완료 후 클래스 제거
        setTimeout(() => {
            robotElement.classList.remove('rotating');
        }, 600);
        
        // 가장 짧은 경로로 회전 (-180 ~ 180 범위)
        if (angleDiff > 180) {
            angleDiff -= 360;
        } else if (angleDiff < -180) {
            angleDiff += 360;
        }
        
        // 새로운 각도 계산
        const newAngle = currentAngle + angleDiff;
        
        // 로봇 회전 적용
        img.style.transform = `rotate(${newAngle}deg)`;
        
        // 새로운 각도 저장
        robotElement.dataset.currentAngle = newAngle.toString();
        
        // 방향 클래스 업데이트
        robotElement.className = `robot direction-${this.gameState.robot.direction}`;
    }
    
    /**
     * 명령 즉시 실행
     */
    async executeCommand(command) {
        if (this.gameState.isRunning) {
            console.log('로봇이 이미 움직이고 있어요!');
            return;
        }
        
        try {
            console.log(`${this.getCommandDisplayName(command)} 실행 중... 🤖`);
            
            // 명령 비동기 실행 (애니메이션 포함)
            const success = await this.robotController.executeCommandAsync(command);
            
            if (success) {
                console.log(`${this.getCommandDisplayName(command)} 완료! 🎉`);
            } else {
                console.log('명령 실행에 실패했어요!');
            }
        } catch (error) {
            console.error('명령 실행 오류:', error);
        }
    }
    

    
    /**
     * 명령어 표시 이름 반환
     */
    getCommandDisplayName(command) {
        const names = {
            'forward': '전진',
            'backward': '후진',
            'right': '우회전',
            'left': '좌회전'
        };
        return names[command] || command;
    }
    
    /**
     * 프로그램 실행 (더 이상 사용하지 않음)
     */
    async runProgram() {
        this.updateStatus('GO 버튼이 뢌렸어요! 🚀 이제 카드를 개별로 클릭해서 로봇을 조종하세요!');
    }
    
    /**
     * 게임 리셋
     */
    resetGame() {
        // 반짝반짝 효과 중지
        this.stopStoreSparkles();
        this.removeStoreCellEffect();
        this.isOnStore = false;
        this.programExecuted = false; // 프로그램 실행 플래그 리셋
        
        this.gameState.resetGame();
        this.updateRobotPosition();
        this.updateStores(); // 상점 위치도 업데이트
        this.clearAllSlots(); // 슬롯들도 모두 초기화
        this.elements.gameOver.classList.add('hidden');
        
        
        // 모든 모달 숨기기
        this.hideAllModals();
        
        // 리셋 후 상점 확인
        setTimeout(() => {
            this.checkRobotOnStore();
        }, 100);
    }
    
    /**
     * 명령어 클리어 (더 이상 사용하지 않음)
     */
    clearCommands() {
        this.updateStatus('클리어 버튼이 뉤렸어요! 🗑️ 이제 즉시 실행 모드에서는 클리어가 필요 없어요.');
    }
    
    /**
     * 현재 실행 중인 명령 하이라이트 (더 이상 사용하지 않음)
     */
    highlightCommand(data) {
        // 즉시 실행 모드에서는 하이라이트가 필요 없음
    }
    
    /**
     * 하이라이트 제거 (더 이상 사용하지 않음)
     */
    clearHighlight() {
        // 즉시 실행 모드에서는 하이라이트가 필요 없음
        this.currentHighlight = -1;
    }
    
    /**
     * 게임 오버 표시
     */
    showGameOver(data) {
        this.elements.gameOver.classList.remove('hidden');
        const reason = data.reason === 'boundary' ? '로봇이 맵 밖으로 나갔어요!' : '게임 오버!';
        
        const gameOverContent = this.elements.gameOver.querySelector('.game-over-content p');
        if (gameOverContent) {
            gameOverContent.textContent = reason;
        }
    }
    
    /**
     * 경계를 넘어가는 애니메이션 처리
     */
    async handleBoundaryMove(data) {
        console.log('경계를 넘어가는 애니메이션 시작:', data);
        
        const robotElement = document.querySelector('.robot');
        if (!robotElement) return;
        
        // 가상의 타겟 셀 생성 (경계 밖)
        const gridContainer = document.querySelector('.grid');
        const gridRect = gridContainer.getBoundingClientRect();
        const cellSize = 100; // 셀 크기
        const gap = 3; // 간격
        
        // 타겟 좌표 계산 (경계 밖 위치)
        let targetX, targetY;
        
        if (data.targetX < 0) {
            // 왼쪽 경계 넘어감
            targetX = -cellSize;
            targetY = data.targetY * (cellSize + gap) + 15; // padding 고려
        } else if (data.targetX >= this.gameState.config.gridWidth) {
            // 오른쪽 경계 넘어감
            targetX = this.gameState.config.gridWidth * (cellSize + gap) - gap;
            targetY = data.targetY * (cellSize + gap) + 15;
        } else if (data.targetY < 0) {
            // 위쪽 경계 넘어감
            targetX = data.targetX * (cellSize + gap) + 15;
            targetY = -cellSize;
        } else if (data.targetY >= this.gameState.config.gridHeight) {
            // 아래쪽 경계 넘어감
            targetX = data.targetX * (cellSize + gap) + 15;
            targetY = this.gameState.config.gridHeight * (cellSize + gap) - gap;
        }
        
        // 로봇을 절대 위치로 설정
        const robotRect = robotElement.getBoundingClientRect();
        robotElement.style.position = 'absolute';
        robotElement.style.left = (robotRect.left - gridRect.left) + 'px';
        robotElement.style.top = (robotRect.top - gridRect.top) + 'px';
        robotElement.style.zIndex = '1000';
        
        // 그리드 컨테이너에 로봇 추가
        gridContainer.appendChild(robotElement);
        
        // 애니메이션 시작
        robotElement.style.transition = 'left 0.6s ease-out, top 0.6s ease-out';
        robotElement.style.left = targetX + 'px';
        robotElement.style.top = targetY + 'px';
        // 투명 효과 제거 - 그냥 밖으로 나가기만 함
        
        // 애니메이션 완료 후 게임 오버 처리
        await new Promise(resolve => {
            setTimeout(() => {
                // 애니메이션 후 게임 오버 이벤트 발생
                this.robotController.emit('onGameOver', { 
                    reason: 'boundary', 
                    command: data.command,
                    afterAnimation: true 
                });
                resolve();
            }, 600); // 애니메이션 시간과 맞춤
        });
    }
    

    /**
     * 게임 정보 표시 (디버그용)
     */
    showDebugInfo() {
        const info = this.gameState.getDebugInfo();
        const robotInfo = this.robotController.getRobotInfo();
        
        console.group('🔍 게임 디버그 정보');
        console.log('게임 상태:', info);
        console.log('로봇 정보:', robotInfo);
        console.groupEnd();
        
        return { gameState: info, robot: robotInfo };
    }
    
    /**
     * 애니메이션 속도 조절
     */
    setAnimationSpeed(speed) {
        this.gameState.config.animationSpeed = Math.max(100, Math.min(2000, speed));
        console.log(`애니메이션 속도: ${speed}ms`);
    }
    
    /**
     * 슬롯에 명령 추가
     */
    addCommandToSlot(slot, command, cardHtml) {
        // 이미 채워진 슬롯이면 바로 리턴
        if (slot.classList.contains('filled')) {
            console.log('이미 채워진 슬롯입니다.');
            return;
        }
        
        // 카드 HTML에서 이미지 부분만 추출
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHtml;
        const img = tempDiv.querySelector('.card-icon');
        
        if (img) {
            const slotImg = img.cloneNode(true);
            slotImg.classList.add('slot-icon');
            slot.appendChild(slotImg);
        }
        
        slot.classList.add('filled');
        slot.dataset.command = command;
        
        
        console.log(`${this.getCommandDisplayName(command)} 명령을 슬롯에 추가!`);
    }
    
    /**
     * 슬롯에서 명령 제거
     */
    removeCommandFromSlot(slot) {
        const command = slot.dataset.command;
        const slotIndex = parseInt(slot.dataset.slot);
        
        // 해당 슬롯 비우기
        slot.innerHTML = '';
        slot.classList.remove('filled');
        delete slot.dataset.command;
        
        // 뒤의 명령들을 앞으로 당기기
        this.shiftSlotsForward(slotIndex);
        
        
        console.log(`${this.getCommandDisplayName(command)} 명령을 제거!`);
    }
    
    /**
     * 지정된 인덱스 이후의 슬롯들을 앞으로 당기기
     */
    shiftSlotsForward(removedIndex) {
        for (let i = removedIndex; i < 9; i++) {
            const currentSlot = document.querySelector(`[data-slot="${i}"]`);
            const nextSlot = document.querySelector(`[data-slot="${i + 1}"]`);
            
            if (nextSlot && nextSlot.classList.contains('filled')) {
                // 다음 슬롯의 내용을 현재 슬롯으로 이동
                currentSlot.innerHTML = nextSlot.innerHTML;
                currentSlot.classList.add('filled');
                currentSlot.dataset.command = nextSlot.dataset.command;
                
                // 다음 슬롯 비우기
                nextSlot.innerHTML = '';
                nextSlot.classList.remove('filled');
                delete nextSlot.dataset.command;
            } else {
                // 더 이상 이동할 슬롯이 없으면 중단
                break;
            }
        }
    }
    
    /**
     * 슬롯에서 프로그램 실행
     */
    async runProgramFromSlots() {
        const slots = document.querySelectorAll('.slot.filled');
        
        if (slots.length === 0) {
            console.log('실행할 명령이 없어요!');
            return;
        }
        
        if (this.gameState.isRunning) {
            console.log('로봇이 이미 실행 중!');
            return;
        }
        
        // 슬롯 순서대로 명령 수집
        const commands = [];
        for (let i = 0; i < 10; i++) {
            const slot = document.querySelector(`[data-slot="${i}"].filled`);
            if (slot && slot.dataset.command) {
                commands.push(slot.dataset.command);
            }
        }
        
        console.log(`프로그램 실행 시작! ${commands.length}개 명령`);
        
        // 프로그램 실행 플래그 설정
        this.programExecuted = true;
        
        // 순차적으로 명령 실행
        this.gameState.isRunning = true;
        
        try {
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                
                // 현재 실행 중인 슬롯 하이라이트
                this.highlightCurrentSlot(i);
                
                const success = await this.robotController.executeCommandAsync(command);
                
                if (!success) {
                    this.clearSlotHighlight();
                    break;
                }
            }
        } catch (error) {
            console.error('프로그램 실행 오류:', error);
        } finally {
            this.gameState.isRunning = false;
            this.clearSlotHighlight();
            console.log('프로그램 실행 완료!');
            
            // 프로그램 실행 완료 후 성공/실패 체크 (명령이 있을 때만)
            if (commands.length > 0) {
                setTimeout(() => {
                    this.checkGameResult();
                }, 1000); // 충분한 시간 대기
            }
        }
    }
    
    /**
     * 게임 결과 체크 및 모달 표시 (프로그램 실행 완료 후에만)
     */
    checkGameResult() {
        console.log('🎯 게임 결과 체크 시작');
        
        // 프로그램이 실행되지 않았으면 체크하지 않음
        if (!this.programExecuted) {
            console.log('❌ 프로그램이 실행되지 않아 결과 체크 생략');
            return;
        }
        
        const robot = this.gameState.robot;
        const stores = this.gameState.stores;
        
        // 로봇이 상점 위에 있는지 확인
        let isOnStore = false;
        Object.values(stores).forEach(store => {
            if (store.x === robot.x && store.y === robot.y) {
                isOnStore = true;
            }
        });
        
        console.log('🤖 로봇 위치:', { x: robot.x, y: robot.y });
        console.log('🏪 상점 위치들:', stores);
        console.log('✅ 상점 도달 여부:', isOnStore);
        
        // 모달 표시
        if (isOnStore) {
            this.showSuccessModal();
        } else {
            this.showFailureModal();
        }
        
        // 체크 후 플래그 리셋
        this.programExecuted = false;
    }
    
    /**
     * 성공 모달 표시
     */
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
            console.log('🎉 성공 모달 표시됨');
        }
    }
    
    /**
     * 실패 모달 표시
     */
    showFailureModal() {
        const modal = document.getElementById('failureModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
            console.log('😅 실패 모달 표시됨');
        }
    }
    
    /**
     * 모든 모달 숨기기
     */
    hideAllModals() {
        const successModal = document.getElementById('successModal');
        const failureModal = document.getElementById('failureModal');
        
        if (successModal) {
            successModal.classList.add('hidden');
            successModal.style.display = 'none';
        }
        if (failureModal) {
            failureModal.classList.add('hidden');
            failureModal.style.display = 'none';
        }
        
        console.log('🚫 모든 모달 숨김 완료');
    }
    
    /**
     * 현재 실행 중인 슬롯 하이라이트
     */
    highlightCurrentSlot(index) {
        this.clearSlotHighlight();
        const slot = document.querySelector(`[data-slot="${index}"]`);
        if (slot) {
            slot.classList.add('executing');
        }
    }
    
    /**
     * 슬롯 하이라이트 제거
     */
    clearSlotHighlight() {
        document.querySelectorAll('.slot.executing').forEach(slot => {
            slot.classList.remove('executing');
        });
    }
    
    /**
     * 모든 슬롯 초기화
     */
    clearAllSlots() {
        const slots = document.querySelectorAll('.slot');
        slots.forEach(slot => {
            slot.innerHTML = '';
            slot.classList.remove('filled', 'executing');
            delete slot.dataset.command;
        });
        
        
        console.log('모든 슬롯이 초기화되었어요!');
    }
    
    
    
    /**
     * 다음 사용 가능한 슬롯 찾기 (왼쪽부터 순서대로)
     */
    getNextAvailableSlot() {
        for (let i = 0; i < 10; i++) {
            const slot = document.querySelector(`[data-slot="${i}"]`);
            if (slot && !slot.classList.contains('filled')) {
                return slot;
            }
        }
        return null; // 모든 슬롯이 차있음
    }
}

// 전역에서 접근 가능하도록 설정
window.UIController = UIController;