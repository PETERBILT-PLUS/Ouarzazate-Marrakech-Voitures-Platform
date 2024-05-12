import ReactSlider from "react-slider";
import { typesOfCars } from "../../utils/stock.ts";
import "./Home.css";
import { useCallback, useEffect, useState } from "react";
import CarCard from "../CarCard/CarCard";
import { IoMdSearch } from "react-icons/io";
import { CiFilter } from "react-icons/ci";
import axios, { AxiosResponse } from "axios";
import InfiniteScroll from "react-infinite-scroll-component";

interface ICar {
  _id: string,
  carName: string,
  availability: "disponible" | "en charge",
  carPrice: number,
  carCity: string,
  carKm: number
  carMarque: string
  carModel: number,
  carType: string
  discription: string,
  carImages: string[]
}

function Home() {
  const MIN: number = 0;
  const MAX: number = 5000;
  const [values, setValues] = useState<[number, number]>([MIN, MAX]);
  const [value, setValue] = useState<string>("");
  const [names, setNames] = useState<string[]>([]);
  const [record, setRecord] = useState<string[]>([]);
  const [cars, setCars] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cursor, setCursor] = useState<string | undefined>("");

  useEffect(() => {
    const getNames = async () => {
      try {
        const res: AxiosResponse<any, any> = await axios.get("http://localhost:5000/user/get-names");
        if (res.data.success) {
          setNames(res.data.names);
          setRecord(res.data.names);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getNames();

    const getCars = async () => {
      try {
        if (loading) return;
        setLoading(true);
        console.log(cursor);
        const res: AxiosResponse<any, any> = await axios.get<{ cars: ICar[]; nextCursor: string | undefined }>(`http://localhost:5000/user/get-cars?cursor=${cursor}`);
        if (res.data.success) {
          const { cars: newVehicles, cursor: cursor } = res.data;
          setCars((prevCars) => [...newVehicles]);
          setCursor(cursor);
        } else if (res.status === 500) {
          alert(res.data.message);
        }
      } catch (error) {
        console.error(error);
      }
    }
    setLoading(false);

    getCars();
  }, []);

  const filter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecord(names.filter((elem: string) => elem.toLowerCase().includes(e.target.value.toLowerCase())));
  }

  const getCars = async () => {
    try {
      if (loading) return;
      setLoading(true);
      console.log(cursor);
      const res: AxiosResponse<any, any> = await axios.get<{ cars: ICar[]; cursor: string | undefined }>(`http://localhost:5000/user/get-cars?cursor=${cursor}`);
      if (res.data.success) {
        const { cars: newVehicles, cursor: cursor } = res.data;
        setCars((prevCars) => [...prevCars, ...newVehicles]);
        setCursor(cursor);
      } else if (res.status === 500) {
        alert(res.data.message);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  const searchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    filter(e);
  }

  const loadMoreVehicules = useCallback(() => {
    getCars();

  }, [cursor, loading]);

  return (
    <section className="home-section py-24">
      <div className="container mx-auto">


        <div className="px-5 py-5">
          <div className="bg-white w-full flex flex-row justify-between gap-4 md:hidden h-12 items-center rounded-2xl px-2">
            <p className="font-bold col-span-2 mx-3">Filter</p>
            <div className="col-span-1 flex justify-end cursor-pointer w-auto">
              <CiFilter size={24} />
            </div>
          </div>
        </div>


        <div className="grid grid-cols-3">

          <div className="col-span-3 lg:col-span-2 px-5 py-0">
            <div className="parent-input h-12 w-full mb-10 rounded-md flex flex-col justify-start items-center">
              <div className="input-division w-full">
                <input type="text" placeholder="search" className="search-input p-5 input-sm w-full rounded-2xl" value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => searchInputChange(e)} />
                <button type="button">
                  <IoMdSearch size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 w-full choices mt-10 z-10">
                {value && (
                  record.slice(0, 5).map((elem: any) => (
                    <div className="bg-white w-full rounded-2xl h-auto outline-none focus:outline-none border px-5 py-4 cursor-pointer" onClick={() => setValue(elem)}>{elem}</div>
                  ))
                )}
              </div>
            </div>
            <InfiniteScroll
              className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8"
              dataLength={cars.length}
              next={loadMoreVehicules}
              hasMore={!cursor}
              loader={<div className="col-span-2 text-center"><span className="loading loading-spinner"></span></div>}
              endMessage={<p className="col-span-2 text-center font-bold">Pas D'autres Voitures</p>}
            >
              {cars?.map((elem: any) => {
                const { _id, availability, pricePerDay, carCity, carKm, carMarque, description, carModel, carType, name, carImages } = elem;
                return (
                  <CarCard
                    _id={_id}
                    carName={name}
                    availability={availability}
                    carPrice={pricePerDay}
                    carCity={carCity}
                    carKm={carKm}
                    carMarque={carMarque}
                    carModel={carModel}
                    carType={carType}
                    discription={description}
                    carImage={carImages[0]}
                  />
                )
              })}
            </InfiniteScroll>
          </div>

          {/* ###### */}

          <div className="hidden lg:block lg:col-span-1">
            <div className="card flex flex-col justify-evenly items-center py-6 mx-12 px-8 bg-white">
              <div className="py-6 self-start w-full flex flex-col justify-evenly items-center">
                <h1 className="card-title pb-3 self-start">Marque</h1>
                <hr className="w-24 h-1 background-blue-hr rounded mb-8 self-start" />
                <select className="w-56 select select-bordered">
                  <option disabled selected>Marque</option>
                  <option>dacia</option>
                  <option>renault</option>
                  <option>citroen</option>
                </select>
                <button className="clear-button self-start mt-8">Clear</button>
              </div>

              <div className="py-6 self-start w-full flex flex-col justify-evenly items-center">
                <h1 className="card-title pb-3 self-start">Energie</h1>
                <hr className="w-24 h-1 background-blue-hr rounded mb-8 self-start" />
                <div className="self-start mx-4 flex flex-col justify-evenly items-start">
                  <div className="flex flex-row justify-start items-center py-2">
                    <input type="radio" id="essence" name="fuel" className="p-4 radio-xs" />
                    <label className="px-4" htmlFor="essence">Essence</label>
                  </div>
                  <div className="flex flex-row justify-start items-center py-2">
                    <input type="radio" id="diesel" name="fuel" className="p-4 radio-xs" />
                    <label className="px-4" htmlFor="diesel">Diesel</label>
                  </div>
                  <div className="flex flex-row justify-start items-center py-2">
                    <input type="radio" id="hybrid" name="fuel" className="p-4 radio-xs" />
                    <label className="px-4" htmlFor="hybrid">Hybrid</label>
                  </div>
                  <div className="flex flex-row justify-start items-center py-2">
                    <input type="radio" id="electrique" name="fuel" className="p-4 radio-xs" />
                    <label className="px-4" htmlFor="electrique">Electrique</label>
                  </div>
                </div>
                <button className="self-start clear-button mt-8">Clear</button>
              </div>

              <div className="py-6 self-start w-full flex flex-col justify-evenly items-center">
                <h1 className="card-title pb-3 self-start">Ville</h1>
                <hr className="w-24 h-1 background-blue-hr rounded mb-8 self-start" />
                <select className="w-56 select select-bordered">
                  <option disabled selected>Ville</option>
                  <option>Marrakech</option>
                  <option>Ouarzazate</option>
                </select>
                <button className="self-start clear-button mt-8">Clear</button>
              </div>

              <div className="py-6 self-start w-full flex flex-col justify-evenly items-center">
                <h1 className="card-title py-2 self-start">Prix</h1>
                <hr className="w-24 h-1 background-blue-hr rounded mb-8 self-start" />
                <span className="py-3">{values[0]} - {values[1]}</span>

                <ReactSlider
                  min={MIN}
                  max={MAX}
                  value={values}
                  onChange={setValues}
                />
              </div>

              <div className="py-6 self-start w-full flex flex-col justify-evenly items-center">
                <h1 className="card-title pb-3 self-start">Type De Voiture</h1>
                <hr className="w-24 h-1 background-blue-hr rounded mb-8 self-start" />
                <select className="w-56 select select-bordered">
                  <option disabled selected>Type De Voiture</option>
                  {typesOfCars.map((elem: string, index: number) => {
                    return (
                      <option key={index}>{elem}</option>
                    );
                  })}
                </select>
                <button className="self-start clear-button mt-8">Clear</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

export default Home;