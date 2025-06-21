"use server";

import { getDbUserId } from "./user.action";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(content:string, image:string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;
    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId:userId
      }
    })
    revalidatePath("/"); //forces the cache for / to be cleared, and the page will be regenerated the next time it's visited.

    return {success: true, post}
  } catch(error) {
    console.log("Failed to create post:", error)
    return {success:false, error: "Failed to create post."}
  }
}


export async function getPosts() {
  try{
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt:"desc"
      },
      include:{
        author:{
          select:{
            id: true,
            username:true,
            image:true,
            name:true
          }
        },
        comments: {
          include:{
            author: {
              select:{
                id:true,
                username:true,
                image:true,
                name:true
              }
            }
          },
          orderBy: {
            createdAt:"asc"
          }
        },
        likes: {
          select:{
            userId:true
          }
        },
        _count: {
          select:{
            likes:true,
            comments:true
          }
        }
      }

    });
    return posts
  } catch(error) {
    console.log("Error in getPosts", error);
    throw new Error("Failed to fetch post")
  }
}