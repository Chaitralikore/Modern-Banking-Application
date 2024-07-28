'use server';

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export const signIn = async ({ email, password }: signInProps) => {  
  try {  
    const { account } = await createAdminClient();  
    const session = await account.createEmailPasswordSession(email, password);  

    cookies().set("appwrite-session", session.secret, {  
      path: "/",  
      httpOnly: true,  
      sameSite: "strict",  
      secure: process.env.NODE_ENV === 'production', // Use secure only in production  
    });  

    return parseStringify(session); // Return session or relevant data  
  } catch (error) {  
    console.error('Sign-in Error:', error);  
    throw new Error('Failed to sign in. Please check your credentials.');  
  }  
}

export const signUp = async (userData: SignUpParams) => {
  const { email, password, firstName, lastName } = userData;
  
  try {
    const { account } = await createAdminClient();

    const  newUserAccount = await account.create(
      ID.unique(), 
      email, 
      password, 
      `${firstName} ${lastName}`
    );

  const session = await account.createEmailPasswordSession(email, password);

  return parseStringify(newUserAccount);
  } catch (error) {
    console.error('Error', error);
  }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();

    const user = await account.get();

    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    cookies().delete('appwrite-session');

    await account.deleteSession('current');
  } catch (error) {
    return null;
  }
}
 