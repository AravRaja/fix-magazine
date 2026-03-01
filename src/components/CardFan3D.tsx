'use client'

import { useRef, useState, Suspense, MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'
import type { ArticleIndexEntry } from '@/lib/types'
import { featuredImageUrl, formatDate } from '@/lib/utils'

const CARD_W = 1.8
const CARD_H = 2.6
const RADIUS = 1.9      // tighter ring — cards closer to the axis
const N = 16
const TILT_X = -0.30   // ~-17° backward lean
const TILT_Z = -0.28   // ~-16° side lean — gives the tilted-axis look

// ─── Card meshes ─────────────────────────────────────────────────────────────

interface CardInnerProps {
  hovered: boolean
  onHover: (over: boolean) => void
  onClick: () => void
}

interface TexturedCardProps extends CardInnerProps {
  article: ArticleIndexEntry
}

function TexturedCard({ article, hovered, onHover, onClick }: TexturedCardProps) {
  const url = featuredImageUrl(article.featuredImage)!
  const texture = useTexture(url)
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const target = hovered ? 1.08 : 1.0
    meshRef.current.scale.x += (target - meshRef.current.scale.x) * 0.12
    meshRef.current.scale.y += (target - meshRef.current.scale.y) * 0.12
    meshRef.current.scale.z += (target - meshRef.current.scale.z) * 0.12
  })

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true) }}
      onPointerOut={() => onHover(false)}
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

function PlaceholderCard({ hovered, onHover, onClick }: CardInnerProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const target = hovered ? 1.08 : 1.0
    meshRef.current.scale.x += (target - meshRef.current.scale.x) * 0.12
    meshRef.current.scale.y += (target - meshRef.current.scale.y) * 0.12
    meshRef.current.scale.z += (target - meshRef.current.scale.z) * 0.12
  })

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true) }}
      onPointerOut={() => onHover(false)}
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshBasicMaterial color="#d0d0d0" side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── Card node (positioned in the ring) ──────────────────────────────────────

interface ArticleCardNodeProps {
  article: ArticleIndexEntry
  index: number
  hovered: boolean
  onHover: (over: boolean) => void
  onClick: () => void
}

function ArticleCardNode({ article, index, hovered, onHover, onClick }: ArticleCardNodeProps) {
  // Negate so index 1 (2nd newest) sits to the LEFT of front, matching reading order
  const angle = -(index / N) * Math.PI * 2
  const position: [number, number, number] = [
    Math.sin(angle) * RADIUS,
    0,
    Math.cos(angle) * RADIUS,
  ]
  // +π/2 → cards face tangentially (like pages of an open book / CD rack)
  const rotY = angle + Math.PI / 2
  const hasImage = article.featuredImage !== null

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {hasImage ? (
        <Suspense fallback={<PlaceholderCard hovered={hovered} onHover={onHover} onClick={onClick} />}>
          <TexturedCard article={article} hovered={hovered} onHover={onHover} onClick={onClick} />
        </Suspense>
      ) : (
        <PlaceholderCard hovered={hovered} onHover={onHover} onClick={onClick} />
      )}
    </group>
  )
}

// ─── Scene ───────────────────────────────────────────────────────────────────

interface CarouselSceneProps {
  articles: ArticleIndexEntry[]
  onHoverChange: (article: ArticleIndexEntry | null) => void
  draggingRef: MutableRefObject<boolean>
  spinRef: MutableRefObject<number>
  velRef: MutableRefObject<number>
  totalDeltaRef: MutableRefObject<number>
}

function CarouselScene({ articles, onHoverChange, draggingRef, spinRef, velRef, totalDeltaRef }: CarouselSceneProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const router = useRouter()
  const spinGroupRef = useRef<THREE.Group>(null)

  function handleHover(i: number, over: boolean) {
    const next = over ? i : null
    setHoveredIndex(next)
    onHoverChange(over ? articles[i] : null)
  }

  useFrame(() => {
    if (!spinGroupRef.current) return
    if (!draggingRef.current) {
      velRef.current *= 0.92
      spinRef.current += velRef.current
    }
    spinGroupRef.current.rotation.y = spinRef.current
  })

  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      {/* Outer: constant tilt (backward + side lean); Inner: Y spin from drag */}
      <group rotation={[TILT_X, 0, TILT_Z]}>
        <group ref={spinGroupRef}>
          {articles.map((article, i) => (
            <ArticleCardNode
              key={article.id}
              article={article}
              index={i}
              hovered={hoveredIndex === i}
              onHover={(over) => handleHover(i, over)}
              onClick={() => {
                if (totalDeltaRef.current < 8) router.push(`/${article.slug}`)
              }}
            />
          ))}
        </group>
      </group>
    </>
  )
}

// ─── Hover preview bar (rendered in DOM, below canvas) ────────────────────────

function HoverPreview({ article }: { article: ArticleIndexEntry }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '72px',
      left: 0,
      right: 0,
      zIndex: 10,
      background: '#fff',
      borderTop: '1px solid #000',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      fontFamily: '"IBM Plex Mono", monospace',
      pointerEvents: 'none',
    }}>
      {article.categories[0] && (
        <span style={{
          background: '#ebff00',
          color: '#000',
          padding: '2px 8px',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {article.categories[0]}
        </span>
      )}
      <span style={{
        fontWeight: 700,
        fontSize: '13px',
        color: '#000',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
      }}>
        {article.title}
      </span>
      <span style={{ color: '#555', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {article.author.name} · {formatDate(article.date)}
        {article.rating !== null && (
          <span style={{ color: '#000', fontWeight: 600 }}> · ★ {article.rating}/10</span>
        )}
      </span>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface CardFan3DProps {
  articles: ArticleIndexEntry[]
}

export default function CardFan3D({ articles }: CardFan3DProps) {
  const [hoveredArticle, setHoveredArticle] = useState<ArticleIndexEntry | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const carouselArticles = articles.slice(0, N)

  const draggingRef = useRef(false)
  const lastXRef = useRef(0)
  const spinRef = useRef(Math.PI / 10)
  const velRef = useRef(0)
  const totalDeltaRef = useRef(0)

  function onPointerDown(e: React.PointerEvent) {
    draggingRef.current = true
    lastXRef.current = e.clientX
    velRef.current = 0
    totalDeltaRef.current = 0
    setIsDragging(true)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return
    const dx = e.clientX - lastXRef.current
    lastXRef.current = e.clientX
    spinRef.current += dx * 0.003
    velRef.current = dx * 0.003
    totalDeltaRef.current += Math.abs(dx)
  }

  function onPointerUp() {
    draggingRef.current = false
    setIsDragging(false)
  }

  const isHovering = hoveredArticle !== null
  const cursor = isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Hover preview — full-width bar floating over top of canvas */}
      {hoveredArticle && <HoverPreview article={hoveredArticle} />}

      {/* Drag layer wrapping the canvas — yellow bg makes cards pop */}
      <div
        style={{ width: '100%', height: '100%', cursor, background: '#ebff00' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <Canvas
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0.8, 9], fov: 50 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          <CarouselScene
            articles={carouselArticles}
            onHoverChange={setHoveredArticle}
            draggingRef={draggingRef}
            spinRef={spinRef}
            velRef={velRef}
            totalDeltaRef={totalDeltaRef}
          />
        </Canvas>
      </div>
    </div>
  )
}
