import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
export function AnimatedSection({ children }) {
    const ref = React.useRef(null);
    const [isVisible, setIsVisible] = React.useState(false);
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setIsVisible(true);
        },
        {
          threshold: 0.1,
          rootMargin: '0px',
        }
      );
  
      if (ref.current) observer.observe(ref.current);
  
      return () => {
        if (ref.current) observer.unobserve(ref.current);
      };
    }, []);
  
    return (
      <motion.div
        ref={ref}
        //style={{ minHeight: '50vh' }} // Ensure there's enough space so they're not all in view
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.8,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        {children}
      </motion.div>
    );
}