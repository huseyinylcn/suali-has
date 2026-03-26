import type { RefObject } from 'react';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { MapPoint3D } from '../../../lib/questionsApi';

type Vec3 = [number, number, number];

function normalizePositionsWithIds(points: MapPoint3D[]): { positions: Vec3[]; ids: string[] } {
  if (points.length === 0) return { positions: [], ids: [] };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
    minZ = Math.min(minZ, p.z);
    maxZ = Math.max(maxZ, p.z);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  const span = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1e-9);
  const target = 8;
  const s = target / span;
  const positions = points.map((p) => [(p.x - cx) * s, (p.y - cy) * s, (p.z - cz) * s] as Vec3);
  const ids = points.map((p) => p.id);
  return { positions: spreadNearlyCoincidentPositions(positions), ids };
}

/** Tıklanabilirlik için: normalize edilmiş uzayda çok yakın noktaları yalnızca görüntüde ayırır (ham coords değişmez). */
function spreadNearlyCoincidentPositions(positions: Vec3[]): Vec3[] {
  if (positions.length < 2) return positions.map((p) => [p[0], p[1], p[2]] as Vec3);
  const out = positions.map((p) => [p[0], p[1], p[2]] as Vec3);
  const n = out.length;
  const MIN_SEP = 0.26;
  const ITERS = 14;
  for (let iter = 0; iter < ITERS; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = out[j][0] - out[i][0];
        const dy = out[j][1] - out[i][1];
        const dz = out[j][2] - out[i][2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= MIN_SEP * MIN_SEP) continue;
        const d = Math.sqrt(Math.max(d2, 1e-30));
        let ux: number;
        let uy: number;
        let uz: number;
        if (d < 1e-7) {
          const t = ((i * 7 + j * 3) * 2.39996322972865332) % (Math.PI * 2);
          ux = Math.cos(t);
          uy = Math.sin(t);
          uz = 0.22 * Math.sin((i + j) * 0.71);
          const inv = 1 / Math.sqrt(ux * ux + uy * uy + uz * uz);
          ux *= inv;
          uy *= inv;
          uz *= inv;
        } else {
          ux = dx / d;
          uy = dy / d;
          uz = dz / d;
        }
        const half = 0.5 * (MIN_SEP - d) + 0.004;
        out[i][0] -= ux * half;
        out[i][1] -= uy * half;
        out[i][2] -= uz * half;
        out[j][0] += ux * half;
        out[j][1] += uy * half;
        out[j][2] += uz * half;
      }
    }
  }
  return out;
}

function proximitySegments(positions: Vec3[], maxDistSq: number, maxPoints: number): [Vec3, Vec3][] {
  const pts = positions.slice(0, maxPoints);
  const out: [Vec3, Vec3][] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i];
      const b = pts[j];
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      const dz = a[2] - b[2];
      if (dx * dx + dy * dy + dz * dz <= maxDistSq) out.push([a, b]);
    }
  }
  return out;
}

function createStarSpriteTexture() {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const ctx = c.getContext('2d');
  if (!ctx) {
    const px = new Uint8Array([255, 255, 255, 230]);
    const t = new THREE.DataTexture(px, 1, 1);
    t.needsUpdate = true;
    return t;
  }
  const cx = s / 2;
  const cy = s / 2;

  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.48);
  aura.addColorStop(0, 'rgba(220, 232, 255, 0.35)');
  aura.addColorStop(0.35, 'rgba(160, 190, 255, 0.12)');
  aura.addColorStop(0.65, 'rgba(100, 140, 220, 0.04)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, s, s);

  const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.36);
  body.addColorStop(0, 'rgba(255, 255, 255, 1)');
  body.addColorStop(0.18, 'rgba(248, 250, 255, 0.92)');
  body.addColorStop(0.45, 'rgba(200, 215, 255, 0.55)');
  body.addColorStop(0.72, 'rgba(130, 155, 210, 0.22)');
  body.addColorStop(0.9, 'rgba(60, 85, 140, 0.06)');
  body.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, s, s);

  const hx = cx - s * 0.11;
  const hy = cy - s * 0.13;
  const hi = ctx.createRadialGradient(hx, hy, 0, hx, hy, s * 0.16);
  hi.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  hi.addColorStop(0.25, 'rgba(255, 252, 255, 0.45)');
  hi.addColorStop(0.55, 'rgba(230, 240, 255, 0.1)');
  hi.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = hi;
  ctx.fillRect(0, 0, s, s);

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.1);
  core.addColorStop(0, 'rgba(255, 255, 255, 1)');
  core.addColorStop(0.55, 'rgba(255, 255, 255, 0.2)');
  core.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, s, s);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const COORD_STAR_POINT_SIZE = 1.15;

function CoordStarSprites({
  positions,
  ids,
  summaries,
  onPointClick,
  onPointHover
}: {
  positions: Vec3[];
  ids: string[];
  summaries: Record<string, string>;
  onPointClick: (id: string) => void;
  onPointHover: (info: { index: number; label: string } | null) => void;
}) {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const texture = useMemo(() => createStarSpriteTexture(), []);

  useEffect(() => () => texture.dispose(), [texture]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const n = positions.length;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = positions[i][0];
      pos[i * 3 + 1] = positions[i][1];
      pos[i * 3 + 2] = positions[i][2];
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [positions]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    const m = matRef.current;
    if (!m) return;
    const t = clock.getElapsedTime();
    m.size = COORD_STAR_POINT_SIZE * (1 + 0.05 * Math.sin(t * 1.4));
  });

  if (positions.length === 0) return null;

  return (
    <points
      geometry={geometry}
      renderOrder={3}
      onClick={(e) => {
        e.stopPropagation();
        const idx = e.index;
        if (idx == null || idx < 0) return;
        const id = ids[idx];
        if (id) onPointClick(id);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        const idx = e.index;
        if (idx == null || idx < 0) {
          onPointHover(null);
          return;
        }
        const id = ids[idx];
        if (!id) {
          onPointHover(null);
          return;
        }
        const label = summaries[id] ?? id;
        onPointHover({ index: idx, label });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointHover(null);
      }}
    >
      <pointsMaterial
        ref={matRef}
        map={texture}
        transparent
        alphaTest={0}
        depthWrite={false}
        size={COORD_STAR_POINT_SIZE}
        sizeAttenuation
        color="#e4ecff"
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

function SelectionHalo({ position }: { position: Vec3 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = meshRef.current;
    if (!m) return;
    const p = 1 + 0.12 * Math.sin(clock.getElapsedTime() * 3);
    m.scale.setScalar(p);
  });
  return (
    <mesh ref={meshRef} position={position} renderOrder={4}>
      <sphereGeometry args={[0.42, 20, 20]} />
      <meshBasicMaterial
        color="#fbbf24"
        transparent
        opacity={0.35}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function SelectionFocusAnchor({
  position,
  controlsRef
}: {
  position: Vec3;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const anchorRef = useRef<THREE.Group>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const anchor = anchorRef.current;
    const ctrl = controlsRef.current;
    if (!anchor || !ctrl) return;
    anchor.position.set(position[0], position[1], position[2]);
    anchor.updateWorldMatrix(true, false);
    anchor.getWorldPosition(worldPos);
    ctrl.target.lerp(worldPos, 1 - Math.exp(-5 * delta));
    ctrl.update();
  });

  return <group ref={anchorRef} />;
}

function HoverTooltipProjector({
  positions,
  hoveredIndex,
  groupRef,
  onProject
}: {
  positions: Vec3[];
  hoveredIndex: number | null;
  groupRef: RefObject<THREE.Group | null>;
  onProject: (pos: { x: number; y: number } | null) => void;
}) {
  const { camera, gl } = useThree();
  const local = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const prevIndex = useRef<number | null>(null);

  useFrame(() => {
    if (
      hoveredIndex == null ||
      hoveredIndex < 0 ||
      hoveredIndex >= positions.length ||
      !groupRef.current
    ) {
      if (prevIndex.current !== null) {
        prevIndex.current = null;
        onProject(null);
      }
      return;
    }
    prevIndex.current = hoveredIndex;
    const p = positions[hoveredIndex];
    local.set(p[0], p[1], p[2]);
    local.applyMatrix4(groupRef.current.matrixWorld);
    projected.copy(local).project(camera);
    const r = gl.domElement.getBoundingClientRect();
    const x = r.left + (projected.x * 0.5 + 0.5) * r.width;
    const y = r.top + (-projected.y * 0.5 + 0.5) * r.height;
    onProject({ x, y });
  });

  return null;
}

function SceneRoot({
  positions,
  ids,
  summaries,
  selectedLocal,
  hoveredIndex,
  onPointClick,
  onPointHover,
  onProjectTooltip,
  controlsRef
}: {
  positions: Vec3[];
  ids: string[];
  summaries: Record<string, string>;
  selectedLocal: Vec3 | null;
  hoveredIndex: number | null;
  onPointClick: (id: string) => void;
  onPointHover: (info: { index: number; label: string } | null) => void;
  onProjectTooltip: (pos: { x: number; y: number } | null) => void;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const segments = useMemo(() => {
    if (positions.length < 2) return [];
    const d = 3.1;
    return proximitySegments(positions, d * d, 90);
  }, [positions]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      <Grid
        infiniteGrid
        position={[0, -5, 0]}
        cellSize={0.55}
        cellThickness={0.65}
        cellColor="#4338ca"
        sectionSize={3.3}
        sectionThickness={1.1}
        sectionColor="#6d28d9"
        fadeDistance={46}
        fadeStrength={1}
      />
      {segments.map(([a, b], i) => (
        <Line
          key={`seg-${i}`}
          points={[a, b]}
          color="#a5b4fc"
          lineWidth={1}
          transparent
          opacity={0.28}
          dashed
          dashScale={3}
          dashSize={0.35}
          gapSize={0.22}
        />
      ))}
      <CoordStarSprites
        positions={positions}
        ids={ids}
        summaries={summaries}
        onPointClick={onPointClick}
        onPointHover={onPointHover}
      />
      <HoverTooltipProjector
        positions={positions}
        hoveredIndex={hoveredIndex}
        groupRef={groupRef}
        onProject={onProjectTooltip}
      />
      {selectedLocal ? (
        <>
          <SelectionHalo position={selectedLocal} />
          <SelectionFocusAnchor position={selectedLocal} controlsRef={controlsRef} />
        </>
      ) : null}
    </group>
  );
}

function DistantStarField() {
  return (
    <group position={[0, 0, -140]} renderOrder={-2}>
      <Stars
        radius={420}
        depth={120}
        count={7000}
        factor={0.85}
        saturation={0.15}
        fade
        speed={0.15}
      />
    </group>
  );
}

function SpaceBackdrop() {
  return (
    <>
      <color attach="background" args={['#02040a']} />
      <fog attach="fog" args={['#02040a', 28, 88]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[16, 14, 10]} intensity={2.1} color="#c4b5fd" distance={70} decay={2} />
      <pointLight position={[-18, -12, -14]} intensity={1.1} color="#22d3ee" distance={65} decay={2} />
      <spotLight position={[0, 22, 0]} angle={0.55} penumbra={0.92} intensity={0.45} color="#e0e7ff" />
      <DistantStarField />
    </>
  );
}

export function QuestionsSpaceMap({
  points,
  pointSummaries,
  selectedQuestionId,
  onSelectQuestionId
}: {
  points: MapPoint3D[];
  pointSummaries: Record<string, string>;
  selectedQuestionId: string | null;
  onSelectQuestionId: (id: string | null) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { positions, ids } = useMemo(() => normalizePositionsWithIds(points), [points]);
  const hasData = positions.length > 0;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const hoverLabelRef = useRef<string | null>(null);

  const selectedLocal = useMemo(() => {
    if (!selectedQuestionId) return null;
    const i = ids.indexOf(selectedQuestionId);
    if (i < 0) return null;
    return positions[i];
  }, [selectedQuestionId, ids, positions]);

  const handlePointClick = (id: string) => {
    onSelectQuestionId(id);
  };

  const applyTooltipPos = useCallback((pos: { x: number; y: number } | null) => {
    const el = tooltipRef.current;
    if (!el) return;
    if (!pos) {
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
      return;
    }
    el.style.opacity = '1';
    el.style.visibility = 'visible';
    el.style.left = `${pos.x + 12}px`;
    el.style.top = `${pos.y + 12}px`;
  }, []);

  const handlePointHover = useCallback(
    (info: { index: number; label: string } | null) => {
      if (!info) {
        hoverLabelRef.current = null;
        setHoveredIndex(null);
        setHoverLabel(null);
        applyTooltipPos(null);
        return;
      }
      hoverLabelRef.current = info.label;
      setHoveredIndex(info.index);
      setHoverLabel(info.label);
    },
    [applyTooltipPos]
  );

  const handleProjectTooltip = useCallback(
    (pos: { x: number; y: number } | null) => {
      if (!pos) {
        applyTooltipPos(null);
        return;
      }
      if (!hoverLabelRef.current) return;
      applyTooltipPos(pos);
    },
    [applyTooltipPos]
  );

  const clearHover = useCallback(() => {
    hoverLabelRef.current = null;
    setHoveredIndex(null);
    setHoverLabel(null);
    applyTooltipPos(null);
  }, [applyTooltipPos]);

  return (
    <div
      className="relative h-[min(72vh,560px)] w-full min-h-[360px] overflow-hidden rounded-lg border border-[var(--gh-border)] bg-[#030510] shadow-[inset_0_0_80px_rgba(88,28,135,0.15)]"
      onPointerLeave={clearHover}
    >
      <div
        ref={tooltipRef}
        className="pointer-events-none fixed z-[60] box-border max-w-[min(18rem,calc(100vw-2rem))] overflow-x-hidden rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-2.5 py-2 text-left shadow-lg"
        style={{ opacity: 0, visibility: 'hidden', left: 0, top: 0 }}
        role="tooltip"
      >
        {hoverLabel ? (
          <p className="max-h-[min(40vh,16rem)] max-w-full overflow-x-hidden overflow-y-auto whitespace-pre-line break-words text-[11px] leading-snug text-[var(--gh-fg)] [overflow-wrap:anywhere]">
            {hoverLabel}
          </p>
        ) : null}
      </div>
      <Canvas
        className="h-full w-full touch-none"
        camera={{ position: [0, 4.5, 17], fov: 50, near: 0.1, far: 220 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        raycaster={{
          params: {
            Mesh: {},
            Line: { threshold: 0.2 },
            LOD: {},
            Points: { threshold: 0.45 },
            Sprite: {}
          }
        }}
        onPointerMissed={() => onSelectQuestionId(null)}
      >
        <Suspense fallback={null}>
          <SpaceBackdrop />
          <SceneRoot
            positions={positions}
            ids={ids}
            summaries={pointSummaries}
            selectedLocal={selectedLocal}
            hoveredIndex={hoveredIndex}
            onPointClick={handlePointClick}
            onPointHover={handlePointHover}
            onProjectTooltip={handleProjectTooltip}
            controlsRef={controlsRef}
          />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            autoRotate={!selectedQuestionId}
            autoRotateSpeed={hasData ? 0.32 : 0.12}
            enableDamping
            dampingFactor={0.056}
            minDistance={5.5}
            maxDistance={52}
            maxPolarAngle={Math.PI * 0.93}
          />
        </Suspense>
      </Canvas>
      {!hasData && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-t from-[#030510]/80 via-[#030510]/35 to-transparent px-4 text-center">
          <p className="text-sm font-medium text-violet-100/90">Henüz gösterilecek nokta yok</p>
          <p className="max-w-sm text-xs text-violet-200/45">
            Liste sekmesinde <strong className="font-medium text-violet-100/70">En Benzer Sorular</strong> ile veri
            yüklediğinizde koordinatlar burada görünür.
          </p>
        </div>
      )}
    </div>
  );
}
