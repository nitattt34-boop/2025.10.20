// =====================================
// 氣球 (Bubble) 相關設定
// =====================================
let bubbles = [];
// 顏色代碼：#edede9 (加分色), #d6ccc2, #f5ebe0, #e3d5ca
const colors = ['#edede9', '#d6ccc2', '#f5ebe0', '#e3d5ca'];
const BONUS_COLOR = '#edede9'; // 設定新的加分氣球顏色

// =====================================
// 遊戲狀態與得分
// =====================================
let score = 0;
const LEFT_TEXT_ID = "414730688"; // 左上角顯示的 ID
const TEXT_SIZE = 32;
const TEXT_COLOR = '#eb6424'; // 設定新的文字顏色 (深橘色)

// =====================================
// 爆破粒子 (Particle) 相關設定
// =====================================
let explosions = []; 
let popSound; // 宣告音效變數

// 預載入音效檔案
function preload() {
  // 請確保 'pop_sound.mp3' 檔案存在於你的專案根目錄
  popSound = loadSound('pop_sound.mp3'); 
  popSound.setVolume(0.5); 
}

// 粒子類別：用於爆破時飛散的小碎片
class Particle {
  constructor(x, y, hue) { 
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D(); 
    this.vel.mult(random(2, 6)); 
    this.acc = createVector(0, 0.1); 
    this.lifespan = 255; 
    this.radius = random(2, 5); 
    
    this.r = unhex(hue.substring(1, 3));
    this.g = unhex(hue.substring(3, 5));
    this.b = unhex(hue.substring(5, 7));
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 5;
  }

  show() {
    noStroke();
    fill(this.r, this.g, this.b, this.lifespan); 
    ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}


function setup() {
  // 建立畫布
  createCanvas(windowWidth, windowHeight);
  background('#ffc8dd'); 
  textAlign(LEFT, TOP); 
  
  // 建立 30 個氣球物件 
  for (let i = 0; i < 30; i++) {
    const randomColor = colors[floor(random(colors.length))];
    const diameter = random(50, 200);
    const x = random(diameter / 2, width - diameter / 2);
    const y = random(height, height + diameter);
    const speed = random(0.5, 3); 
    const alpha = random(100, 200); 
    
    bubbles.push({
      x: x,
      y: y,
      d: diameter,
      color: randomColor,
      speed: speed,
      alpha: alpha,
      isExploded: false 
    });
  }
  
  noStroke();
}

/**
 * 繪製一個五角星
 */
function drawStar(x, y, radius, colorVal, alphaVal) {
  let angle = TWO_PI / 5;
  let halfAngle = angle / 2.0;
  
  fill(colorVal[0], colorVal[1], colorVal[2], alphaVal);
  
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a - HALF_PI) * radius;
    let sy = y + sin(a - HALF_PI) * radius;
    vertex(sx, sy);
    
    sx = x + cos(a + halfAngle - HALF_PI) * radius * 0.5;
    sy = y + sin(a + halfAngle - HALF_PI) * radius * 0.5; 
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

/**
 * 建立一個粒子爆破效果並播放音效
 */
function createExplosion(x, y, color) {
  let particleCount = floor(random(15, 30)); 
  let particleGroup = [];
  
  for (let i = 0; i < particleCount; i++) {
    particleGroup.push(new Particle(x, y, color));
  }
  explosions.push(particleGroup);
  
  if (popSound.isLoaded()) {
    popSound.stop();
    popSound.play();
  }
}

/**
 * 檢查滑鼠是否點擊在氣球範圍內
 */
function checkCollision(bubble, mouseX, mouseY) {
  // 使用 dist() 函式計算滑鼠位置與氣球中心的距離
  const distance = dist(bubble.x, bubble.y, mouseX, mouseY);
  return distance < bubble.d / 2;
}


// 點擊事件處理 (由滑鼠點擊觸發爆破)
function mousePressed() {
  // 1. 解鎖音訊上下文 (瀏覽器限制)
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  
  // 2. 檢查點擊是否命中氣球
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let bubble = bubbles[i];
    
    // 只處理未爆破的氣球
    if (!bubble.isExploded && checkCollision(bubble, mouseX, mouseY)) {
      
      bubble.isExploded = true;
      
      // 3. 處理爆破和得分邏輯
      createExplosion(bubble.x, bubble.y, bubble.color);
      
      // *** 更新得分邏輯 ***
      if (bubble.color === BONUS_COLOR) {
        score += 1; // 點擊 #edede9 氣球加一分
      } else {
        score -= 1; // 點擊其他顏色氣球扣一分
      }

      break; // 每次點擊只處理第一個命中的氣球
    }
  }
}


function draw() {
  // 清除背景
  background('#ffc8dd'); 

  
  // 處理所有氣球
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let bubble = bubbles[i];
    
    // 只有未爆破的氣球才繪製和移動
    if (!bubble.isExploded) {
      // 1. 繪製圓和星星
      const r = unhex(bubble.color.substring(1, 3));
      const g = unhex(bubble.color.substring(3, 5));
      const b = unhex(bubble.color.substring(5, 7));
      fill(r, g, b, bubble.alpha);
      
      ellipse(bubble.x, bubble.y, bubble.d);

      // 繪製星星
      let starRadius = bubble.d / 7 / 2;
      let offset = (bubble.d / 2 - starRadius) * 0.6; 
      let starX = bubble.x + offset;
      let starY = bubble.y - offset;
      drawStar(starX, starY, starRadius, [255, 255, 0], 120);

      // 2. 讓圓往上漂浮
      bubble.y -= bubble.speed;
      
      // 3. 檢查是否漂到頂端 (未爆破的氣球才循環)
      if (bubble.y < -bubble.d / 2) {
        // 重置氣球
        bubble.y = random(height + bubble.d / 2, height + bubble.d); 
        bubble.x = random(bubble.d / 2, width - bubble.d / 2);
        bubble.isExploded = false; 
      }
    } else {
        // 如果氣球已爆破，立即將其重置並移到底部，以便下一幀開始漂浮
        bubble.y = random(height + bubble.d / 2, height + bubble.d);
        bubble.x = random(bubble.d / 2, width - bubble.d / 2);
        bubble.isExploded = false; // 重置爆破狀態
    }
  }
  
  // 處理所有爆破粒子群
  for (let j = explosions.length - 1; j >= 0; j--) {
    let particleGroup = explosions[j];
    
    for (let i = particleGroup.length - 1; i >= 0; i--) {
      let particle = particleGroup[i];
      particle.update();
      particle.show();
      
      if (particle.isFinished()) {
        particleGroup.splice(i, 1);
      }
    }
    
    if (particleGroup.length === 0) {
      explosions.splice(j, 1);
    }
  }
  
  // =====================================
  // 顯示文字與分數
  // =====================================
  fill(TEXT_COLOR);
  textSize(TEXT_SIZE);
  
  // 左上角文字 (ID)
  textAlign(LEFT, TOP);
  text(LEFT_TEXT_ID, 10, 10);
  
  // 右上角文字 (得分)
  textAlign(RIGHT, TOP);
  text(`得分: ${score}`, width - 10, 10);
}

// 處理視窗大小改變
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background('#ffc8dd');
}
