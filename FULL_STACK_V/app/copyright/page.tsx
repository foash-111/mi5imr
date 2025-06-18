import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CopyrightPage() {
  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden max-w-4xl mx-auto">
          <CardHeader className="bg-vintage-paper-dark/10 border-b border-vintage-border">
            <CardTitle className="text-2xl md:text-3xl text-center">حقوق النشر</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <ScrollArea className="h-full">
              <div className="prose prose-vintage max-w-none" dir="rtl">
                <p className="text-lg font-medium">
                  تحتوي هذه الصفحة على معلومات حول حقوق النشر والملكية الفكرية لمحتوى منصة مخيمر.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">1. ملكية المحتوى</h2>
                <p>
                  جميع المحتويات المنشورة على منصة مخيمر - بما في ذلك النصوص والصور والرسومات والشعارات والفيديوهات
                  والتسجيلات الصوتية والتصميمات - هي ملك لمنصة مخيمر أو للمؤلفين والفنانين المساهمين، وهي محمية بموجب
                  قوانين حقوق النشر والملكية الفكرية.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">2. استخدام المحتوى</h2>
                <p>يُسمح باستخدام محتوى المنصة وفقًا للشروط التالية:</p>
                <ul className="list-disc pr-6 space-y-2 my-4">
                  <li>الاستخدام الشخصي غير التجاري: يمكنك قراءة وعرض المحتوى للاستخدام الشخصي غير التجاري فقط.</li>
                  <li>
                    الاقتباس المحدود: يُسمح باقتباس مقاطع قصيرة من المحتوى شريطة الإشارة بوضوح إلى المصدر (منصة مخيمر)
                    والمؤلف الأصلي.
                  </li>
                  <li>
                    المشاركة عبر وسائل التواصل الاجتماعي: يُسمح بمشاركة روابط المحتوى على وسائل التواصل الاجتماعي مع
                    الإشارة إلى المصدر.
                  </li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-4">3. الاستخدامات المحظورة</h2>
                <p>يُحظر ما يلي دون إذن كتابي مسبق:</p>
                <ul className="list-disc pr-6 space-y-2 my-4">
                  <li>إعادة نشر المحتوى بالكامل على مواقع أخرى أو منصات إلكترونية.</li>
                  <li>استخدام المحتوى لأغراض تجارية.</li>
                  <li>تعديل أو اشتقاق أعمال من المحتوى الأصلي.</li>
                  <li>توزيع أو بيع المحتوى.</li>
                  <li>إزالة أي إشارات لحقوق النشر أو العلامات التجارية من المحتوى.</li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-4">4. محتوى المستخدمين</h2>
                <p>
                  عندما تقوم بنشر تعليقات أو مشاركات على المنصة، فإنك تحتفظ بحقوق النشر الخاصة بك، ولكنك تمنح منصة مخيمر
                  ترخيصًا عالميًا غير حصري وخاليًا من حقوق الملكية لاستخدام وعرض ونسخ وتعديل هذا المحتوى على المنصة.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">5. محتوى الأطراف الثالثة</h2>
                <p>
                  قد تحتوي المنصة على روابط أو إشارات إلى محتوى أطراف ثالثة. نحن نحترم حقوق الملكية الفكرية للآخرين
                  ونسعى للإشارة بشكل مناسب إلى مصادر المحتوى الخارجي.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">6. الإبلاغ عن انتهاكات حقوق النشر</h2>
                <p>
                  إذا كنت تعتقد أن محتوى منشور على منصتنا ينتهك حقوق النشر الخاصة بك، يرجى إبلاغنا بذلك عبر صفحة{" "}
                  <a href="/contact" className="text-vintage-accent hover:underline">
                    اتصل بنا
                  </a>{" "}
                  مع تقديم المعلومات التالية:
                </p>
                <ul className="list-disc pr-6 space-y-2 my-4">
                  <li>وصف للعمل المحمي بحقوق النشر الذي تدعي انتهاكه.</li>
                  <li>وصف للمحتوى على منصتنا الذي تعتقد أنه ينتهك حقوق النشر الخاصة بك.</li>
                  <li>معلومات الاتصال الخاصة بك.</li>
                  <li>بيان بأنك تعتقد بحسن نية أن استخدام المحتوى غير مصرح به.</li>
                  <li>بيان بأن المعلومات التي قدمتها دقيقة وأنك صاحب حقوق النشر أو مخول بالتصرف نيابة عنه.</li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-4">7. التراخيص والأذونات</h2>
                <p>
                  للحصول على إذن لاستخدام محتوى من منصة مخيمر بطريقة غير مشمولة في هذه السياسة، يرجى التواصل معنا عبر
                  صفحة{" "}
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
