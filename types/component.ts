export interface Component {
  id: string
  type: string
  displayName?: string
  config: any
  html: string
}

export interface SwiperSlide {
  linkUrl: string
  desktopImage: string
  mobileImage: string
  altText: string
  utmSource?: string
  campaignName?: string
}

export interface SwiperConfig {
  slides: SwiperSlide[]
}

export interface HeroConfig {
  title: string
  subtitle: string
  buttonText: string
  buttonUrl: string
}
