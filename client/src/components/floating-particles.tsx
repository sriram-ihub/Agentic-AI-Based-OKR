import { motion } from "framer-motion";

const FloatingParticles = () => {
  const particles = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="floating-particles">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="particle"
          style={{
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
            left: Math.random() * 100 + "%",
          }}
          animate={{
            y: [window.innerHeight + 100, -100],
            rotate: [0, 360],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
