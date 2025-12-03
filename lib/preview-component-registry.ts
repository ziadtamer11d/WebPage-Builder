import { settingsModel } from "./settings-model"
import { appendUTMToURL } from "./utm-utils"

export interface ComponentTemplate {
  name: string
  defaultConfig: any
  generateHTML: (config: any) => string
}

class PreviewComponentRegistryClass {
  private templates: Map<string, ComponentTemplate> = new Map()

  constructor() {
    this.registerDefaults()
  }

  private registerDefaults() {
    // Swiper Carousel Component
    this.register("swiper", {
      name: "Swiper Carousel",
      defaultConfig: {
        slides: [
          {
            linkUrl: "",
            desktopImage: "",
            mobileImage: "",
            altText: "",
            subtitle: "",
            utmSource: "",
            campaignName: "",
          },
          {
            linkUrl: "",
            desktopImage: "",
            mobileImage: "",
            altText: "",
            subtitle: "",
            utmSource: "",
            campaignName: "",
          },
          {
            linkUrl: "",
            desktopImage: "",
            mobileImage: "",
            altText: "",
            subtitle: "",
            utmSource: "",
            campaignName: "",
          },
        ],
      },
      generateHTML: (config) => {
        const slides = config.slides || []

        // If there's only one slide, use the simple template
        if (slides.length === 1) {
          const slide = slides[0]
          const linkWithUTM = appendUTMToURL(slide.linkUrl, slide.utmSource, slide.campaignName)
          return `<div>
  <a href="${linkWithUTM}"></a>
  <div class="swiper-slide">
    <a href="${linkWithUTM}">
      <picture>
        <source media="(min-width: 768px)" srcset="${slide.desktopImage}" />
        <!-- Mobile image -->
        <source media="(max-width: 767px)" srcset="${slide.mobileImage}" />
        <!-- Fallback for older browsers -->
        <img src="${slide.desktopImage}" class="slider-picture" alt="${slide.altText}" loading="lazy" />
      </picture></a>
  </div>
</div>`
        }

        // Multiple slides - use swiper template
        const slidesHTML = slides
          .map(
            (slide: any) => {
              const linkWithUTM = appendUTMToURL(slide.linkUrl, slide.utmSource, slide.campaignName)
              return `
    <div class="swiper-slide"><a href="${linkWithUTM}">
      <picture>
        <source media="(min-width: 768px)" srcset="${slide.desktopImage}" />
        <!-- Mobile image -->
        <source media="(max-width: 767px)" srcset="${slide.mobileImage}" />
        <!-- Fallback for older browsers -->
        <img src="${slide.desktopImage}" class="slider-picture" alt="${slide.altText}" loading="lazy" />
      </picture></a>
    </div>`
            },
          )
          .join("")

        return `<!-- Swiper -->
<div class="swiper mySwiper">
  <div class="swiper-wrapper">${slidesHTML}
  </div>
  <div class="swiper-button-next"></div>
  <div class="swiper-button-prev"></div>
  <div class="swiper-pagination"></div>
</div>`
      },
    })

    // New Banner Swiper Component
    this.register("new-banner", {
      name: "New Banner",
      defaultConfig: {
        slides: [
          {
            linkUrl: "",
            desktopImage: "",
            mobileImage: "",
            altText: "",
            subtitle: "",
            utmSource: "",
            campaignName: "",
          },
          {
            linkUrl: "",
            desktopImage: "",
            mobileImage: "",
            altText: "",
            subtitle: "",
            utmSource: "",
            campaignName: "",
          },
          {
            linkUrl: "",
            desktopImage: "",
            mobileImage: "",
            altText: "",
            subtitle: "",
            utmSource: "",
            campaignName: "",
          },
        ],
      },
      generateHTML: (config) => {
        const slides = config.slides || []

        if (!slides.length) {
          return "<!-- new banner start --><!-- New Banner: No slides configured --><!-- new banner end -->"
        }

        const slidesHTML = slides
          .map((slide: any) => {
            const linkWithUTM = appendUTMToURL(slide.linkUrl, slide.utmSource, slide.campaignName)
            const altText = slide.altText || ""
            const subtitle = slide.subtitle || ""
            return `
                  <a href="${linkWithUTM}" class="swiper-slide _revamp-slide" role="group" aria-label="${altText}">
                    <div class="slide-link-re">
                      <img
                        src="${slide.desktopImage}"
                        alt="${altText}" class="slide-image">
                      <div class="image-gradient-overlay"></div>
                      <div class="slide-content">
                        <div class="slide-title">${subtitle}</div>
                        <button class="slide-button" aria-label="${altText}">
                          <span>Shop now</span>
                        </button>
                      </div>
                    </div>
                  </a>`
          })
          .join("")

        return `<!-- new banner start -->
<main id="content">
  <section id="wrapper">
    <div id="content-wrapper">
      <!-- Main Banner Slider - Local Scoped Styles (doesn't affect other components) -->
      <script src="https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/categories_swiper.js"></script>
      <script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>
      <!----################ START Mainbanners ################ >

#desktop banner: 2000x666

#tablet banner: 1000x666

#mobil banner: 600x750

-->
      <div id="main-banner-slider">
        <div class="_slider-container">
          <div class="_slider-inner">
            <div class="swiper _revamp" id="main-banner-swiper">
              <div class="swiper-wrapper">
${slidesHTML}
              </div>
              <div class="swiper-button-next"></div>
              <div class="swiper-button-prev"></div>
              <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
            </div>
          </div>
        </div>
      </div>
      <script>
        // Scoped Swiper initialization - only affects the main banner slider
        var mainBannerSwiper = new Swiper('#main-banner-swiper', {
          centeredSlides: true,
          loop: true,
          spaceBetween: 20,
          autoplay: {
            delay: 4000,
            disableOnInteraction: false,
          },
          navigation: {
            nextEl: '#main-banner-slider .swiper-button-next',
            prevEl: '#main-banner-slider .swiper-button-prev',
          },
          breakpoints: {
            1280: { slidesPerView: 3 },
            1024: { slidesPerView: 2.6 },
            992: { slidesPerView: 2.2 },
            720: { slidesPerView: 2 },
            599: { slidesPerView: 1.6 },
            500: { slidesPerView: 1.2 },
            0: { slidesPerView: 1 }
          }
        });
      </script>
    </div>
  </section>
</main>
<!-- new banner end -->`
      },
    })

    // Four Categories Component
    this.register("four-categories", {
      name: "Four Categories",
      defaultConfig: {
        title: "",
        backgroundColor: "",
        categories: [
          { linkUrl: "", imageUrl: "", altText: "", utmSource: "", campaignName: "" },
          { linkUrl: "", imageUrl: "", altText: "", utmSource: "", campaignName: "" },
          { linkUrl: "", imageUrl: "", altText: "", utmSource: "", campaignName: "" },
          { linkUrl: "", imageUrl: "", altText: "", utmSource: "", campaignName: "" },
        ],
      },
      generateHTML: (config) => {
        const categories = config.categories || []
        const categoriesHTML = categories
          .map(
            (category: any) => {
              const linkWithUTM = appendUTMToURL(category.linkUrl, category.utmSource, category.campaignName)
              return `
      <div class="four_categories_category_wrapper">
        <div style="max-width: 100%;">
          <a href="${linkWithUTM}">
            <div class="four_categories_image_wrapper">
              <img src="${category.imageUrl}" alt="${category.altText}" loading="lazy" width="432" height="467" />
            </div>
          </a>
        </div>
      </div>`
            },
          )
          .join("")

        return `<div class="four_categories_wrapper" style="background-color:${config.backgroundColor};">
  <div class="four_categories_title_wrapper">
    <div class="four_categories_title_container">
      <h2 class="four_categories_title">${config.title}</h2>
    </div>
  </div>
  <div class="four_categories_container">
    <div class="four_categories_box">${categoriesHTML}
    </div>
  </div>
</div>`
      },
    })

    // Eight Icons Component
    this.register("eight-icons", {
      name: "Eight Icons",
      defaultConfig: {
        title: "",
        icons: [
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "", utmSource: "", campaignName: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "", utmSource: "", campaignName: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "", utmSource: "", campaignName: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "", utmSource: "", campaignName: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "", utmSource: "", campaignName: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "", utmSource: "", campaignName: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "", utmSource: "", campaignName: "" },
          { linkUrl: "", imageUrl: "", altText: "", subtitle: "", utmSource: "", campaignName: "" },
        ],
      },
      generateHTML: (config) => {
        const icons = config.icons || []
        const iconsHTML = icons
          .map(
            (icon: any) => {
              const linkWithUTM = appendUTMToURL(icon.linkUrl, icon.utmSource, icon.campaignName)
              return `
      <a href="${linkWithUTM}" class="icon-wrapper">
        <div class="icon-container">
          <div class="picture-container">
            <picture aria-hidden="true" style="padding-top: 109.773%">
              <img deca-image="true" alt="${icon.altText}" src="${icon.imageUrl}" loading="lazy" />
            </picture>
          </div>
          <div class="icon-subtitle">
            <span>${icon.subtitle}</span>
          </div>
        </div>
      </a>`
            },
          )
          .join("")

        return `<div id="page-content">
  <h2 class="icons-title">${config.title}</h2>
  <div class="icons-container">
    <div class="icons-wrapper">${iconsHTML}
    </div>
  </div>
</div>`
      },
    })

    // Products Showroom Component
    this.register("products-showroom", {
      name: "Products Showroom",
      defaultConfig: {
        mode: "title", // "title" or "image"
        title: "",
        categoryNumber: "",
        objectIds: "",
        direction: "ltr",
        tabbedMode: false,
        tabs: [],
        bannerConfig: {
          desktopImage: "",
          mobileImage: "",
          altText: "",
          linkUrl: "",
          utmSource: "",
          campaignName: ""
        }
      },
      generateHTML: (config) => {
        const currency = settingsModel.getCurrency()
        const isRTL = config.direction === "rtl"

        if (!currency) {
          return "<!-- Error: No currency settings found -->"
        }

        // If tabbed mode is enabled, generate tabbed showroom
        if (config.tabbedMode && config.tabs && Array.isArray(config.tabs) && config.tabs.length > 0) {
          const firstTabName = (config.tabs[0]?.name || 'Tab 1').replace(/'/g, "\\'")
          const containerClass = isRTL ? 'showroom-container showroom-container-rtl' : 'showroom-container'
          const trackClass = config.mode === "title" ? 'no-image-track' : 'showroom-products-track'
          const arrowClass = config.mode === "title" ? 'left_no_image_arrow' : 'left_showroom_arrow'
          const arrowClassRight = config.mode === "title" ? 'right_no_image_arrow' : 'right_showroom_arrow'

          // Generate tab buttons
          const tabButtons = config.tabs.map((tab: any) => {
            const tabName = (tab.name || 'Tab').replace(/'/g, "\\'")
            return `            <li><button :class="{ 'active': activeTab === '${tabName}' }" @click="activeTab = '${tabName}'" class="showroom-button">${tabName}</button></li>`
          }).join('\n')

          // Generate tab content for each tab
          const tabContents = config.tabs.map((tab: any) => {
            const tabName = (tab.name || 'Tab').replace(/'/g, "\\'")
            const objectIDsArray = tab.objectIds ? tab.objectIds.split(",").map((id: string) => `'${id.trim()}'`) : []
            
            let productFunctionCall = ""
            if (tab.categoryNumber && objectIDsArray.length > 0) {
              productFunctionCall = `getProductsFromCategory(10, ${tab.categoryNumber}, [${objectIDsArray.join(", ")}])`
            } else if (tab.categoryNumber) {
              productFunctionCall = `getProductsFromCategory(10, ${tab.categoryNumber}, [])`
            } else if (objectIDsArray.length > 0) {
              productFunctionCall = `getProductsManual([${objectIDsArray.join(", ")}])`
            }

            return `        <!-- ${tabName} Tab -->
        <div class="${containerClass}" x-show="activeTab === '${tabName}'">
            <div class="showroom-products-wrapper">
                <div class="swiper-button-prev ${arrowClass} showroom_arrow"></div>
                <div class="swiper-button-next ${arrowClassRight} showroom_arrow"></div>
                <div class="showroom-products-container">
                    <section x-data="{ products: [] }" x-init="products = await ${productFunctionCall}">
                        <div class="showroom-products-container ${trackClass}" style="display: flex;">
                            <template x-for="product in products">
                                <div class="product--card">
                                    <a :href="product.url" style="text-decoration: none; color: black;">
                                        <div class="product-picture-wrapper">
                                            <span>
                                                <img class="product-picture" :alt="product.product_name" :src="updateImageUrl(product.image_url)" loading="lazy" />
                                            </span>
                                        </div>
                                        <div x-show="product.percentoff > 0" class="discount-percentage">
                                            <span x-text="product.percentoff.toFixed(0) + '% OFF'"></span>
                                        </div>
                                        <div class="product-details-wrapper">
                                            <div>
                                                <div class="product-price-wrapper">
                                                    <div class="product-price-container">
                                                        <div class="vp-price">
                                                            <span class="product-price" :class="{'discounted': product.percentoff > 0}" x-text="product.prix.toFixed(2) + ' ${currency}'"></span>
                                                            <span x-show="product.percentoff > 0" class="product-original-price" x-text="product.regular.toFixed(2) + ' ${currency}'"></span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="product-brand-wrapper">
                                                    <span class="product-brand" x-text="product.brand"></span>
                                                </div>
                                                <div class="product-name" x-text="product.product_name"></div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </template>
                        </div>
                    </section>
                </div>
            </div>
        </div>`
          }).join('\n\n')

          // Banner HTML for image mode
          const bannerLinkWithUTM = config.mode === "image" && config.bannerConfig 
            ? appendUTMToURL(config.bannerConfig.linkUrl || "", config.bannerConfig.utmSource, config.bannerConfig.campaignName)
            : ""
          const bannerHTML = config.mode === "image" && (config.bannerConfig?.desktopImage || config.bannerConfig?.mobileImage) ? `
        <template x-if="(desktopBannerImage && desktopBannerImage.trim() !== '') || (mobileBannerImage && mobileBannerImage.trim() !== '')">
            <a style="text-decoration: none; display: block; position: relative" href="${bannerLinkWithUTM}">
                <div class="showroom-banner-wrapper">
                    <!-- DESKTOP BANNER IMAGE - Shows on desktop only -->
                    <span class="showroom-desktop-banner">
                        <span>
                            <img alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27268%27%20height=%27477%27/%3e">
                        </span>
                        <img :alt="bannerAlt" :src="desktopBannerImage" class="showroom-banner-image" />
                    </span>
                    <div style="box-sizing: border-box; margin: 0px; min-width: 0px; height: 100%; width: 100%; position: relative;">
                        <!-- MOBILE BANNER IMAGE - Shows on mobile only -->
                        <span class="showroom-mobile-banner">
                            <img :alt="bannerAlt" :src="mobileBannerImage" class="showroom-banner-image" />
                        </span>
                    </div>
                </div>
            </a>
        </template>` : ''

          // X-data initialization for banner
          const xDataInit = config.mode === "image" 
            ? `x-data="{ activeTab: '${firstTabName}', desktopBannerImage: '${config.bannerConfig?.desktopImage || ''}', mobileBannerImage: '${config.bannerConfig?.mobileImage || ''}', bannerAlt: '${config.bannerConfig?.altText || ''}' }"` 
            : `x-data="{ activeTab: '${firstTabName}' }"`

          return `<!-- Tabbed Showroom Start -->
<div ${xDataInit}>
    ${config.mode === "title" ? `<div class="showroom-heading">
        <h2 id="showroom-title">${config.title || 'Products'}</h2>
        <ul class="showroom-buttons-list">
${tabButtons}
        </ul>
    </div>` : `${bannerHTML}
    <div class="showroom-heading" style="margin-top: 20px;">
        <ul class="showroom-buttons-list">
${tabButtons}
        </ul>
    </div>`}
    <div class="component-container">
${tabContents}
    </div>
</div>
<!-- Tabbed Showroom End -->`
        }

        // Regular (non-tabbed) showroom
        const objectIDsArray = config.objectIds ? config.objectIds.split(",").map((id: string) => `'${id.trim()}'`) : []

        let productFunctionCall = ""
        if (config.categoryNumber && objectIDsArray.length > 0) {
          productFunctionCall = `getProductsFromCategory(10, ${config.categoryNumber}, [${objectIDsArray.join(", ")}])`
        } else if (config.categoryNumber) {
          productFunctionCall = `getProductsFromCategory(10, ${config.categoryNumber}, [])`
        } else if (objectIDsArray.length > 0) {
          productFunctionCall = `getProductsManual([${objectIDsArray.join(", ")}])`
        }

        const containerClass = isRTL ? 'showroom-container showroom-container-rtl' : 'showroom-container'
        const trackClass = config.mode === "title" ? 'no-image-track' : 'showroom-products-track'
        const arrowClass = config.mode === "title" ? 'left_no_image_arrow' : 'left_showroom_arrow'
        const arrowClassRight = config.mode === "title" ? 'right_no_image_arrow' : 'right_showroom_arrow'

        // Banner HTML for image mode
        const bannerLinkWithUTM = config.mode === "image" && config.bannerConfig 
          ? appendUTMToURL(config.bannerConfig.linkUrl || "", config.bannerConfig.utmSource, config.bannerConfig.campaignName)
          : ""
        const bannerHTML = config.mode === "image" && (config.bannerConfig?.desktopImage || config.bannerConfig?.mobileImage) ? `
                    <template x-if="(desktopBannerImage && desktopBannerImage.trim() !== '') || (mobileBannerImage && mobileBannerImage.trim() !== '')">
                        <a style="text-decoration: none; display: block; position: relative" href="${bannerLinkWithUTM}">
                            <div class="showroom-banner-wrapper">
                                <!-- DESKTOP BANNER IMAGE - Shows on desktop only -->
                                <span class="showroom-desktop-banner">
                                    <span>
                                        <img alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27268%27%20height=%27477%27/%3e">
                                    </span>
                                    <img :alt="bannerAlt" :src="desktopBannerImage" class="showroom-banner-image" />
                                </span>
                                <div style="box-sizing: border-box; margin: 0px; min-width: 0px; height: 100%; width: 100%; position: relative;">
                                    <!-- MOBILE BANNER IMAGE - Shows on mobile only -->
                                    <span class="showroom-mobile-banner">
                                        <img :alt="bannerAlt" :src="mobileBannerImage" class="showroom-banner-image" />
                                    </span>
                                </div>
                            </div>
                        </a>
                    </template>` : ''

        // X-data initialization for banner
        const xDataInit = config.mode === "image" 
          ? `x-data="{ desktopBannerImage: '${config.bannerConfig?.desktopImage || ''}', mobileBannerImage: '${config.bannerConfig?.mobileImage || ''}', bannerAlt: '${config.bannerConfig?.altText || ''}' }"` 
          : ''

        return `<div class="showroom-component" id="showroom-${Date.now()}" ${xDataInit}>
        ${config.mode === "title" ? `<div class="showroom-heading">
            <h2 id="showroom-title">${config.title}</h2>
        </div>` : ''}
        <div class="component-container"${config.mode === "title" ? ' style="margin-left: 10px;"' : ''}>
            <div class="${containerClass}">${bannerHTML}
                <div class="showroom-products-wrapper">
                    <div class="swiper-button-prev ${arrowClass} showroom_arrow"></div>
                    <div class="swiper-button-next ${arrowClassRight} showroom_arrow"></div>
                    <div class="showroom-products-container">
                        <section x-data="{ products: [] }" x-init="products = await ${productFunctionCall}">
                            <div class="showroom-products-container ${trackClass}" style="display: flex;">
                                <template x-for="product in products">
                                    <div class="product--card">
                                        <a :href="product.url" style="text-decoration: none; color: black;">
                                            <div class="product-picture-wrapper">
                                                <span>
                                                    <img class="product-picture" :alt="product.product_name" :src="updateImageUrl(product.image_url)" loading="lazy" />
                                                </span>
                                            </div>
                                            <div x-show="product.percentoff > 0" class="discount-percentage">
                                                <span x-text="product.percentoff.toFixed(0) + '%' + ' OFF'"></span>
                                            </div>
                                            <div class="product-details-wrapper">
                                                <div>
                                                    <div class="product-price-wrapper">
                                                        <div class="product-price-container">
                                                            <div class="vp-price">
                                                                <span class="product-price" :class="{'discounted': product.percentoff > 0}" x-text="product.prix.toFixed(2) + ' ${currency}'"></span>
                                                                <span x-show="product.percentoff > 0" class="product-original-price" x-text="product.regular.toFixed(2) + ' ${currency}'"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="product-brand-wrapper">
                                                        <span class="product-brand" x-text="product.brand"></span>
                                                    </div>
                                                    <div class="product-name" x-text="product.product_name"></div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </template>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    </div>`
      },
    })

    // Hero Banner Component
    this.register("hero-banner", {
      name: "Hero Banner",
      defaultConfig: {
        image: "",
        title: "",
        subtitle: ""
      },
      generateHTML: (config) => {
        return `<!--Hero Banner Start-->
<div class="hero-banner-wrapper">
  <div class="hero-banner-padding">
    <div class="hero-banner-image-wrapper">
      <img src="${config.image}" class="hero-banner-image" />
    </div>
    <div class="hero-banner-overlay"></div>
    <div class="hero-banner-text-wrapper">
      <div class="hero-banner-text-container">
        <div class="hero-banner-text">
          <h1 class="hero-banner-title">${config.title}</h1>
          <p class="hero-banner-subtitle">${config.subtitle}</p>
        </div>
      </div>
    </div>
  </div>
</div>
<!--Hero Banner End-->`
      }
    })

    // Dual Panel Section Component
    this.register("dual-panel-section", {
      name: "Dual Panel Section",
      defaultConfig: {
        title: "",
        description: "",
        image: "",
        imageEnabled: true
      },
      generateHTML: (config) => {
        return `<!--Dual Panel Section Start-->
<div class="dual-panel-section">
  <div class="section-text dual-panel-content">
    <h2 class="section-text-title">
      ${config.title}
    </h2>
    <p class="section-text-description">${config.description}</p>
  </div>
  ${config.imageEnabled ? `<div class="section-image dual-panel-content">
    <img src="${config.image}" class="media-content" />
  </div>` : ""}
</div>
<!--Dual Panel Section End-->`
      }
    })

    // Info Grid Section Component
    this.register("info-grid-section", {
      name: "Info Grid Section",
      defaultConfig: {
        title: "",
        items: [
          {
            icon: "",
            title: "",
            subtitles: [""]
          }
        ]
      },
      generateHTML: (config) => {
        const itemsHTML = (config.items || []).map((item: any) => `
    <li class="info-grid-list-item">
      <div class="info-grid-list-item-icon">
        <img src="${item.icon}" class="info-grid-list-item-icon-image" />
      </div>
      <div class="info-grid-list-item-text">
        <div class="info-grid-list-item-title">
          ${item.title}
        </div>
        ${(item.subtitles || []).map((sub: any) => `<div class="info-grid-list-item-subtitle">${sub}</div>`).join("")}
      </div>
    </li>`).join("")
        return `<!--Info Grid Section Start -->
<div class="info-grid-section">
  <h2 class="info-grid-section-title">${config.title}</h2>
  <ul class="info-grid-list">
    ${itemsHTML}
  </ul>
</div>
<!--Info Grid Section End-->`
      }
    })

    // FAQs Section Component
    this.register("faqs-section", {
      name: "FAQs Section",
      defaultConfig: {
        title: "Frequently Asked Questions",
        faqs: [
          { question: "", answer: "" }
        ]
      },
      generateHTML: (config) => {
        const faqsHTML = (config.faqs || []).map((faq: any) => `
        <details class="question-wrapper">
          <summary class="question-text">
            ${faq.question}
          </summary>
          <div class="answer-wrapper">
            <p class="answer-text">
              ${faq.answer}
            </p>
          </div>
        </details>`).join("")
        return `<!--FAQs section Start-->
<div class="faqs-section-wrapper">
  <div class="faqs-section">
    <div class="faqs-header-wrapper">
      <h2 class="faqs-header">${config.title}</h2>
      <div class="questions-section">
        ${faqsHTML}
      </div>
    </div>
  </div>
</div>
<!--FAQs section End-->`
      }
    })
  }

  register(type: string, template: ComponentTemplate) {
    this.templates.set(type, template)
  }

  getTemplate(type: string): ComponentTemplate | undefined {
    return this.templates.get(type)
  }

  getAllTemplates(): ComponentTemplate[] {
    return Array.from(this.templates.values())
  }
}

export const PreviewComponentRegistry = new PreviewComponentRegistryClass()