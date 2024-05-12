import axios, { AxiosResponse } from 'axios';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { FormikHelpers, useFormik } from 'formik';
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { app } from '../../Configuration/firebase';
import { vehiculeSchema } from '../../Configuration/vehiculeShema';
import SubmitButton from '../../SubComponent/SubmitButton/SubmitButton.tsx';
import { carMarques, typesOfCars } from '../../utils/stock.ts';

interface IImagesFile extends File {
    name: string,
}

interface FormValues {
    carName: string;
    carMarque: string;
    carFuel: string;
    description: string;
    pricePerDay: number;
    availability: string;
    carKm: number;
    carType: string;
    carCity: string;
    carPhotos: string[]; // Ensure carPhotos is an array of strings
}

function CreateListing() {

    const [uploadByte, setUploadByte] = useState<number>(0);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [files, setFiles] = React.useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleImageSubmit = () => {
        if (files.length > 0 && files.length + values.carPhotos.length < 7) {
            const promises: Promise<string>[] = []; // Define promises array explicitly
            setImageLoading(true);
            for (let i = 0; i < files.length; i++) {
                promises.push(storeImages(files[i]));
            }
            Promise.all(promises).then((urls: string[]) => {
                const updatedValues = {
                    ...values,
                    carPhotos: [...values.carPhotos, ...urls] // Append new image URLs to the existing ones
                };
                setValues(updatedValues); // Update form values
            });
        } else {
            toast.warning("Maximum 7 images");
        }
    }

    const storeImages = async (file: IImagesFile): Promise<string> => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on("state_changed", (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadByte(progress);
            }, (error) => {
                reject(error);
                setUploadByte(0);
                setImageLoading(false);
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: any) => {
                    resolve(downloadURL);
                    setUploadByte(0);
                    setImageLoading(false);
                });
            }
            );

        });
    }

    const handleRemoveImage = (index: number) => {
        const updatedPhotos = [...values.carPhotos]; // Create a copy of the carPhotos array
        updatedPhotos.splice(index, 1); // Remove the image URL at the specified index
        const updatedValues = {
            ...values,
            carPhotos: updatedPhotos, // Update carPhotos with the modified array
        }
        setValues(updatedValues); // Set the updated values
    }

    const onSubmit = async (values: FormValues, actions: FormikHelpers<FormValues>) => {
        if (values.carPhotos.length < 5) return toast.warning("Minimum 5 photos");
        if (values.carPhotos.length > 7) return toast.warning("Maximum 7 photos");
        console.log(values);
        const res: AxiosResponse<any, any> = await axios.post("http://localhost:5000/admin/add-car", values, { withCredentials: true });
        if (res.data.success && res.status === 201) {
            toast.success("Vehicule Crée Succès");
            actions.resetForm();
        } else if (res.status === 401) {
            toast.warning("Entres Tous les informations du Vehicule");
            return false;
        } else if (res.status === 500) {
            toast.error("Ops Erreur de serveur");
            return false;
        } else if (res.status == 404) {
            toast.success("success")
        }
    }

    const { handleSubmit, handleBlur, setValues, handleChange, isSubmitting, values, errors, touched } = useFormik<FormValues>({
        initialValues: {
            carName: "",
            carMarque: "",
            carFuel: "",
            description: "",
            pricePerDay: 0,
            availability: "",
            carKm: 0,
            carType: "",
            carCity: "",
            carPhotos: [],
        },
        validationSchema: vehiculeSchema,
        onSubmit,
    });

    return (
        <section className="py-12 bg-gray-100" style={{ minHeight: "100vh" }}>
            <div className="container mx-auto">
                <h1 className="text-3xl text-center text-gray-800 mb-8 py-8">Ajouter un Véhicule</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 px-4 py-6 bg-white rounded-lg shadow-lg">

                        <label htmlFor="car-name" className="text-gray-700">Nom Du Véhicule:</label>
                        <input className="input-sm border border-gray-300 rounded px-4 py-5 w-full" onBlur={handleBlur} onChange={handleChange} value={values.carName} id="car-name" placeholder="Nom Du Véhicule" name="carName" />
                        {errors.carName && touched.carName && <p className="text-red-500 text-sm">{errors.carName}</p>}

                        <label htmlFor="carMarque">Marque du Vehicule:</label>
                        <select onChange={handleChange} value={values.carMarque} className="border border-gray-300 p-2 rounded w-full" name="carMarque">
                            <option disabled value="">Marque</option>
                            {carMarques.map((elem: string, index: number) => {
                                return (
                                    <option key={index}>{elem}</option>
                                );
                            })}
                        </select>
                        {errors.carMarque && touched.carMarque && <p className="text-red-500 text-sm">{errors.carPhotos}</p>}

                        <label htmlFor="carFuel">Type du Carburant:</label>
                        <select onChange={handleChange} id="carFuel" value={values.carFuel} className="border border-gray-300 p-2 rounded w-full" name="carFuel">
                            <option disabled value="">Type Du Carburant</option>
                            <option>Essence</option>
                            <option>Diesel</option>
                            <option>Elecrique</option>
                            <option>Hybrid</option>
                        </select>
                        {errors.carFuel && touched.carFuel && <p className="text-red-500 text-sm">{errors.carFuel}</p>}


                        <label htmlFor="description">Description:</label>
                        <input className="input-sm border border-gray-300 rounded px-4 py-5 w-full" onBlur={handleBlur} onChange={handleChange} value={values.description} id="description" placeholder="Description" name="description" />
                        {errors.description && touched.description && <p className="text-red-500 text-sm">{errors.description}</p>}

                        <label htmlFor="pricePerDay">Prix Par Jour (DH):</label>
                        <input className="input-sm border border-gray-300 rounded px-4 py-5 w-full" onBlur={handleBlur} onChange={handleChange} value={values.pricePerDay} id="pricePerDay" placeholder="Prix/Jour" name="pricePerDay" />
                        {errors.pricePerDay && touched.pricePerDay && <p className="text-red-500 text-sm">{errors.pricePerDay}</p>}

                        <label htmlFor="availability">Etat du Vehicule:</label>
                        <select onChange={handleChange} id="availability" className="border border-gray-300 p-2 rounded w-full" name="availability" value={values.availability}>
                            <option disabled value="">Etat De Vehicule</option>
                            <option value="disponible">Disponible</option>
                            <option value="en charge">En Charge</option>
                        </select>
                        {errors.availability && touched.availability && <p className="text-red-500 text-sm">{errors.availability}</p>}

                        <label htmlFor="carKm">Killometrage:</label>
                        <input className="input-sm border border-gray-300 rounded px-4 py-5 w-full" onBlur={handleBlur} onChange={handleChange} value={values.carKm} id="carKm" placeholder="Killomètrage" name="carKm" />
                        {errors.carKm && touched.carKm && <p className="text-red-500 text-sm">{errors.carKm}</p>}

                        <label htmlFor="carType">Type du Vehicule:</label>
                        <select onChange={handleChange} id="carType" className="border border-gray-300 p-2 rounded w-full" name="carType" value={values.carType}>
                            <option disabled value="">Type du Vehicule</option>
                            {typesOfCars.map((elem: string, index: number) => {
                                return (
                                    <option key={index}>{elem}</option>
                                );
                            })}
                        </select>
                        {errors.carType && touched.carType && <p className="text-red-500 text-sm">{errors.carType}</p>}

                        <label htmlFor="carCity">La Ville:</label>
                        <select onChange={handleChange} id="carCity" className="border border-gray-300 p-2 rounded w-full" name="carCity" value={values.carCity}>
                            <option disabled value="">Ville</option>
                            <option>Ouarzazate</option>
                            <option>Marrakech</option>
                            
                        </select>
                        {errors.carCity && touched.carCity && <p className="text-red-500 text-sm">{errors.carCity}</p>}



                        <SubmitButton disabled={isSubmitting} loading={loading} />
                    </form>

                    <div className="px-4 py-6 bg-white rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Les Images</h2>
                        <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiles(e.target.files)} accept="image/*" multiple className="mb-4" />
                        {imageLoading && <p className="text-gray-800 text-sm mb-4">Loading...</p>}
                        {uploadByte ? <p className="text-gray-900 text-sm mb-4">Upload byte {Math.floor(uploadByte)}%</p> : null}
                        <button type="button" className="btn-primary mb-4" onClick={handleImageSubmit}>Télécharger</button>
                        {errors.carPhotos && touched.carPhotos && <p className="text-red-500 text-sm">{errors.carPhotos}</p>}

                        <div className="grid grid-cols-2 gap-4">
                            {values.carPhotos.length ? (
                                values.carPhotos.map((elem, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <img className="rounded mb-2" style={{ maxHeight: "150px", width: "100%" }} src={elem} alt={`Image ${index}`} />
                                        <button className="btn-secondary text-slate-900" onClick={() => handleRemoveImage(index)}>Supprimer</button>
                                    </div>
                                ))
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )
}

export default CreateListing;