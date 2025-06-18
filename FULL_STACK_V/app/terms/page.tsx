import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden max-w-4xl mx-auto">
          <CardHeader className="bg-vintage-paper-dark/10 border-b border-vintage-border">
            <CardTitle className="text-2xl md:text-3xl text-center">شروط الاستخدام</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <ScrollArea className="h-full"  style={{ direction: "ltr" }}>
              <div className="prose prose-vintage max-w-none"  dir="rtl">
                <p className="text-lg font-medium">
                  مرحباً بك في منصة مخيمر. يرجى قراءة شروط الاستخدام التالية بعناية قبل استخدام الموقع.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">1. قبول الشروط</h2>
                <p>
                  باستخدامك لمنصة مخيمر، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من
                  هذه الشروط، فيرجى عدم استخدام موقعنا.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">2. التغييرات في الشروط</h2>
                <p>
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التغييرات على هذه الصفحة. استمرارك في استخدام
                  الموقع بعد نشر التغييرات يعني موافقتك على الشروط الجديدة.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">3. استخدام الموقع</h2>
                <p>أنت توافق على استخدام الموقع فقط للأغراض القانونية وبطريقة لا تنتهك حقوق الآخرين. يحظر عليك:</p>
                <ul className="list-disc pr-6 space-y-2 my-4">
                  <li>نشر أي محتوى غير قانوني أو ضار أو مسيء أو تشهيري.</li>
                  <li>انتهاك حقوق الملكية الفكرية للآخرين.</li>
                  <li>استخدام الموقع لأغراض احتيالية أو ضارة.</li>
                  <li>محاولة الوصول غير المصرح به إلى أجزاء من الموقع.</li>
                  <li>نشر محتوى إعلاني أو ترويجي دون إذن مسبق.</li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-4">4. حسابات المستخدمين</h2>
                <p>
                  عند إنشاء حساب على منصتنا، أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. أنت مسؤول عن جميع
                  الأنشطة التي تتم تحت حسابك.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">5. المحتوى</h2>
                <p>
                  جميع المحتويات المنشورة على منصة مخيمر هي ملك للمنصة أو للمؤلفين المساهمين. يحظر نسخ أو إعادة نشر أي
                  محتوى دون إذن صريح.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">6. التعليقات والمشاركات</h2>
                <p>
                  عند نشر تعليقات أو مشاركات على الموقع، فإنك تمنح منصة مخيمر حقًا غير حصري لاستخدام وعرض ونسخ وتعديل هذا
                  المحتوى على الموقع.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">7. إخلاء المسؤولية</h2>
                <p>يتم توفير الموقع "كما هو" دون أي ضمانات. لا نضمن أن الموقع سيكون متاحًا دائمًا أو خاليًا من الأخطاء.</p>

                <h2 className="text-xl font-bold mt-8 mb-4">8. تحديد المسؤولية</h2>
                <p>
                  لن تكون منصة مخيمر مسؤولة عن أي أضرار مباشرة أو غير مباشرة تنتج عن استخدامك للموقع أو عدم قدرتك على
                  استخدامه.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">9. القانون المطبق</h2>
                <p>
                  تخضع هذه الشروط والأحكام للقوانين المعمول بها، وأي نزاع ينشأ عن استخدام الموقع سيخضع للاختصاص القضائي
                  للمحاكم المختصة.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">10. الاتصال بنا</h2>
                <p>
                  إذا كان لديك أي أسئلة حول شروط الاستخدام هذه، يرجى الاتصال بنا عبر صفحة{" "}
                  <a href="/contact" className="text-vintage-accent hover:underline">
                    اتصل بنا
                  </a>
                  .
                </p>

                <div className="mt-8 text-center text-sm text-muted-foreground">آخر تحديث: ١ مايو ٢٠٢٣</div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
