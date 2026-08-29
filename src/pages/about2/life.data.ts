export type LifeImage = {
  src: string
  alt: string
  size: 'large' | 'wide' | 'tall' | 'medium' | 'small'
  caption?: string
}

export const lifeImages: LifeImage[] = [
  { src: '/about2/life/01.jpg', alt: 'A golf course surrounded by nature', size: 'large', caption: 'BAD GOLF. GOOD AFTERNOON.' },
  { src: '/about2/life/02.jpg', alt: 'A quiet detail noticed during the day', size: 'small', caption: 'FIG. 04' },
  { src: '/about2/life/03.jpg', alt: 'A long walk through the outdoors', size: 'tall', caption: 'A LONG WALK' },
  { src: '/about2/life/04.jpg', alt: 'A candid city moment', size: 'small' },
  { src: '/about2/life/05.jpg', alt: 'Water and a quiet landscape', size: 'wide', caption: 'SOMEWHERE AWAY FROM THE SCREEN' },
  { src: '/about2/life/06.jpg', alt: 'A bicycle during a ride', size: 'tall' },
  { src: '/about2/life/07.jpg', alt: 'A moment shared with friends', size: 'medium', caption: 'SATURDAY / 18:42' },
  { src: '/about2/life/08.jpg', alt: 'A book and an ordinary afternoon', size: 'small' },
  { src: '/about2/life/09.jpg', alt: 'An interesting place found while travelling', size: 'wide', caption: 'OUTSIDE > INSIDE' },
]
