import { settingsModel } from "./settings-model"

export interface Asset {
  type: "css" | "js"
  url: string
  id: string
}

class AssetRegistryClass {
  private assets: Set<string> = new Set()
  private defaultAssets: Asset[] = [
    // Scripts
    {
      type: "js",
      url: "https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js",
      id: "algolia-search-js",
    },
    {
      type: "js",
      url: "https://unpkg.com/@alpinejs/intersect@3.8.1/dist/cdn.min.js",
      id: "alpine-intersect-js",
    },
    {
      type: "js",
      url: "https://unpkg.com/alpinejs@3.8.1/dist/cdn.min.js",
      id: "alpine-js",
    },
    {
      type: "js",
      url: "https://unpkg.com/swiper/swiper-bundle.min.js",
      id: "swiper-js",
    },
    {
      type: "js",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.js",
      id: "banner-carousel-js",
    },
    {
      type: "js",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/categories_swiper.js",
      id: "categories-swiper-js",
    },
    // Stylesheets
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.css",
      id: "banner-carousel-css",
    },
    {
      type: "css",
      url: "https://unpkg.com/@vtmn/css-button",
      id: "vtmn-button-css",
    },
    {
      type: "css",
      url: "https://unpkg.com/swiper/swiper-bundle.min.css",
      id: "swiper-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/4%20blocks.css",
      id: "four-blocks-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/8%20icons.css",
      id: "eight-icons-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/ShowroomFinal.css",
      id: "showroom-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Page%20stretch.css",
      id: "page-stretch-css",
    },
    // New informational styles
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/dual%20section.css",
      id: "dual-section-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/hero%20banner.css",
      id: "hero-banner-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/info%20grid%20section.css",
      id: "info-grid-section-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/faqs%20section.css",
      id: "faqs-section-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/homepage.css",
      id: "homepage-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/horizontal_wrapper.css",
      id: "horizontal-wrapper-css",
    },
    {
      type: "css",
      url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/categories_swiper.css",
      id: "categories-swiper-css",
    },
  ]

  private customScript = `<script>
document.addEventListener("DOMContentLoaded", function() {
  const tracks = document.querySelectorAll(".showroom-products-track");
  const leftShowroomArrows = document.querySelectorAll(".left_showroom_arrow");
  const rightShowroomArrows = document.querySelectorAll(".right_showroom_arrow");
  const trackTranslations = Array(tracks.length).fill(0);

  const noImageTracks = document.querySelectorAll(".no-image-track");
  const leftNoImageArrows = document.querySelectorAll(".left_no_image_arrow");
  const rightNoImageArrows = document.querySelectorAll(".right_no_image_arrow");
  const noImageTrackTranslations = Array(noImageTracks.length).fill(0);

  const setArrowOpacity = (arrow, isVisible) => {
    arrow.style.opacity = isVisible ? "1" : "0.5";
    arrow.style.transition = "opacity 0.3s ease";
  };

  const setArrowDisabled = (arrow, isDisabled) => {
    if (isDisabled) {
      arrow.style.pointerEvents = "none"; 
      arrow.style.cursor = "default";
      arrow.style.opacity = "0.5"; 
    } else {
      arrow.style.pointerEvents = "auto";
      arrow.style.cursor = "pointer";
      arrow.style.opacity = "1";
    }
  };

  const translateContainer = (track, index, amount, translations, offset, leftArrow, rightArrow) => {
    const displayWidth = window.innerWidth - offset;
    const trackWidth = track.offsetWidth;
    const maxTranslateX = trackWidth - displayWidth;

    translations[index] += amount;

    if (translations[index] >= 0) {
      translations[index] = 0;
    } else if (translations[index] < -maxTranslateX) {
      translations[index] = -maxTranslateX;
    }

      track.style.transform = \`translateX(\${translations[index]}px)\`
    track.style.transition = "transform 0.5s ease";

    if (translations[index] === 0) {
      setArrowOpacity(leftArrow, false);
      setArrowDisabled(leftArrow, true); 
    } else {
      setArrowOpacity(leftArrow, true); 
      setArrowDisabled(leftArrow, false);
    }

    if (translations[index] === -maxTranslateX) {
      setArrowOpacity(rightArrow, false); 
      setArrowDisabled(rightArrow, true);
    } else {
      setArrowOpacity(rightArrow, true); 
      setArrowDisabled(rightArrow, false);
    }
  };

  leftShowroomArrows.forEach((arrow, index) => {
    setArrowDisabled(arrow, true); 
    arrow.addEventListener("click", () => {
      const track = tracks[index];
      const secondChildWidth = 261;
      translateContainer(track, index, secondChildWidth, trackTranslations, 416, arrow, rightShowroomArrows[index]);
    });
  });

  rightShowroomArrows.forEach((arrow, index) => {
    arrow.addEventListener("click", () => {
      const track = tracks[index];
      const secondChildWidth = 261;
      translateContainer(track, index, -secondChildWidth, trackTranslations, 416, leftShowroomArrows[index], arrow);
    });
  });

  leftNoImageArrows.forEach((arrow, index) => {
    setArrowDisabled(arrow, true); 
    arrow.addEventListener("click", () => {
      const track = noImageTracks[index];
      const secondChildWidth = 261;
      translateContainer(track, index, secondChildWidth, noImageTrackTranslations, 91, arrow, rightNoImageArrows[index]);
    });
  });

  rightNoImageArrows.forEach((arrow, index) => {
    arrow.addEventListener("click", () => {
      const track = noImageTracks[index];
      const secondChildWidth = 261;
      translateContainer(track, index, -secondChildWidth, noImageTrackTranslations, 91, leftNoImageArrows[index], arrow);
    });
  });
});

const algoliaDetails = {
  app_id: 'TR53CBEI82',
  api_search_key: "98ef65e220d8d74a2dfac7a67f1dba11",
  index_name: "prod_en",
};

function handleLoadingSliders() {
  const loadingProducts = document.getElementsByClassName("loading-products");
  const loadingProductsArr = [...loadingProducts];
  loadingProductsArr.forEach((e) => {
    e.remove();
  });
}

function updateImageUrl(url) {
  const newParams = "format=auto&quality=40&f=400x0";
  if (url.indexOf("?") > -1) {
    const urlParts = url.split("?");
    return \`\${urlParts[0]}?\${newParams}\`;
  } else {
    return url;
  }
}

document.addEventListener("alpine:init", () => {
    Alpine.data("products", () => ({
      products: [],
      gridStyle: "",
      getProductsFromCategory(
        prodCount,
        categoryNumber,
        priorityObjectIDs = []
      ) {
        const clientAlg = algoliasearch(
          algoliaDetails.app_id,
          algoliaDetails.api_search_key
        );
        const indexAlg = clientAlg.initIndex(algoliaDetails.index_name);
        const objectIDFilters = priorityObjectIDs
        .map((id) => \`objectID:\${id}\`)
        .join(" OR ");

        indexAlg
          .search("", {
          filters: objectIDFilters.length
          ? objectIDFilters
          : \`category = \${categoryNumber}\`,
          analytics: false,
        })
          .then(({ hits: priorityHits }) => {
          if (priorityObjectIDs.length) {
            indexAlg
              .search("", {
              filters: \`category = \${categoryNumber} \`,
              analytics: false,
            })
              .then(({ hits: categoryHits }) => {
              const uniqueCategoryHits = categoryHits.filter(
                (hit) => !priorityObjectIDs.includes(hit.objectID)
              );

              const combinedResults = [
                ...priorityHits,
                ...uniqueCategoryHits,
              ].slice(0, prodCount);

              this.products = combinedResults;
              handleLoadingSliders();
            });
          } else {
            const filteredResultsByCategory = priorityHits
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, prodCount);

            this.products = filteredResultsByCategory;
            handleLoadingSliders();
          }
        });
      },
      getDiscountedProductsFromCategory(
        prodCount,
        categoryNumber,
        priorityObjectIDs = []
      ) {
        const clientAlg = algoliasearch(
          algoliaDetails.app_id,
          algoliaDetails.api_search_key
        );
        const indexAlg = clientAlg.initIndex(algoliaDetails.index_name);

        const objectIDFilters = priorityObjectIDs
        .map((id) => \`objectID:\${id}\`)
        .join(" OR ");

        indexAlg
          .search("", {
          filters: objectIDFilters.length
          ? objectIDFilters
          : \`category = \${categoryNumber} AND percentoff > 0\`,
          analytics: false,
        })
          .then(({ hits: priorityHits }) => {
          if (priorityObjectIDs.length) {
            indexAlg
              .search("", {
              filters: \`category = \${categoryNumber} AND percentoff > 0\`,
              analytics: false,
            })
              .then(({ hits: categoryHits }) => {
              const uniqueCategoryHits = categoryHits.filter(
                (hit) => !priorityObjectIDs.includes(hit.objectID)
              );

              const combinedResults = [
                ...priorityHits,
                ...uniqueCategoryHits,
              ].slice(0, prodCount);

              this.products = combinedResults;
              handleLoadingSliders();
            });
          } else {
            const filteredResultsByCategory = priorityHits
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, prodCount);

            this.products = filteredResultsByCategory;
            handleLoadingSliders();
          }
        });
      },
      getProductsManual(productsArr) {
        const clientAlg = algoliasearch(
          algoliaDetails.app_id,
          algoliaDetails.api_search_key
        );
        const indexAlg = clientAlg.initIndex(algoliaDetails.index_name);

        const filters = productsArr.map((id) => \`objectID:\${id}\`).join(" OR ");

        indexAlg
          .search("", {
          filters: filters,
          analytics: false,
        })
          .then(({ hits }) => {
          handleLoadingSliders();
          const orderedHits = productsArr.map((id) =>
                                              hits.find((hit) => hit.objectID === id)
                                             );
          this.products = orderedHits.filter(Boolean);
          this.updateGridStyle();
        })
          .catch((err) => {
          // Error handled silently
        });
      },

      updateGridStyle() {
        const columns = this.products.length;
        this.gridStyle = \`grid-template-columns: repeat(\${columns}, 1fr);\`;
      },
    }));
  });
</script>`

  addAsset(asset: Asset): boolean {
    if (this.hasAsset(asset.id)) {
      return false
    }

    if (typeof window !== "undefined" && window.document) {
      if (asset.type === "css") {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = asset.url
        link.id = asset.id
        link.setAttribute("async", "true")
        document.head.appendChild(link)
      } else if (asset.type === "js") {
        const script = document.createElement("script")
        script.src = asset.url
        script.id = asset.id
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
    }

    this.assets.add(asset.id)
    return true
  }

  injectDefaultAssets() {
    if (typeof window !== "undefined" && window.document) {
    // Inject all default assets
    this.defaultAssets.forEach((asset) => {
      this.addAsset(asset)
    })

    // Inject custom script
    if (!document.getElementById("custom-script")) {
      const scriptElement = document.createElement("script")
        scriptElement.type = "text/javascript"
      scriptElement.id = "custom-script"
        scriptElement.async = true
        scriptElement.defer = true
      scriptElement.innerHTML = this.customScript.replace(/<script>|<\/script>/g, "")
      document.head.appendChild(scriptElement)
      }

      // Add preview-only initialization script
      if (!document.getElementById("preview-init")) {
        const previewScript = document.createElement("script")
        previewScript.id = "preview-init"
        previewScript.innerHTML = `
          // Wait for Alpine.js to load
          const waitForAlpine = setInterval(() => {
            if (window.Alpine) {
              clearInterval(waitForAlpine)
              // Initialize Alpine
              window.Alpine.start()
              // Initialize any Alpine components that were added dynamically
              document.querySelectorAll('[x-data]').forEach(el => {
                if (!el._x_dataStack) {
                  window.Alpine.initTree(el)
                }
              })
            }
          }, 100)
        `
        document.head.appendChild(previewScript)
      }
    }
  }

  // Initialize interactive components like Swiper after DOM updates
  initializeInteractiveComponents(): void {
    if (typeof window === "undefined") return

    // Initialize Swiper instances with improved timing
    setTimeout(() => {
      if (window.Swiper) {
        // Destroy existing swiper instances to avoid conflicts
        const existingSwipers = document.querySelectorAll(".swiper")
        existingSwipers.forEach((swiperEl: any) => {
          if (swiperEl.swiper) {
            swiperEl.swiper.destroy(true, true)
          }
        })

        // Wait a bit more for DOM to settle
        setTimeout(() => {
          // Initialize new swiper instances
          const swiperElements = document.querySelectorAll(".swiper:not(.swiper-initialized)")
          swiperElements.forEach((swiperEl) => {
            try {
              new window.Swiper(swiperEl, {
                loop: true,
                pagination: {
                  el: swiperEl.querySelector(".swiper-pagination"),
                  clickable: true,
                },
                navigation: {
                  nextEl: swiperEl.querySelector(".swiper-button-next"),
                  prevEl: swiperEl.querySelector(".swiper-button-prev"),
                },
                autoplay: {
                  delay: 3000,
                  disableOnInteraction: false,
                },
                // Add some additional options for better functionality
                slidesPerView: 1,
                spaceBetween: 0,
                centeredSlides: true,
              })
            } catch (error) {
              // Error handled silently
            }
          })
        }, 50)
      }
    }, 200)
  }

  hasAsset(id: string): boolean {
    return this.assets.has(id)
  }

  getCodeWithAssets(htmlCode: string): string {
    // Wrap the code in <div id="ZA_body_fix">...</div>
    const wrappedHtml = `<div id="ZA_body_fix">\n${htmlCode}\n</div>`

    // Get all required assets
    let assets: Asset[] = []

    // Try to load custom assets from localStorage
    if (typeof window !== "undefined") {
      const savedCss = localStorage.getItem("custom_css_assets")
      const savedJs = localStorage.getItem("custom_js_assets")
      
      if (savedCss && savedJs) {
        // Use saved custom assets
        const cssAssets = JSON.parse(savedCss)
        const jsAssets = JSON.parse(savedJs)
        assets = [...cssAssets, ...jsAssets]
      } else {
        // Use default assets
        assets = [...this.defaultAssets]
      }
    } else {
      // Use default assets (server-side)
      assets = [...this.defaultAssets]
    }

    // Generate asset HTML
    const assetTags = assets
      .map((asset) => {
        if (asset.type === "css") {
          return `<link rel="stylesheet" href="${asset.url}" />`
        } else if (asset.type === "js") {
          // Add defer attribute to Alpine.js scripts
          const defer = asset.url.includes("alpinejs") ? ' defer' : ''
          return `<script src="${asset.url}"${defer}></script>`
        }
        return ""
      })
      .join("\n")

    // Get settings from settings model
    const settings = settingsModel.getSettings()
    
    // Create the custom script with dynamic Algolia settings
    const scriptWithSettings = this.customScript.replace(
      /const algoliaDetails = {[^}]+};/,
      `const algoliaDetails = {
        app_id: '${settings?.app_id || ""}',
        api_search_key: "${settings?.api_search_key || ""}",
        index_name: "${settings?.index_name || ""}",
      };`
    )

    // Get inline CSS and JS from localStorage
    let inlineCss = ""
    let inlineJs = ""
    
    if (typeof window !== "undefined") {
      inlineCss = localStorage.getItem("custom_inline_css") || ""
      inlineJs = localStorage.getItem("custom_inline_js") || ""
    }

    // Build inline style and script tags
    const inlineStyleTag = inlineCss ? `\n<style>\n${inlineCss}\n</style>` : ""
    const inlineScriptTag = inlineJs ? `\n<script>\n${inlineJs}\n</script>` : ""

    // Return combined code with assets, custom script, and inline code
    return `${wrappedHtml}\n\n${assetTags}\n\n${scriptWithSettings}${inlineStyleTag}${inlineScriptTag}`
  }

  clear(): void {
    this.assets.clear()
    // Remove injected assets from DOM
    if (typeof window !== "undefined") {
      this.defaultAssets.forEach((asset) => {
        const element = document.getElementById(asset.id)
        if (element) {
          element.remove()
        }
      })
      const customScript = document.getElementById("custom-script")
      if (customScript) {
        customScript.remove()
      }
    }
  }

  async loadAssets(): Promise<void> {
    // Load all default assets
    await Promise.all(
      this.defaultAssets.map(async (asset) => {
        if (asset.type === "js") {
          await this.loadScript(asset.url)
        } else {
          await this.loadStyle(asset.url)
        }
      })
    )
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = () => resolve()
      script.onerror = () => reject()
      document.head.appendChild(script)
    })
  }

  private loadStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      link.onload = () => resolve()
      link.onerror = () => reject()
      document.head.appendChild(link)
    })
  }
}

export const AssetRegistry = new AssetRegistryClass()

// Add Swiper to window type for TypeScript
declare global {
  interface Window {
    Swiper: any
    settingsModel: typeof settingsModel
  }
}
