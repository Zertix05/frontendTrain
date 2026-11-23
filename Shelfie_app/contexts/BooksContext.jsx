import { createContext, useState, useEffect } from "react";
import {databases} from "../lib/appwrite";
import { ID, Permission, Query, Role } from "appwrite";
import { useUser } from "../HOOKS/useUse";


const DATABASE_ID="69119767001aa669275f"
const COLLECTION_ID="book"
export const BooksContext = createContext();

export function BooksProvider({ children }) {
  const [books, setBooks]= useState([]);
  const {user}= useUser();

  async function fetchBooks(){
    try{
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('userId',user.$id)
            ]
        )
        setBooks(response.documents)
        console.log(response.documents)
    }catch(error){
        console.log(error.message)
    }
  }


   async function fetchBooksById(){
    try{

    }catch(error){
        console.log(error.message)
    }
  }

  async function createBook(data) {
  try {
    console.log("Creating book:", data);
    console.log("User:", user?.$id);

    const newBook = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      { ...data, userId: user.$id },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );

    console.log("Book created:", newBook);
    setBooks((prev) => [...prev, newBook]);
  } catch (error) {
    console.log("Create book error:", error);
  }
}

  
   async function deleteBook(id){
    try{

    }catch(error){
        console.log(error.message)
    }
  }

  useEffect(()=>{
    if(user){
        fetchBooks()
    }else{
        setBooks([])
    }
  },[user])


  return (
    <BooksContext.Provider value={{ books, fetchBooks, fetchBooksById, createBook, deleteBook }}>
      {children}
    </BooksContext.Provider>
  );
}
