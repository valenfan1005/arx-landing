/**
 * ARX Blob — instance-scoped viscous WebGL2 metaball field.
 * Adapted from the ARX design-system motion module so it:
 *   - sizes to its own <canvas> (not window) via ResizeObserver
 *   - reads the cursor relative to the canvas rect (survives transforms)
 *   - renders on a transparent background (blends over the hero grid)
 *   - supports multiple independent instances
 *
 * Usage:  window.mountArxBlob(canvasEl, { colors:[[r,g,b],...], scale:1 })
 * Returns a cleanup function.
 */
(function () {
  const VS = `#version 300 es
  in vec4 a_position; void main(){ gl_Position = a_position; }`;

  const FS = `#version 300 es
  precision highp float;
  uniform vec2 u_resolution;
  uniform int u_count;
  uniform vec4 u_blobs[4];
  uniform vec3 u_colors[4];
  out vec4 outColor;

  float smin(float a, float b, float k){
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b,a,h) - k*h*(1.0-h);
  }
  vec4 map(vec2 p){
    float d = 1000.0; vec3 col = vec3(0.0);
    float k = 0.3; float tw = 0.0;
    for(int i=0;i<4;i++){
      if(i >= u_count) break;
      vec2 c = u_blobs[i].xy; float r = u_blobs[i].z;
      float dd = length(p-c) - r;
      d = smin(d, dd, k);
      float w = exp(-dd*10.0);
      col += u_colors[i]*w; tw += w;
    }
    if(tw>0.0) col/=tw;
    return vec4(col,d);
  }
  vec3 calcNormal(vec2 p){
    const vec2 e = vec2(0.012,0.0);
    vec3 n = vec3(map(p+e.xy).w - map(p-e.xy).w,
                  map(p+e.yx).w - map(p-e.yx).w, 0.16);
    return normalize(n);
  }
  void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv*2.0-1.0;
    p.x *= u_resolution.x/u_resolution.y;
    vec4 scene = map(p);
    float dist = scene.w; vec3 base = scene.rgb;
    float alpha = smoothstep(0.012,-0.012,dist);
    if(alpha < 0.001){ outColor = vec4(0.0); return; }
    vec3 n = calcNormal(p);
    vec3 L1 = normalize(vec3(0.5,0.8,1.0));
    vec3 V  = vec3(0.0,0.0,1.0);
    vec3 ambient = base*0.22;
    float diff = max(dot(n,L1),0.0);
    vec3 diffuse = base*(diff*0.85);
    vec3 H1 = normalize(L1+V);
    float spec = pow(max(dot(n,H1),0.0),128.0);
    float rim = 1.0 - max(dot(n,V),0.0);
    rim = smoothstep(0.5,1.0,rim);
    vec3 fin = ambient + diffuse + vec3(1.0)*spec*1.5 + base*rim*0.6;
    outColor = vec4(fin, alpha);
  }`;

  function compile(gl, type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return s;
  }

  window.mountArxBlob = function (canvas, opts) {
    opts = opts || {};
    const colors = opts.colors || [
      [0.702,0.553,0.957], // violet  #B38DF4
      [0.231,0.106,0.506], // purple  #3B1B81
      [0.133,0.820,0.933], // electric#22D1EE
    ];
    const sizes = opts.sizes || [0.46, 0.30, 0.20]; // relative masses
    const spread = opts.spread != null ? opts.spread : 0.42;
    const gl = canvas.getContext('webgl2', { antialias:true, alpha:true, premultipliedAlpha:false });
    if(!gl){ return function(){}; }

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(program);

    const aLoc = gl.getAttribLocation(program, 'a_position');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uCount = gl.getUniformLocation(program, 'u_count');
    const uBlobs = gl.getUniformLocation(program, 'u_blobs');
    const uColors = gl.getUniformLocation(program, 'u_colors');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const N = 3;
    let mx = 0.0, my = 0.0, hasMouse = false;
    const blobs = [];
    for(let i=0;i<N;i++){
      blobs.push({
        x:(Math.random()-0.5)*spread, y:(Math.random()-0.5)*spread,
        vx:0, vy:0, radius:0.1,
        target: Math.sqrt(sizes[i]) * 0.62,
        color: colors[i],
        ang: i*(Math.PI*2/N),
      });
    }

    function resize(){
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
      canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
      gl.viewport(0,0,canvas.width,canvas.height);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function onMove(e){
      const r = canvas.getBoundingClientRect();
      if(!r.width || !r.height) return;
      const u = (e.clientX - r.left)/r.width;
      const v = 1.0 - (e.clientY - r.top)/r.height;
      mx = u*2.0-1.0; my = v*2.0-1.0; hasMouse = true;
    }
    window.addEventListener('mousemove', onMove);

    let then = 0, raf = 0, running = true;
    function frame(now){
      if(!running) return;
      now *= 0.001; then = now;
      const aspect = canvas.width/canvas.height;
      for(let i=0;i<N;i++){
        const b = blobs[i];
        b.radius += (b.target - b.radius)*0.08;
        const t = now*0.35;
        const tx = Math.cos(t + b.ang)*spread*0.7;
        const ty = Math.sin(t*0.8 + b.ang)*spread*0.5;
        b.vx += (tx - b.x)*0.01;
        b.vy += (ty - b.y)*0.01;
        if(hasMouse){
          const dx = b.x - mx*aspect, dy = b.y - my;
          const d = Math.hypot(dx,dy);
          if(d < 0.6 && d > 0.0001){
            b.vx += (dx/d)*(0.6-d)*0.02;
            b.vy += (dy/d)*(0.6-d)*0.02;
          }
        }
        b.vx*=0.92; b.vy*=0.92; b.x+=b.vx; b.y+=b.vy;
      }
      const bData=[], cData=[];
      blobs.forEach(b=>{ bData.push(b.x,b.y,b.radius,0); cData.push(b.color[0],b.color[1],b.color[2]); });
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1i(uCount, N);
      gl.uniform4fv(uBlobs, bData);
      gl.uniform3fv(uColors, cData);
      gl.enableVertexAttribArray(aLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return function cleanup(){
      running = false; cancelAnimationFrame(raf);
      ro.disconnect(); window.removeEventListener('mousemove', onMove);
    };
  };
})();
