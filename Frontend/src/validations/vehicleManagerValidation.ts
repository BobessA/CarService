import { Vehicle } from "../models/Vehicle";

export const validateVehicle = (car: Omit<Vehicle, 'id'>) => {
  const errors: string[] = [];

  if (!car.licensePlate.trim()) {
    errors.push("Rendszám megadása kötelező!");
  }

  if (car.licensePlate.trim().length > 10) {
    errors.push("A rendszám maximum 10 karakter hosszú lehet!");
  }

  if (!car.brand.trim()) {
    errors.push("Gyártó megadása kötelező!");
  }

  if (car.brand.trim().length > 32) {
    errors.push("A gyártó maximum 32 karakter hosszú lehet!");
  }

  if (!car.model.trim()) {
    errors.push("Modell megadása kötelező!");
  }

  if (car.model.trim().length > 32) {
    errors.push("A típus maximum 32 karakter hosszú lehet!");
  }

  if (!car.yearOfManufacture) {
    errors.push("Gyártási év megadása kötelező!");
  }

  if (car.yearOfManufacture && (car.yearOfManufacture < 1900 || car.yearOfManufacture > new Date().getFullYear()+1)) {
    errors.push("A gyártás éve érvénytelen!");
  }

  if (!car.vin.trim()) {
    errors.push("Alvázszám megadása kötelező!");
  }

  if (car.vin.trim().length > 17) {
    errors.push("Az alvázszám hossza maximum 17 karakter lehet!");
  }

  if (!car.engineCode.trim()) {
    errors.push("Motorkód megadása kötelező!");
  }

  if (car.engineCode.trim().length > 20) {
    errors.push("A motorkód maximum 20 karakter hosszú lehet!");
  }

  if (!car.fuelType || car.fuelType < 1 || car.fuelType > 3) {
    errors.push("Válasszon üzemanyagot!");
  }

  return errors;

};