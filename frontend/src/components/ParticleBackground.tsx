import React, { useEffect, useRef } from 'react';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    let mouse = {
      x: -1000,
      y: -1000,
      vx: 0,
      vy: 0,
      lastX: -1000,
      lastY: -1000
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', onMouseMove);

    class Particle {
      x: number;
      y: number;
      baseVx: number;
      baseVy: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseVx = (Math.random() - 0.5) * 0.8;
        this.baseVy = (Math.random() - 0.5) * 0.8;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.radius = Math.random() * 1.5 + 0.5;
      }

      update() {
        // Distance to mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // If close to mouse and mouse is moving, agitate
        if (dist < 150) {
          const force = (150 - dist) / 150;
          const mouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
          if (mouseSpeed > 0) {
            this.vx += (mouse.vx * force * 0.08);
            this.vy += (mouse.vy * force * 0.08);
          }
        }

        // Apply friction to return to base velocity smoothly
        this.vx += (this.baseVx - this.vx) * 0.02;
        this.vy += (this.baseVy - this.vy) * 0.02;

        // Speed limit to prevent particles from flying off too fast permanently
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 8) {
          this.vx = (this.vx / speed) * 8;
          this.vy = (this.vy / speed) * 8;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // Using a color that matches the premium dark theme (accent color or subtle white/blue)
        ctx.fillStyle = 'rgba(120, 160, 255, 0.6)';
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 10000); // Density
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(120, 160, 255, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate mouse velocity per frame
      if (mouse.lastX !== -1000) {
        mouse.vx = mouse.x - mouse.lastX;
        mouse.vy = mouse.y - mouse.lastY;
      }
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      drawLines();

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default ParticleBackground;
