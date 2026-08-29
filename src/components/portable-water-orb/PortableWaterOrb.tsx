import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

interface PortableWaterOrbProps {
  size?: number
  label?: string
  ariaLabel?: string
  surfaceSelector?: string
  surfaceCutoff?: number
  panelTitle?: string
  panelContent?: ReactNode
  onOpenChange?: (open: boolean) => void
}

const vertexSource = `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const fragmentSource = `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform float clickAge;
  uniform float lightMode;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);
  }
  float fbm(vec2 p) {
    float value=0.; float amplitude=.5;
    for(int i=0;i<5;i++){ value+=noise(p)*amplitude; p=mat2(1.62,1.17,-1.17,1.62)*p; amplitude*=.5; }
    return value;
  }
  float waves(vec2 p,float t) {
    float a=atan(p.y,p.x);
    return sin(a*3.+t*1.2)*.018+sin(a*5.-t*.9)*.012+sin(a*8.+t*.55)*.006;
  }
  void main() {
    vec2 p=(gl_FragCoord.xy*2.-resolution)/resolution.y;
    float phase=mod(time,8.)/8.;
    float morph=pow(sin(phase*3.14159265),2.);
    float impact=exp(-pow((phase-.13)/.04,2.));
    float clickEnergy=exp(-clickAge*1.7)*step(0.,clickAge);
    float radius=.66+waves(p,time)*morph+impact*waves(p,time*3.)*1.8+sin(atan(p.y,p.x)*6.-clickAge*11.)*.026*clickEnergy;
    float d=length(p); float edge=radius-d;
    if(edge<-.035){ gl_FragColor=vec4(0.); return; }
    float z=sqrt(max(0.,radius*radius-d*d));
    vec3 n=normalize(vec3(p.x,p.y,z));
    n.xy+=vec2(sin(p.y*15.+time*1.4),cos(p.x*13.-time*1.1))*.045*morph;
    n=normalize(n);
    vec3 viewDir=vec3(0.,0.,1.); vec3 lightDir=normalize(vec3(-.55,.72,.8));
    float diffuse=max(dot(n,lightDir),0.); float fresnel=pow(1.-max(dot(n,viewDir),0.),2.4);
    float specular=pow(max(dot(reflect(-lightDir,n),viewDir),0.),70.);
    vec2 flowP=p*3.8;
    vec2 warp=vec2(fbm(flowP+vec2(time*.18,-time*.1)),fbm(flowP+vec2(-time*.12,time*.16)+4.7));
    float flow=fbm(flowP+(warp-.5)*2.4+vec2(0.,time*.2));
    float fineFlow=fbm(p*8.-warp*1.7-vec2(time*.12,0.));
    float caustic=pow(smoothstep(.48,.72,flow+fineFlow*.22),3.)*.22;
    float rippleFront=clickAge*1.15; float rippleDistance=length(p-vec2(-.28,.3));
    float ripple=sin((rippleDistance-rippleFront)*38.)*exp(-abs(rippleDistance-rippleFront)*13.)*exp(-clickAge*1.05)*step(0.,clickAge);
    vec3 deep=mix(vec3(.12,.48,.61),vec3(.14,.58,.68),lightMode);
    vec3 aqua=mix(vec3(.62,.91,.92),vec3(.58,.96,.94),lightMode);
    vec3 color=mix(deep,aqua,diffuse*.5+z*.2+flow*.15);
    float surfaceRestraint=mix(1.,.42,lightMode);
    color+=caustic*vec3(.45,1.,.95)*surfaceRestraint+max(ripple,0.)*vec3(.62,1.,.98)*.4+specular*vec3(mix(.72,.24,lightMode))+fresnel*vec3(.16,.34,.38);
    float rim=smoothstep(-.035,.025,edge);
    float alpha=rim*(mix(.38,.62,lightMode)+fresnel*mix(.42,.3,lightMode)+specular*mix(.1,.08,lightMode));
    gl_FragColor=vec4(color,alpha);
  }
`

const styles = `
.portable-water-orb{--orb-requested-size:90px;--orb-size:var(--orb-requested-size);position:fixed;z-index:80;right:max(24px,env(safe-area-inset-right));bottom:max(28px,env(safe-area-inset-bottom));width:var(--orb-size);height:var(--orb-size)}
.portable-water-orb__button{position:relative;width:100%;height:100%;padding:0;border:0;border-radius:50%;cursor:pointer;background:transparent;filter:drop-shadow(0 8px 13px rgba(0,73,119,.3));transition:transform .3s ease}
.portable-water-orb__button:hover{transform:scale(1.035)}
.portable-water-orb__button:focus-visible{outline:2px solid #6fd6d6;outline-offset:7px}
.portable-water-orb__canvas{position:absolute;inset:-13%;width:126%;height:126%;max-width:none;max-height:none;aspect-ratio:1/1}
.portable-water-orb__label{position:absolute;right:calc(100% + 5px);top:50%;width:max-content;padding:7px 10px;color:#071a2e;border:1px solid rgba(7,26,46,.08);border-radius:999px;background:rgba(246,248,250,.82);box-shadow:0 8px 24px rgba(7,26,46,.08);backdrop-filter:blur(12px);font:600 10px ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;transform:translateY(-50%);transition:opacity .25s ease}
.portable-water-orb.is-open .portable-water-orb__label{opacity:0}
.portable-water-orb__panel{position:absolute;right:4px;bottom:calc(100% + 20px);width:min(320px,calc(100vw - 36px));padding:22px;color:#eaffff;border:1px solid rgba(170,239,237,.2);border-radius:20px 20px 5px 20px;background:rgba(4,42,55,.94);box-shadow:0 25px 70px rgba(0,12,18,.5);backdrop-filter:blur(18px);opacity:0;visibility:hidden;transform:translateY(12px) scale(.97);transform-origin:bottom right;transition:.28s ease}
.portable-water-orb.is-open .portable-water-orb__panel{opacity:1;visibility:visible;transform:none}
.portable-water-orb__panel h2{margin:0 30px 8px 0;font:500 21px/1.15 system-ui,sans-serif;letter-spacing:-.03em}
.portable-water-orb__panel p{margin:0;color:#9ebfc2;font:400 13px/1.55 system-ui,sans-serif}
.portable-water-orb__close{position:absolute;top:11px;right:11px;width:44px;height:44px;color:#dff;border:1px solid rgba(170,239,237,.15);border-radius:50%;background:transparent;cursor:pointer}
.portable-water-orb.is-underwater .portable-water-orb__label{color:rgba(238,255,255,.96);border-color:rgba(150,240,232,.2);background:rgba(3,24,34,.66);box-shadow:0 8px 24px rgba(0,8,14,.22);text-shadow:0 0 12px rgba(150,240,232,.18)}
@media(max-width:600px){.portable-water-orb{--orb-size:min(var(--orb-requested-size),76px);right:max(14px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom))}.portable-water-orb__label{display:none}.portable-water-orb__panel{right:0;bottom:calc(100% + 16px)}}
@media(prefers-reduced-motion:reduce){.portable-water-orb__button,.portable-water-orb__panel{transition:none}}
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

export default function PortableWaterOrb({
  size = 90,
  label = 'Ask h.',
  ariaLabel = 'Open portfolio assistant',
  surfaceSelector = '.surface-hero',
  surfaceCutoff = .85,
  panelTitle = 'Ask beneath the surface.',
  panelContent = <p>Connect this panel to navigation, contact options, or an assistant.</p>,
  onOpenChange,
}: PortableWaterOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const clickTime = useRef(-10000)
  const lightMode = useRef(1)
  const [open, setOpen] = useState(false)
  const [underwater, setUnderwater] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { alpha: true, antialias: true })
    if (!canvas || !gl) return
    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
    const program = gl.createProgram()
    if (!vertex || !fragment || !program) return
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program); gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const resolution = gl.getUniformLocation(program, 'resolution')
    const time = gl.getUniformLocation(program, 'time')
    const clickAge = gl.getUniformLocation(program, 'clickAge')
    const light = gl.getUniformLocation(program, 'lightMode')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let renderedLight = lightMode.current
    const render = (now: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, reduced ? 1.5 : now / 1000)
      gl.uniform1f(clickAge, (now - clickTime.current) / 1000)
      renderedLight += (lightMode.current - renderedLight) * (reduced ? 1 : .06)
      gl.uniform1f(light, renderedLight); gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (!reduced && !document.hidden) frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(frame); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment); gl.deleteBuffer(buffer) }
  }, [])

  useEffect(() => {
    const update = () => {
      const surface = document.querySelector<HTMLElement>(surfaceSelector)
      const canvas = canvasRef.current
      if (!canvas) return
      const threshold = surface ? surface.getBoundingClientRect().top + surface.offsetHeight * surfaceCutoff : window.innerHeight * surfaceCutoff
      const submerged = canvas.getBoundingClientRect().top + canvas.offsetHeight / 2 >= threshold
      lightMode.current = submerged ? 0 : 1
      setUnderwater(submerged)
    }
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [surfaceCutoff, surfaceSelector])

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const toggle = () => {
    clickTime.current = performance.now()
    setOpen((current) => { const next = !current; onOpenChange?.(next); return next })
  }

  return <>
    <style>{styles}</style>
    <aside className={`portable-water-orb${open ? ' is-open' : ''}${underwater ? ' is-underwater' : ''}`} style={{ '--orb-requested-size': `${size}px` } as CSSProperties}>
      <div className="portable-water-orb__panel" id="portable-water-orb-panel" role="dialog" aria-hidden={!open} aria-label={panelTitle}>
        <button className="portable-water-orb__close" type="button" onClick={toggle} aria-label="Close panel">×</button>
        <h2>{panelTitle}</h2>
        {panelContent}
      </div>
      <span className="portable-water-orb__label">{label}</span>
      <button className="portable-water-orb__button" type="button" onClick={toggle} aria-label={ariaLabel} aria-expanded={open} aria-controls="portable-water-orb-panel">
        <canvas className="portable-water-orb__canvas" ref={canvasRef} width="320" height="320" aria-hidden="true" />
      </button>
    </aside>
  </>
}
