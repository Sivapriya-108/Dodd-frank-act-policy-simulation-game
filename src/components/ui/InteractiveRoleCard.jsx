import React from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export const InteractiveRoleCard = React.forwardRef(function InteractiveRoleCard(
  { title, subtitle, imageUrl, actionText, href = '#', onActionClick, className },
  ref
) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const rotateX = useTransform(springY, [-0.5, 0.5], ['10.5deg', '-10.5deg'])
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-10.5deg', '10.5deg'])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseXVal = e.clientX - rect.left
    const mouseYVal = e.clientY - rect.top
    const xPct = mouseXVal / rect.width - 0.5
    const yPct = mouseYVal / rect.height - 0.5
    mouseX.set(xPct)
    mouseY.set(yPct)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      className={cn(
        'relative h-[24rem] w-full rounded-2xl bg-transparent shadow-2xl border border-zinc-600/40',
        className
      )}
    >
      <div
        style={{
          transform: 'translateZ(42px)',
          transformStyle: 'preserve-3d'
        }}
        className="absolute inset-3 grid h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] grid-rows-[1fr_auto] rounded-xl shadow-lg overflow-hidden"
      >
        <img
          src={imageUrl}
          alt={`${title}, ${subtitle}`}
          className="absolute inset-0 h-full w-full rounded-xl object-cover"
        />

        <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-b from-black/20 via-transparent to-black/70" />

        <div className="relative flex flex-col justify-between rounded-xl p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <motion.h2
                style={{ transform: 'translateZ(50px)' }}
                className="text-2xl font-bold"
              >
                {title}
              </motion.h2>
              <motion.p
                style={{ transform: 'translateZ(40px)' }}
                className="text-sm font-light text-white/85"
              >
                {subtitle}
              </motion.p>
            </div>
            <motion.a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08, rotate: '2deg' }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Learn more about ${title}`}
              style={{ transform: 'translateZ(56px)' }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/30"
            >
              <ArrowUpRight className="h-5 w-5 text-white" />
            </motion.a>
          </div>

          <motion.button
            type="button"
            onClick={onActionClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ transform: 'translateZ(40px)' }}
            className={cn(
              'w-full rounded-lg py-3 text-center font-semibold text-white transition-colors',
              'bg-white/10 backdrop-blur-md ring-1 ring-inset ring-white/20 hover:bg-white/20'
            )}
          >
            {actionText}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
})
