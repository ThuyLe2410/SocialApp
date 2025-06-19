"use server";

import { getDbUserId } from "./user.action";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(content:string, image:string) {
  try {
    const userId = await getDbUserId();
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
