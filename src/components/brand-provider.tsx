"use client";
import { createContext,useContext } from "react";
const BrandContext=createContext({logoUrl:"/brand/hassan-jewels-logo.png"});
export function BrandProvider({logoUrl,children}:{logoUrl:string;children:React.ReactNode}){return <BrandContext.Provider value={{logoUrl}}>{children}</BrandContext.Provider>}
export function useBrand(){return useContext(BrandContext)}
