const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Firework {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.trail = [];
        this.trailLength = 5;
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = Math.random() * 50 + 50;
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        this.speed *= this.acceleration;
        const velocityX = Math.cos(this.angle) * this.speed;
        const velocityY = Math.sin(this.angle) * this.speed;

        this.x += velocityX;
        this.y += velocityY;

        if (Math.abs(this.x - this.targetX) < this.speed && Math.abs(this.y - this.targetY) < this.speed) {
            this.createParticles();
            return true;
        }
        return false;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = `hsl(${this.brightness}, 100%, 50%)`;
        ctx.stroke();
    }

    createParticles() {
        const particleCount = 100;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(this.targetX, this.targetY));
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 10 + 1;
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = Math.random() * 360;
        this.brightness = Math.random() * 50 + 50;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.01;
    }

    update() {
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            return true;
        }
        return false;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.fill();
        ctx.restore();
    }
}

const fireworks = [];
const particles = [];

function animate() {
    requestAnimationFrame(animate);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    fireworks.forEach((firework, index) => {
        if (firework.update()) {
            fireworks.splice(index, 1);
        } else {
            firework.draw();
        }
    });

    particles.forEach((particle, index) => {
        if (particle.update()) {
            particles.splice(index, 1);
        } else {
            particle.draw();
        }
    });
}

function createRandomFirework() {
    const x = Math.random() * canvas.width;
    const y = canvas.height;
    const targetX = Math.random() * canvas.width;
    const targetY = Math.random() * canvas.height / 2;
    fireworks.push(new Firework(x, y, targetX, targetY));
    setTimeout(createRandomFirework, Math.random() * 1000 + 500);
}

canvas.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

createRandomFirework();
animate();
