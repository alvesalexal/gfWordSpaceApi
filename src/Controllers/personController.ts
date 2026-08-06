import { Response } from "express";
import PersonService from "../Services/PersonService";
import { AuthRequest } from "../Middleware/auth";

const getUnique = async (req: AuthRequest, res: Response) => {
  const personId = Number(req.params.id);
  const personService = new PersonService();
  const person = await personService.getPersonById(personId);
  if (!person) {
    res.status(404).json({ message: "Pessoa não encontrada." });
    return;
  }

  res.status(200).json(person);
};

const getAll = async (req: AuthRequest, res: Response) => {
  const personService = new PersonService();
  const person = await personService.getAllPerson();
  res.status(200).json(person);
};

const update = async (req: AuthRequest, res: Response) => {
  try {
    const personId = Number(req.params.id);

    if (req.userId !== personId) {
      res.status(403).json({ message: "Acesso negado." });
      return;
    }

    const { name, email, phone } = req.body;
    const personService = new PersonService();
    const person = await personService.updatePerson(personId, { name, email, phone });

    res.status(200).json(person);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Erro ao atualizar perfil." });
  }
};

const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const personId = Number(req.params.id);

    if (req.userId !== personId) {
      res.status(403).json({ message: "Acesso negado." });
      return;
    }

    const { avatar } = req.body;

    if (!avatar) {
      res.status(400).json({ message: "Nenhuma imagem enviada." });
      return;
    }

    const personService = new PersonService();
    const person = await personService.updateAvatar(personId, avatar);

    res.status(200).json(person);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Erro ao atualizar avatar." });
  }
};

const personControllerFunctions = {
  getUnique,
  getAll,
  update,
  updateAvatar,
};

export default personControllerFunctions;
