import { IPerson } from "./types";

export default class PersonModel {
  private id: number;
  private name: string;
  private phone: string;
  private email: string;
  private created_at: Date;

  constructor(param: IPerson) {
    this.id = param.id;
    this.name = param.name;
    this.phone = param.phone;
    this.email = param.email;
    this.created_at = param.created_at || new Date();
  }

  getAllProps() {
    const person: IPerson = {
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      created_at: this.created_at,
    };
    return person;
  }
}
