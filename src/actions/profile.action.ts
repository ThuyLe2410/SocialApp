"use server"

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getProfileByUsername(username:string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username:username
            },
            select: {
                id: true,
                image:true,
                name: true,
                username:true,
                bio: true,
                email:true,
                location:true,
                website:true,
                createAt:true,
                _count: {
                    select: {
                        followers:true,
                        following:true,
                        posts:true
                    }
                }
            }
        })

        return user;

    } catch(error) {
        console.log("Error fetching profile: ", error);
        throw new Error("Failed to fetch profile")
    }
}

export async function getUserPosts(userId:string) {
    try {
        const posts = await prisma.post.findMany({
            where: {
                authorId: userId
            },
            include: {
                author: {
                    select: {
                        id:true,
                        name: true,
                        username:true,
                        image:true
                    }
                },

                comments: {
                    include: {
                        author: {
                            select: {
                                id:true,
                                name: true,
                                username:true,
                                image:true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                },

                likes: {
                    select: {
                        userId:true
                    }
                },

                _count: {
                    select: {
                        likes: true, 
                        comments:true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return posts;

    } catch(error) {
        console.log("Error fetching post: ", error);
        throw new Error("Failed to fetch user post")
    }
}

export async function getUserLikedPosts(userId: string) {
    try {
        const likedPosts = await prisma.post.findMany({
            where: {
                likes: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name:true,
                        username: true,
                        image:true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username:true,
                                image: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                },
                likes: {
                    select: {
                        userId:true
                    }
                },
                _count : {
                    select: {
                        likes: true,
                        comments:true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return likedPosts
    } catch(error) {
        console.log("Error fetching liked post", error)
        throw new Error("Failed to fetch liked posts")
    }
}



export async function updateProfile(formData: FormData) {
    try {
        const {userId: clerkId} = await auth();
        if (!clerkId) throw new Error("Unauthorized")
        const name = formData.get("name") as string;
        const bio = formData.get("bio") as string;
        const location = formData.get("location") as string;
        const website = formData.get("website") as string
        const user = await prisma.user.update({
            where: {clerkId},
            data: {
                name, bio, location, website
            }
        })
        revalidatePath("/profile")
        return {success:true, user}
    } catch(error) {
        console.log("Error updating profile", error);
        return {success: false, error: "Failed to update profile"}
    }
}

export async function isFollowing(userId: string) {
    try {
        const currentUserId = await getDbUserId();
        console.log('currentUserId', currentUserId)
        if (!currentUserId) return

        const follow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: userId
                }
            }
        })
        return !!follow;

    } catch(error) {
        console.log("Error checking follow status", error)
        return false
    }
}

