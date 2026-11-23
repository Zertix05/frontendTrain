import { Client, Account, Databases } from "appwrite";

export const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1") 
    .setProject("690905d4002dbca79e96"); 

export const account = new Account(client);
export const databases = new Databases(client);
