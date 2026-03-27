import { motion } from "framer-motion";

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  duration: 4 + Math.random() * 6,
  delay: Math.random() * 4,
}));

const GoldParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
    {particles.map((p) => (
      <motion.div
        key={p.id}
        className="absolute rounded-full"
        style={{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          background: `radial-gradient(circle, hsl(43 72% 60% / 0.8), hsl(43 72% 50% / 0))`,
        }}
        animate={{
          y: [0, -40, -80],
          x: [0, (Math.random() - 0.5) * 30],
          opacity: [0, 0.7, 0],
          scale: [0.5, 1.2, 0.3],
        }}
        transition={{
          duration: p.duration,
          delay: p.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export default GoldParticles;
