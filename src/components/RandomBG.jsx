import { useState, useEffect } from "react";

const RandomBG = () => {
  const [imageSrc, setImageSrc] = useState("");

  const imageList = ["https://berundang.com/wp-content/uploads/2024/06/postingan-instagram-tambahan-nama-scaled.jpg", "https://berundang.com/wp-content/uploads/2024/06/postingan-instagram-2-tambahan-nama-scaled.jpg"];

  useEffect(() => {
    const randomImage = imageList[Math.floor(Math.random() * imageList.length)];
    setImageSrc(randomImage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {imageSrc ? (
          <img
          src={imageSrc}
          alt="best bid & quick quote"
          className="w-full lg:h-screen object-cover"
          />
      ) : null}
    </>
  );
};

export default RandomBG;
