import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/actions/profile.action";
import { notFound } from "next/navigation";

export async function generateMetaData({params} : {params:{username:string}}) {
    const user = await getProfileByUsername(params.username)
    if (!user) return;
    return {
        title: `${user.name ?? user.username}`,
        description: user.bio ||  `Check out ${user.username}'s profile`
    }
}

export default async function ProfilePage({
  params
}: {
  params: { username: string };
}) {
  console.log("params", params);
  const user = await getProfileByUsername(params.username);
  if (!user) notFound();
  await new Promise((resolve) => setTimeout(resolve, 3000))
  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id)
  ])
  console.log('userId', user.id);
  console.log('isCurrentUserFollowing', isCurrentUserFollowing)
  
  return <div>profile</div>;
}
