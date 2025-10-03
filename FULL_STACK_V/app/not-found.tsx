import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vintage-paper">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">الصفحة غير موجودة</h2>
          <p className="text-gray-600 max-w-md">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              العودة للرئيسية
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/feed">
              تصفح المحتوى
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
