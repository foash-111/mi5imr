import { notFound } from "next/navigation"
import { getUserById, getUserLikes, getUserBookmarks } from "@/backend/lib/db"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Heart, Bookmark } from "lucide-react"

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id)
  if (!user) return notFound()
  const lovedContent = await getUserLikes(params.id)
  const savedContent = await getUserBookmarks(params.id)

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar src={user.avatar} alt={user.name} className="h-16 w-16" />
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <div className="text-muted-foreground text-sm">{user.email}</div>
            <div className="text-xs mt-1">تاريخ الانضمام: {new Date(user.createdAt).toLocaleDateString("ar-EG")}</div>
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <CardTitle>المحتوى المفضل</CardTitle>
          </CardHeader>
          <CardContent>
            {lovedContent.length === 0 ? (
              <div className="text-muted-foreground">لا يوجد محتوى مفضل.</div>
            ) : (
              <ul className="space-y-2">
                {lovedContent.map((item: any) => (
                  <li key={item._id}>
                    <a href={`/content/${item.slug}`} className="text-blue-600 hover:underline">{item.title}</a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Bookmark className="h-5 w-5 text-yellow-500" />
            <CardTitle>المحتوى المحفوظ</CardTitle>
          </CardHeader>
          <CardContent>
            {savedContent.length === 0 ? (
              <div className="text-muted-foreground">لا يوجد محتوى محفوظ.</div>
            ) : (
              <ul className="space-y-2">
                {savedContent.map((item: any) => (
                  <li key={item._id}>
                    <a href={`/content/${item.slug}`} className="text-blue-600 hover:underline">{item.title}</a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 