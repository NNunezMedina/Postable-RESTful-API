import bcrypt from "bcryptjs";
import { ApiError } from "../middleware/error";
import { User, UserParams, userSchema } from "../models/user";
import {
  createUserInDB,
  deleteUserFromDatabase,
  getUserByEmail,
  getUserByUsername,
} from "../../data/user-data";

export async function createUser(userInput: UserParams): Promise<User> {
  const parsedData = userSchema.parse(userInput);

  const userByEmail = await getUserByEmail(parsedData.email);
  if (userByEmail) {
    throw new ApiError("The email is already registered", 400);
  }

  const userByUsername = await getUserByUsername(parsedData.username);
  if (userByUsername) {
    throw new ApiError("The username is already taken", 400);
  }

  const hashedPassword = await bcrypt.hash(parsedData.password, 10);
  const newUser = await createUserInDB({
    ...parsedData,
    password: hashedPassword,
  });
  return newUser;
}

export async function validateCredentials(
  credentials: UserParams
): Promise<User> {
  const { email, password } = credentials;

  const user = await getUserByEmail(email);

  const isValid = await bcrypt.compare(password, user?.password || "");

  if (!user || !isValid) {
    throw new ApiError("Incorrect credentials", 400);
  }

  return user;
}

export async function deleteUser(username: string) {
  const result = await deleteUserFromDatabase(username);
  if (!result) {
    throw new Error("No se pudo eliminar la cuenta del usuario"); 
  }

}

