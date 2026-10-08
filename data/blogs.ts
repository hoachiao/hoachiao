export const blogs = [
  {
    id: 1,
    title: 'Closure 閉包',
    paragraph:
      'Closure 閉包在MDN上的定義是「閉包（Closure）是函式以及該函式被宣告時所在的作用域環境（lexical environment）的組合。」乍看之下是一串有看沒有懂的文字，在討論閉包之前，必須要先對JS中，執行環境與作用域有基本的了解，才能在觀察程式碼中，發現閉包的存在。',
    content: `
      <div>
        <p>Closure 閉包在MDN上的定義是「閉包（Closure）是函式以及該函式被宣告時所在的作用域環境（lexical environment）的組合。」乍看之下是一串有看沒有懂的文字，在討論閉包之前，必須要先對JS中，執行環境與作用域有基本的了解，才能在觀察程式碼中，發現閉包的存在。</p>
      <div>
      <div>
        <h2>1. JS執行環境－函數執行時會發生什麼事</h2>
        <p>討論程式語言執行時所發生的事情，絕對離不開Stack & Heap 這兩個名詞，而Stack ＆Heap 是什麼？在做什麼用？背後的概念牽涉太廣，不在此篇文章多做敘述，簡單來說，以目前普遍被使用的ChromeV8 引擎為例，在執行JS 時，引擎有兩塊主要區域，一塊稱之為Call Stack 另一塊則稱為Heap，Call Stack 為主要的執行環境，以下借用我的恩師Jonas 在 Udemy 課程上的Slide 來表示這個概念。</p>
        <img  src="/images/blogs/closure/closure-slide.png">
        <div style="font-size:12px">來源：<b><a href="https://www.udemy.com/course/the-complete-javascript-course/" target="_blank" rel="noreferrer noopenner">The-Complete-Javascript-Course Jonas Schmedtmann slide87</a></b></div>
        <p>而在JS具有內建的垃圾回收機制，如果今天要執行一個函式，會先進入Call Stack，而在函式執行完畢後，JS 引擎會自動判斷不需要該函式，所以將函式的記憶體空間釋放，這個概念也就造就出了我們下一段要提的「閉包」所發生的背景。</p>
      </div>
      <div>
        <h2>2. 閉包（Closure）與作用域（Scope）</h2>
        <p>在談論「閉包」之前，讓我們先來看看這段來自MDN的程式碼。</p>
        <img  src="/images/blogs/closure/closure-scope.png">
        <p>這段程式碼會印出Tony，乍看之下好像很合理，但想想我們上一段說的，在一個函式執行完後，JS 引擎會釋放記憶體空間，照理來說makeFunc執行到回傳 displayName 函式後，就會消失，為什麼我們將displayName 賦值到myFunc後執行myFunc()還能印出Tony呢？ 這就是所謂的「閉包」啦！</p>
        <p>而這一切又是如何發生的呢？這邊又牽涉到作用域的概念，這一樣是一個非常廣範的概念，這邊只能簡述，在Huli大的文章「所有的函式都是閉包：談 JS 中的作用域與 Closure」中，他用大明星與地區明星來介紹作用的的概念，是我目前看過最易懂的例子，首先先告訴大家這邊會用到的作用域規則是「內層的函式可以去獲取外層的變數，而外層的則無獲得內層的變數」，以明星的例子來舉例，明星有分國際巨星、台灣明星、地方明星等等，國際巨星泰勒絲就像是一個全域變數，在世界各地、在台灣、在台北都可以取得，因為大家都認識，但是在世界就無法取得唐綺陽這個變數，因爲她是台灣的國師而不是世界的地球占卜師，作用域大概就是這樣的概念。</p>
        <p>而問題來了，我在台灣想要獲得泰勒絲變數的值，我要如何取得？我們都知道泰勒絲並不是台灣人，在台灣是找不到的，所以JS的機制是，「找不到就往上層找」，仔細看看上面的程式碼，當displayName找不到name這個變數名稱時，往上一層找，找到makeFunc中的name變數Tony，而就是這樣的原理，JS引擎會發現這個變數還會被使用，所以保留不做釋放，而因為displayName而被保留的myFunc執行環境，在displayName執行時，完全屬於displayName，因為只存在在這樣的封閉環境，應此稱為「閉包」。</p>
        <p>在這裡簡單的為「閉包」下一個結論，我非常喜歡Jonas 在談論閉包時說的，閉包的特性可以解釋成，「<b>一個函式可以獲取內部用到的變數在宣告當下的環境</b>」（<b>A function has access to the variable environment (VE) of the execution context in which it was created</b>），以生活情境來比喻，就像一個人對出生地永遠保有連結一樣。</p>
      </div>
      <div>
        <h2>3.  閉包（Closure）的優缺點與應用</h2>
        <p>閉包的缺點從上面一路提下來，很明顯的會是內存泄露（Memory Leak）的問題，因為原本應該被釋放的記憶體空間，因為閉包都保存著，數量一多，勢必會造成記憶體的問題。</p>
        <p>關於閉包的優點，簡單提兩個，一個是可以將函數封裝創造私有變數，以下面這個MDN的例子來說，我們如果要改變privateCounter 這個變數，只能透過調用<b>counter.increment();</b><b>counter.increment();</b> 來改變，確保變數不會受到其他方式的改變與污染。</p>
        <img  src="/images/blogs/closure/closure-pros-and-cons.png">
        <p>另一個關於閉包的優點，是可以簡化複雜的算式，在搜尋參考資料時，逛到一篇LinkIn上的文章，<a href="https://www.linkedin.com/pulse/javascript-closure-use-case-avoid-memory-leaks-improve-sharma/ target="_blank" rel="noreferrer noopenner""> JavaScript Closure Use Case - Avoid memory leaks and improve performance</a> ，裡面提到一個簡單卻強大的例子來證明閉包的強大，比較下面兩個function的差別。FUNCTION 1 是沒有使用閉包的例子，FUNCTION 2是有使用閉包的例子，在FUNCTION 1中，每次調用multiplier，a 變數都會重新被宣告一次，而在FUNCTION 2中， 因為閉包，回傳的函式可以直接調用到a 的值，避免a 在每一次調用multiplier時都會被計算一次，因為現在大家的電腦都太快，可能不會明顯感受到差別，但如果今天a 是更複雜的計算，可能大家體感上就會感受到這樣使用的差異性了。</p>
        <img style="width:700px;height:'auto;object-fit:contain" src="/images/blogs/closure/closure-in-practice.png">
      </div>
      <div>
        <h2>4. React 內的閉包以 useState為例</h2>
        <p>在討論JS的閉包後，因為筆者最常使用的框架為React，因此想再連結閉包與React，進行簡單的討論。在React 中，最常被使用到的hook之一，useState即是透過閉包的方式去呈現，這邊引用參考資料7內，簡易模擬useState的程式碼：</p>
        <img  src="/images/blogs/closure/closure-useState-clone.png">      
        <p>這段程式碼中，最後的test會印出1，這是React中很常出現的議題「Stale Closure （過期閉包）」，仔細看，在useStateClone內部的setState 函式中，印出的state確實會是2，但因為調用setState 函式時並未重新調用useStateClone，所以即時在setState 函式內改變了state的值，該變數的改變結果也只停留在該函式作用域內，所以實際上在全域印出的state並不會被改變。</p>
        <p>而作者提出了解決此問題的方法，為以下程式碼：</p>
        <img  src="/images/blogs/closure/closure-useState-fun.png">
        <p>這段程式將state的閉包再多一層作用域，當呼叫render 函式的時候，所傳入的MyComponent也會被呼叫一次，意思即是內部的useStateClone也會被調用到，而setValue透過function的形式，將舊的state傳入，可以讓setState較即時更新狀態，這就是為什麼在React中，我們總是強調，setState必須用function去執行，以獲取較新的值來更新內容。</p>
      </div>

    `,
    reference: [
      {
        id: 1,
        title: 'The-Complete-Javascript-Course   Jonas Schmedtmann',
        link: 'https://www.udemy.com/user/jonasschmedtmann/',
      },
      {
        id: 2,
        title: 'MDN Closures',
        link: 'https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Closures',
      },
      {
        id: 3,
        title: '所有的函式都是閉包：談 JS 中的作用域與 Closure  Huli',
        link: 'https://blog.huli.tw/2018/12/08/javascript-closure/',
      },
      {
        id: 4,
        title: 'JavaScript概念三明治：基礎觀念、語法原理一次帶走！蔡木景',
        link: 'https://www.tenlong.com.tw/products/9789864347575?list_name=srh',
      },
      {
        id: 5,
        title: '[筆記]-JavaScript 閉包(Closure)是什麼?關於閉包的3件事',
        link: 'https://jianline.com/javascript-closure/',
      },
      {
        id: 6,
        title:
          'JavaScript Closure Use Case - Avoid memory leaks and improve performance',
        link: 'https://www.linkedin.com/pulse/javascript-closure-use-case-avoid-memory-leaks-improve-sharma/',
      },
      {
        id: 7,
        title: 'Behind the Scenes: React Hooks API',
        link: 'https://www.fullstacklabs.co/blog/behind-the-scenes-react-hooks-api',
      },
    ],
  },
];
