"use client"

import { useEffect, useRef } from "react"

export function SpinningCube() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    // Function to draw a pulsing white ball
    const drawPulsingBall = (time: number) => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Base radius and pulsing effect
      const baseRadius = 8
      const pulseAmount = 2
      const radius = baseRadius + Math.sin(time * 2) * pulseAmount

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create gradient for glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.5)
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)")
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      // Draw outer glow
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw main white ball
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fillStyle = "white"
      ctx.fill()
    }

    // Animation loop
    const animate = () => {
      time += 0.05
      drawPulsingBall(time)
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} width={32} height={32} className="h-8 w-8" />
}
