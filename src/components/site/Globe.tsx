import { useEffect, useRef } from "react";

/**
 * Animated wireframe globe rendered to a 2D canvas.
 * - Thousands of cyan particles (Fibonacci sphere)
 * - Rotating + wave motion
 * - Network connections between nearby points
 * - Pulsing nodes + floating particles
 * - Mouse parallax
 */
export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Fibonacci sphere
    const N = 1400;
    const pts: { x: number; y: number; z: number; phase: number }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      pts.push({
        x: Math.cos(theta) * r,
        y,
        z: Math.sin(theta) * r,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // floating particles
    const floats = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.5 + 0.2,
    }));

    const onMouse = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouse.current.tx = (e.clientX - cx) / cx;
      mouse.current.ty = (e.clientY - cy) / cy;
    };
    window.addEventListener("mousemove", onMouse);

    const start = performance.now();
    const projected: { x: number; y: number; z: number; size: number; alpha: number }[] = new Array(N);

    const render = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      // ease mouse
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.04;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.04;

      const cx = width / 2 + mouse.current.x * 30;
      const cy = height / 2 + mouse.current.y * 20;
      const radius = Math.min(width, height) * 0.42;
      const rotY = t * 0.12 + mouse.current.x * 0.4;
      const rotX = -0.25 + mouse.current.y * 0.3;
      const sinY = Math.sin(rotY);
      const cosY = Math.cos(rotY);
      const sinX = Math.sin(rotX);
      const cosX = Math.cos(rotX);

      // floating particles
      for (const p of floats) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.a * 0.4})`;
        ctx.fill();
      }

      // project + wave
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        // wave displacement
        const wave = 1 + Math.sin(t * 1.6 + p.phase + p.y * 4) * 0.04;

        let x = p.x * wave;
        let y = p.y * wave;
        let z = p.z * wave;

        // rotate Y
        let xz = x * cosY + z * sinY;
        let zz = -x * sinY + z * cosY;
        x = xz;
        z = zz;
        // rotate X
        let yz = y * cosX - z * sinX;
        z = y * sinX + z * cosX;
        y = yz;

        const depth = (z + 1.5) / 2.5; // 0..1
        const px = cx + x * radius;
        const py = cy + y * radius;
        const size = 0.4 + depth * 1.6;
        const alpha = 0.15 + depth * 0.85;
        projected[i] = { x: px, y: py, z, size, alpha };

        // pulsing dots
        const pulse = 0.6 + Math.sin(t * 2 + p.phase) * 0.4;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha * (0.5 + pulse * 0.5)})`;
        ctx.fill();
      }

      // network connections - sample subset for performance
      ctx.lineWidth = 0.6;
      const step = 4;
      for (let i = 0; i < N; i += step) {
        const a = projected[i];
        if (a.z < -0.2) continue;
        for (let j = i + step; j < Math.min(i + step * 20, N); j += step) {
          const b = projected[j];
          if (b.z < -0.2) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 2600) {
            const alpha = (1 - d2 / 2600) * 0.18 * Math.min(a.alpha, b.alpha);
            ctx.strokeStyle = `rgba(0, 194, 168, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // moving data pulse along an arc
      const arcCount = 4;
      for (let k = 0; k < arcCount; k++) {
        const tt = ((t * 0.25 + k / arcCount) % 1);
        const idxA = Math.floor((k * 137) % N);
        const idxB = Math.floor((k * 137 + 380) % N);
        const a = projected[idxA];
        const b = projected[idxB];
        if (!a || !b) continue;
        if (a.z < -0.1 || b.z < -0.1) continue;
        const px = a.x + (b.x - a.x) * tt;
        const py = a.y + (b.y - a.y) * tt;
        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 229, 255, 0.9)";
        ctx.shadowColor = "rgba(0, 229, 255, 0.9)";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 hero-gradient" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
