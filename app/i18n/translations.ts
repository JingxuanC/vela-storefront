// ============================================================================
// Vela AI — i18n Translations
// Supported: en, zh, ja, de, fr, es
// ============================================================================

export type Lang = "en" | "zh" | "ja" | "de" | "fr" | "es";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

type TranslationMap = Record<string, Record<Lang, string>>;

const T: TranslationMap = {
  // ── Nav ──
  "nav.features": { en: "Features", zh: "功能", ja: "機能", de: "Funktionen", fr: "Fonctions", es: "Funciones" },
  "nav.pricing": { en: "Pricing", zh: "定价", ja: "価格", de: "Preise", fr: "Tarifs", es: "Precios" },
  "nav.contact": { en: "Contact", zh: "联系", ja: "お問い合わせ", de: "Kontakt", fr: "Contact", es: "Contacto" },
  "nav.dashboard": { en: "Dashboard →", zh: "控制台 →", ja: "ダッシュボード →", de: "Dashboard →", fr: "Tableau de bord →", es: "Panel →" },

  // ── Hero ──
  "hero.badge": { en: "AI-Powered Growth for Shopify", zh: "AI 驱动的 Shopify 增长引擎", ja: "Shopify向けAI成長エンジン", de: "KI-gestütztes Wachstum für Shopify", fr: "Croissance IA pour Shopify", es: "Crecimiento impulsado por IA para Shopify" },
  "hero.title1": { en: "You're one person running a store.", zh: "你一个人运营一家店。", ja: "あなた一人でストアを運営。", de: "Sie führen allein einen Shop.", fr: "Vous gérez une boutique seul(e).", es: "Eres una persona dirigiendo una tienda." },
  "hero.title2": { en: "But you're competing with teams of 50.", zh: "但你的竞争对手有 50 人的团队。", ja: "でも競合は50人のチーム。", de: "Aber Sie konkurrieren mit Teams von 50.", fr: "Mais vos concurrents ont des équipes de 50.", es: "Pero compites contra equipos de 50 personas." },
  "hero.subtitle": { en: "Vela AI gives you the AI team you can't afford to hire — customer support, marketing, content, SEO. One install, 24/7.", zh: "Vela AI 给你请不起的 AI 团队——客服、营销、内容、SEO。一次安装，全天候运行。", ja: "Vela AIはあなたに雇えないAIチームを提供——カスタマーサポート、マーケティング、コンテンツ、SEO。1回のインストールで24時間365日稼働。", de: "Vela AI gibt Ihnen das KI-Team, das Sie sich nicht leisten können – Support, Marketing, Content, SEO. Eine Installation, 24/7.", fr: "Vela AI vous donne l'équipe IA que vous ne pouvez pas embaucher — support, marketing, contenu, SEO. Une installation, 24h/24.", es: "Vela AI te da el equipo de IA que no puedes pagar — soporte, marketing, contenido, SEO. Una instalación, 24/7." },
  "hero.cta.install": { en: "Install on Shopify — Free", zh: "免费安装到 Shopify", ja: "Shopifyに無料インストール", de: "Kostenlos auf Shopify installieren", fr: "Installer sur Shopify — Gratuit", es: "Instalar en Shopify — Gratis" },
  "hero.cta.contact": { en: "Talk to Us →", zh: "联系我们 →", ja: "お問い合わせ →", de: "Kontaktieren Sie uns →", fr: "Contactez-nous →", es: "Contáctanos →" },

  // ── Pain Points ──
  "pain.label": { en: "The Reality", zh: "现实", ja: "現実", de: "Die Realität", fr: "La réalité", es: "La realidad" },
  "pain.heading": { en: "Running a Shopify store is a full-time job. Actually, it's three.", zh: "运营 Shopify 店铺是一份全职工作。其实是三份。", ja: "Shopifyストアの運営はフルタイムの仕事。実は3つ分。", de: "Einen Shopify-Shop zu führen ist ein Vollzeitjob. Eigentlich sind es drei.", fr: "Gérer une boutique Shopify est un travail à plein temps. En fait, c'en est trois.", es: "Dirigir una tienda Shopify es un trabajo de tiempo completo. En realidad, son tres." },
  "pain.cards.0.title": { en: "You Can't Reply to Every Customer", zh: "你无法回复每个客户", ja: "全ての顧客に返信できない", de: "Sie können nicht jedem Kunden antworten", fr: "Vous ne pouvez pas répondre à chaque client", es: "No puedes responder a cada cliente" },
  "pain.cards.0.desc": { en: "42% of shoppers expect a response within 1 hour. Negative reviews pile up while you're packing orders. Your brand reputation suffers in silence.", zh: "42% 的消费者期望 1 小时内得到回复。差评在你打包订单时堆积。品牌声誉在沉默中受损。", ja: "購入者の42%が1時間以内の返信を期待。注文処理中に悪いレビューが蓄積。ブランドの評判が静かに傷つく。", de: "42% der Käufer erwarten eine Antwort innerhalb 1 Stunde. Negative Bewertungen häufen sich, während Sie Bestellungen packen.", fr: "42% des acheteurs attendent une réponse en moins d'1h. Les avis négatifs s'accumulent pendant que vous préparez les commandes.", es: "El 42% de los compradores espera respuesta en 1 hora. Las reseñas negativas se acumulan mientras empaquetas pedidos." },
  "pain.cards.1.title": { en: "70% of Carts Are Abandoned", zh: "70% 的购物车被放弃", ja: "カートの70%が放棄される", de: "70% der Warenkörbe werden abgebrochen", fr: "70% des paniers sont abandonnés", es: "El 70% de los carritos se abandonan" },
  "pain.cards.1.desc": { en: "Customers leave without buying. You don't know why. No time to send follow-ups. That's thousands in lost revenue every month.", zh: "顾客离开不买。你不知道为什么。没时间跟进。每月损失数千美元收入。", ja: "顧客は購入せずに去る。理由は不明。フォローアップの時間なし。毎月数千ドルの機会損失。", de: "Kunden gehen ohne zu kaufen. Sie wissen nicht warum. Keine Zeit für Follow-ups. Das sind Tausende an verlorenem Umsatz.", fr: "Les clients partent sans acheter. Vous ne savez pas pourquoi. Pas le temps d'envoyer des relances. Des milliers perdus chaque mois.", es: "Los clientes se van sin comprar. No sabes por qué. Sin tiempo para seguimientos. Miles en ingresos perdidos cada mes." },
  "pain.cards.2.title": { en: "AI Search Engines Can't Find You", zh: "AI 搜索引擎找不到你", ja: "AI検索エンジンがあなたを見つけられない", de: "KI-Suchmaschinen finden Sie nicht", fr: "Les moteurs de recherche IA ne vous trouvent pas", es: "Los motores de búsqueda IA no te encuentran" },
  "pain.cards.2.desc": { en: "ChatGPT, Perplexity, Gemini — your products are invisible to them. Your competitors are already optimizing.", zh: "ChatGPT、Perplexity、Gemini——你的产品对它们不可见。竞争对手已经在优化了。", ja: "ChatGPT、Perplexity、Gemini——あなたの製品は見えていない。競合はすでに最適化済み。", de: "ChatGPT, Perplexity, Gemini – Ihre Produkte sind für sie unsichtbar. Ihre Konkurrenten optimieren bereits.", fr: "ChatGPT, Perplexity, Gemini — vos produits sont invisibles. Vos concurrents optimisent déjà.", es: "ChatGPT, Perplexity, Gemini — tus productos son invisibles para ellos. Tus competidores ya están optimizando." },

  // ── How It Works ──
  "how.label": { en: "How Vela AI Works", zh: "Vela AI 如何运作", ja: "Vela AIの仕組み", de: "Wie Vela AI funktioniert", fr: "Comment Vela AI fonctionne", es: "Cómo funciona Vela AI" },
  "how.heading": { en: "Your store data becomes your competitive advantage", zh: "你的店铺数据成为竞争优势", ja: "あなたのストアデータが競争優位に", de: "Ihre Shop-Daten werden zum Wettbewerbsvorteil", fr: "Vos données deviennent votre avantage concurrentiel", es: "Los datos de tu tienda se convierten en ventaja competitiva" },
  "how.steps.0.title": { en: "Sync Your Store", zh: "同步店铺数据", ja: "ストアを同期", de: "Shop synchronisieren", fr: "Synchronisez votre boutique", es: "Sincroniza tu tienda" },
  "how.steps.0.desc": { en: "Products, orders, reviews — auto-synced", zh: "产品、订单、评价——自动同步", ja: "商品・注文・レビューを自動同期", de: "Produkte, Bestellungen, Bewertungen – automatisch synchronisiert", fr: "Produits, commandes, avis — synchronisés automatiquement", es: "Productos, pedidos, reseñas — sincronizados automáticamente" },
  "how.steps.1.title": { en: "AI Learns Your Business", zh: "AI 学习你的业务", ja: "AIがビジネスを学習", de: "KI lernt Ihr Geschäft", fr: "L'IA apprend votre activité", es: "La IA aprende tu negocio" },
  "how.steps.1.desc": { en: "Patterns, trends, customer behavior", zh: "模式、趋势、客户行为", ja: "パターン・トレンド・顧客行動", de: "Muster, Trends, Kundenverhalten", fr: "Tendances, motifs, comportement client", es: "Patrones, tendencias, comportamiento del cliente" },
  "how.steps.2.title": { en: "Revenue Grows 24/7", zh: "收入 24/7 增长", ja: "収益が24時間365日成長", de: "Umsatz wächst rund um die Uhr", fr: "Le chiffre d'affaires augmente 24h/24", es: "Los ingresos crecen 24/7" },
  "how.steps.2.desc": { en: "Replies, recovers, recommends", zh: "自动回复、挽回、推荐", ja: "返信・回復・レコメンド", de: "Antwortet, stellt wieder her, empfiehlt", fr: "Répond, récupère, recommande", es: "Responde, recupera, recomienda" },

  // ── Loss Calculator ──
  "calc.label": { en: "What You're Losing Right Now", zh: "你现在正在损失什么", ja: "今、何を失っているか", de: "Was Sie gerade verlieren", fr: "Ce que vous perdez en ce moment", es: "Lo que estás perdiendo ahora" },
  "calc.heading": { en: "Calculate your hidden revenue loss — every month", zh: "计算你每月隐藏的收入损失", ja: "毎月の隠れた収益損失を計算", de: "Berechnen Sie Ihren versteckten monatlichen Umsatzverlust", fr: "Calculez votre perte de revenus cachée — chaque mois", es: "Calcula tu pérdida de ingresos oculta — cada mes" },
  "calc.orders_label": { en: "Monthly orders", zh: "月订单数", ja: "月間注文数", de: "Monatliche Bestellungen", fr: "Commandes mensuelles", es: "Pedidos mensuales" },
  "calc.aov_label": { en: "Average order value ($)", zh: "平均客单价 ($)", ja: "平均注文額 ($)", de: "Durchschn. Bestellwert ($)", fr: "Panier moyen ($)", es: "Valor promedio del pedido ($)" },
  "calc.button": { en: "Calculate My Loss", zh: "计算我的损失", ja: "損失を計算", de: "Meinen Verlust berechnen", fr: "Calculer ma perte", es: "Calcular mi pérdida" },
  "calc.result.abandoned": { en: "Abandoned Cart Value", zh: "弃购金额", ja: "放棄カート額", de: "Abgebrochene Warenkörbe", fr: "Valeur des paniers abandonnés", es: "Valor de carritos abandonados" },
  "calc.result.recoverable": { en: "Recoverable with Vela (~25%)", zh: "Vela 可挽回 (~25%)", ja: "Velaで回復可能 (~25%)", de: "Mit Vela wiederherstellbar (~25%)", fr: "Récupérable avec Vela (~25%)", es: "Recuperable con Vela (~25%)" },
  "calc.result.reviews": { en: "Negative Reviews (monthly)", zh: "差评数 (月)", ja: "ネガティブレビュー (月間)", de: "Negative Bewertungen (monatlich)", fr: "Avis négatifs (mensuels)", es: "Reseñas negativas (mensuales)" },
  "calc.result.ai_invisible": { en: "AI-Search Invisible Products", zh: "AI 搜索不可见产品", ja: "AI検索で見えない商品", de: "KI-unsichtbare Produkte", fr: "Produits invisibles aux IA", es: "Productos invisibles para IA" },
  "calc.cta": { en: "Stop losing ${amount}/mo. Install Vela free.", zh: "别再每月损失 ${amount}。免费安装 Vela。", ja: "毎月${amount}の損失を止める。Velaを無料でインストール。", de: "Stoppen Sie ${amount}$/Monat Verlust. Installieren Sie Vela kostenlos.", fr: "Arrêtez de perdre ${amount}$/mois. Installez Vela gratuitement.", es: "Deja de perder ${amount}/mes. Instala Vela gratis." },

  // ── Tool Comparison ──
  "compare.label": { en: "One App Replaces Five", zh: "一个应用替代五个", ja: "1つのアプリで5つを置き換え", de: "Eine App ersetzt fünf", fr: "Une app remplace cinq", es: "Una app reemplaza cinco" },
  "compare.heading": { en: "You're paying for 5+ apps. Vela does it all.", zh: "你每月付 5+ 个 App 的钱。Vela 一个就够了。", ja: "5つ以上のアプリに支払っている。Velaがすべてをカバー。", de: "Sie bezahlen für 5+ Apps. Vela macht alles.", fr: "Vous payez pour 5+ apps. Vela fait tout.", es: "Estás pagando 5+ apps. Vela lo hace todo." },
  "compare.monthly_savings": { en: "Monthly savings with Vela Growth plan", zh: "使用 Vela Growth 方案每月节省", ja: "Vela Growthプランでの月間節約額", de: "Monatliche Ersparnis mit Vela Growth", fr: "Économies mensuelles avec le plan Vela Growth", es: "Ahorro mensual con el plan Vela Growth" },

  // ── Product Showcase ──
  "showcase.label": { en: "See Vela in Action", zh: "看看 Vela 长什么样", ja: "Velaの動作を見る", de: "Sehen Sie Vela in Aktion", fr: "Voyez Vela en action", es: "Ve Vela en acción" },
  "showcase.heading": { en: "Beautiful dashboard. Powerful AI. Zero learning curve.", zh: "漂亮的仪表盘。强大的 AI。零学习曲线。", ja: "美しいダッシュボード。強力なAI。学習不要。", de: "Schönes Dashboard. Leistungsstarke KI. Keine Lernkurve.", fr: "Beau tableau de bord. IA puissante. Zéro courbe d'apprentissage.", es: "Hermoso panel. IA potente. Sin curva de aprendizaje." },

  // ── Data Flywheel ──
  "flywheel.label": { en: "The Data Flywheel", zh: "数据飞轮", ja: "データフライホイール", de: "Das Daten-Schwungrad", fr: "Le volant de données", es: "El volante de datos" },
  "flywheel.heading": { en: "Every interaction makes your AI smarter", zh: "每次互动让 AI 更聪明", ja: "すべての対話がAIを賢くする", de: "Jede Interaktion macht Ihre KI schlauer", fr: "Chaque interaction rend votre IA plus intelligente", es: "Cada interacción hace que tu IA sea más inteligente" },
  "flywheel.desc": { en: "Sync your store → AI analyzes patterns → Insights drive actions → Results feed back in. Unlike other apps, Vela's features share one data foundation.", zh: "同步店铺 → AI 分析模式 → 洞察驱动行动 → 结果反馈。与其他 App 不同，Vela 的所有功能共享同一数据底座。", ja: "ストア同期 → AIがパターン分析 → 洞察が行動を促進 → 結果がフィードバック。他のアプリと違い、Velaの全機能は1つのデータ基盤を共有。", de: "Shop sync → KI analysiert Muster → Erkenntnisse treiben Aktionen → Ergebnisse fließen zurück. Anders als andere Apps teilen Velas Funktionen eine Datenbasis.", fr: "Sync boutique → L'IA analyse → Les insights déclenchent des actions → Les résultats alimentent le système. Contrairement aux autres apps, Vela partage une base de données unique.", es: "Sincroniza tienda → IA analiza patrones → Insights impulsan acciones → Resultados retroalimentan. A diferencia de otras apps, Vela comparte una base de datos única." },
  "flywheel.pillars.0.t": { en: "Real-time Sync", zh: "实时同步", ja: "リアルタイム同期", de: "Echtzeit-Sync", fr: "Sync en temps réel", es: "Sincronización en tiempo real" },
  "flywheel.pillars.0.d": { en: "Products, orders, reviews — auto-synced via Shopify webhooks", zh: "产品、订单、评价——通过 Shopify webhook 自动同步", ja: "商品・注文・レビューをShopifyウェブフックで自動同期", de: "Produkte, Bestellungen, Bewertungen – automatisch via Shopify-Webhooks", fr: "Produits, commandes, avis — synchronisés via webhooks Shopify", es: "Productos, pedidos, reseñas — sincronizados vía webhooks de Shopify" },
  "flywheel.pillars.1.t": { en: "Unified Data Base", zh: "统一数据底座", ja: "統合データ基盤", de: "Einheitliche Datenbasis", fr: "Base de données unifiée", es: "Base de datos unificada" },
  "flywheel.pillars.1.d": { en: "All AI features share one data foundation — no silos", zh: "所有 AI 功能共享一个数据底座——没有数据孤岛", ja: "全AI機能が1つのデータ基盤を共有——サイロなし", de: "Alle KI-Funktionen teilen eine Datenbasis – keine Silos", fr: "Toutes les fonctions IA partagent une base — pas de silos", es: "Todas las funciones IA comparten una base de datos — sin silos" },
  "flywheel.pillars.2.t": { en: "Self-improving", zh: "自我进化", ja: "自己改善", de: "Selbstverbessernd", fr: "Auto-amélioration", es: "Auto-mejora" },
  "flywheel.pillars.2.d": { en: "Each customer interaction refines recommendations", zh: "每次客户互动都优化推荐", ja: "各顧客対話がレコメンドを改善", de: "Jede Kundeninteraktion verfeinert Empfehlungen", fr: "Chaque interaction affine les recommandations", es: "Cada interacción refina las recomendaciones" },
  "flywheel.pillars.3.t": { en: "Zero Configuration", zh: "零配置", ja: "ゼロ設定", de: "Null Konfiguration", fr: "Zéro configuration", es: "Cero configuración" },
  "flywheel.pillars.3.d": { en: "Install → Done. App Embed Block activates automatically", zh: "安装即用。App Embed Block 自动激活", ja: "インストール→完了。App Embed Blockが自動有効化", de: "Installieren → Fertig. App Embed Block aktiviert sich automatisch", fr: "Installer → C'est prêt. L'App Embed s'active automatiquement", es: "Instalar → Listo. El App Embed se activa automáticamente" },

  // ── Results ──
  "results.label": { en: "What You Actually Get", zh: "你实际得到什么", ja: "実際に得られるもの", de: "Was Sie tatsächlich bekommen", fr: "Ce que vous obtenez vraiment", es: "Lo que realmente obtienes" },
  "results.heading": { en: "Not features. Results.", zh: "不是功能。是结果。", ja: "機能ではなく結果。", de: "Keine Features. Ergebnisse.", fr: "Pas des fonctionnalités. Des résultats.", es: "No características. Resultados." },

  // ── Product Showcase new cards ──
  "showcase.fulfillment.title": { en: "Live Tracking", zh: "物流跟踪", ja: "配送追跡", de: "Sendungsverfolgung", fr: "Suivi en direct", es: "Seguimiento en vivo" },
  "showcase.fulfillment.desc": { en: "Real-time order tracking on storefront. Customers see every step — label printed, in transit, out for delivery, delivered. Powered by Shopify GraphQL.", zh: "店铺前台实时订单追踪。顾客看到每一步——已打单、运输中、派送中、已签收。基于 Shopify GraphQL。", ja: "ストアフロントでリアルタイム注文追跡。顧客は全ステップを確認——ラベル印刷済、輸送中、配達中、配達完了。Shopify GraphQL対応。", de: "Echtzeit-Sendungsverfolgung im Shop. Kunden sehen jeden Schritt — Etikett gedruckt, unterwegs, in Zustellung, zugestellt.", fr: "Suivi de commande en temps réel sur la vitrine. Les clients voient chaque étape — étiquette imprimée, en transit, en livraison, livré.", es: "Seguimiento de pedidos en tiempo real en tu tienda. Los clientes ven cada paso — etiqueta impresa, en tránsito, en reparto, entregado." },
  "showcase.salesbot.title": { en: "AI Sales Agent", zh: "AI 销售机器人", ja: "AIセールスエージェント", de: "KI-Verkaufsagent", fr: "Agent de vente IA", es: "Agente de ventas IA" },
  "showcase.salesbot.desc": { en: "Not a FAQ bot. 5-stage sales funnel: Greeting → Qualifying questions → Personalized recommendations → Objection handling with real Shopify discount codes → One-click checkout. 9 tools, autonomous decisions.", zh: "不是 FAQ 机器人。五阶段销售漏斗：打招呼 → 问需求 → 个性化推荐 → 化解议价（真实 Shopify 折扣码）→ 一键结账。9 个工具自主决策，像真正的销售。", ja: "FAQボットではありません。5段階の営業ファネル：挨拶→ニーズ発見→パーソナライズ推薦→価格交渉対応（実Shopify割引コード）→ワンクリック購入。9ツールで自律判断。", de: "Kein FAQ-Bot. 5-stufiger Verkaufstrichter: Begrüßung → Bedarfsanalyse → Personalisierte Empfehlungen → Einwandbehandlung mit echten Shopify-Rabattcodes → One-Click-Checkout.", fr: "Pas un bot FAQ. Entonnoir de vente en 5 étapes : Accueil → Questions qualificatives → Recommandations personnalisées → Gestion des objections avec vrais codes promo Shopify → Achat en un clic.", es: "No es un bot de FAQ. Embudo de ventas de 5 etapas: Saludo → Preguntas calificativas → Recomendaciones personalizadas → Manejo de objeciones con códigos de descuento reales de Shopify → Compra en un clic." },
  "showcase.chat.title": { en: "Merchant Chat", zh: "商家沟通", ja: "マーチャントチャット", de: "Händler-Chat", fr: "Chat marchand", es: "Chat del comerciante" },
  "showcase.chat.desc": { en: "Customers chat directly with you — not just AI. When they need a human, the conversation routes to your dashboard. Build relationships, not just transactions.", zh: "顾客直接与你对话——不只是 AI。需要人工时，对话路由到你的控制台。建立关系，而不只是交易。", ja: "顧客がAIだけでなくあなたと直接チャット。人間が必要な時は会話がダッシュボードに転送。取引だけでなく関係を構築。", de: "Kunden chatten direkt mit Ihnen — nicht nur mit KI. Wenn sie einen Menschen brauchen, wird das Gespräch an Ihr Dashboard weitergeleitet.", fr: "Les clients discutent directement avec vous — pas seulement l'IA. Quand ils ont besoin d'un humain, la conversation est routée vers votre tableau de bord.", es: "Los clientes chatean directamente contigo — no solo con IA. Cuando necesitan un humano, la conversación se enruta a tu panel." },
  "compare.salesbot": { en: "Sales Agent", zh: "销售机器人", ja: "セールスエージェント", de: "Verkaufsagent", fr: "Agent de vente", es: "Agente de ventas" },
  "compare.salesbot.others": { en: "Tidio + Gorgias $79+/mo", zh: "Tidio + Gorgias $79+/月", ja: "Tidio + Gorgias $79+/月", de: "Tidio + Gorgias $79+/Monat", fr: "Tidio + Gorgias $79+/mois", es: "Tidio + Gorgias $79+/mes" },
  "compare.salesbot.vela": { en: "AI Autopilot · Free", zh: "AI 自动驾驶 · 免费", ja: "AI自動運転 · 無料", de: "KI-Autopilot · Kostenlos", fr: "Pilote automatique IA · Gratuit", es: "Piloto automático IA · Gratis" },
  "compare.fulfillment": { en: "Order Tracking", zh: "订单追踪", ja: "注文追跡", de: "Sendungsverfolgung", fr: "Suivi de commande", es: "Seguimiento de pedidos" },
  "compare.fulfillment.others": { en: "AfterShip $11/mo", zh: "AfterShip $11/月", ja: "AfterShip $11/月", de: "AfterShip $11/Monat", fr: "AfterShip $11/mois", es: "AfterShip $11/mes" },
  "compare.fulfillment.vela": { en: "Built-in · Free", zh: "内置 · 免费", ja: "内蔵 · 無料", de: "Integriert · Kostenlos", fr: "Intégré · Gratuit", es: "Integrado · Gratis" },
  "features.salesbot.title": { en: "AI Sales Agent", zh: "AI 销售机器人", ja: "AIセールスエージェント", de: "KI-Verkaufsagent", fr: "Agent de vente IA", es: "Agente de ventas IA" },
  "features.salesbot.desc": { en: "5-stage sales funnel: discovers needs, handles objections, generates real Shopify discount codes, closes with one-click checkout. 9 built-in tools, autonomous decisions, ranks results by customer preferences.", zh: "五阶段销售漏斗：挖掘需求 → 个性化推荐 → 化解议价 → 生成真实 Shopify 折扣码 → 一键结账。9 个内置工具，自主决策，按顾客偏好排序结果。", ja: "5段階営業ファネル：ニーズ発見→推薦→価格交渉→実Shopify割引コード→ワンクリック購入。9種類のツール、自律判断、顧客好みでランキング。", de: "5-stufiger Verkaufstrichter: Bedarfsanalyse → Empfehlungen → Einwandbehandlung → echte Shopify-Rabattcodes → Checkout. 9 Tools, autonome Entscheidungen.", fr: "Entonnoir en 5 étapes : découverte des besoins → recommandations → gestion des objections → vrais codes promo Shopify → achat. 9 outils, décisions autonomes.", es: "Embudo de 5 etapas: descubre necesidades → recomienda → maneja objeciones → códigos de descuento reales → compra. 9 herramientas, decisiones autónomas." },

  // ── Features Grid ──
  "features.label": { en: "Eight AI Modules", zh: "八大 AI 模块", ja: "8つのAIモジュール", de: "Acht KI-Module", fr: "Huit modules IA", es: "Ocho módulos de IA" },
  "features.heading": { en: "Everything your store needs to grow", zh: "店铺增长所需的一切", ja: "ストア成長に必要なすべて", de: "Alles, was Ihr Shop zum Wachsen braucht", fr: "Tout ce dont votre boutique a besoin pour se développer", es: "Todo lo que tu tienda necesita para crecer" },

  // ── What's New ──
  "whatsnew.label": { en: "What's New", zh: "最新功能", ja: "新機能", de: "Neuigkeiten", fr: "Nouveautés", es: "Novedades" },
  "whatsnew.heading": { en: "Just shipped. Already working for your store.", zh: "刚上线。已经在为你的店铺工作。", ja: "リリース済み。すでにストアで稼働中。", de: "Gerade veröffentlicht. Arbeitet bereits für Ihren Shop.", fr: "Vient de sortir. Déjà au travail pour votre boutique.", es: "Recién lanzado. Ya trabajando para tu tienda." },

  // ── Trust Bar ──
  "trust.gdpr": { en: "GDPR Compliant", zh: "GDPR 合规", ja: "GDPR準拠", de: "DSGVO-konform", fr: "Conforme RGPD", es: "Cumple GDPR" },
  "trust.speed": { en: "<50KB — Won't slow your store", zh: "<50KB — 不影响店铺速度", ja: "<50KB — ストア速度に影響なし", de: "<50KB – Verlangsamt Ihren Shop nicht", fr: "<50KB — Ne ralentit pas votre boutique", es: "<50KB — No ralentiza tu tienda" },
  "trust.privacy": { en: "We never sell your data", zh: "绝不售卖你的数据", ja: "データを販売しません", de: "Wir verkaufen Ihre Daten nie", fr: "Nous ne vendons jamais vos données", es: "Nunca vendemos tus datos" },
  "trust.uninstall": { en: "Uninstall = Data deleted in 30 days", zh: "卸载后 30 天内数据清除", ja: "アンインストール後30日でデータ削除", de: "Deinstallation = Daten in 30 Tagen gelöscht", fr: "Désinstallation = Données supprimées sous 30 jours", es: "Desinstalar = Datos eliminados en 30 días" },
  "trust.ai": { en: "Powered by Qwen — Bring your own key", zh: "Powered by Qwen — 可用自己的 API Key", ja: "Qwen搭載 — 独自キー持込可", de: "Powered by Qwen – Eigener Key möglich", fr: "Propulsé par Qwen — Apportez votre clé", es: "Impulsado por Qwen — Trae tu propia clave" },

  // ── Stats ──
  "stats.label": { en: "Trusted by Shopify Merchants", zh: "Shopify 商家信赖", ja: "Shopifyマーチャントに信頼", de: "Von Shopify-Händlern vertraut", fr: "Approuvé par les marchands Shopify", es: "Confiado por comerciantes Shopify" },
  "stats.heading": { en: "Results that speak for themselves", zh: "结果说明一切", ja: "結果がすべてを語る", de: "Ergebnisse, die für sich sprechen", fr: "Des résultats qui parlent d'eux-mêmes", es: "Resultados que hablan por sí mismos" },
  "stats.0.value": { en: "500+", zh: "500+", ja: "500+", de: "500+", fr: "500+", es: "500+" },
  "stats.0.label": { en: "Active Stores", zh: "活跃店铺", ja: "アクティブストア", de: "Aktive Shops", fr: "Boutiques actives", es: "Tiendas activas" },
  "stats.1.value": { en: "2.4M", zh: "240万", ja: "240万", de: "2,4 Mio.", fr: "2,4M", es: "2,4M" },
  "stats.1.label": { en: "AI Interactions", zh: "AI 交互次数", ja: "AI対話数", de: "KI-Interaktionen", fr: "Interactions IA", es: "Interacciones IA" },
  "stats.2.value": { en: "98%", zh: "98%", ja: "98%", de: "98%", fr: "98%", es: "98%" },
  "stats.2.label": { en: "Satisfaction", zh: "满意度", ja: "満足度", de: "Zufriedenheit", fr: "Satisfaction", es: "Satisfacción" },
  "stats.3.value": { en: "15%", zh: "15%", ja: "15%", de: "15%", fr: "15%", es: "15%" },
  "stats.3.label": { en: "Avg Revenue Uplift", zh: "平均收入提升", ja: "平均収益向上", de: "Ø Umsatzsteigerung", fr: "Hausse moyenne du CA", es: "Aumento medio de ingresos" },

  // ── Pricing ──
  "pricing.label": { en: "Pricing", zh: "定价", ja: "価格", de: "Preise", fr: "Tarifs", es: "Precios" },
  "pricing.heading": { en: "Free to Start, Scale as You Grow", zh: "免费起步，按需扩展", ja: "無料で始めて、成長に合わせて拡張", de: "Kostenlos starten, bei Wachstum skalieren", fr: "Gratuit pour commencer, évoluez avec votre croissance", es: "Gratis para empezar, escala cuando crezcas" },
  "pricing.popular": { en: "MOST POPULAR", zh: "最受欢迎", ja: "一番人気", de: "AM BELIEBTESTEN", fr: "LE PLUS POPULAIRE", es: "MÁS POPULAR" },
  "pricing.free.name": { en: "Free", zh: "免费", ja: "無料", de: "Kostenlos", fr: "Gratuit", es: "Gratis" },
  "pricing.growth.name": { en: "Growth", zh: "成长版", ja: "Growth", de: "Growth", fr: "Croissance", es: "Crecimiento" },
  "pricing.pro.name": { en: "Pro", zh: "专业版", ja: "Pro", de: "Pro", fr: "Pro", es: "Pro" },
  "pricing.cta.popular": { en: "Start Free Trial", zh: "开始免费试用", ja: "無料トライアル開始", de: "Kostenlos testen", fr: "Essai gratuit", es: "Prueba gratis" },
  "pricing.cta.default": { en: "Get Started", zh: "开始使用", ja: "始める", de: "Loslegen", fr: "Commencer", es: "Empezar" },

  // ── Results Cards ──
  "results.cards.0.label": { en: "of negative reviews auto-replied", zh: "差评自动回复率", ja: "ネガティブレビュー自動返信率", de: "der negativen Bewertungen automatisch beantwortet", fr: "des avis négatifs répondus automatiquement", es: "de reseñas negativas respondidas automáticamente" },
  "results.cards.0.title": { en: "Auto Reply That Sounds Human", zh: "像真人一样的自动回复", ja: "人間らしい自動返信", de: "Automatische Antwort, die menschlich klingt", fr: "Réponse automatique qui semble humaine", es: "Respuesta automática que suena humana" },
  "results.cards.0.desc": { en: "Customer leaves a 1-star review at 3 AM? Vela responds within minutes — with empathy, product knowledge, and a solution.", zh: "客户凌晨3点留下1星评价？Vela 在几分钟内回复——带有同理心、产品知识和解决方案。", ja: "顧客が深夜3時に1つ星レビュー？Velaが数分で返信——共感、商品知識、解決策を添えて。", de: "Kunde hinterlässt um 3 Uhr nachts eine 1-Stern-Bewertung? Vela antwortet innerhalb von Minuten.", fr: "Un client laisse un avis 1 étoile à 3h du matin ? Vela répond en quelques minutes.", es: "¿Un cliente deja una reseña de 1 estrella a las 3 AM? Vela responde en minutos." },
  "results.cards.1.label": { en: "average cart recovery rate", zh: "平均购物车挽回率", ja: "平均カート回復率", de: "durchschnittliche Warenkorb-Wiederherstellungsrate", fr: "taux moyen de récupération de panier", es: "tasa promedio de recuperación de carritos" },
  "results.cards.1.title": { en: "Abandoned Carts Recovered", zh: "弃购挽回", ja: "放棄カートを回復", de: "Abgebrochene Warenkörbe wiederhergestellt", fr: "Paniers abandonnés récupérés", es: "Carritos abandonados recuperados" },
  "results.cards.1.desc": { en: "Detects abandonment, sends personalized email with smart discount, tracks recovery. You do nothing.", zh: "自动检测弃购，发送个性化邮件和智能折扣，追踪挽回效果。你什么都不用做。", ja: "放棄を検出し、パーソナライズメールとスマート割引を送信、回復を追跡。何もしなくてOK。", de: "Erkennt Abbruch, sendet personalisierte E-Mail mit Rabatt, verfolgt Wiederherstellung.", fr: "Détecte l'abandon, envoie un email personnalisé avec remise, suit la récupération.", es: "Detecta abandono, envía email personalizado con descuento, rastrea recuperación." },
  "results.cards.2.label": { en: "AI interactions processed", zh: "AI 交互处理量", ja: "AI対話処理数", de: "KI-Interaktionen verarbeitet", fr: "interactions IA traitées", es: "interacciones IA procesadas" },
  "results.cards.2.title": { en: "Real Conversations, Real Sales", zh: "真实对话，真实销售", ja: "リアルな会話、リアルな売上", de: "Echte Gespräche, echte Verkäufe", fr: "Vraies conversations, vraies ventes", es: "Conversaciones reales, ventas reales" },
  "results.cards.2.desc": { en: "Vela handles product questions, size recommendations, and purchase objections right on your storefront.", zh: "Vela 在你的店铺前台处理产品问题、尺码推荐和购买疑虑。", ja: "Velaがストアフロントで商品質問、サイズ推奨、購入の懸念に対応。", de: "Vela bearbeitet Produktfragen, Größenempfehlungen und Kaufeinwände direkt in Ihrem Shop.", fr: "Vela gère les questions produits, recommandations de taille et objections d'achat sur votre vitrine.", es: "Vela maneja preguntas de productos, recomendaciones de talla y objeciones de compra en tu escaparate." },

  // ── Features Cards (Grid) ──
  "features.cards.0.title": { en: "AI Operations Assistant", zh: "AI 运营助手", ja: "AI運用アシスタント", de: "KI-Betriebsassistent", fr: "Assistant opérationnel IA", es: "Asistente de operaciones IA" },
  "features.cards.0.desc": { en: "Ask anything about your store. 'Why are returns up?' 'What should I restock?' — gets real answers from your data.", zh: "问任何关于店铺的问题——'退货为什么多了？''该补什么货？'——从真实数据中获取答案。", ja: "ストアについて何でも質問——「返品が増えた理由は？」「何を再入荷すべき？」——実データから回答。", de: "Fragen Sie alles über Ihren Shop.", fr: "Posez n'importe quelle question sur votre boutique. L'IA répond avec vos données réelles.", es: "Pregunta lo que sea sobre tu tienda. La IA responde con datos reales." },
  "features.cards.1.title": { en: "AI Shopping Assistant", zh: "AI 购物助手", ja: "AIショッピングアシスタント", de: "KI-Einkaufsassistent", fr: "Assistant shopping IA", es: "Asistente de compras IA" },
  "features.cards.1.desc": { en: "Embedded on storefront. Customers ask product questions, AI answers with real product data and reviews.", zh: "嵌入店铺前台。顾客提问产品问题，AI 用真实产品数据和评价回答。", ja: "ストアフロントに埋め込み。顧客が商品質問、AIが実データとレビューで回答。", de: "Eingebettet im Shop. Kunden fragen, KI antwortet mit echten Produktdaten.", fr: "Intégré à la vitrine. Les clients posent des questions, l'IA répond avec des données réelles.", es: "Integrado en el escaparate. Los clientes preguntan, la IA responde con datos reales." },
  "features.cards.2.title": { en: "Auto Reply to Reviews", zh: "自动回复评价", ja: "レビュー自動返信", de: "Auto-Antwort auf Bewertungen", fr: "Réponse automatique aux avis", es: "Respuesta automática a reseñas" },
  "features.cards.2.desc": { en: "Detects negative reviews via webhook, generates empathetic AI replies, posts back after your approval.", zh: "通过 webhook 检测差评，生成富有同理心的 AI 回复，你批准后自动发布。", ja: "ウェブフックでネガティブレビューを検出、共感的なAI返信を生成、承認後に投稿。", de: "Erkennt negative Bewertungen via Webhook, generiert empathische KI-Antworten.", fr: "Détecte les avis négatifs via webhook, génère des réponses IA empathiques.", es: "Detecta reseñas negativas vía webhook, genera respuestas IA empáticas." },
  "features.cards.3.title": { en: "Content Factory", zh: "内容工厂", ja: "コンテンツ工場", de: "Content-Fabrik", fr: "Usine à contenu", es: "Fábrica de contenido" },
  "features.cards.3.desc": { en: "Generate product descriptions, blog posts, social captions — backed by trend data and customer reviews.", zh: "生成产品描述、博客文章、社交媒体文案——基于趋势数据和客户评价。", ja: "商品説明・ブログ投稿・SNSキャプションを生成——トレンドデータと顧客レビューに基づく。", de: "Produktbeschreibungen, Blog-Posts, Social-Media-Texte generieren.", fr: "Générez des descriptions produits, articles de blog, légendes sociales.", es: "Genera descripciones de productos, posts de blog, textos para redes sociales." },
  "features.cards.4.title": { en: "Smart Returns", zh: "智能退货", ja: "スマート返品", de: "Intelligente Retouren", fr: "Retours intelligents", es: "Devoluciones inteligentes" },
  "features.cards.4.desc": { en: "Self-service return portal with auto-generated labels. AI analyzes reasons, recommends exchanges.", zh: "自助退货门户，自动生成退货标签。AI 分析退货原因，推荐换货。", ja: "セルフ返品ポータル、自動ラベル生成。AIが理由を分析し交換を推奨。", de: "Self-Service-Retourenportal mit automatisch generierten Labels.", fr: "Portail de retour en libre-service avec étiquettes générées automatiquement.", es: "Portal de devoluciones autoservicio con etiquetas generadas automáticamente." },
  "features.cards.5.title": { en: "Virtual Try-On", zh: "虚拟试穿", ja: "バーチャル試着", de: "Virtuelle Anprobe", fr: "Essayage virtuel", es: "Prueba virtual" },
  "features.cards.5.desc": { en: "Customers upload a photo, AI renders the garment. Auto-injected on product pages for fashion stores.", zh: "顾客上传照片，AI 渲染服装效果。自动注入到服装店铺的产品页面。", ja: "顧客が写真をアップロード、AIが衣服をレンダリング。ファッションストアの商品ページに自動挿入。", de: "Kunden laden ein Foto hoch, KI rendert das Kleidungsstück.", fr: "Les clients téléchargent une photo, l'IA rend le vêtement.", es: "Los clientes suben una foto, la IA renderiza la prenda." },
  "features.cards.6.title": { en: "Live Tracking", zh: "物流跟踪", ja: "配送追跡", de: "Sendungsverfolgung", fr: "Suivi en direct", es: "Seguimiento en vivo" },
  "features.cards.6.desc": { en: "Real-time order tracking on storefront. Customers see label printed → in transit → out for delivery → delivered. All via Shopify GraphQL.", zh: "店铺前台实时订单追踪。顾客看到已打单→运输中→派送中→已签收。全流程基于 Shopify GraphQL。", ja: "ストアフロントでリアルタイム追跡。ラベル印刷→輸送中→配達中→配達完了を確認可能。すべてShopify GraphQL経由。", de: "Echtzeit-Sendungsverfolgung im Shop. Kunden sehen Etikett gedruckt → unterwegs → in Zustellung → zugestellt.", fr: "Suivi de commande en temps réel. Les clients voient étiquette imprimée → en transit → en livraison → livré.", es: "Seguimiento en tiempo real. Los clientes ven etiqueta impresa → en tránsito → en reparto → entregado." },
  "features.cards.7.title": { en: "Merchant Chat", zh: "商家沟通", ja: "マーチャントチャット", de: "Händler-Chat", fr: "Chat marchand", es: "Chat del comerciante" },
  "features.cards.7.desc": { en: "AI handles 80% of questions. When a customer needs you, the chat routes to your dashboard. Real human connection when it matters.", zh: "AI 处理 80% 的问题。当顾客需要你时，对话路由到你的控制台。关键时刻的真实人际连接。", ja: "AIが80%の質問を処理。顧客があなたを必要とする時はチャットがダッシュボードに転送。大切な時のリアルな人間関係。", de: "KI bearbeitet 80% der Fragen. Wenn ein Kunde Sie braucht, wird der Chat an Ihr Dashboard weitergeleitet.", fr: "L'IA gère 80% des questions. Quand un client a besoin de vous, le chat est routé vers votre tableau de bord.", es: "La IA maneja el 80% de las preguntas. Cuando un cliente te necesita, el chat se enruta a tu panel." },

  // ── FAQ ──
  "faq.label": { en: "FAQ", zh: "常见问题", ja: "よくある質問", de: "FAQ", fr: "FAQ", es: "FAQ" },
  "faq.heading": { en: "Got questions? We've got answers.", zh: "有问题？我们有答案。", ja: "質問がありますか？答えがあります。", de: "Fragen? Wir haben Antworten.", fr: "Des questions ? Nous avons des réponses.", es: "¿Preguntas? Tenemos respuestas." },
  "faq.items.0.q": { en: "How is Vela different from other Shopify AI apps?", zh: "Vela 和其他 Shopify AI App 有什么不同？", ja: "Velaは他のShopify AIアプリとどう違う？", de: "Wie unterscheidet sich Vela von anderen Shopify-KI-Apps?", fr: "En quoi Vela est différent des autres apps IA Shopify ?", es: "¿En qué se diferencia Vela de otras apps IA de Shopify?" },
  "faq.items.0.a": { en: "Most AI apps do one thing — chat, or reviews, or content. Vela syncs your entire store data into one foundation, so every feature gets smarter from every other feature. That means your Shopping Assistant knows about returns, your Content Factory uses real sales data, and your Auto Reply references product details.", zh: "大多数 AI App 只做一件事——聊天、评价或内容。Vela 将你的全部店铺数据同步到一个底座，每个功能都从其他功能中变得更聪明。这意味着你的购物助手了解退货情况，内容工厂使用真实销售数据，自动回复引用产品详情。", ja: "ほとんどのAIアプリは1つのことだけ——チャット、レビュー、コンテンツ。Velaはストア全体のデータを1つの基盤に同期し、すべての機能が他の機能から賢くなる。つまりショッピングアシスタントは返品を知り、コンテンツ工場は実際の販売データを使い、自動返信は製品詳細を参照する。", de: "Die meisten KI-Apps machen nur eins — Chat, Bewertungen oder Content. Vela synchronisiert alle Ihre Shop-Daten in eine Basis, sodass jede Funktion von jeder anderen profitiert.", fr: "La plupart des apps IA font une seule chose. Vela synchronise toutes vos données dans une fondation unique, rendant chaque fonction plus intelligente.", es: "La mayoría de las apps IA hacen una sola cosa. Vela sincroniza todos los datos de tu tienda en una base única, haciendo que cada función sea más inteligente." },
  "faq.items.1.q": { en: "Does Vela slow down my store?", zh: "Vela 会拖慢我的店铺吗？", ja: "Velaはストアを遅くする？", de: "Verlangsamt Vela meinen Shop?", fr: "Vela ralentit-il ma boutique ?", es: "¿Vela ralentiza mi tienda?" },
  "faq.items.1.a": { en: "No. Vela runs entirely on our servers. The storefront widget is a lightweight script (<50KB) that loads asynchronously. Your store's PageSpeed score won't be affected.", zh: "不会。Vela 完全运行在我们的服务器上。店铺前台 Widget 是一个轻量脚本（<50KB），异步加载。你的店铺 PageSpeed 得分不受影响。", ja: "いいえ。Velaは完全に当社サーバーで動作。ストアフロントウィジェットは軽量スクリプト（<50KB）で非同期読み込み。PageSpeedスコアに影響なし。", de: "Nein. Vela läuft vollständig auf unseren Servern. Das Storefront-Widget ist ein leichtes Skript (<50KB), das asynchron lädt.", fr: "Non. Vela fonctionne entièrement sur nos serveurs. Le widget est un script léger (<50KB) qui se charge de façon asynchrone.", es: "No. Vela funciona completamente en nuestros servidores. El widget es un script ligero (<50KB) que carga de forma asíncrona." },
  "faq.items.2.q": { en: "Can I try it before paying?", zh: "可以免费试用吗？", ja: "支払い前に試せる？", de: "Kann ich es vor dem Bezahlen testen?", fr: "Puis-je essayer avant de payer ?", es: "¿Puedo probarlo antes de pagar?" },
  "faq.items.2.a": { en: "Absolutely. The Free plan includes the AI Shopping Assistant (50/day), Operations Assistant (20/day), and Content Factory (5/day). No credit card required. Upgrade when you need more.", zh: "当然。免费方案包含 AI 购物助手（50次/天）、运营助手（20次/天）和内容工厂（5次/天）。无需信用卡。需要更多时升级。", ja: "もちろん。無料プランにはAIショッピングアシスタント（50回/日）、運用アシスタント（20回/日）、コンテンツ工場（5回/日）が含まれる。クレカ不要。", de: "Absolut. Der kostenlose Plan enthält KI-Einkaufsassistent, Betriebsassistent und Content-Fabrik. Keine Kreditkarte erforderlich.", fr: "Absolument. Le plan gratuit inclut l'assistant shopping IA, l'assistant opérationnel et l'usine à contenu. Pas de carte bancaire requise.", es: "Absolutamente. El plan gratuito incluye asistente de compras IA, asistente operativo y fábrica de contenido. Sin tarjeta de crédito." },
  "faq.items.3.q": { en: "Which AI model does Vela use?", zh: "Vela 使用什么 AI 模型？", ja: "VelaはどのAIモデルを使う？", de: "Welches KI-Modell verwendet Vela?", fr: "Quel modèle IA Vela utilise-t-il ?", es: "¿Qué modelo de IA usa Vela?" },
  "faq.items.3.a": { en: "We use Qwen (via Alibaba DashScope) by default, optimized for e-commerce. Pro users can bring their own API keys (BYOK) for OpenAI, DeepSeek, or other providers via our LLM Router.", zh: "默认使用 Qwen（阿里云 DashScope），针对电商优化。Pro 用户可通过 LLM Router 自带 API Key（BYOK），使用 OpenAI、DeepSeek 等。", ja: "デフォルトはQwen（Alibaba DashScope）、EC向け最適化。ProユーザーはLLM Router経由でOpenAI、DeepSeekなどのAPIキーを持ち込み可能（BYOK）。", de: "Standardmäßig Qwen (via Alibaba DashScope), für E-Commerce optimiert. Pro-Nutzer können eigene API-Keys (BYOK) für OpenAI, DeepSeek etc. mitbringen.", fr: "Nous utilisons Qwen (via Alibaba DashScope) par défaut, optimisé pour l'e-commerce. Les utilisateurs Pro peuvent apporter leurs propres clés API (BYOK).", es: "Usamos Qwen (vía Alibaba DashScope) por defecto, optimizado para e-commerce. Usuarios Pro pueden traer sus propias claves API (BYOK)." },
  "faq.items.4.q": { en: "What happens if I uninstall?", zh: "如果我卸载会怎样？", ja: "アンインストールするとどうなる？", de: "Was passiert bei Deinstallation?", fr: "Que se passe-t-il si je désinstalle ?", es: "¿Qué pasa si desinstalo?" },
  "faq.items.4.a": { en: "Your store data (products, orders, reviews) was synced for AI processing only. When you uninstall, all your data is deleted within 30 days per Shopify's App Store requirements. We never sell or share your data.", zh: "你的店铺数据（产品、订单、评价）仅用于 AI 处理。卸载后，根据 Shopify App Store 要求，所有数据将在 30 天内删除。我们绝不售卖或分享你的数据。", ja: "ストアデータ（商品・注文・レビュー）はAI処理のみに使用。アンインストール後、Shopify App Store要件に従い30日以内に全データ削除。データを販売・共有することはありません。", de: "Ihre Shop-Daten wurden nur für KI-Verarbeitung synchronisiert. Bei Deinstallation werden alle Daten innerhalb 30 Tage gelöscht. Wir verkaufen oder teilen Ihre Daten nie.", fr: "Vos données boutique étaient synchronisées uniquement pour le traitement IA. Lors de la désinstallation, toutes les données sont supprimées sous 30 jours. Nous ne vendons ni ne partageons jamais vos données.", es: "Los datos de tu tienda se sincronizaron solo para procesamiento IA. Al desinstalar, todos los datos se eliminan en 30 días. Nunca vendemos ni compartimos tus datos." },

  // ── Contact ──
  "contact.label": { en: "Get In Touch", zh: "联系我们", ja: "お問い合わせ", de: "Kontakt", fr: "Contactez-nous", es: "Contacto" },
  "contact.heading": { en: "Let's talk about your store", zh: "聊聊你的店铺", ja: "あなたのストアについて話しましょう", de: "Lassen Sie uns über Ihren Shop sprechen", fr: "Parlons de votre boutique", es: "Hablemos de tu tienda" },
  "contact.desc": { en: "Questions about Vela AI? Want a demo? Just want to chat about AI for e-commerce? We read every message.", zh: "关于 Vela AI 有问题？想看演示？想聊聊电商 AI？每条消息我们都会回复。", ja: "Vela AIについて質問？デモを見たい？ECのAIについて話したい？すべてのメッセージに目を通します。", de: "Fragen zu Vela AI? Möchten Sie eine Demo? Wir lesen jede Nachricht.", fr: "Questions sur Vela AI ? Vous voulez une démo ? Nous lisons chaque message.", es: "¿Preguntas sobre Vela AI? ¿Quieres una demo? Leemos cada mensaje." },
  "contact.name": { en: "Your Name", zh: "你的名字", ja: "お名前", de: "Ihr Name", fr: "Votre nom", es: "Tu nombre" },
  "contact.email": { en: "your@email.com", zh: "你的邮箱", ja: "メールアドレス", de: "ihre@email.com", fr: "votre@email.com", es: "tu@email.com" },
  "contact.message": { en: "Tell us about your store and what you need...", zh: "告诉我们你的店铺和需求...", ja: "ストアと必要なことについて教えてください...", de: "Erzählen Sie uns von Ihrem Shop...", fr: "Parlez-nous de votre boutique...", es: "Cuéntanos sobre tu tienda..." },
  "contact.submit": { en: "Send Message", zh: "发送消息", ja: "送信", de: "Nachricht senden", fr: "Envoyer", es: "Enviar mensaje" },
  "contact.sending": { en: "Sending...", zh: "发送中...", ja: "送信中...", de: "Senden...", fr: "Envoi...", es: "Enviando..." },
  "contact.sent_title": { en: "Message Sent!", zh: "消息已发送！", ja: "送信完了！", de: "Nachricht gesendet!", fr: "Message envoyé !", es: "¡Mensaje enviado!" },
  "contact.sent_desc": { en: "Thanks! We'll get back to you within 24 hours.", zh: "谢谢！我们会在 24 小时内回复。", ja: "ありがとう！24時間以内に返信します。", de: "Danke! Wir melden uns innerhalb 24 Stunden.", fr: "Merci ! Nous vous répondrons sous 24h.", es: "¡Gracias! Te responderemos en 24 horas." },
  "contact.error": { en: "All fields are required.", zh: "请填写所有字段。", ja: "すべての項目を入力してください。", de: "Alle Felder sind erforderlich.", fr: "Tous les champs sont obligatoires.", es: "Todos los campos son obligatorios." },
  "contact.failed": { en: "Failed to send. Please try again or email hello@velagrow.com.", zh: "发送失败。请重试或发邮件到 hello@velagrow.com。", ja: "送信失敗。再試行またはhello@velagrow.comにメールしてください。", de: "Senden fehlgeschlagen. Versuchen Sie es erneut.", fr: "Échec d'envoi. Réessayez ou écrivez à hello@velagrow.com.", es: "Error al enviar. Intenta de nuevo o escribe a hello@velagrow.com." },

  // ── Footer ──
  "footer.tagline": { en: "Shopify Growth Platform", zh: "Shopify 增长平台", ja: "Shopify成長プラットフォーム", de: "Shopify-Wachstumsplattform", fr: "Plateforme de croissance Shopify", es: "Plataforma de crecimiento Shopify" },

  // ── Mobile CTA ──
  "mobile.install": { en: "Install Free", zh: "免费安装", ja: "無料インストール", de: "Kostenlos installieren", fr: "Installer gratuitement", es: "Instalar gratis" },
  "mobile.contact": { en: "Contact Us", zh: "联系我们", ja: "お問い合わせ", de: "Kontakt", fr: "Contact", es: "Contacto" },
};

export function t(key: string, lang: Lang): string {
  if (T[key] && T[key][lang]) return T[key][lang];
  if (T[key] && T[key].en) return T[key].en; // fallback to English
  return key; // raw key fallback
}

// Server-side language detection
export function detectLanguage(request: Request): Lang {
  const url = new URL(request.url);
  const param = url.searchParams.get("lang");
  if (param && ["en","zh","ja","de","fr","es"].includes(param)) return param as Lang;

  const cookieHeader = request.headers.get("Cookie") || "";
  const cookieMatch = cookieHeader.match(/vela_lang=([a-z]{2})/);
  if (cookieMatch && ["en","zh","ja","de","fr","es"].includes(cookieMatch[1])) return cookieMatch[1] as Lang;

  const acceptLang = request.headers.get("Accept-Language") || "";
  if (acceptLang.includes("zh")) return "zh";
  if (acceptLang.includes("ja")) return "ja";
  if (acceptLang.includes("de")) return "de";
  if (acceptLang.includes("fr")) return "fr";
  if (acceptLang.includes("es")) return "es";
  return "en";
}
