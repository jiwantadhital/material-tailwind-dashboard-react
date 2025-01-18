import React, { useState, useEffect } from "react";
import { authService } from "../../services/apiService";

const Carousel = () => {
  const [images, setImages] = useState(Array(3).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);

  // Add useEffect to fetch existing images
  useEffect(() => {
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      const response = await authService.getCarouselImages();
      // Assuming the API returns an array of image objects
      setImages(response.data || Array(3).fill(null));
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const title = `T${index + 1}`; // T1, T2, or T3 based on index
        await authService.uploadCarouselImage(file, title);
        // Refresh images after upload
        await fetchCarouselImages();
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Carousel Display */}
      <div className="w-full max-w-md mb-8">
        <div className="relative aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden">
          {images[currentIndex] ? (
            <img
                src={`http://localhost:8000/${images[currentIndex].image}`}
              alt={`Slide ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No image uploaded</p>
            </div>
          )}
        </div>
      
        
        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                currentIndex === index ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Upload Buttons */}
      <div className="flex gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex flex-col items-center">
            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              {images[index] ? 'Replace' : 'Upload'} Image {index + 1}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, index)}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
