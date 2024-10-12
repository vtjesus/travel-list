// stores/imageStore.js
import { defineStore } from "pinia";

export const useImageStore = defineStore("imageStore", () => {
  // Method to create a base64 string from the file
  const createBase64Image = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // Base64 string
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Method to handle image file input and convert to base64
  const handleImage = async (e) => {
    const selectedImage = e.target.files[0];
    try {
      const base64Image = await createBase64Image(selectedImage);
      return base64Image; // Return the base64 image
    } catch (error) {
      console.error("Error converting image to Base64:", error);
      return null; // Return null in case of an error
    }
  };

  return { createBase64Image, handleImage };
});
