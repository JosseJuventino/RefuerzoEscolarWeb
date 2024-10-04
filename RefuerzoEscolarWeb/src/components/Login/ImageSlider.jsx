import { useState, useEffect } from "react";
import imageData from "../../data/images_slider.json";
import login_styles from "../../css/login.module.css";

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(login_styles.slideIn);
  const [isTransitioning, setIsTransitioning] = useState(false); // For controlling the transition state

  const imagesArray = imageData.images; // Access the images from the imported JSON

  // Automatically switch images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection(login_styles.slideOut); // Start sliding out the current image
      setIsTransitioning(true); // Set transitioning state

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesArray.length); 
        setSlideDirection(login_styles.slideIn); 
        setIsTransitioning(false); 
      }, 1000); 
    }, 3000); 

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [imagesArray]);

  return (
    <div className={login_styles.image_section}>
      {!isTransitioning && (
        <img
          src={imagesArray[currentIndex]}
          alt="Sliding Image"
          className={`${login_styles.slider_image} ${slideDirection}`} // Apply sliding direction using CSS modules
        />
      )}
    </div>
  );
}
