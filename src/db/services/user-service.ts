import bcrypt from "bcryptjs";
import { ApiError } from "../middleware/error";
import { User, UserParams, userSchema } from "../models/user";
import {
  createUserInDB,
  deleteUserFromDatabase,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  UserData,
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

export async function deleteUser(userId: number) {
  const result = await deleteUserFromDatabase(userId);
  if (!result) {
    throw new Error("Couldn't eliminate the user account"); 
  }

}

export async function updateUserProfile(userId: number, updates: Partial<User>): Promise<User | null> {
  try {

    const updatedUser = await UserData.updateUser(userId, updates);

    return updatedUser; 
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Error updating user profile.");
  }
}

export async function getUserProfile(userId: number) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role:user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}



