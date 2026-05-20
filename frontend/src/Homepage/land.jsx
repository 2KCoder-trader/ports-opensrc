import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import Grid from "@mui/material/Grid2";
import { Typography, Box } from "@mui/material";
import CardImage from "./icons/CardImage.png";
import StockImage from "./icons/StockImage.png";
import Features from "./Features";
import GetStarted from "./GetStarted";
import OurStory from "./OurStory";
import { AnimatedSection } from "./AnimatedSection";
import Footer from "./Footer";
import portsImage from "./Images/ports_logo.png";
import styles from "./Home.module.css";
import { Hero } from "./Hero";
import { SignInButton, SignUpButton, DiscordButton } from "./HeaderButtons";
import ParticlesComponent from "./tsparticles";

function PortfolioCard({ alt, delay }) {
  return (
    <div className={styles.portfolioCard} style={{ animationDelay: `${delay}s` }}>
      <img
        src={CardImage}
        alt={alt}
        width={270}
        height={340}
      />
    </div>
  );
}

function StockCard({ alt, delay }) {
  return (
    <div className={styles.portfolioCard}>
      <img
        src={StockImage}
        alt={alt}
        width={382}
        height={106}
        style={{ 
          filter: "brightness(1.5) contrast(1.2)",
          WebkitFilter: "brightness(1.5) contrast(1.2)"
        }}
      />
    </div>
  );
}

function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div style={{ backgroundColor: "#111152", minHeight: "100vh", margin: "0", padding: "0", overflow: "hidden" }}>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1.5 }}
      >
        <AnimatedSection delay={0.5}>
          <Grid container spacing={3} sx={{ 
            backgroundColor: "rgba(8, 8, 35, 0.95)", 
            padding: "15px",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            alignItems: "center" 
          }}>
          <Grid item md={6} xs={4}>
              <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <img
                src={portsImage}
                alt="Ports Logo"
                  style={{ 
                    width: "72px",
                    height: "64px",
                    marginRight: "12px",
                    filter: "drop-shadow(0 0 8px rgba(139, 109, 190, 0.3))"
                  }}
              />
            </a>
          </Grid>
          <Grid
            container
            spacing={2}
              sx={{ 
                alignItems: "center", 
                justifyContent: "flex-end",
                gap: "10px"
              }}
            >
              <Grid item>
              <SignUpButton />
            </Grid>
              <Grid item>
              <SignInButton />
            </Grid>
            <Grid item>
              <DiscordButton />
              </Grid>
          </Grid>
        </Grid>
      </AnimatedSection>

        <AnimatedSection delay={0.8}>
          <Grid 
            container 
            spacing={0} 
            sx={{ 
              backgroundColor: "#111152",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "90vh",
              padding: "80px 0",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(circle at 50% 50%, rgba(139, 109, 190, 0.15) 0%, rgba(17, 17, 82, 0) 70%)",
                pointerEvents: "none"
              }
            }}
          >
            <Grid item xs={12} md={10} lg={8} sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
            <img
              src={portsImage}
              alt="Ports Logo"
                  style={{ 
                    width: "180px",
                    marginBottom: "30px",
                    filter: "drop-shadow(0 0 15px rgba(139, 109, 190, 0.4))"
                  }}
                />
            <Typography
              sx={{
                    fontSize: { xs: "40px", md: "60px" },
                color: "#ffffff",
                fontWeight: "bold",
                    marginBottom: "20px",
                    textShadow: "0 0 20px rgba(139, 109, 190, 0.3)"
              }}
            >
              Ports
            </Typography>
                <Hero />
              </motion.div>
          </Grid>
        </Grid>
      </AnimatedSection>
      
        <AnimatedSection delay={1.2}>
          <section className={styles.portfolioSection} style={{ padding: "100px 0" }}>
            <Typography variant="h2" sx={{
              color: "#ffffff",
              fontSize: "3rem",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "4rem",
              textShadow: "0 0 20px rgba(139, 109, 190, 0.3)"
            }}>
              Check out the ports.
            </Typography>
            
            <Typography sx={{
              color: "#e0d5f3",
              fontSize: "1.2rem",
              textAlign: "center",
              marginBottom: "4rem",
              opacity: 0,
              animation: "fadeIn 0.8s ease-out 0.8s forwards",
              "@keyframes fadeIn": {
                to: {
                  opacity: 0.9
                }
              }
            }}>
              (and build some of your own!)
            </Typography>
            
            <Box sx={{
              position: "relative",
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "0 20px"
            }}>
              <Grid container sx={{ 
                position: "relative", 
                zIndex: 1,
                justifyContent: "center",
                gap: { xs: 2, md: 4 },
                flexWrap: "wrap",
                width: "100%",
                maxWidth: "1200px",
                margin: "0 auto"
              }}>
                {/* First Row */}
                <Grid container item spacing={4} sx={{ 
                  justifyContent: "center", 
                  width: "100%",
                  marginBottom: "40px",
                  marginLeft: { xs: 0, md: "-80px" }
                }}>
                  {[
                    { alt: "Growth Port", delay: 0 },
                    { alt: "Tech Port", delay: 0.1 },
                    { alt: "Value Port", delay: 0.2 }
                  ].map((card, index) => (
                    <Grid 
                      item 
                      key={card.alt}
                      xs={12} 
                      sm={6} 
                      md={4}
                      sx={{
                        opacity: 0,
                        transform: "translateY(40px)",
                        animation: `fadeInUp 0.6s ease-out ${card.delay}s forwards`,
                        "@keyframes fadeInUp": {
                          to: {
                            opacity: 1,
                            transform: "translateY(0)"
                          }
                        }
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <PortfolioCard alt={card.alt} />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                {/* Second Row */}
                <Grid container item spacing={4} sx={{ 
                  justifyContent: "center", 
                  width: "100%",
                  marginLeft: { xs: 0, md: "80px" }
                }}>
                  {[
                    { alt: "Dividend Port", delay: 0.3 },
                    { alt: "Growth Port 2", delay: 0.4 },
                    { alt: "Tech Port 2", delay: 0.5 }
                  ].map((card, index) => (
                    <Grid 
                      item 
                      key={card.alt}
                      xs={12} 
                      sm={6} 
                      md={4}
                      sx={{
                        opacity: 0,
                        transform: "translateY(40px)",
                        animation: `fadeInUp 0.6s ease-out ${card.delay}s forwards`,
                        "@keyframes fadeInUp": {
                          to: {
                            opacity: 1,
                            transform: "translateY(0)"
                          }
                        }
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <PortfolioCard alt={card.alt} />
                      </motion.div>
                    </Grid>
                  ))}
          </Grid>
        </Grid>
            </Box>
        </section>
      </AnimatedSection>

        <AnimatedSection delay={1.5}>
        <section className={styles.stockSection}>
            <Box sx={{
              position: "relative",
              padding: "100px 0"
            }}>
              <Typography variant="h2" sx={{
                color: "#ffffff",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: "800",
                textAlign: "center",
                marginBottom: "1rem",
                textShadow: "0 0 20px rgba(139, 109, 190, 0.3)"
              }}>
                Add to your collection
              </Typography>
              <Typography sx={{
                color: "#e0d5f3",
                fontSize: "1.1rem",
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto 4rem",
                opacity: 0.9,
                lineHeight: 1.6
              }}>
                Discover and invest in top-performing stocks with real-time market insights and smart recommendations.
              </Typography>

              <Box sx={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 20px",
                position: "relative"
              }}>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <Grid container spacing={3} sx={{
                    transform: "rotate(-5deg)",
                    marginBottom: "40px"
                  }}>
                    {[1, 2, 3, 4].map((_, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <motion.div
                          whileHover={{ 
                            scale: 1.05,
                            rotate: 5,
                            transition: { duration: 0.2 }
                          }}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                        >
                          <StockCard alt={`Stock Card ${index + 1}`} delay={index * 0.2} />
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>

                  <Grid container spacing={3} sx={{
                    transform: "rotate(-5deg)",
                    justifyContent: "center"
                  }}>
                    {[1, 2, 3].map((_, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <motion.div
                          whileHover={{ 
                            scale: 1.05,
                            rotate: 5,
                            transition: { duration: 0.2 }
                          }}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index + 4) * 0.2 }}
                        >
                          <StockCard alt={`Stock Card ${index + 5}`} delay={(index + 4) * 0.2} />
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              </Box>
            </Box>
        </section>
      </AnimatedSection>

        <AnimatedSection delay={1.8}>
          <section className={styles.descriptionSection} style={{ padding: "100px 0" }}>
            <Typography variant="h2" sx={{
              color: "#ffffff",
              fontSize: "2.5rem",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "3rem",
              textShadow: "0 0 20px rgba(139, 109, 190, 0.3)"
            }}>
              Simple, transparent pricing
            </Typography>
            <Typography sx={{
              color: "#e0d5f3",
              fontSize: "1.2rem",
              textAlign: "center",
              maxWidth: "800px",
              margin: "0 auto",
              padding: "0 2rem",
              lineHeight: 1.6,
              opacity: 0.9
            }}>
              By using a proprietary algorithm to calculate an expense ratio for every port, 
              we ensure that you get the best deal based on risk, volatility, performance, and many other metrics.
            </Typography>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={2}>
        <Features style={{ padding: "100px 0" }} />
      </AnimatedSection>

      <AnimatedSection delay={2}>
        <GetStarted style={{ padding: "100px 0" }} />
      </AnimatedSection>

      <AnimatedSection delay={2}>
        <OurStory style={{ padding: "100px 0" }} />
      </AnimatedSection>

      <Footer delay={2} style={{ marginTop: "60px" }} />
    </motion.div>
    </div>
  );
}

export { LandingPage as KLandingPage };