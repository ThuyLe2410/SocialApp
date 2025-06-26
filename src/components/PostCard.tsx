"use client";
import { useState } from "react";
import { createComment, getPosts, toggleLike } from "@/actions/post.action";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import {
  HeartIcon,
  LogInIcon,
  MessageCircleIcon,
  SendIcon,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import toast from "react-hot-toast";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { deletePost } from "@/actions/post.action";

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
  const [hasLiked, setHasLiked] = useState(post.likes.some(like => like.userId === dbUserId));
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  const handleLike = async () => {
    try {
        setHasLiked(!hasLiked);
        setOptimisticLikes(prev => prev + (hasLiked? -1: 1))
        await toggleLike(post.id)
    } catch (error) {
        console.log('Failed to handleLike', error)
    }
  };

  const handleAddComment = async() => {
    if (!newComment.trim() || isCommenting) return;
    try {
        setIsCommenting(true);
        const result = await createComment(post.id, newComment);
        if (result?.success) {
            toast.success("Comment posted successfully")
            setNewComment("")
        }
        
    } catch(error) {
        console.log("Failed to add comment", error)
        toast.error("Failed to add comment")
    } finally {
        setIsCommenting(false)
    }
  }

  const handleDelete = async() => {
    if (isDeleting) return;
    try{
        setIsDeleting(true);
        // delete function in server post.action
        const result = await deletePost(post.id);
        if (result.success) toast.success("Post deleted successfully")
        else throw new Error(result.error)
    } catch(error) {
        console.log("Failed to delete", error)
        toast.error("Failed to delete post")
    } finally {
        setIsDeleting(false)
    }
  }

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
                    {" "}
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                  </div>
                </div>

                {/* Check if current user is the post author => delete*/}
                {dbUserId === post.authorId && <DeleteAlertDialog isDeleting={isDeleting} onDelete ={handleDelete}/>}
              </div>

              <p className="mt-2 text-sm text-foreground break-words">
                {post.content}
              </p>
            </div>
          </div>

          {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img
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
          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              {/* DISPLAY COMMENTS */}
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage src={comment.author.image ?? "avatar/png"} />
                      <p>Comment</p>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm">
                          {comment.author.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        <span className="text-sm text-muted-foreground">.</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>
                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* COMMENTING */}
              {user ? (
                <div className="flex space-x-3">
                  <Avatar>
                    <AvatarImage src={user.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                        onClick={handleAddComment}>
                        {isCommenting ? (
                          "Posting..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>{" "}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50"> 
                <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                        <LogInIcon className="size-4"/>
                        Sign in to comment
                    </Button>
                    </SignInButton></div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
