import { useState, useEffect } from "react";

const RandomBG = () => {
  const [imageSrc, setImageSrc] = useState("");

  const imageList = ["https://ik.imagekit.io/tvlk/blog/2021/03/Mandalika.jpg", "https://ik.imagekit.io/tvlk/blog/2021/03/Mandalika.jpg"];

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
          className="w-full lg:h-screen h-40 object-cover"
          />
      ) : null}
    </>
  );
};

export default RandomBG;
