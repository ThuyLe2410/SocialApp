"use client";
import { useState } from "react";
import { getPosts } from "@/actions/post.action";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { HeartIcon, MessageCircle, MessageCircleIcon } from "lucide-react";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

export default function PostCard({
  post,
  dbUserId,
}: {
  post: Post;
  dbUserId: string | null;
}) {
  const { user } = useUser();
  const [hasLiked, setHasLiked] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    setHasLiked(!hasLiked);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href="">
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            {/* HEADER and TEXT CONTENT */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link href="" className="font-semibold truncate">
                    {post.author.name}
                  </Link>

                  <div>
                    <Link href="">{post.author.username}</Link>
                    <span>.</span>
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                  </div>
                </div>

                {/* Check if current user is the post author => delete*/}
                {dbUserId === post.authorId && <>delete</>}
              </div>

              <p className="mt-2 text-sm text-foreground break-words">
                {post.content}
              </p>
            </div>
          </div>

          {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <Image
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* LIKE & COMMENT BUTTON */}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 ${
                  hasLiked
                    ? "text-red-500 hover:text-red-600"
                    : "hover:text-red-500"
                }`}
                onClick={handleLike}>
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-2">
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => setShowComments(!showComments)}>
              <MessageCircleIcon
                className={`size-5 ${
                  showComments ? "fill-blue-500 text-blue-500" : ""
                }`}
              />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && <div className="space-y-4 pt-4 border-t">
            {/* DISPLAY COMMENTS */}
            <div className="space-y-4"> 

            </div>
            </div>}
        </div>
      </CardContent>
    </Card>
  );
}
