// ==========================================================
// JustBuy — WebGL Custom Shader Gradient (ruucm/shadergradient)
// ==========================================================

export class ShaderGradient {
  constructor(canvasId = 'bg-shader-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      console.warn('WebGL not supported, falling back to CSS gradient');
      return;
    }

    this.mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    this.time = 0;
    this.rafId = null;

    this.init();
  }

  init() {
    const gl = this.gl;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // High performance fluid color shader inspired by shadergradient
    const fsSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      // Color Palette based on JustBuy brand identity
      // #F4EFE8 (Warm Cream), #E9E0D3 (Soft Beige), #F26B1D (Warm Orange), #C2532D (Terracotta)
      const vec3 c1 = vec3(0.957, 0.937, 0.910); // Warm cream base
      const vec3 c2 = vec3(0.914, 0.878, 0.827); // Soft beige
      const vec3 c3 = vec3(0.949, 0.420, 0.114); // Warm brand orange
      const vec3 c4 = vec3(0.761, 0.325, 0.176); // Deep terracotta
      const vec3 c5 = vec3(1.000, 0.985, 0.965); // Pure warm highlight

      // Fast simplex noise approximation
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.y = 1.0 - st.y;

        // Aspect correction
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = st;
        p.x *= aspect;

        float t = u_time * 0.18;
        vec2 m = u_mouse * 0.3;

        // Domain warping with simplex noise
        float n1 = snoise(p * 1.2 + vec2(t * 0.4 + m.x, t * 0.2 - m.y));
        float n2 = snoise(p * 1.8 - vec2(t * 0.3, t * 0.5) + vec2(n1 * 0.6));
        float n3 = snoise(p * 2.4 + vec2(t * 0.2, -t * 0.3) + vec2(n2 * 0.4));

        // Smooth subtle color blends
        float blend1 = smoothstep(-0.6, 0.8, n1);
        float blend2 = smoothstep(-0.5, 0.7, n2);
        float blend3 = smoothstep(-0.4, 0.9, n3);

        vec3 color = mix(c1, c2, blend1);
        // Orange & terracotta liquid accents (controlled intensity for calm aesthetic)
        color = mix(color, c3, blend2 * 0.28);
        color = mix(color, c4, blend3 * 0.18);
        color = mix(color, c5, pow(clamp(n1 * n2, 0.0, 1.0), 3.0) * 0.35);

        // Soft vignette to keep focus centered and clean
        float vignette = 1.0 - length(st - 0.5) * 0.35;
        color *= vignette;

        gl_FragColor = vec4(color, 0.68);
      }
    `;

    const vertShader = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fragShader = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertShader || !fragShader) return;

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertShader);
    gl.attachShader(this.program, fragShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Shader link error:', gl.getProgramInfoLog(this.program));
      return;
    }

    // Full screen quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    this.posAttrib = gl.getAttribLocation(this.program, 'a_position');
    this.timeUniform = gl.getUniformLocation(this.program, 'u_time');
    this.resUniform = gl.getUniformLocation(this.program, 'u_resolution');
    this.mouseUniform = gl.getUniformLocation(this.program, 'u_mouse');

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX / window.innerWidth;
      this.mouse.targetY = e.clientY / window.innerHeight;
    });

    this.resize();
    this.render();
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  render() {
    if (!this.gl || !this.program) return;
    const gl = this.gl;

    this.time += 0.015;
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    gl.useProgram(this.program);

    gl.enableVertexAttribArray(this.posAttrib);
    gl.vertexAttribPointer(this.posAttrib, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(this.timeUniform, this.time);
    gl.uniform2f(this.resUniform, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.mouseUniform, this.mouse.x, this.mouse.y);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.rafId = requestAnimationFrame(() => this.render());
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
