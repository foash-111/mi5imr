import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden max-w-4xl mx-auto">
          <CardHeader className="bg-vintage-paper-dark/10 border-b border-vintage-border">
            <CardTitle className="text-2xl md:text-3xl text-center">سياسة الخصوصية</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <ScrollArea className="h-full">
              <div className="prose prose-vintage max-w-none">
                <p className="text-lg font-medium">
                  تلتزم منصة مخيمر بحماية خصوصيتك. تشرح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">1. المعلومات التي نجمعها</h2>
                <p>قد نجمع المعلومات التالية:</p>
                <ul className="list-disc pr-6 space-y-2 my-4">
                  <li>معلومات التعريف الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف، إلخ).</li>
                  <li>معلومات الدخول والاستخدام للموقع.</li>
                  <li>معلومات عن جهازك ومتصفحك.</li>
                  <li>المعلومات التي تقدمها طواعية (مثل التعليقات والمشاركات).</li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-4">2. كيفية استخدام المعلومات</h2>
                <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                <ul className="list-disc pr-6 space-y-2 my-4">
                  <li>توفير وتحسين خدماتنا.</li>
                  <li>التواصل معك بشأن حسابك أو استفساراتك.</li>
                  <li>إرسال تحديثات ونشرات إخبارية (إذا اخترت الاشتراك).</li>
                  <li>تحليل استخدام الموقع وتحسين تجربة المستخدم.</li>
                  <li>منع الاحتيال وحماية أمن الموقع.</li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-4">3. ملفات تعريف الارتباط (Cookies)</h2>
                <p>
                  نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم وجمع بيانات حول استخدام الموقع. يمكنك تعطيل ملفات
                  تعريف الارتباط في إعدادات متصفحك، ولكن قد يؤثر ذلك على وظائف معينة في الموقع.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">4. مشاركة المعلومات</h2>
                <p>لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية:</p>
                <ul className="list-disc pr-6 space-y-2 my-4">
                  <li>مع مقدمي الخدمات الذين يساعدوننا في تشغيل الموقع.</li>
                  <li>عندما يكون ذلك مطلوبًا بموجب القانون أو للامتثال للإجراءات القانونية.</li>
                  <li>لحماية حقوقنا أو ممتلكاتنا أو سلامة مستخدمينا.</li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-4">5. أمان البيانات</h2>
                <p>
                  نتخذ تدابير أمنية معقولة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو الإفصاح. ومع ذلك، لا يمكن
                  ضمان أمان المعلومات المرسلة عبر الإنترنت بشكل كامل.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">6. حقوقك</h2>
                <p>لديك الحق في:</p>
                <ul className="list-disc pr-6 space-y-2 my-4">
                  <li>الوصول إلى معلوماتك الشخصية التي نحتفظ بها.</li>
                  <li>طلب تصحيح أو تحديث معلوماتك.</li>
                  <li>طلب حذف معلوماتك (مع مراعاة الالتزامات القانونية).</li>
                  <li>الاعتراض على معالجة معلوماتك.</li>
                  <li>سحب موافقتك في أي وقت.</li>
                </ul>

                <h2 className="text-xl font-bold mt-8 mb-4">7. خصوصية الأطفال</h2>
                <p>
                  لا نجمع عن قصد معلومات شخصية من الأطفال دون سن 13 عامًا. إذا كنت تعتقد أن طفلًا قد قدم معلومات شخصية
                  لنا، يرجى الاتصال بنا وسنتخذ الإجراءات المناسبة لإزالة هذه المعلومات.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">8. التغييرات في سياسة الخصوصية</h2>
                <p>
                  قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة، وإذا كانت التغييرات
                  جوهرية، سنقوم بإخطارك عبر البريد الإلكتروني أو إشعار على موقعنا.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4">9. الاتصال بنا</h2>
                <p>
                  إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا عبر صفحة{" "}
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
