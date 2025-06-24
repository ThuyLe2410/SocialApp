"use server"
import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export async function getNotifications() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];
    console.log("userId getNotifications", userId)
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        creator: {
            select: {
                id:true,
                name:true,
                username:true,
                image:true
            }
        },
        post: {
            select: {
                id:true,
                content:true,
                image:true
            }
        },
        comment: {
            select:{
                id: true,
                content:true,
                createdAt:true
            }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("notifications", notifications)
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch Notifications");
  }
}

export async function markNotificationsAsRead(unreadIds: string[]) {
    try {
        await prisma.notification.updateMany({
            where: {
                id: {
                    in: unreadIds
                }
            },
            data: {
                read: true
            }
        })
        return {success: true}
    }catch(error) {
        console.log("Error marking notifications as read", error);
        return {success: false}
    }
}
