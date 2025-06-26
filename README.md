# SocialApp
A social media application buile with [Next.js] (https://nextjs.org), featuring image uploads, user-generated posts and interaction. 

🔗 **Live Demo**: [https://social-app-ten-omega.vercel.app](https://social-app-ten-omega.vercel.app)


## 🚀 Features

- ⚡ Built with **Next.js App Router**
- 📸 Image uploads with **UploadThing**
- 🗂 Full-stack backend using **Prisma** and **PostgreSQL**
- 🌐 Styled with **Tailwind CSS**
- 🔄 Auto-updating pages using **React Server Components**
- ✅ File-based routing and layouts with `app/` directory
- 🔒 Authentication (optional: with NextAuth.js or custom)



## Setup .env file
To run the app locally, create a `.env` file in the root directory and add the following:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_postgresql_database_url
UPLOADTHING_TOKEN=your_uploadthing_token 
```


## Run app
```
$npm run dev
```