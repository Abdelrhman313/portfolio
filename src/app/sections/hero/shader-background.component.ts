import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';

import { MediaService } from '../../core/media.service';

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

// Slow fbm noise drifting between steel and warm umber, with a soft vignette that
// darkens as the hero scrolls away.
const FRAGMENT_SHADER = `
precision mediump float;
uniform float uTime;
uniform vec2 uResolution;
uniform float uScrollProgress;
float hash(vec2 p) { p = fract(p * vec2(127.1, 311.7)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float smoothNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = hash(i); float b = hash(i + vec2(1.0, 0.0)); float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) { float v = 0.0; float amp = 0.5; for (int i = 0; i < 4; i++) { v += amp * smoothNoise(p); p *= 2.1; amp *= 0.5; } return v; }
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 2.5;
  vec2 q = vec2(fbm(p + vec2(uTime * 0.04, uTime * 0.02)), fbm(p + vec2(1.7, 9.2)));
  float n = fbm(p + 0.8 * q + vec2(uTime * 0.015));
  vec3 colorA = vec3(0.102, 0.118, 0.141);
  vec3 colorB = vec3(0.137, 0.118, 0.098);
  vec3 color = mix(colorA, colorB, n * 0.65);
  vec2 vig = uv * (1.0 - uv.yx);
  float vign = pow(vig.x * vig.y * 15.0, 0.25);
  color = color * (0.9 + 0.1 * vign);
  color = mix(color, colorA * 0.82, uScrollProgress * 0.4);
  gl_FragColor = vec4(color, 1.0);
}`;

/** Full-bleed animated noise behind the hero, drawn only while on screen. */
@Component({
  selector: 'app-shader-background',
  standalone: true,
  template: `<canvas #canvas class="shader" aria-hidden="true"></canvas>`,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
      }
      .shader {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background: #1a1e24;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShaderBackgroundComponent implements AfterViewInit, OnDestroy {
  /** Hero scroll progress (0–1), written by the hero's ScrollTrigger. */
  @Input() progress = { value: 0 };

  @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;
  private cleanup?: () => void;

  constructor(
    private readonly zone: NgZone,
    private readonly media: MediaService,
  ) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.start());
  }

  private start(): void {
    const canvas = this.canvas.nativeElement;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram()!;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uScroll = gl.getUniformLocation(program, 'uScrollProgress');

    const startedAt = performance.now();
    const render = (now: number) => {
      gl.uniform1f(uTime, (now - startedAt) / 1000);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uScroll, this.progress.value);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    // Reduced motion: a single still frame, redrawn only when a resize clears the canvas.
    const still = this.media.reducedMotion.matches;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (still) render(startedAt);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let visible = true;
    const visibility = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
    visibility.observe(canvas);

    let frame = 0;
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (visible) render(now);
    };
    if (!still) frame = requestAnimationFrame(draw);

    this.cleanup = () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
