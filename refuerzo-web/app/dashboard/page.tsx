"use client";
import Image from "next/image";
import { useState } from "react";

export default function Dashboard() {
  const images = [
    "https://scontent.fsvq6-1.fna.fbcdn.net/v/t1.6435-9/78085714_10157918657942722_8043497555176194048_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=LzauR8QzyAoQ7kNvgFz_m8l&_nc_oc=AdivSGWaXYotSaF0FdyUWuvONDE4LAtyPP7VzkVxEajBgkhidRFutw6NIwx9uBUBie9Ky8uJyxnEpKhDUgrzBMOb&_nc_zt=23&_nc_ht=scontent.fsvq6-1.fna&_nc_gid=AoYtPgUhsUPrcoBceiO45Gn&oh=00_AYAbWpMcywe91ufSoNcLn-FOGZHsFiyB6ezxQ4gH-AUk-A&oe=67C1FA98",
    "https://scontent.fsvq6-1.fna.fbcdn.net/v/t39.30808-6/468910038_10162345449812722_7574478234706282205_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=86c6b0&_nc_ohc=7CkfK5sPGVgQ7kNvgF7jts1&_nc_oc=AdgQ15GCkTdhVMgp7wBE4dVqUuh78O8ig8d3LjUIgUgYGAUiLoXmQYZOqABs34jJA4b0Qc6SSjiEUfUF2WHrFC2a&_nc_zt=23&_nc_ht=scontent.fsvq6-1.fna&_nc_gid=A3ti1F5Fv-d0FgohcQG-BgX&oh=00_AYCPlTps7H-P7iXt_ZbIjRRXVdwu6uo2oM1IA04KRAQW_A&oe=67A07860",
    "https://scontent.fsvq6-1.fna.fbcdn.net/v/t39.30808-6/432536819_812825910890552_8026197173708377019_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=veyr-N8fV-QQ7kNvgH5tR5B&_nc_oc=Adgyih7tCIh7M4JIr81rUtgkhqgncqMTnh6MWmdAvsNWcu7LuwcPiPFHARhmRXFwMgkdYuFYusiW7pt1Qz-0dJOP&_nc_zt=23&_nc_ht=scontent.fsvq6-1.fna&_nc_gid=AP7rZ2a235GwqN3F5ejIs-_&oh=00_AYCCFmE1sj0fIrWJn73WGLNz70-TQSdwIs6hnCu7baKcbA&oe=67A068F4",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="px-4 md:px-20 py-3 md:mt-0 mt-0">

      <h1 className="text-2xl font-bold text-center text-blue_principal">
        Refuerzo escolar Ing. William Mendoza
      </h1>
      <h2 className="text-lg text-center italic font-normal text-gray-500">
        &#8220;La educación es el arte de hacer visibles las cosas
        invisibles&#8221; &#40;Jean-François Lyotard&#41;
      </h2>

      <div className="px-4 md:px-32">
        <div className="mt-6 w-full relative h-[200px] md:h-[350px] overflow-hidden">
          <Image
            src={images[currentImageIndex]}
            alt={`Imagen ${currentImageIndex + 1}`}
            fill
            className="object-cover rounded-lg"
          />

          <button
            onClick={goToPreviousImage}
            className="hidden md:block absolute top-1/2 left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          >
            &#10094;
          </button>

          <button
            onClick={goToNextImage}
            className="hidden md:block absolute top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          >
            &#10095;
          </button>

          <div className="flex justify-center mt-4 space-x-2 absolute bottom-4 left-1/2 transform -translate-x-1/2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                  index === currentImageIndex
                    ? "bg-blue_principal"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 px-4 md:px-20">
        <h3 className="text-xl font-bold text-center text-blue_principal">
          Historia
        </h3>
        <p className="font-normal italic text-center mt-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias blanditiis obcaecati quidem quo aperiam, magnam ducimus pariatur molestiae? Rem quasi at magnam, quidem voluptate ut doloremque. Dolore quo recusandae aspernatur ab error excepturi omnis odio neque laboriosam consectetur sunt quos fuga harum ipsam dolor blanditiis molestias minus possimus, labore sapiente.</p>
        <p className="font-normal italic text-center mt-5">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Labore id culpa distinctio natus? Molestias neque eveniet fugit veritatis et, temporibus est iste accusamus quas quisquam sed? Id architecto earum nam beatae saepe, dignissimos, cumque quasi sit, aliquam ducimus eveniet nobis. Architecto facere, ratione accusantium aperiam quos eius itaque cupiditate deleniti iste culpa dolores a doloremque fugiat facilis tempore! Ea tempore maiores accusantium odio labore inventore doloribus repellat quaerat voluptatem hic?.</p>
        <p className="font-normal italic text-center mt-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae voluptas molestias reprehenderit in consequatur autem suscipit, obcaecati tempora repudiandae aliquam neque a accusantium nisi, animi cumque nesciunt doloribus debitis optio ipsam quasi. Reprehenderit minus nisi suscipit harum dolore perferendis nam earum modi recusandae dolores atque similique temporibus iure, consectetur repudiandae.</p>
      </div>
    </div>
  );
}