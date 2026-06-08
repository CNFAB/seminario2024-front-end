import { motion } from 'framer-motion';
import '../styles/Hero.css';

const Hero = () => {
  const circuitVariants = {
    animate: {
      pathLength: [0, 1],
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const phoneVariants = {
    float: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const sparkVariants = {
    sparkle: {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: 0.5,
      },
    },
  };

  return (
    <section id="home" className="hero">
      <div className="hero-background">
        <div className="grid-bg"></div>
        <div className="glow-1"></div>
        <div className="glow-2"></div>
      </div>

      <div className="hero-container">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="hero-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span>Reparación de Celulares</span>
            <br />
            <span className="gradient-text">Profesional y Rápida</span>
          </motion.h2>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Expertos en reparación de todos los modelos. Garantía de calidad en cada servicio.
          </motion.p>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Solicitar Servicio
            </motion.button>
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Servicios
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          variants={phoneVariants}
          animate="float"
        >
          <div className="phone-wrapper">
            <svg className="phone-illustration" viewBox="0 0 200 400" fill="none">
              <defs>
                <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b35" />
                  <stop offset="100%" stopColor="#ffa500" />
                </linearGradient>
              </defs>

              <rect x="30" y="20" width="140" height="360" rx="20" fill="url(#phoneGrad)" opacity="0.1" stroke="url(#phoneGrad)" strokeWidth="2"/>
              <rect x="40" y="35" width="120" height="300" rx="15" fill="#000" />

              <circle cx="100" cy="150" r="40" fill="none" stroke="#ff6b35" strokeWidth="2" opacity="0.5"/>
              <circle cx="100" cy="150" r="30" fill="none" stroke="#ffa500" strokeWidth="1" opacity="0.3"/>

              <g opacity="0.8">
                <line x1="100" y1="80" x2="100" y2="220" stroke="#ff6b35" strokeWidth="1"/>
                <line x1="60" y1="150" x2="140" y2="150" stroke="#ff6b35" strokeWidth="1"/>
              </g>
            </svg>

            <motion.div
              className="spark spark-1"
              variants={sparkVariants}
              animate="sparkle"
            >
              ✨
            </motion.div>
            <motion.div
              className="spark spark-2"
              variants={sparkVariants}
              animate="sparkle"
              transition={{ delay: 1 }}
            >
              ⚡
            </motion.div>
            <motion.div
              className="spark spark-3"
              variants={sparkVariants}
              animate="sparkle"
              transition={{ delay: 1.5 }}
            >
              🔧
            </motion.div>
          </div>

          <motion.svg
            className="circuit-board"
            viewBox="0 0 400 300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            viewport={{ once: true }}
          >
            <motion.path
              d="M 50 150 L 150 150 L 150 100 L 250 100 L 250 200"
              stroke="#ff6b35"
              strokeWidth="2"
              fill="none"
              variants={circuitVariants}
              animate="animate"
            />
            <motion.circle cx="150" cy="150" r="5" fill="#ff6b35" />
            <motion.circle cx="250" cy="100" r="5" fill="#ff6b35" />
            <motion.circle cx="250" cy="200" r="5" fill="#ff6b35" />
          </motion.svg>
        </motion.div>
      </div>

      <motion.div
        className="scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="scroll-mouse">
          <div className="scroll-dot"></div>
        </div>
        <span>Desplázate para explorar</span>
      </motion.div>
    </section>
  );
};

export default Hero;
