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



export async function toggleLike(postId:string) {
  try{
    const userId = await getDbUserId();
    if (!userId) return 

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId, postId
        }
      }
    })

    const post = await prisma.post.findUnique({
      where: {id: postId},
      select: {authorId:true}
    })

    if (!post) throw new Error ("Post not found");

    if (existingLike) {
      // unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId, postId
          }
        }
      })
    } else {
      // like and create notification
      await prisma.$transaction([
        prisma.like.create({
          data:{userId, postId}
        }),
        ...(post.authorId !== userId ? 
          [prisma.notification.create({
          data: {
            type: "LIKE",
            userId: post.authorId,
            creatorId: userId,
            postId,
            read:false
          }
        })] : []
        ) 
      ])
    }
    revalidatePath("/");
    return {success: true};
  } catch(error) {
  console.log("Failed to toggle like:", error);
  return {success: false, error: "Failed to toggle like"}
  }
}


export async function createComment(postId:string, content:string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    if (!content) throw new Error("Content is required")

    const post = await prisma.post.findUnique({
      where:{id:postId},
      select:{authorId:true}
    });
    console.log("post addComment", post);
    if (!post) throw new Error("Post not found")

    // create a comment and notification
    const [comment] = await prisma.$transaction(async(tx) => {
      // create comment
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId
        }
      })
      // create notification
      if (post.authorId !== userId) {
        await tx.notification.create({
          data:{
            type: "Comment",
            userId: post.authorId,
            creatorId:userId,
            postId,
            commentId: newComment.id,
            read:false
          }
        })
      }
      return [newComment]
    })
   
    revalidatePath(`/`)
    return {success:true, comment}
  } catch(error) {
    console.error("Failed to create new comment", error)
    return {success:false, error: "Failed to create comment"}
  }
}