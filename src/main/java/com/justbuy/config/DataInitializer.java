package com.justbuy.config;

import com.justbuy.model.*;
import com.justbuy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepo;
    private final SellerRepository sellerRepo;
    private final ProductRepository productRepo;
    private final ReviewRepository reviewRepo;
    private final AdminAccountRepository adminAccountRepo;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // Picsum Photos for product images (neutral, lifestyle-appropriate)
    private static final String IMG = "https://picsum.photos/seed/";

    @Override
    public void run(String... args) {
        log.info("🌱 Seeding JustBuy database...");
        seedAdminAccount();
        seedCategories();
        seedSellers();
        seedProducts();
        seedReviews();
        log.info("✅ Database seeded successfully!");
    }

    private void seedAdminAccount() {
        if (adminAccountRepo.findByEmailIgnoreCase("admin@justbuy.com").isEmpty()) {
            adminAccountRepo.save(AdminAccount.builder()
                    .name("JustBuy Administrator")
                    .email("admin@justbuy.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .status("ACTIVE")
                    .build());
        }
    }

    private void seedCategories() {
        List<Category> cats = List.of(
            Category.builder().name("Electronics").slug("electronics").icon("⚡").imageUrl(IMG+"electronics/600/400").color("#F26B1D").featured(true).productCount(1240).description("Gadgets & tech accessories").build(),
            Category.builder().name("Fashion").slug("fashion").icon("👗").imageUrl(IMG+"fashion/600/400").color("#C2532D").featured(true).productCount(3820).description("Clothing, shoes & accessories").build(),
            Category.builder().name("Home & Living").slug("home-living").icon("🏠").imageUrl(IMG+"interior/600/400").color("#8B7355").featured(true).productCount(2150).description("Furniture, decor & essentials").build(),
            Category.builder().name("Beauty").slug("beauty").icon("✨").imageUrl(IMG+"beauty/600/400").color("#D4956A").featured(true).productCount(980).description("Skincare, makeup & wellness").build(),
            Category.builder().name("Sports").slug("sports").icon("🏃").imageUrl(IMG+"sports/600/400").color("#6B7B5C").featured(true).productCount(760).description("Fitness, outdoor & activewear").build(),
            Category.builder().name("Books").slug("books").icon("📚").imageUrl(IMG+"book/600/400").color("#7B6F8A").featured(false).productCount(4200).description("Books, stationery & art supplies").build(),
            Category.builder().name("Toys").slug("toys").icon("🧸").imageUrl(IMG+"toy/600/400").color("#D4856A").featured(false).productCount(530).description("Kids toys & games").build(),
            Category.builder().name("Automotive").slug("automotive").icon("🚗").imageUrl(IMG+"car/600/400").color("#5C6B7B").featured(false).productCount(410).description("Car accessories & tools").build()
        );
        categoryRepo.saveAll(cats);
    }

    private void seedSellers() {
        List<Seller> sellers = List.of(
            Seller.builder().name("TechNova Store").email("seller@justbuy.com").passwordHash(passwordEncoder.encode("seller123")).slug("technova").description("Premium electronics & gadgets curated for the modern lifestyle.").logoUrl(IMG+"technova/80/80").bannerUrl(IMG+"techbanner/1200/300").rating(4.8).reviewCount(12400).followerCount(98200).salesCount(245000).location("Shenzhen, China").verified(true).badge("Top Seller").build(),
            Seller.builder().name("Linen & Lace").slug("linen-lace").description("Minimalist fashion for the mindful wardrobe.").logoUrl(IMG+"linen/80/80").bannerUrl(IMG+"fashionbanner/1200/300").rating(4.9).reviewCount(8700).followerCount(62000).salesCount(134000).location("Istanbul, Turkey").verified(true).badge("Top Seller").build(),
            Seller.builder().name("Casa Moderna").slug("casa-moderna").description("Scandinavian-inspired home décor & living essentials.").logoUrl(IMG+"casa/80/80").bannerUrl(IMG+"homebanner/1200/300").rating(4.7).reviewCount(5200).followerCount(41000).salesCount(89000).location("Copenhagen, Denmark").verified(true).badge("Rising Star").build(),
            Seller.builder().name("Glow Lab").slug("glow-lab").description("Clean beauty, natural skincare, dermatologist-tested formulas.").logoUrl(IMG+"glow/80/80").bannerUrl(IMG+"beautybanner/1200/300").rating(4.9).reviewCount(9800).followerCount(75000).salesCount(198000).location("Seoul, South Korea").verified(true).badge("Top Seller").build(),
            Seller.builder().name("Peak Sports").slug("peak-sports").description("Performance sportswear & outdoor gear for every athlete.").logoUrl(IMG+"peak/80/80").bannerUrl(IMG+"sportsbanner/1200/300").rating(4.6).reviewCount(3100).followerCount(28000).salesCount(56000).location("Portland, USA").verified(true).badge("Certified").build()
        );
        sellerRepo.saveAll(sellers);
    }

    private void seedProducts() {
        List<Category> cats = categoryRepo.findAll();
        List<Seller> sellers = sellerRepo.findAll();

        Category electronics = cats.get(0);
        Category fashion = cats.get(1);
        Category home = cats.get(2);
        Category beauty = cats.get(3);
        Category sports = cats.get(4);

        Seller techNova = sellers.get(0);
        Seller linenLace = sellers.get(1);
        Seller casaModerna = sellers.get(2);
        Seller glowLab = sellers.get(3);
        Seller peakSports = sellers.get(4);

        List<Product> products = List.of(
            // Electronics
            Product.builder().name("AuraSound Pro Wireless Earbuds").slug("aurasound-pro-earbuds").description("Premium wireless earbuds with active noise cancellation, 36-hour battery life, and crystal-clear spatial audio. Ergonomic design fits all ear sizes.").price(new BigDecimal("89.99")).originalPrice(new BigDecimal("149.99")).discountPercent(40).stock(320).thumbnailUrl(IMG+"earbuds/400/400").imageUrls(IMG+"earbuds/800/800,"+IMG+"earbuds2/800/800,"+IMG+"earbuds3/800/800").colors("Midnight Black,Pearl White,Rose Gold").rating(4.8).reviewCount(2847).soldCount(15200).featured(true).flashDeal(true).freeShipping(true).badge("Best Seller").tags("earbuds,wireless,audio,anc").category(electronics).seller(techNova).build(),

            Product.builder().name("SlimPad Ultra Tablet 11\"").slug("slimpad-ultra-tablet").description("10.9\" OLED display, 128GB storage, all-day battery, perfect for work and creativity. Includes stylus pen.").price(new BigDecimal("349.00")).originalPrice(new BigDecimal("499.00")).discountPercent(30).stock(85).thumbnailUrl(IMG+"tablet/400/400").imageUrls(IMG+"tablet/800/800,"+IMG+"tablet2/800/800").colors("Space Gray,Silver,Midnight Blue").rating(4.7).reviewCount(1203).soldCount(8400).featured(true).freeShipping(true).badge("New").tags("tablet,oled,stylus,work").category(electronics).seller(techNova).build(),

            Product.builder().name("ZenWatch 3 — Minimalist Smart Watch").slug("zenwatch-3").description("Ceramic bezel, sapphire glass, health monitoring, GPS. A watch for those who believe less is more.").price(new BigDecimal("219.00")).originalPrice(new BigDecimal("289.00")).discountPercent(24).stock(142).thumbnailUrl(IMG+"watch/400/400").imageUrls(IMG+"watch/800/800,"+IMG+"watch2/800/800,"+IMG+"watch3/800/800").colors("Black,Silver,Gold").sizes("38mm,42mm,45mm").rating(4.9).reviewCount(3412).soldCount(22100).featured(true).flashDeal(true).freeShipping(true).badge("Hot").tags("smartwatch,health,gps,minimalist").category(electronics).seller(techNova).build(),

            Product.builder().name("FocusDesk Lamp — Wireless Charging Base").slug("focusdesk-lamp").description("LED desk lamp with 5 brightness levels, 3 color temps, and built-in 15W wireless charger. Perfect for any workspace.").price(new BigDecimal("64.99")).originalPrice(new BigDecimal("89.99")).discountPercent(28).stock(210).thumbnailUrl(IMG+"lamp/400/400").imageUrls(IMG+"lamp/800/800,"+IMG+"lamp2/800/800").colors("White,Black").rating(4.6).reviewCount(876).soldCount(4300).freeShipping(true).badge("Staff Pick").tags("lamp,desk,wireless charging,office").category(electronics).seller(techNova).build(),

            Product.builder().name("MicroHub 8-in-1 USB-C Dock").slug("microhub-usbc-dock").description("8 ports in a sleek aluminum body: 4K HDMI, SD card, 3x USB-A, 2x USB-C PD, Ethernet. Plug & play.").price(new BigDecimal("42.99")).originalPrice(new BigDecimal("59.99")).discountPercent(28).stock(450).thumbnailUrl(IMG+"hub/400/400").imageUrls(IMG+"hub/800/800").colors("Silver,Space Gray").rating(4.5).reviewCount(1542).soldCount(9800).freeShipping(true).tags("usb hub,dock,adapter,laptop").category(electronics).seller(techNova).build(),

            // Fashion
            Product.builder().name("Linen Breeze Relaxed Shirt").slug("linen-breeze-shirt").description("100% European linen, garment-washed for softness. Boxy relaxed fit, perfect for warm days or layering.").price(new BigDecimal("54.00")).originalPrice(new BigDecimal("79.00")).discountPercent(32).stock(280).thumbnailUrl(IMG+"shirt/400/400").imageUrls(IMG+"shirt/800/800,"+IMG+"shirt2/800/800,"+IMG+"shirt3/800/800").colors("Ecru,Sage,Sky Blue,Terracotta").sizes("XS,S,M,L,XL,XXL").rating(4.8).reviewCount(2134).soldCount(11200).featured(true).freeShipping(true).badge("Best Seller").tags("linen,shirt,summer,minimalist").category(fashion).seller(linenLace).build(),

            Product.builder().name("Cloud Comfort Sneakers").slug("cloud-comfort-sneakers").description("Lightweight knit upper, memory foam insole, rubber outsole. Zero break-in period — comfortable from step one.").price(new BigDecimal("78.00")).originalPrice(new BigDecimal("110.00")).discountPercent(29).stock(195).thumbnailUrl(IMG+"sneakers/400/400").imageUrls(IMG+"sneakers/800/800,"+IMG+"sneakers2/800/800").colors("White,Stone,Black,Navy").sizes("36,37,38,39,40,41,42,43,44,45").rating(4.7).reviewCount(1876).soldCount(8700).featured(true).flashDeal(true).freeShipping(true).badge("Hot").tags("sneakers,comfort,everyday,knit").category(fashion).seller(linenLace).build(),

            Product.builder().name("Canvas Weekend Tote Bag").slug("canvas-weekend-tote").description("Heavy canvas, leather handles, internal zip pocket, laptop sleeve. Holds everything. Goes everywhere.").price(new BigDecimal("38.00")).originalPrice(new BigDecimal("55.00")).discountPercent(31).stock(340).thumbnailUrl(IMG+"tote/400/400").imageUrls(IMG+"tote/800/800,"+IMG+"tote2/800/800").colors("Natural,Black,Forest Green").rating(4.9).reviewCount(3210).soldCount(18400).featured(true).freeShipping(true).badge("Top Rated").tags("tote,canvas,bag,weekend").category(fashion).seller(linenLace).build(),

            Product.builder().name("Merino Wool Crewneck Sweater").slug("merino-crewneck-sweater").description("Grade A merino wool, anti-pilling, temperature-regulating. A wardrobe staple that lasts for years.").price(new BigDecimal("89.00")).originalPrice(new BigDecimal("130.00")).discountPercent(32).stock(120).thumbnailUrl(IMG+"sweater/400/400").imageUrls(IMG+"sweater/800/800,"+IMG+"sweater2/800/800").colors("Cream,Charcoal,Dusty Rose,Olive").sizes("XS,S,M,L,XL").rating(4.8).reviewCount(987).soldCount(5300).freeShipping(true).badge("Premium").tags("merino,sweater,wool,winter").category(fashion).seller(linenLace).build(),

            // Home & Living
            Product.builder().name("Terra Ceramic Mug Set — 4 Pieces").slug("terra-ceramic-mug-set").description("Hand-thrown stoneware mugs with reactive glaze — each one unique. Dishwasher safe. 350ml capacity.").price(new BigDecimal("44.00")).originalPrice(new BigDecimal("62.00")).discountPercent(29).stock(165).thumbnailUrl(IMG+"mug/400/400").imageUrls(IMG+"mug/800/800,"+IMG+"mug2/800/800").colors("Terracotta,Sage,Cream,Slate").rating(4.9).reviewCount(4521).soldCount(23000).featured(true).freeShipping(true).badge("Fan Favorite").tags("ceramic,mug,kitchen,handmade").category(home).seller(casaModerna).build(),

            Product.builder().name("Modular Bookshelf — Open Frame").slug("modular-bookshelf").description("Powder-coated steel frame with solid oak shelves. Modular — add or remove sections as needed. Easy assembly.").price(new BigDecimal("189.00")).originalPrice(new BigDecimal("250.00")).discountPercent(24).stock(48).thumbnailUrl(IMG+"shelf/400/400").imageUrls(IMG+"shelf/800/800,"+IMG+"shelf2/800/800").colors("Black Frame,White Frame").rating(4.6).reviewCount(612).soldCount(2800).freeShipping(true).badge("New Arrival").tags("bookshelf,shelving,storage,oak").category(home).seller(casaModerna).build(),

            Product.builder().name("Linen Duvet Cover Set — King").slug("linen-duvet-cover-king").description("100% stonewashed linen, pre-washed for softness. Included: 1 duvet cover + 2 pillowcases. Gets softer with every wash.").price(new BigDecimal("119.00")).originalPrice(new BigDecimal("169.00")).discountPercent(30).stock(92).thumbnailUrl(IMG+"duvet/400/400").imageUrls(IMG+"duvet/800/800,"+IMG+"duvet2/800/800").colors("Ecru,Fog Blue,Sage,Blush").rating(4.8).reviewCount(1890).soldCount(9400).featured(true).freeShipping(true).badge("Best Seller").tags("linen,bedding,duvet,sleep").category(home).seller(casaModerna).build(),

            Product.builder().name("Aroma Diffuser — Matte Ceramic").slug("aroma-diffuser-ceramic").description("Ultrasonic diffuser with 400ml capacity, 7 LED moods, auto-off. Whisper-quiet, 12-hour run time.").price(new BigDecimal("39.99")).originalPrice(new BigDecimal("54.99")).discountPercent(27).stock(230).thumbnailUrl(IMG+"diffuser/400/400").imageUrls(IMG+"diffuser/800/800").colors("White,Sage,Terracotta").rating(4.7).reviewCount(2340).soldCount(14200).flashDeal(true).freeShipping(true).badge("Flash Deal").tags("diffuser,aroma,wellness,home").category(home).seller(casaModerna).build(),

            // Beauty
            Product.builder().name("Glass Skin Hydration Serum").slug("glass-skin-serum").description("Hyaluronic acid + niacinamide complex. Gives skin a lit-from-within glow. Fragrance-free, suitable for all skin types.").price(new BigDecimal("36.00")).originalPrice(new BigDecimal("52.00")).discountPercent(31).stock(510).thumbnailUrl(IMG+"serum/400/400").imageUrls(IMG+"serum/800/800,"+IMG+"serum2/800/800").rating(4.9).reviewCount(6720).soldCount(38000).featured(true).flashDeal(true).freeShipping(true).badge("#1 Best Seller").tags("serum,skincare,hyaluronic,glow").category(beauty).seller(glowLab).build(),

            Product.builder().name("SPF 50+ Invisible Sunscreen").slug("invisible-sunscreen-spf50").description("Lightweight, zero white cast, reef-safe formula. Wears beautifully under makeup. Dermatologist tested.").price(new BigDecimal("22.00")).originalPrice(new BigDecimal("30.00")).discountPercent(27).stock(680).thumbnailUrl(IMG+"sunscreen/400/400").imageUrls(IMG+"sunscreen/800/800").rating(4.8).reviewCount(4380).soldCount(27000).featured(true).freeShipping(true).badge("Viral").tags("sunscreen,spf,skincare,protection").category(beauty).seller(glowLab).build(),

            Product.builder().name("Gua Sha Stone Set").slug("gua-sha-stone-set").description("Rose quartz gua sha + jade roller + face oil. Reduces puffiness, improves circulation, sculpts facial contour.").price(new BigDecimal("28.99")).originalPrice(new BigDecimal("42.00")).discountPercent(31).stock(290).thumbnailUrl(IMG+"guasha/400/400").imageUrls(IMG+"guasha/800/800,"+IMG+"guasha2/800/800").rating(4.7).reviewCount(2100).soldCount(12500).flashDeal(true).freeShipping(true).badge("Trending").tags("gua sha,jade roller,beauty,wellness").category(beauty).seller(glowLab).build(),

            // Sports
            Product.builder().name("FlexPro Resistance Bands Set").slug("flexpro-resistance-bands").description("5 latex bands with different resistance levels, carry bag included. Perfect for home workouts, rehab, or warmup.").price(new BigDecimal("24.99")).originalPrice(new BigDecimal("39.99")).discountPercent(38).stock(760).thumbnailUrl(IMG+"bands/400/400").imageUrls(IMG+"bands/800/800,"+IMG+"bands2/800/800").colors("Black Set,Colorful Set").rating(4.6).reviewCount(3210).soldCount(19800).featured(true).flashDeal(true).freeShipping(true).badge("Flash Deal").tags("resistance bands,workout,home gym,fitness").category(sports).seller(peakSports).build(),

            Product.builder().name("Ultralight Trail Running Shoes").slug("ultralight-trail-shoes").description("Vibram sole, drainage ports, recycled mesh upper. 198g per shoe. Grip on any terrain.").price(new BigDecimal("129.00")).originalPrice(new BigDecimal("179.00")).discountPercent(28).stock(78).thumbnailUrl(IMG+"trailshoes/400/400").imageUrls(IMG+"trailshoes/800/800,"+IMG+"trailshoes2/800/800").colors("Carbon Black,Stone Gray,Forest").sizes("37,38,39,40,41,42,43,44,45,46").rating(4.7).reviewCount(890).soldCount(4100).freeShipping(true).badge("New").tags("trail,running,shoes,outdoor").category(sports).seller(peakSports).build(),

            Product.builder().name("Insulated Water Bottle 1L").slug("insulated-water-bottle-1l").description("Double-wall stainless steel, keeps cold 24h / hot 12h. BPA-free lid, powder-coat finish. Fits standard cup holders.").price(new BigDecimal("32.00")).originalPrice(new BigDecimal("45.00")).discountPercent(29).stock(430).thumbnailUrl(IMG+"bottle/400/400").imageUrls(IMG+"bottle/800/800,"+IMG+"bottle2/800/800").colors("Matte Black,White,Forest Green,Terracotta").rating(4.8).reviewCount(5640).soldCount(31200).featured(true).freeShipping(true).badge("Fan Favorite").tags("water bottle,insulated,stainless,hydration").category(sports).seller(peakSports).build(),

            Product.builder().name("Yoga Mat Premium 6mm").slug("premium-yoga-mat-6mm").description("Natural rubber base, microfiber top. Non-slip in hot yoga. Alignment guides printed. Includes carry strap.").price(new BigDecimal("67.00")).originalPrice(new BigDecimal("95.00")).discountPercent(29).stock(155).thumbnailUrl(IMG+"yogamat/400/400").imageUrls(IMG+"yogamat/800/800,"+IMG+"yogamat2/800/800").colors("Warm Terracotta,Sage Green,Deep Navy,Charcoal").rating(4.9).reviewCount(2780).soldCount(13600).featured(true).freeShipping(true).badge("Top Rated").tags("yoga,mat,fitness,pilates").category(sports).seller(peakSports).build()
        );

        productRepo.saveAll(products);
    }

    private void seedReviews() {
        List<Product> products = productRepo.findAll();
        if (products.isEmpty()) return;

        Product p1 = products.get(0); // AuraSound earbuds
        Product p2 = products.get(2); // ZenWatch
        Product p6 = products.get(5); // Linen shirt

        List<Review> reviews = List.of(
            Review.builder().product(p1).authorName("Alex M.").authorAvatar(IMG+"alex/48/48").rating(5).comment("These earbuds changed my commute. ANC is absolutely stellar — blocks out the entire subway. Battery lasts 2+ days for me. Highly recommend.").imageUrl(IMG+"review1/300/300").helpfulCount(234).verified(true).build(),
            Review.builder().product(p1).authorName("Priya S.").authorAvatar(IMG+"priya/48/48").rating(5).comment("Sound quality rivals earbuds 3x the price. Fit is perfect, never fall out during runs. The case charges super fast too.").helpfulCount(187).verified(true).build(),
            Review.builder().product(p1).authorName("David K.").authorAvatar(IMG+"david/48/48").rating(4).comment("Great earbuds overall. The app could use some polish but the sound and ANC are excellent. Worth every penny at this price.").helpfulCount(92).verified(true).build(),

            Review.builder().product(p2).authorName("Sarah L.").authorAvatar(IMG+"sarah/48/48").rating(5).comment("The most beautiful watch I've ever owned. Ceramic bezel feels incredibly premium. Health tracking is accurate and the battery lasts 5 days easily.").imageUrl(IMG+"review2/300/300").helpfulCount(312).verified(true).build(),
            Review.builder().product(p2).authorName("Omar R.").authorAvatar(IMG+"omar/48/48").rating(5).comment("Got the 45mm in black. Absolutely stunning on the wrist. The minimalist dial is exactly what I was looking for. GPS is precise.").helpfulCount(198).verified(true).build(),

            Review.builder().product(p6).authorName("Emma T.").authorAvatar(IMG+"emma/48/48").rating(5).comment("The quality of this linen is incredible. Washed it 5 times, gets softer every time. The ecru color is exactly as pictured. Sizing is generous — I went down one size.").imageUrl(IMG+"review3/300/300").helpfulCount(276).verified(true).build(),
            Review.builder().product(p6).authorName("Chris W.").authorAvatar(IMG+"chris/48/48").rating(4).comment("Beautiful shirt, exactly what I wanted. Ships fast, packaging is lovely. Only small note: iron it while damp for best results.").helpfulCount(143).verified(true).build()
        );

        reviewRepo.saveAll(reviews);
    }
}
