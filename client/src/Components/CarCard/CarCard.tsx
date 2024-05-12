import { TfiAgenda } from "react-icons/tfi";
import { CiLocationOn } from "react-icons/ci";
import { GiSpeedometer } from 'react-icons/gi';
import { FaCar } from 'react-icons/fa';
import "./CarCard.css";


function CarCard({ _id, carName, availability, carPrice, carCity, carKm, carMarque, carModel, carType, discription, carImage }: { _id: string, carName: string, availability: string, carPrice: number, carCity: string, carKm: number, carMarque: string, carModel: number, carType: string, discription: string, carImage: string }) {
    return (
        <div className="card w-auto bg-base-100 shadow-xl">
            <figure><img src={carImage} alt={carName} /></figure>

            <div className="card-body">
                <h2 className="card-title">{carName}</h2>
                <div className="flex flex-row justify-start gap-5 items-center">
                    <div className="flex flex-row justify-evenly items-center gap-2">
                        <TfiAgenda size={20} />
                        <p className="text-slate-800">{carModel}</p>
                    </div>
                    <div className="flex flex-row justify-evenly items-center">
                        <CiLocationOn size={22} />
                        <p className="text-slate-800">{carCity}</p>
                    </div>
                </div>

                <p className="border-t pt-4">{discription}</p>

                <div className="card-actions grid grid-cols-2">
                    <div className="center-element flex flex-row justify-center items-center gap-2">
                        <GiSpeedometer size={24} />
                        <p>{carKm} Km</p>
                    </div>
                    <div className="center-element flex flex-row justify-center items-center gap-2">
                        <FaCar size={24} />
                        <p className="px-0">{carMarque}</p>
                    </div>
                    <div className="pt-2 col-span-2">
                        <p className="text-slate-800">{carPrice} Dh/Jour</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CarCard;