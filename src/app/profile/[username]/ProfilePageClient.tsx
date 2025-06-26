"use client";
import { getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.action";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@radix-ui/react-separator";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  EditIcon,
  FileIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";
import { format } from "date-fns";
import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import PostCard from "@/components/PostCard";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Posts = Awaited<ReturnType<typeof getUserPosts>>;
type User = Awaited<ReturnType<typeof getProfileByUsername>>;

type ProfilePageClient = {
  isFollowing: boolean | undefined;
  likedPost: Posts;
  user: NonNullable<User>;
  posts: Posts;
};

export default function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPost,
  posts,
  user,
}: ProfilePageClient) {
  const { user: currentUser } = useUser();
  console.log("currentuser ", user);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const handleFollow = async () => {
    if (!currentUser) return;
    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.log("Failed to update follow status", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const formattedDate = format(new Date(user.createAt), "MMMM yyyy");

  const handleEditSubmit = async() => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
        formData.append(key, value)
    })
    const result = await updateProfile(formData);
    if (result?.success) {
        setShowEditDialog(false);
        toast.success("Profile updated successfully")
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">

                {/* AVATAR */}
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">
                  {user.name ?? user.username}
                </h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="mt-2 text-sm">{user.bio}</p>

                {/* PROFILE STATS */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="font-semibold">
                        {user._count.following.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Following
                      </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold">
                        {user._count.followers.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Followers
                      </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold">
                        {user._count.posts.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

                {/* FOLLOW & EDIT PROFILE BUTTONS */}
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button className="w-full mt-4">Follow</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button
                    className="w-full mt-4"
                    onClick={() => setShowEditDialog(true)}>
                    <EditIcon className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-4"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                    variant={isFollowing ? "outline" : "default"}>
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}

                {/* LOCATION & WEBSITE */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}

                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2" />
                      <a
                        href={
                          user.website.startsWith("http")
                            ? user.website
                            : `http://${user.website}`
                        }>
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                data-[state=active]:bg-transparent px-6 font-semibold">
              <FileIcon className="size-4" /> Post
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                data-[state=active]:bg-transparent px-6 font-semibold">
              <HeartIcon className="size-4" /> Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={user.id} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {" "}
                  No posts yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPost.length > 0 ? (
                likedPost.map((post) => (
                  <PostCard key={post.id} post={post} dbUserId={user.id} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {" "}
                  No liked posts post to show
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Input
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  placeholder="Your bio"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  placeholder="Your location"
                />
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  placeholder="Your website"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
                <DialogClose asChild>
                    <Button>
                        Cancel
                    </Button>
                </DialogClose>
                <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>

          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
