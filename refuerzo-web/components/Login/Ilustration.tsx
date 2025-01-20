"use client";
import Image from "next/image";

import React from "react";

const Illustration: React.FC = () => {
  return (
    <div className="w-full md:w-1/2 bg-pink-200 flex items-center justify-center">
      <Image
        src="https://media.vaticannews.va/media/content/dam-archive/vaticannews/multimedia/2020/12/04/WhatsApp-Image-2020-12-02-at-08.12.31aem.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.1000.563.jpeg"
        className="w-full h-full object-cover"
        alt="Illustration"
      />
    </div>
  );
};

export default Illustration;
