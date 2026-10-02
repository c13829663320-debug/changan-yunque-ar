/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * vk-render.ts — WebGL 渲染（feature/ar-xrframe）
 *
 * 职责：
 *  1) 相机背景：按官方 VisionKit 示例，把 VKFrame 的 YUV 纹理（yTexture/uvTexture）
 *     经 getDisplayTransform 调整后上屏，效果等同实时相机画面；
 *  2) 复原图叠加：marker 命中后，把 scene.arRestoreImage 作为贴图四边形，
 *     按 anchor.transform（列优先 4x4）× frame.camera.viewMatrix × 投影矩阵
 *     做透视变换，贴合在 marker 平面上——这是必须真实可用的叠加路径。
 *
 * 说明：glb 3D 模型为升级项（依赖 threejs-miniprogram / gltf-loader），
 * 当前 cdnBase 为空，默认走复原图叠加；glb 缺失/加载失败不得影响本类。
 *
 * 所有渲染调用均由组件包在 try/catch 中；本类内部也做防御性处理，单帧异常不外抛。
 */

const NEAR = 0.01;
const FAR = 100;

/* 相机背景 YUV→RGB 着色器（官方示例逐字口径） */
const BG_VS = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform mat3 displayTransform;
varying vec2 v_texCoord;
void main() {
  vec3 p = displayTransform * vec3(a_position, 0.0);
  gl_Position = vec4(p, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

const BG_FS = `
precision highp float;
uniform sampler2D y_texture;
uniform sampler2D uv_texture;
varying vec2 v_texCoord;
void main() {
  vec4 y_color = texture2D(y_texture, v_texCoord);
  vec4 uv_color = texture2D(uv_texture, v_texCoord);
  float Y = y_color.r;
  float U = uv_color.r - 0.5;
  float V = uv_color.a - 0.5;
  float R = Y + 1.402 * V;
  float G = Y - 0.344 * U - 0.714 * V;
  float B = Y + 1.772 * U;
  gl_FragColor = vec4(R, G, B, 1.0);
}
`;

/* 复原图叠加：贴图四边形，MVP = proj * view * model */
const OV_VS = `
attribute vec3 a_pos;
attribute vec2 a_uv;
uniform mat4 u_mvp;
varying vec2 v_uv;
void main() {
  gl_Position = u_mvp * vec4(a_pos, 1.0);
  v_uv = a_uv;
}
`;

const OV_FS = `
precision mediump float;
uniform sampler2D u_tex;
varying vec2 v_uv;
void main() {
  vec4 c = texture2D(u_tex, v_uv);
  gl_FragColor = vec4(c.rgb, c.a);
}
`;

/** 列优先 4x4 矩阵乘法 a*b */
function mul4(a: number[], b: number[]): number[] {
  const out = new Array<number>(16).fill(0);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[0 * 4 + r] * b[c * 4 + 0] +
        a[1 * 4 + r] * b[c * 4 + 1] +
        a[2 * 4 + r] * b[c * 4 + 2] +
        a[3 * 4 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

export class VkRenderer {
  private canvas: any;
  private gl: any;
  private bgProg: any = null;
  private ovProg: any = null;
  private bgPosBuf: any = null;
  private bgUvBuf: any = null;
  private ovBuf: any = null;
  private bgUni: any = {};
  private ovUni: any = {};
  private restoreTex: any = null;
  private restoreReady = false;
  private destroyed = false;

  constructor(canvas: any, gl: any, restoreSrc: string) {
    this.canvas = canvas;
    this.gl = gl;
    this.initBackground();
    this.initOverlay();
    this.loadRestore(restoreSrc);
  }

  /* ---------------- 编译工具 ---------------- */
  private compile(type: number, src: string): any {
    const gl = this.gl;
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  /* ---------------- 相机背景程序 ---------------- */
  private initBackground(): void {
    const gl = this.gl;
    const vs = this.compile(gl.VERTEX_SHADER, BG_VS);
    const fs = this.compile(gl.FRAGMENT_SHADER, BG_FS);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    this.bgProg = prog;

    // 顶点：全屏三角带
    this.bgPosBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bgPosBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]), gl.STATIC_DRAW);
    this.bgUvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bgUvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, 0, 1, 1, 0, 0, 0]), gl.STATIC_DRAW);

    this.bgUni = {
      aPos: gl.getAttribLocation(prog, 'a_position'),
      aUv: gl.getAttribLocation(prog, 'a_texCoord'),
      dt: gl.getUniformLocation(prog, 'displayTransform'),
      y: gl.getUniformLocation(prog, 'y_texture'),
      uv: gl.getUniformLocation(prog, 'uv_texture'),
    };
  }

  /* ---------------- 复原图叠加程序 ---------------- */
  private initOverlay(): void {
    const gl = this.gl;
    const vs = this.compile(gl.VERTEX_SHADER, OV_VS);
    const fs = this.compile(gl.FRAGMENT_SHADER, OV_FS);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    this.ovProg = prog;

    // 四边形（局部平面 x/y，z=0），三角带
    this.ovBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ovBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -0.5, -0.5, 0, 0, 0,
         0.5, -0.5, 0, 1, 0,
        -0.5,  0.5, 0, 0, 1,
         0.5,  0.5, 0, 1, 1,
      ]),
      gl.STATIC_DRAW,
    );
    this.ovUni = {
      aPos: gl.getAttribLocation(prog, 'a_pos'),
      aUv: gl.getAttribLocation(prog, 'a_uv'),
      mvp: gl.getUniformLocation(prog, 'u_mvp'),
      tex: gl.getUniformLocation(prog, 'u_tex'),
    };
  }

  /* ---------------- 复原图纹理 ---------------- */
  private loadRestore(src: string): void {
    if (!src) return;
    try {
      const gl = this.gl;
      const tex = gl.createTexture();
      this.restoreTex = tex;
      const img = this.canvas.createImage();
      img.onload = () => {
        try {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          this.restoreReady = true;
        } catch (e) {
          this.restoreReady = false;
        }
      };
      img.onerror = () => {
        this.restoreReady = false;
      };
      img.src = src;
    } catch (e) {
      this.restoreReady = false;
    }
  }

  /* ---------------- 每帧渲染 ---------------- */
  render(frame: any, camera: any, pose: number[] | null): void {
    if (this.destroyed) return;
    const gl = this.gl;
    try {
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.disable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.drawBackground(frame);
      if (pose && camera) this.drawOverlay(camera, pose);
    } catch (e) {
      /* 单帧渲染异常：上交由组件决定是否 fallback */
      throw e;
    }
  }

  /** 相机背景：YUV 全屏四边形 */
  private drawBackground(frame: any): void {
    if (!this.bgProg) return;
    const gl = this.gl;
    let yTexture: any = null;
    let uvTexture: any = null;
    try {
      const t = frame.getCameraTexture(gl, 'yuv');
      yTexture = t && t.yTexture;
      uvTexture = t && t.uvTexture;
    } catch (e) {
      return;
    }
    if (!yTexture || !uvTexture) return;

    const displayTransform = frame.getDisplayTransform
      ? frame.getDisplayTransform()
      : null;

    gl.useProgram(this.bgProg);
    gl.uniform1i(this.bgUni.y, 0);
    gl.uniform1i(this.bgUni.uv, 1);
    if (this.bgUni.dt && displayTransform) {
      gl.uniformMatrix3fv(this.bgUni.dt, false, displayTransform);
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, yTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, uvTexture);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bgPosBuf);
    gl.enableVertexAttribArray(this.bgUni.aPos);
    gl.vertexAttribPointer(this.bgUni.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bgUvBuf);
    gl.enableVertexAttribArray(this.bgUni.aUv);
    gl.vertexAttribPointer(this.bgUni.aUv, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /** 复原图叠加：按 anchor 姿态做透视四边形 */
  private drawOverlay(camera: any, pose: number[]): void {
    if (!this.ovProg || !this.restoreTex || !this.restoreReady) return;
    const gl = this.gl;
    try {
      const view: number[] = camera.viewMatrix;
      let proj: number[] = camera.getProjectionMatrix ? camera.getProjectionMatrix(NEAR, FAR) : null;
      if (!view || !proj) return;
      // MVP = proj * view * model（均列优先）
      const vp = mul4(proj as number[], view);
      const mvp = mul4(vp, pose);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(this.ovProg);
      gl.uniformMatrix4fv(this.ovUni.mvp, false, new Float32Array(mvp));
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.restoreTex);
      gl.uniform1i(this.ovUni.tex, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.ovBuf);
      gl.enableVertexAttribArray(this.ovUni.aPos);
      gl.vertexAttribPointer(this.ovUni.aPos, 3, gl.FLOAT, false, 5 * 4, 0);
      gl.enableVertexAttribArray(this.ovUni.aUv);
      gl.vertexAttribPointer(this.ovUni.aUv, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disable(gl.BLEND);
    } catch (e) {
      /* 叠加失败仅影响复原图，相机背景已上屏，不抛出 */
    }
  }

  /** 释放 WebGL 资源（幂等） */
  destroy(): void {
    this.destroyed = true;
    const gl = this.gl;
    try {
      if (this.restoreTex) gl.deleteTexture(this.restoreTex);
      if (this.bgPosBuf) gl.deleteBuffer(this.bgPosBuf);
      if (this.bgUvBuf) gl.deleteBuffer(this.bgUvBuf);
      if (this.ovBuf) gl.deleteBuffer(this.ovBuf);
      if (this.bgProg) gl.deleteProgram(this.bgProg);
      if (this.ovProg) gl.deleteProgram(this.ovProg);
    } catch (e) {
      /* ignore */
    }
    this.restoreTex = null;
  }
}
