import * as yup from "yup";

interface IVehicleSchema {
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

export const vehiculeSchema = yup.object<IVehicleSchema>().shape({
    carName: yup.string().required("Entrer le nom du Vehicule"),
    carMarque: yup.string().required("Entrer la marque du Vehicule"),
    carFuel: yup.string().required("Entrer Le type du carburant"),
    description: yup.string().required("Entrer La description"),
    pricePerDay: yup.number().required("Entrer le prix par jour"),
    availability: yup.string().required("Entrer l'etat de Vehicule"),
    carKm: yup.number().required("Entrer le kilométrage du Vehicule"),
    carType: yup.string().required("Entrer le type du vehicule"),
    carCity: yup.string().required("Entrer La ville du Vehicule"),
    carPhotos: yup.array().of(yup.string()).min(5).max(7).required("Entrer les images du Vehicule"),
});
